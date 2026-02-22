import { eq } from 'drizzle-orm'
import { users } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = useDB()

  // Delete user (cascades to monitors and results via FK)
  await db.delete(users).where(eq(users.id, user.id))

  // Clear session
  await clearUserSession(event)

  return { success: true }
})
