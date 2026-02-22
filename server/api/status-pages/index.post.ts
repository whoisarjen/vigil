import { eq, and, inArray } from 'drizzle-orm'
import { statusPages, statusPageMonitors, monitors } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()
  const body = await readBody(event)

  // Validate
  const parsed = createStatusPageSchema.parse(body)

  // Check slug uniqueness
  const [existingSlug] = await db
    .select({ id: statusPages.id })
    .from(statusPages)
    .where(eq(statusPages.slug, parsed.slug))

  if (existingSlug) {
    throw createError({
      statusCode: 409,
      statusMessage: 'A status page with this slug already exists',
    })
  }

  // Create status page
  const [statusPage] = await db
    .insert(statusPages)
    .values({
      slug: parsed.slug,
      title: parsed.title,
      description: parsed.description,
      isPublic: parsed.isPublic,
      userId: user.id,
    })
    .returning()

  // Link monitors if provided
  if (parsed.monitorIds && parsed.monitorIds.length > 0) {
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
          statusPageId: statusPage.id,
          monitorId,
          displayOrder: index,
        })),
      )
    }
  }

  return statusPage
})
