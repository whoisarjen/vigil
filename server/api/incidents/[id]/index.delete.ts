import { eq, and } from 'drizzle-orm'
import { incidents } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()
  const id = getRouterParam(event, 'id')!

  // Verify ownership
  const [existing] = await db
    .select({ id: incidents.id })
    .from(incidents)
    .where(and(eq(incidents.id, id), eq(incidents.userId, user.id)))

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Incident not found' })
  }

  await db.delete(incidents).where(eq(incidents.id, id))

  return { success: true }
})
