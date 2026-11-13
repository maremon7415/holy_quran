import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Best-effort in-process throttle (per email). Serverless instances don't share it, but it slows simple guessing. */
const fails = new Map<string, { n: number; at: number }>()
const WINDOW = 10 * 60_000
let dummyHash: string | undefined

export async function verifyCredentials(raw: unknown) {
  const parsed = credentialsSchema.safeParse(raw)
  if (!parsed.success) {
    await sleep(400)
    return null
  }
  const { email, password } = parsed.data
  const rec = fails.get(email)
  const recent = rec && Date.now() - rec.at < WINDOW ? rec.n : 0
  if (recent >= 5) {
    await sleep(2000)
    return null
  }
  await connectDB()
  const user = await User.findOne({ email })
  // compare against a dummy hash when the user is missing, so timing doesn't reveal which emails exist
  const hash = user?.password ?? (dummyHash ??= bcrypt.hashSync('noor-dummy', 11))
  const ok = await bcrypt.compare(password, hash)
  if (!user || !user.password || !ok) {
    fails.set(email, { n: recent + 1, at: Date.now() })
    await sleep(500 + Math.random() * 300)
    return null
  }
  fails.delete(email)
  return { id: user._id.toString(), name: user.name, email: user.email, image: user.image ?? null }
}
