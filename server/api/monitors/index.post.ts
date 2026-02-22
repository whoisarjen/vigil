import { eq, sql } from 'drizzle-orm'
import { monitors } from '~~/server/db/schema'
import { PLANS } from '~~/shared/types'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()
  const body = await readBody(event)

  // Validate
  const parsed = createMonitorSchema.parse(body)

  // Check plan limits
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(monitors)
    .where(eq(monitors.userId, user.id))

  const plan = PLANS[user.plan as keyof typeof PLANS]
  if (Number(countResult.count) >= plan.maxMonitors) {
    throw createError({
      statusCode: 403,
      statusMessage: `Free plan is limited to ${plan.maxMonitors} monitors`,
    })
  }

  // Create
  const [monitor] = await db
    .insert(monitors)
    .values({
      ...parsed,
      userId: user.id,
      headers: parsed.headers || {},
      betteruptimeHeartbeatUrl: parsed.betteruptimeHeartbeatUrl || null,
    })
    .returning()

  return monitor
})
