import { eq, and, desc } from 'drizzle-orm'
import {
  incidents,
  incidentUpdates,
  incidentMonitors,
  monitors,
} from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()
  const id = getRouterParam(event, 'id')!

  // Get incident with ownership check
  const [incident] = await db
    .select()
    .from(incidents)
    .where(and(eq(incidents.id, id), eq(incidents.userId, user.id)))

  if (!incident) {
    throw createError({ statusCode: 404, statusMessage: 'Incident not found' })
  }

  // Get all updates ordered by createdAt desc
  const updates = await db
    .select()
    .from(incidentUpdates)
    .where(eq(incidentUpdates.incidentId, id))
    .orderBy(desc(incidentUpdates.createdAt))

  // Get affected monitor names
  const affectedMonitors = await db
    .select({
      id: monitors.id,
      name: monitors.name,
    })
    .from(incidentMonitors)
    .innerJoin(monitors, eq(monitors.id, incidentMonitors.monitorId))
    .where(eq(incidentMonitors.incidentId, id))

  return {
    ...incident,
    createdAt: incident.createdAt.toISOString(),
    updatedAt: incident.updatedAt.toISOString(),
    resolvedAt: incident.resolvedAt?.toISOString() || null,
    updates: updates.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })),
    affectedMonitors,
  }
})
