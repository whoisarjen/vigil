import { eq, and, ne, inArray } from 'drizzle-orm'
import { statusPages, statusPageMonitors, monitors } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  // Verify ownership
  const [existing] = await db
    .select()
    .from(statusPages)
    .where(and(eq(statusPages.id, id), eq(statusPages.userId, user.id)))

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Status page not found' })
  }

  // Validate
  const parsed = updateStatusPageSchema.parse(body)

  // If slug changed, check uniqueness
  if (parsed.slug && parsed.slug !== existing.slug) {
    const [slugTaken] = await db
      .select({ id: statusPages.id })
      .from(statusPages)
      .where(and(eq(statusPages.slug, parsed.slug), ne(statusPages.id, id)))

    if (slugTaken) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A status page with this slug already exists',
      })
    }
  }

  // If monitorIds provided, re-link monitors
  if (parsed.monitorIds !== undefined) {
    // Delete existing links
    await db
      .delete(statusPageMonitors)
      .where(eq(statusPageMonitors.statusPageId, id))

    // Insert new links
    if (parsed.monitorIds.length > 0) {
      // Verify all monitors belong to user
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
        await db.insert(statusPageMonitors).values(
          validMonitorIds.map((monitorId, index) => ({
            statusPageId: id,
            monitorId,
            displayOrder: index,
          })),
        )
      }
    }
  }

  // Update status page
  const { monitorIds: _, ...updateData } = parsed
  const [updated] = await db
    .update(statusPages)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(statusPages.id, id))
    .returning()

  return updated
})
