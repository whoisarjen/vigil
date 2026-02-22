import { eq, and, desc, gte, sql } from 'drizzle-orm'
import { monitors, monitorResults } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()
  const id = getRouterParam(event, 'id')!

  // Get monitor
  const [monitor] = await db
    .select()
    .from(monitors)
    .where(and(eq(monitors.id, id), eq(monitors.userId, user.id)))

  if (!monitor) {
    throw createError({ statusCode: 404, statusMessage: 'Monitor not found' })
  }

  // Get results for last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const results = await db
    .select()
    .from(monitorResults)
    .where(
      and(
        eq(monitorResults.monitorId, id),
        gte(monitorResults.executedAt, sevenDaysAgo),
      ),
    )
    .orderBy(desc(monitorResults.executedAt))
    .limit(500)

  // Calculate stats
  const total = results.length
  const successful = results.filter(r => r.status === 'success').length
  const uptimePercent = total > 0 ? (successful / total) * 100 : null
  const avgResponseTime = total > 0
    ? results.reduce((sum, r) => sum + (r.responseTimeMs || 0), 0) / total
    : null

  return {
    ...monitor,
    createdAt: monitor.createdAt.toISOString(),
    updatedAt: monitor.updatedAt.toISOString(),
    results: results.map(r => ({
      ...r,
      executedAt: r.executedAt.toISOString(),
    })),
    stats: {
      uptimePercent,
      avgResponseTime: avgResponseTime ? Math.round(avgResponseTime) : null,
      totalChecks: total,
      lastChecked: results[0]?.executedAt?.toISOString() || null,
    },
  }
})
