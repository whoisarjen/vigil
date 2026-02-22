import { eq, and } from 'drizzle-orm'
import { monitors } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  // Verify ownership
  const [existing] = await db
    .select()
    .from(monitors)
    .where(and(eq(monitors.id, id), eq(monitors.userId, user.id)))

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Monitor not found' })
  }

  // Validate
  const parsed = updateMonitorSchema.parse(body)

  // Update
  const [updated] = await db
    .update(monitors)
    .set({
      ...parsed,
      updatedAt: new Date(),
    })
    .where(eq(monitors.id, id))
    .returning()

  return updated
})
