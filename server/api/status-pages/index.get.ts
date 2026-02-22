import { eq, desc, sql } from 'drizzle-orm'
import { statusPages, statusPageMonitors } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()

  const pages = await db
    .select({
      id: statusPages.id,
      slug: statusPages.slug,
      title: statusPages.title,
      description: statusPages.description,
      isPublic: statusPages.isPublic,
      createdAt: statusPages.createdAt,
      updatedAt: statusPages.updatedAt,
      monitorCount: sql<number>`count(${statusPageMonitors.id})`,
    })
    .from(statusPages)
    .leftJoin(statusPageMonitors, eq(statusPageMonitors.statusPageId, statusPages.id))
    .where(eq(statusPages.userId, user.id))
    .groupBy(statusPages.id)
    .orderBy(desc(statusPages.createdAt))

  return pages.map((p) => ({
    ...p,
    monitorCount: Number(p.monitorCount),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))
})
