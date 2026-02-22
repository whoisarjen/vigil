import { eq, and } from 'drizzle-orm'
import { statusPages } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()
  const id = getRouterParam(event, 'id')!

  // Verify ownership
  const [existing] = await db
    .select({ id: statusPages.id })
    .from(statusPages)
    .where(and(eq(statusPages.id, id), eq(statusPages.userId, user.id)))

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Status page not found' })
  }

  await db.delete(statusPages).where(eq(statusPages.id, id))

  return { success: true }
})
