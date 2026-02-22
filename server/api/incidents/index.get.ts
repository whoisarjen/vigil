import { eq, and, desc } from 'drizzle-orm'
import {
  incidents,
  statusPages,
  incidentMonitors,
  monitors,
} from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()

  const query = getQuery(event)
  const statusPageId = query.statusPageId as string | undefined

  // Build where conditions
  const conditions = [eq(incidents.userId, user.id)]
  if (statusPageId) {
    conditions.push(eq(incidents.statusPageId, statusPageId))
  }

  // Get incidents with status page title
  const userIncidents = await db
    .select({
      id: incidents.id,
      title: incidents.title,
      status: incidents.status,
      impact: incidents.impact,
      statusPageId: incidents.statusPageId,
      statusPageTitle: statusPages.title,
      createdAt: incidents.createdAt,
      updatedAt: incidents.updatedAt,
      resolvedAt: incidents.resolvedAt,
    })
    .from(incidents)
    .innerJoin(statusPages, eq(statusPages.id, incidents.statusPageId))
    .where(and(...conditions))
    .orderBy(desc(incidents.createdAt))

  // Get affected monitor names for each incident
  const result = await Promise.all(
    userIncidents.map(async (incident) => {
      const affectedMonitors = await db
        .select({ name: monitors.name })
        .from(incidentMonitors)
        .innerJoin(monitors, eq(monitors.id, incidentMonitors.monitorId))
        .where(eq(incidentMonitors.incidentId, incident.id))

      return {
        ...incident,
        createdAt: incident.createdAt.toISOString(),
        updatedAt: incident.updatedAt.toISOString(),
        resolvedAt: incident.resolvedAt?.toISOString() || null,
        affectedMonitors: affectedMonitors.map((m) => m.name),
      }
    }),
  )

  return result
})
