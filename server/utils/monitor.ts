import pLimit from 'p-limit'
import { eq, lte, and } from 'drizzle-orm'
import { monitors, monitorResults, users } from '~~/server/db/schema'

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

  // 6. Send integration notifications (non-blocking)
  for (let i = 0; i < activeMonitors.length; i++) {
    const monitor = activeMonitors[i]
    const result = processedResults[i]

    // Statuspage.io
    if (monitor.statuspageApiKey && monitor.statuspagePageId && monitor.statuspageComponentId) {
      notifyStatuspage(monitor, result).catch((err) => {
        console.error(`Statuspage notification failed for ${monitor.id}:`, err)
      })
    }

    // BetterUptime
    if (monitor.betteruptimeHeartbeatUrl) {
      notifyBetteruptime(monitor, result).catch((err) => {
        console.error(`BetterUptime notification failed for ${monitor.id}:`, err)
      })
    }
  }

  // 7. Cleanup old results (7 days for free users)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  await db
    .delete(monitorResults)
    .where(lte(monitorResults.executedAt, sevenDaysAgo))

  return { checked: processedResults.length, results: processedResults }
}
