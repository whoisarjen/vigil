import { eq, and, desc, gte, lte } from 'drizzle-orm'
import { monitors, monitorResults } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()
  const id = getRouterParam(event, 'id')!
  const query = getQuery(event)

  const limit = Math.min(Number(query.limit) || 50, 200)
  const offset = Number(query.offset) || 0

  // Verify ownership
  const [monitor] = await db
    .select({ id: monitors.id })
    .from(monitors)
    .where(and(eq(monitors.id, id), eq(monitors.userId, user.id)))

  if (!monitor) {
    throw createError({ statusCode: 404, statusMessage: 'Monitor not found' })
  }

  const results = await db
    .select()
    .from(monitorResults)
    .where(eq(monitorResults.monitorId, id))
    .orderBy(desc(monitorResults.executedAt))
    .limit(limit)
    .offset(offset)

  return results.map(r => ({
    ...r,
    executedAt: r.executedAt.toISOString(),
  }))
})
