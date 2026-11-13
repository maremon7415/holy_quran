/**
 * Small in-memory rate limiting for the auth endpoints. Pure + clock-injectable so it can be unit-tested.
 *
 * NOTE: state lives in the memory of one server instance. That is fine for a single-region deployment (Vercel's
 * default), but instances don't share counters; for horizontal scale use a shared store (e.g. Upstash Redis
 * `@upstash/ratelimit`) behind the same functions.
 *
 * Policy
 *  - login, per IP: 20 attempts / 10 min (sliding window) → rejected with `rate_limited` (stops password spraying
 *    across many emails from one address).
 *  - login, per email: failures (from any IP) in the last 15 min add an exponential delay before the password is
 *    checked: 0 for the first 2, then 1 s, 2 s, 4 s … capped at 30 s. It is a delay, never a lockout, so an attacker
 *    hammering an email cannot keep the real owner (with the right password, from another IP) out.
 *  - register, per IP: 5 / hour.
 */

export class SlidingWindow {
  private hits = new Map<string, number[]>()
  constructor(readonly max: number, readonly windowMs: number) {}

  private recent(key: string, now: number): number[] {
    const list = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs)
    if (list.length) this.hits.set(key, list)
    else this.hits.delete(key)
    return list
  }
  count(key: string, now = Date.now()): number {
    return this.recent(key, now).length
  }
  /** Records an attempt; false when the key already used up its window (the attempt is then not recorded). */
  hit(key: string, now = Date.now()): boolean {
    const list = this.recent(key, now)
    if (list.length >= this.max) return false
    list.push(now)
    this.hits.set(key, list)
    if (this.hits.size > 10_000) this.sweep(now)
    return true
  }
  /** Milliseconds until the next attempt would be allowed (0 = now). */
  retryAfter(key: string, now = Date.now()): number {
    const list = this.recent(key, now)
    return list.length < this.max ? 0 : Math.max(0, list[0] + this.windowMs - now)
  }
  reset(key: string) {
    this.hits.delete(key)
  }
  clear() {
    this.hits.clear()
  }
  private sweep(now: number) {
    for (const k of [...this.hits.keys()]) this.recent(k, now)
  }
}

/** Client IP from the proxy headers (first hop of x-forwarded-for, else x-real-ip). */
export function clientIp(headers: Headers | undefined | null): string {
  const xff = headers?.get('x-forwarded-for')
  const first = xff?.split(',')[0]?.trim()
  if (first) return first.slice(0, 64)
  const real = headers?.get('x-real-ip')?.trim()
  return real ? real.slice(0, 64) : 'unknown'
}

export const LOGIN_IP_MAX = 20
export const LOGIN_IP_WINDOW = 10 * 60_000
export const EMAIL_FAIL_WINDOW = 15 * 60_000
export const MAX_BACKOFF_MS = 30_000
export const REGISTER_IP_MAX = 5
export const REGISTER_IP_WINDOW = 60 * 60_000

/** Delay before checking a password for an email with `failures` recent failures. */
export function backoffMs(failures: number): number {
  if (failures < 3) return 0
  return Math.min(MAX_BACKOFF_MS, 1000 * 2 ** (failures - 3))
}

export function createLoginThrottle() {
  const perIp = new SlidingWindow(LOGIN_IP_MAX, LOGIN_IP_WINDOW)
  const fails = new SlidingWindow(Number.MAX_SAFE_INTEGER, EMAIL_FAIL_WINDOW)
  return {
    /** Call before checking a password. `allowed: false` = reject without checking; otherwise wait `delayMs` first. */
    before(email: string, ip: string, now = Date.now()): { allowed: boolean; delayMs: number; retryAfterMs: number } {
      if (!perIp.hit(ip, now)) return { allowed: false, delayMs: 0, retryAfterMs: perIp.retryAfter(ip, now) }
      return { allowed: true, delayMs: backoffMs(fails.count(email, now)), retryAfterMs: 0 }
    },
    /** Record the outcome. A success clears the email's failures. */
    after(email: string, ok: boolean, now = Date.now()) {
      if (ok) fails.reset(email)
      else fails.hit(email, now)
    },
    clear() {
      perIp.clear()
      fails.clear()
    },
  }
}

export const loginThrottle = createLoginThrottle()
export const registerLimiter = new SlidingWindow(REGISTER_IP_MAX, REGISTER_IP_WINDOW)

/** Test helper. */
export function _resetRateLimits() {
  loginThrottle.clear()
  registerLimiter.clear()
}
