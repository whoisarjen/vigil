import { eq, and, inArray } from 'drizzle-orm'
import {
  incidents,
  incidentUpdates,
  incidentMonitors,
  statusPages,
  monitors,
} from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()
  const body = await readBody(event)

  // Validate
  const parsed = createIncidentSchema.parse(body)

  // Verify status page belongs to user
  const [statusPage] = await db
    .select({ id: statusPages.id })
    .from(statusPages)
    .where(
      and(
        eq(statusPages.id, parsed.statusPageId),
        eq(statusPages.userId, user.id),
      ),
    )

  if (!statusPage) {
    throw createError({ statusCode: 404, statusMessage: 'Status page not found' })
  }

  // Create incident
  const [incident] = await db
    .insert(incidents)
    .values({
      userId: user.id,
      statusPageId: parsed.statusPageId,
      title: parsed.title,
      status: parsed.status,
      impact: parsed.impact,
      resolvedAt: parsed.status === 'resolved' ? new Date() : null,
    })
    .returning()

  // Create initial update
  await db.insert(incidentUpdates).values({
    incidentId: incident.id,
    message: parsed.message,
    status: parsed.status,
  })

  // Link monitors if provided
  if (parsed.monitorIds && parsed.monitorIds.length > 0) {
    // Verify monitors belong to user
    const userMonitors = await db
      .select({ id: monitors.id })
      .from(monitors)
      .where(
        and(
          inArray(monitors.id, parsed.monitorIds),
          eq(monitors.userId, user.id),
        ),
      )

    const validMonitorIds = userMonitors.map((m) => m.id)

    if (validMonitorIds.length > 0) {
      await db.insert(incidentMonitors).values(
        validMonitorIds.map((monitorId) => ({
          incidentId: incident.id,
          monitorId,
        })),
      )
    }
  }

  return incident
})
