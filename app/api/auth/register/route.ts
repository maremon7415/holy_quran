import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { accountsEnabled } from '@/lib/auth-env'
import { registerSchema } from '@/lib/auth-credentials'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!accountsEnabled()) return NextResponse.json({ code: 'disabled', message: 'Accounts are not enabled on this deployment.' }, { status: 503 })
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
    if (await User.exists({ email })) return NextResponse.json({ code: 'email_taken', message: 'An account with this email already exists.' }, { status: 409 })
    await User.create({ name, email, password: await bcrypt.hash(password, 11) })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e) {
    // a race on the unique index surfaces as E11000
    if ((e as { code?: number }).code === 11000) return NextResponse.json({ code: 'email_taken', message: 'An account with this email already exists.' }, { status: 409 })
    console.error('[register]', e)
    return NextResponse.json({ code: 'server', message: 'Could not create the account. Please try again.' }, { status: 500 })
  }
}
