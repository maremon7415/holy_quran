import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * "Link Google sign-in" intent: a short-lived cookie, HMAC-signed with the auth secret, naming the signed-in user who
 * asked to link. The Google callback only honours it when the current session belongs to the same user.
 */
export const LINK_COOKIE = 'nq-link-google'
export const LINK_TTL_MS = 10 * 60_000

const mac = (payload: string, secret: string) => createHmac('sha256', secret).update(`link-google:${payload}`).digest('base64url')

export function signLinkIntent(userId: string, secret: string, now = Date.now()): string {
  const payload = `${userId}.${now + LINK_TTL_MS}`
  return `${payload}.${mac(payload, secret)}`
}

/** The user id if the value is authentic and not expired, else null. */
export function verifyLinkIntent(value: string | undefined | null, secret: string, now = Date.now()): string | null {
  if (!value) return null
  const parts = value.split('.')
  if (parts.length !== 3) return null
  const [userId, exp, sig] = parts
  const want = Buffer.from(mac(`${userId}.${exp}`, secret))
  const got = Buffer.from(sig)
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null
  if (!/^\d+$/.test(exp) || Number(exp) < now) return null
  return userId || null
}
