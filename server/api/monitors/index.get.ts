import { eq, desc, sql, and, gte } from 'drizzle-orm'
import { monitors, monitorResults } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  // Get all monitors for user
  const userMonitors = await db
    .select()
    .from(monitors)
    .where(eq(monitors.userId, user.id))
    .orderBy(desc(monitors.createdAt))

  // Get latest result and uptime for each monitor
  const result = await Promise.all(
    userMonitors.map(async (monitor) => {
      // Latest result
      const [latest] = await db
        .select()
        .from(monitorResults)
        .where(eq(monitorResults.monitorId, monitor.id))
        .orderBy(desc(monitorResults.executedAt))
        .limit(1)

      // 24h uptime
      const uptimeData = await db
        .select({
          total: sql<number>`count(*)`,
          successful: sql<number>`count(*) filter (where ${monitorResults.status} = 'success')`,
        })
        .from(monitorResults)
        .where(
          and(
            eq(monitorResults.monitorId, monitor.id),
            gte(monitorResults.executedAt, twentyFourHoursAgo),
          ),
        )

      const uptimePercent = uptimeData[0].total > 0
        ? (uptimeData[0].successful / uptimeData[0].total) * 100
        : null

      return {
        id: monitor.id,
        name: monitor.name,
        url: monitor.url,
        method: monitor.method,
        expectedStatus: monitor.expectedStatus,
        timeoutMs: monitor.timeoutMs,
        scheduleInterval: monitor.scheduleInterval,
        enabled: monitor.enabled,
        createdAt: monitor.createdAt.toISOString(),
        latestStatus: latest?.status || null,
        latestResponseTime: latest?.responseTimeMs || null,
        latestCheckedAt: latest?.executedAt?.toISOString() || null,
        uptimePercent,
      }
    }),
  )

  return result
})
