import type { H3Event } from 'h3'
import type { SessionUser } from '~~/shared/types'

export async function requireAuth(event: H3Event): Promise<SessionUser> {
  const session = await getUserSession(event)
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return session.user as SessionUser
}
