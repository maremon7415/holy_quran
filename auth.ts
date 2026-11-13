import NextAuth, { type NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { authSecret, googleEnabled } from '@/lib/auth-env'
import { verifyCredentials } from '@/lib/auth-credentials'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

declare module 'next-auth' {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; image?: string | null }
  }
}

const providers: NextAuthConfig['providers'] = [
  Credentials({
    name: 'Email',
    credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
    authorize: (credentials) => verifyCredentials(credentials),
  }),
]
// Google is opt-in: only registered when both vars are present.
if (googleEnabled()) providers.push(Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET }))

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  trustHost: true,
  // A placeholder keeps module evaluation safe when no secret is set; every route checks accountsEnabled() first.
  secret: authSecret() ?? 'accounts-disabled-placeholder',
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 90 },
  pages: { signIn: '/login', error: '/login' },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === 'google') {
        // map the Google identity onto our own User document (create on first sign-in)
        await connectDB()
        const email = (token.email ?? user?.email ?? '').toLowerCase()
        let u = await User.findOne({ email })
        if (!u) u = await User.create({ name: user?.name || email.split('@')[0], email, image: user?.image ?? undefined })
        token.sub = u._id.toString()
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
