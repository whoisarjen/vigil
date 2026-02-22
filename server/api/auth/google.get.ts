import { eq } from 'drizzle-orm'
import { users } from '~~/server/db/schema'

export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['email', 'profile'],
  },
  async onSuccess(event, { user: googleUser }) {
    const db = useDB()

    // Upsert user
    const existing = await db.query.users.findFirst({
      where: eq(users.googleId, googleUser.sub),
    })

    let dbUser
    if (existing) {
      const [updated] = await db
        .update(users)
        .set({
          name: googleUser.name,
          image: googleUser.picture,
          email: googleUser.email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id))
        .returning()
      dbUser = updated
    } else {
      const [created] = await db
        .insert(users)
        .values({
          email: googleUser.email,
          name: googleUser.name,
          image: googleUser.picture,
          googleId: googleUser.sub,
        })
        .returning()
      dbUser = created
    }

    // Set session
    await setUserSession(event, {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.image,
        plan: dbUser.plan,
      },
    })

    return sendRedirect(event, '/dashboard')
  },
  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/sign-in?error=auth')
  },
})
