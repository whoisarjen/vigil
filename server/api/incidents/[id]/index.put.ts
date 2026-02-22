import { eq, and } from 'drizzle-orm'
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
  const parsed = updateIncidentSchema.parse(body)

  // If status changed, create a new update entry
  if (parsed.status && parsed.status !== existing.status) {
    await db.insert(incidentUpdates).values({
      incidentId: id,
      message: parsed.message || `Status changed to ${parsed.status}`,
      status: parsed.status,
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
  if (parsed.status === 'resolved') {
    updateData.resolvedAt = new Date()
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
