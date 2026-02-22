import { eq, and } from 'drizzle-orm'
import { ZodError } from 'zod'
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
  let parsed
  try {
    parsed = updateMonitorSchema.parse(body)
  } catch (err) {
    if (err instanceof ZodError) {
      const fieldErrors = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      throw createError({
        statusCode: 422,
        statusMessage: `Validation failed: ${fieldErrors}`,
      })
    }
    throw err
  }

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
