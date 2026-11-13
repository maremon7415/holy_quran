import NextAuth, { CredentialsSignin, type NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { decode } from 'next-auth/jwt'
import { authSecret, googleEnabled } from '@/lib/auth-env'
import { LoginRateLimited, verifyCredentials } from '@/lib/auth-credentials'
import { decideGoogleSignIn, type UserLite } from '@/lib/auth-google'
import { LINK_COOKIE, verifyLinkIntent } from '@/lib/auth-link'
import { clientIp } from '@/lib/auth-ratelimit'
import { connectDB } from '@/lib/db'
import User, { type IUser } from '@/models/User'

declare module 'next-auth' {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; image?: string | null }
  }
}

class RateLimitedSignin extends CredentialsSignin {
  code = 'rate_limited'
}

const providers: NextAuthConfig['providers'] = [
  Credentials({
    name: 'Email',
    credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
    authorize: async (credentials, request) => {
      try {
        return await verifyCredentials(credentials, { ip: clientIp(request?.headers) })
      } catch (e) {
        if (e instanceof LoginRateLimited) throw new RateLimitedSignin()
        throw e
      }
    },
  }),
]
// Google is opt-in: only registered when both vars are present.
if (googleEnabled()) providers.push(Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET }))

const lite = (u: IUser | null): UserLite | null =>
  u ? { id: u._id.toString(), hasPassword: Boolean(u.password), emailVerified: Boolean(u.emailVerified), googleId: u.googleId ?? null } : null

/** The user id of a valid "link Google" request made by the user who is signed in right now, else null. */
async function linkRequestUserId(): Promise<string | null> {
  const secret = authSecret()
  if (!secret) return null
  try {
    const { cookies } = await import('next/headers')
    const jar = await cookies()
    const intent = verifyLinkIntent(jar.get(LINK_COOKIE)?.value, secret)
    if (!intent) return null
    jar.delete(LINK_COOKIE)
    for (const name of ['__Secure-authjs.session-token', 'authjs.session-token']) {
      const token = jar.get(name)?.value
      if (!token) continue
      const session = await decode({ token, secret, salt: name })
      if (session?.sub === intent) return intent
    }
  } catch (e) {
    console.error('[auth] link check failed', e)
  }
  return null
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  trustHost: true,
  // A placeholder keeps module evaluation safe when no secret is set; every route checks accountsEnabled() first.
  secret: authSecret() ?? 'accounts-disabled-placeholder',
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 90 },
  pages: { signIn: '/login', error: '/login' },
  callbacks: {
    /** Map a Google identity onto a local User — see lib/auth-google.ts for the account-takeover rules. */
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google') return true
      await connectDB()
      const sub = account.providerAccountId
      const email = String(profile?.email ?? user?.email ?? '').toLowerCase()
      const emailVerified = (profile as { email_verified?: boolean } | undefined)?.email_verified
      const linkUserId = await linkRequestUserId()
      const decision = decideGoogleSignIn({
        googleSub: sub,
        emailVerified,
        byGoogleId: lite(await User.findOne({ googleId: sub })),
        byEmail: email ? lite(await User.findOne({ email })) : null,
        linkUserId,
      })
      switch (decision.action) {
        case 'signin':
          return true
        case 'link': {
          const target = await User.findById(decision.userId)
          if (!target) return '/login?error=AccessDenied'
          target.googleId = sub
          // Google vouches for its address; it proves ownership of this account's email only if they match
          if (emailVerified === true && target.email === email) target.emailVerified = true
          if (!target.image && user?.image) target.image = user.image
          await target.save()
          return true
        }
        case 'create':
          await User.create({ name: user?.name || email.split('@')[0], email, image: user?.image ?? undefined, googleId: sub, emailVerified: true })
          return true
        case 'refuse':
          return linkUserId ? `/account?error=${decision.error}` : `/login?error=${decision.error}`
      }
    },
    async jwt({ token, user, account }) {
      if (account?.provider === 'google') {
        await connectDB()
        const u = await User.findOne({ googleId: account.providerAccountId })
        // never fall back to Google's own id as our user id
        if (u) token.sub = u._id.toString()
        else delete token.sub
      } else if (user?.id) {
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
  },
})
