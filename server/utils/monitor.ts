import pLimit from 'p-limit'
import { eq, lte, and, ne, inArray } from 'drizzle-orm'
import {
  monitors,
  monitorResults,
  statusPageMonitors,
  statusPages,
  incidents,
  incidentUpdates,
  incidentMonitors,
} from '~~/server/db/schema'

const CONCURRENCY_LIMIT = 5

interface CheckResult {
  monitorId: string
  status: 'success' | 'failure' | 'timeout' | 'error'
  responseCode: number | null
  responseTimeMs: number | null
  errorMessage: string | null
}

async function checkMonitor(monitor: typeof monitors.$inferSelect): Promise<CheckResult> {
  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), monitor.timeoutMs)

    const response = await fetch(monitor.url, {
      method: monitor.method,
      headers: {
        'User-Agent': 'Vigil/1.0 (Cron Monitor)',
        ...(monitor.headers as Record<string, string> || {}),
      },
      body: ['POST', 'PUT', 'PATCH'].includes(monitor.method) ? monitor.body : undefined,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const responseTimeMs = Date.now() - startTime
    const isSuccess = response.status === monitor.expectedStatus

    return {
      monitorId: monitor.id,
      status: isSuccess ? 'success' : 'failure',
      responseCode: response.status,
      responseTimeMs,
      errorMessage: isSuccess ? null : `Expected ${monitor.expectedStatus}, got ${response.status}`,
    }
  } catch (err: unknown) {
    const responseTimeMs = Date.now() - startTime
    const error = err as Error

    if (error.name === 'AbortError') {
      return {
        monitorId: monitor.id,
        status: 'timeout',
        responseCode: null,
        responseTimeMs,
        errorMessage: `Request timed out after ${monitor.timeoutMs}ms`,
      }
    }

    return {
      monitorId: monitor.id,
      status: 'error',
      responseCode: null,
      responseTimeMs,
      errorMessage: error.message || 'Unknown error',
    }
  }
}

function getImpactFromStatus(status: CheckResult['status']): 'minor' | 'major' {
  if (status === 'error') return 'major'
  return 'minor' // failure, timeout
}

function getIncidentTitle(monitorName: string, status: CheckResult['status']): string {
  return `${monitorName} is ${status}`
}

async function createAutoIncidents(
  db: ReturnType<typeof useDB>,
  failedResults: CheckResult[],
  activeMonitors: (typeof monitors.$inferSelect)[],
) {
  if (failedResults.length === 0) return

  const monitorMap = new Map(activeMonitors.map((m) => [m.id, m]))
  const failedMonitorIds = failedResults.map((r) => r.monitorId)

  // Find which failed monitors are linked to status pages
  const linkedPages = await db
    .select({
      monitorId: statusPageMonitors.monitorId,
      statusPageId: statusPageMonitors.statusPageId,
      userId: statusPages.userId,
    })
    .from(statusPageMonitors)
    .innerJoin(statusPages, eq(statusPages.id, statusPageMonitors.statusPageId))
    .where(inArray(statusPageMonitors.monitorId, failedMonitorIds))

  if (linkedPages.length === 0) return

  // For each linked monitor-statusPage pair, check if there's already an active incident
  for (const link of linkedPages) {
    const monitor = monitorMap.get(link.monitorId)
    if (!monitor) continue

    const failedResult = failedResults.find((r) => r.monitorId === link.monitorId)
    if (!failedResult) continue

    // Check for existing active incident for this monitor on this status page
    const existingActiveIncidents = await db
      .select({ id: incidents.id })
      .from(incidents)
      .innerJoin(incidentMonitors, eq(incidentMonitors.incidentId, incidents.id))
      .where(
        and(
          eq(incidents.statusPageId, link.statusPageId),
          ne(incidents.status, 'resolved'),
          eq(incidentMonitors.monitorId, link.monitorId),
        ),
      )
      .limit(1)

    if (existingActiveIncidents.length > 0) continue

    // Create auto-incident
    const title = getIncidentTitle(monitor.name, failedResult.status)
    const impact = getImpactFromStatus(failedResult.status)

    const [incident] = await db
      .insert(incidents)
      .values({
        userId: link.userId,
        statusPageId: link.statusPageId,
        title,
        status: 'investigating',
        impact,
      })
      .returning()

    // Create initial update
    await db.insert(incidentUpdates).values({
      incidentId: incident.id,
      message: `Automated alert: ${monitor.name} returned ${failedResult.status}. ${failedResult.errorMessage || ''}`.trim(),
      status: 'investigating',
    })

    // Link the monitor to the incident
    await db.insert(incidentMonitors).values({
      incidentId: incident.id,
      monitorId: link.monitorId,
    })
  }
}

export async function runAllChecks() {
  const db = useDB()

  // 1. Fetch all enabled monitors
  const activeMonitors = await db
    .select()
    .from(monitors)
    .where(eq(monitors.enabled, true))

  if (activeMonitors.length === 0) {
    return { checked: 0, results: [] }
  }

  // 2. Execute with concurrency limit
  const limit = pLimit(CONCURRENCY_LIMIT)
  const settledResults = await Promise.allSettled(
    activeMonitors.map((monitor) => limit(() => checkMonitor(monitor))),
  )

  // 4. Process results
  const processedResults: CheckResult[] = settledResults.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    return {
      monitorId: activeMonitors[i].id,
      status: 'error' as const,
      responseCode: null,
      responseTimeMs: null,
      errorMessage: r.reason?.message ?? 'Promise rejected',
    }
  })

  // 5. Save results to database
  if (processedResults.length > 0) {
    await db.insert(monitorResults).values(
      processedResults.map((r) => ({
        monitorId: r.monitorId,
        status: r.status,
        responseCode: r.responseCode,
        responseTimeMs: r.responseTimeMs,
        errorMessage: r.errorMessage,
      })),
    )
  }

  // 6. Auto-create incidents for failed checks
  const failedResults = processedResults.filter((r) => r.status !== 'success')
  await createAutoIncidents(db, failedResults, activeMonitors)

  // 7. Cleanup old results (90 days for uptime calculation)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  await db
    .delete(monitorResults)
    .where(lte(monitorResults.executedAt, ninetyDaysAgo))

  return { checked: processedResults.length, results: processedResults }
}
