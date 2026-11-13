import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { loginThrottle } from '@/lib/auth-ratelimit'

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(72),
})

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'name').max(80),
  email: z.string().trim().toLowerCase().email().max(254),
  // bcrypt only uses the first 72 bytes
  password: z.string().min(8, 'weak').max(72),
})

let sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
/** Test hook: replace the sleep (e.g. to record delays instead of waiting). */
export function _setSleep(fn: (ms: number) => Promise<void>) {
  sleep = fn
}

/** Thrown when the caller's IP exceeded the login attempt window (see lib/auth-ratelimit.ts). */
export class LoginRateLimited extends Error {
  constructor(public retryAfterMs: number) {
    super('rate_limited')
  }
}

let dummyHash: string | undefined

/**
 * Check an email + password. Throttled per IP (hard window) and per email (exponential delay, never a lockout).
 * Returns the user or null; throws LoginRateLimited when the IP is over its window.
 */
export async function verifyCredentials(raw: unknown, ctx: { ip?: string } = {}) {
  const parsed = credentialsSchema.safeParse(raw)
  if (!parsed.success) {
    await sleep(400)
    return null
  }
  const { email, password } = parsed.data
  const gate = loginThrottle.before(email, ctx.ip ?? 'unknown')
  if (!gate.allowed) throw new LoginRateLimited(gate.retryAfterMs)
  if (gate.delayMs) await sleep(gate.delayMs)
  await connectDB()
  const user = await User.findOne({ email })
  // compare against a dummy hash when the user is missing, so timing doesn't reveal which emails exist
  const hash = user?.password ?? (dummyHash ??= bcrypt.hashSync('noor-dummy', 11))
  const ok = await bcrypt.compare(password, hash)
  if (!user || !user.password || !ok) {
    loginThrottle.after(email, false)
    await sleep(500 + Math.random() * 300)
    return null
  }
  loginThrottle.after(email, true)
  return { id: user._id.toString(), name: user.name, email: user.email, image: user.image ?? null }
}
