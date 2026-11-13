import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { accountsEnabled, authSecret, googleEnabled } from '@/lib/auth-env'
import { LINK_COOKIE, LINK_TTL_MS, signLinkIntent } from '@/lib/auth-link'

export const dynamic = 'force-dynamic'

/**
 * Step 1 of "Link Google sign-in" (Account settings): the signed-in user asks to link, we set a short-lived signed
 * cookie, then the client starts the Google flow. The Google callback links only if the cookie AND the session
 * still name this user (see auth.ts / lib/auth-google.ts).
 */
export async function POST(req: Request) {
  if (!accountsEnabled() || !googleEnabled()) return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  // same-origin only (the session cookie is SameSite=Lax, this is defence in depth)
  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? new URL(req.url).host
  let originHost: string | null = null
  try {
    originHost = origin ? new URL(origin).host : null
  } catch {
    originHost = 'invalid'
  }
  if (originHost && originHost !== host) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const res = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  res.cookies.set(LINK_COOKIE, signLinkIntent(userId, authSecret()!), {
    httpOnly: true,
    sameSite: 'lax',
    secure: new URL(req.url).protocol === 'https:',
    path: '/',
    maxAge: Math.floor(LINK_TTL_MS / 1000),
  })
  return res
}
