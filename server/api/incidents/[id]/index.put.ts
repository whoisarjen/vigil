import { eq, and } from 'drizzle-orm'
import { ZodError } from 'zod'
import { incidents, incidentUpdates } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  // Verify ownership
  const [existing] = await db
    .select()
    .from(incidents)
    .where(and(eq(incidents.id, id), eq(incidents.userId, user.id)))

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Incident not found' })
  }

  // Validate
  let parsed
  try {
    parsed = updateIncidentSchema.parse(body)
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

  // Always create an update entry when a message is provided
  if (parsed.message) {
    await db.insert(incidentUpdates).values({
      incidentId: id,
      message: parsed.message,
      status: parsed.status || existing.status,
    })
  }

  // Build update data
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  }

  if (parsed.title !== undefined) updateData.title = parsed.title
  if (parsed.status !== undefined) updateData.status = parsed.status
  if (parsed.impact !== undefined) updateData.impact = parsed.impact

  // If status changed to resolved, set resolvedAt
  if (parsed.status === 'resolved' && existing.status !== 'resolved') {
    updateData.resolvedAt = new Date()
  }
  // If re-opened from resolved, clear resolvedAt
  if (parsed.status && parsed.status !== 'resolved' && existing.status === 'resolved') {
    updateData.resolvedAt = null
  }

  // Update incident
  const [updated] = await db
    .update(incidents)
    .set(updateData)
    .where(eq(incidents.id, id))
    .returning()

  return {
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    resolvedAt: updated.resolvedAt?.toISOString() || null,
  }
})
