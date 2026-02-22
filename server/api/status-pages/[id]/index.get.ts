import { eq, and } from 'drizzle-orm'
import { statusPages, statusPageMonitors } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()
  const id = getRouterParam(event, 'id')!

  // Get status page with ownership check
  const [statusPage] = await db
    .select()
    .from(statusPages)
    .where(and(eq(statusPages.id, id), eq(statusPages.userId, user.id)))

  if (!statusPage) {
    throw createError({ statusCode: 404, statusMessage: 'Status page not found' })
  }

  // Get linked monitor IDs
  const linkedMonitors = await db
    .select({ monitorId: statusPageMonitors.monitorId })
    .from(statusPageMonitors)
    .where(eq(statusPageMonitors.statusPageId, id))

  return {
    ...statusPage,
    createdAt: statusPage.createdAt.toISOString(),
    updatedAt: statusPage.updatedAt.toISOString(),
    monitorIds: linkedMonitors.map((m) => m.monitorId),
  }
})
