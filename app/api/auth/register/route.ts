import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { accountsEnabled } from '@/lib/auth-env'
import { registerSchema } from '@/lib/auth-credentials'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { clientIp, registerLimiter } from '@/lib/auth-ratelimit'

export const dynamic = 'force-dynamic'

/**
 * Creates an email + password account.
 *
 * Existing emails are NOT revealed: registering an address that already has an account answers exactly like a
 * successful registration (same status/body, same bcrypt cost) but changes nothing. The client then tries to sign in
 * with the submitted password; if that fails it shows "Could not create account — if you already have one, sign in".
 * Rate limit: 5 attempts per IP per hour (in-memory, per instance — see lib/auth-ratelimit.ts).
 */
const created = () => NextResponse.json({ ok: true }, { status: 201 })

export async function POST(req: Request) {
  if (!accountsEnabled()) return NextResponse.json({ code: 'disabled', message: 'Accounts are not enabled on this deployment.' }, { status: 503 })
  const ip = clientIp(req.headers)
  if (!registerLimiter.hit(ip)) {
    const retry = Math.ceil(registerLimiter.retryAfter(ip) / 1000)
    return NextResponse.json({ code: 'rate_limited', message: 'Too many attempts. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(retry) } })
  }
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ code: 'invalid', message: 'Invalid request.' }, { status: 400 })
  }
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    const weak = parsed.error.issues.some((i) => i.path[0] === 'password')
    const email = parsed.error.issues.some((i) => i.path[0] === 'email')
    return NextResponse.json(
      { code: weak ? 'weak_password' : email ? 'invalid_email' : 'invalid', message: weak ? 'Password must be 8–72 characters.' : email ? 'Enter a valid email address.' : 'Please fill all fields.' },
      { status: 400 },
    )
  }
  const { name, email, password } = parsed.data
  try {
    await connectDB()
    const hash = await bcrypt.hash(password, 11) // always pay the bcrypt cost so timing doesn't reveal existing emails
    if (await User.exists({ email })) return created()
    // email ownership is not verified for password accounts (no mail sending); Google sign-in relies on this flag
    await User.create({ name, email, password: hash, emailVerified: false })
    return created()
  } catch (e) {
    // a race on the unique index surfaces as E11000: same answer as an existing email
    if ((e as { code?: number }).code === 11000) return created()
    console.error('[register]', e)
    return NextResponse.json({ code: 'server', message: 'Could not create the account. Please try again.' }, { status: 500 })
  }
}
