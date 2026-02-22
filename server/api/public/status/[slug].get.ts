import { eq, and, ne, desc, gte, sql } from 'drizzle-orm'
import {
  statusPages,
  statusPageMonitors,
  monitors,
  monitorResults,
  incidents,
  incidentUpdates,
  incidentMonitors,
} from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const slug = getRouterParam(event, 'slug')!

  // Get public status page by slug
  const [statusPage] = await db
    .select()
    .from(statusPages)
    .where(and(eq(statusPages.slug, slug), eq(statusPages.isPublic, true)))

  if (!statusPage) {
    throw createError({ statusCode: 404, statusMessage: 'Status page not found' })
  }

  // Get linked monitors
  const linkedMonitors = await db
    .select({
      monitorId: statusPageMonitors.monitorId,
      displayOrder: statusPageMonitors.displayOrder,
      name: monitors.name,
    })
    .from(statusPageMonitors)
    .innerJoin(monitors, eq(monitors.id, statusPageMonitors.monitorId))
    .where(eq(statusPageMonitors.statusPageId, statusPage.id))
    .orderBy(statusPageMonitors.displayOrder)

  // For each monitor, get latest result and 90-day uptime
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  const monitorData = await Promise.all(
    linkedMonitors.map(async (m) => {
      // Latest result
      const [latest] = await db
        .select()
        .from(monitorResults)
        .where(eq(monitorResults.monitorId, m.monitorId))
        .orderBy(desc(monitorResults.executedAt))
        .limit(1)

      // 90-day uptime
      const uptimeData = await db
        .select({
          total: sql<number>`count(*)`,
          successful: sql<number>`count(*) filter (where ${monitorResults.status} = 'success')`,
        })
        .from(monitorResults)
        .where(
          and(
            eq(monitorResults.monitorId, m.monitorId),
            gte(monitorResults.executedAt, ninetyDaysAgo),
          ),
        )

      const total = Number(uptimeData[0].total)
      const successful = Number(uptimeData[0].successful)
      const uptimePercent = total > 0
        ? Number(((successful / total) * 100).toFixed(3))
        : null

      const currentStatus = latest
        ? latest.status === 'success' ? 'operational' : 'down'
        : 'unknown'

      // Daily status for 90-day uptime bar, ordered by date ascending
      const dailyStatusRows = await db
        .select({
          date: sql<string>`to_char(${monitorResults.executedAt}, 'YYYY-MM-DD')`,
          total: sql<number>`count(*)`,
          successful: sql<number>`count(*) filter (where ${monitorResults.status} = 'success')`,
          failures: sql<number>`count(*) filter (where ${monitorResults.status} != 'success')`,
        })
        .from(monitorResults)
        .where(
          and(
            eq(monitorResults.monitorId, m.monitorId),
            gte(monitorResults.executedAt, ninetyDaysAgo),
          ),
        )
        .groupBy(sql`to_char(${monitorResults.executedAt}, 'YYYY-MM-DD')`)
        .orderBy(sql`to_char(${monitorResults.executedAt}, 'YYYY-MM-DD')`)

      const dailyStatus = dailyStatusRows.map((row) => {
        const dayTotal = Number(row.total)
        const daySuccessful = Number(row.successful)
        const dayFailures = Number(row.failures)

        let status: 'success' | 'failure' | 'degraded'
        if (dayFailures === 0) {
          status = 'success'
        } else if (daySuccessful === 0) {
          status = 'failure'
        } else {
          // Mix of successes and failures
          status = dayFailures / dayTotal > 0.5 ? 'failure' : 'degraded'
        }

        return {
          date: row.date,
          status,
          total: dayTotal,
          successful: daySuccessful,
          failures: dayFailures,
        }
      })

      return {
        id: m.monitorId,
        name: m.name,
        displayOrder: m.displayOrder,
        currentStatus,
        latestResponseTime: latest?.responseTimeMs || null,
        latestCheckedAt: latest?.executedAt?.toISOString() || null,
        uptimePercent,
        dailyStatus,
      }
    }),
  )

  // Get active incidents (status != 'resolved')
  const activeIncidents = await db
    .select()
    .from(incidents)
    .where(
      and(
        eq(incidents.statusPageId, statusPage.id),
        ne(incidents.status, 'resolved'),
      ),
    )
    .orderBy(desc(incidents.createdAt))

  const activeIncidentsWithDetails = await Promise.all(
    activeIncidents.map(async (incident) => {
      // Get updates
      const updates = await db
        .select()
        .from(incidentUpdates)
        .where(eq(incidentUpdates.incidentId, incident.id))
        .orderBy(desc(incidentUpdates.createdAt))

      // Get affected monitor names
      const affectedMonitors = await db
        .select({ name: monitors.name })
        .from(incidentMonitors)
        .innerJoin(monitors, eq(monitors.id, incidentMonitors.monitorId))
        .where(eq(incidentMonitors.incidentId, incident.id))

      return {
        id: incident.id,
        title: incident.title,
        status: incident.status,
        impact: incident.impact,
        createdAt: incident.createdAt.toISOString(),
        updatedAt: incident.updatedAt.toISOString(),
        updates: updates.map((u) => ({
          id: u.id,
          message: u.message,
          status: u.status,
          createdAt: u.createdAt.toISOString(),
        })),
        affectedMonitors: affectedMonitors.map((m) => m.name),
      }
    }),
  )

  // Get recently resolved incidents (last 14 days)
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  const recentIncidents = await db
    .select()
    .from(incidents)
    .where(
      and(
        eq(incidents.statusPageId, statusPage.id),
        eq(incidents.status, 'resolved'),
        gte(incidents.resolvedAt, fourteenDaysAgo),
      ),
    )
    .orderBy(desc(incidents.resolvedAt))

  const recentIncidentsWithDetails = await Promise.all(
    recentIncidents.map(async (incident) => {
      const updates = await db
        .select()
        .from(incidentUpdates)
        .where(eq(incidentUpdates.incidentId, incident.id))
        .orderBy(desc(incidentUpdates.createdAt))

      const affectedMonitors = await db
        .select({ name: monitors.name })
        .from(incidentMonitors)
        .innerJoin(monitors, eq(monitors.id, incidentMonitors.monitorId))
        .where(eq(incidentMonitors.incidentId, incident.id))

      return {
        id: incident.id,
        title: incident.title,
        status: incident.status,
        impact: incident.impact,
        createdAt: incident.createdAt.toISOString(),
        updatedAt: incident.updatedAt.toISOString(),
        resolvedAt: incident.resolvedAt?.toISOString() || null,
        updates: updates.map((u) => ({
          id: u.id,
          message: u.message,
          status: u.status,
          createdAt: u.createdAt.toISOString(),
        })),
        affectedMonitors: affectedMonitors.map((m) => m.name),
      }
    }),
  )

  // Compute overall status
  let overallStatus: 'operational' | 'major_outage' | 'partial_outage' | 'degraded' = 'operational'

  const hasCriticalIncident = activeIncidents.some((i) => i.impact === 'critical')
  const hasMajorIncident = activeIncidents.some((i) => i.impact === 'major')
  const hasAnyDown = monitorData.some((m) => m.currentStatus === 'down')

  if (hasCriticalIncident) {
    overallStatus = 'major_outage'
  } else if (hasMajorIncident || hasAnyDown) {
    overallStatus = 'partial_outage'
  } else if (activeIncidents.length > 0) {
    overallStatus = 'degraded'
  }

  return {
    slug: statusPage.slug,
    title: statusPage.title,
    description: statusPage.description,
    monitors: monitorData,
    activeIncidents: activeIncidentsWithDetails,
    recentIncidents: recentIncidentsWithDetails,
    overallStatus,
  }
})
