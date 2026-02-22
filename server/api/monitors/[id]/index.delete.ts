import { eq, and } from 'drizzle-orm'
import { monitors } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()
  const id = getRouterParam(event, 'id')!

  // Verify ownership
  const [existing] = await db
    .select({ id: monitors.id })
    .from(monitors)
    .where(and(eq(monitors.id, id), eq(monitors.userId, user.id)))

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Monitor not found' })
  }

  await db.delete(monitors).where(eq(monitors.id, id))

  return { success: true }
})
