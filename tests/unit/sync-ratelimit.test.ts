import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SlidingWindow, backoffMs, clientIp, createLoginThrottle, _resetRateLimits, MAX_BACKOFF_MS, LOGIN_IP_MAX, LOGIN_IP_WINDOW, REGISTER_IP_MAX } from '@/lib/auth-ratelimit'

describe('SlidingWindow', () => {
  it('allows max hits per window and frees slots as they age out', () => {
    const w = new SlidingWindow(3, 1000)
    expect([w.hit('k', 0), w.hit('k', 100), w.hit('k', 200), w.hit('k', 300)]).toEqual([true, true, true, false])
    expect(w.retryAfter('k', 300)).toBe(700)
    expect(w.hit('k', 1001)).toBe(true) // the hit at 0 aged out
    expect(w.hit('other', 300)).toBe(true)
  })
})

describe('clientIp', () => {
  it('uses the first x-forwarded-for hop, then x-real-ip', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7')
    expect(clientIp(new Headers({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2')
    expect(clientIp(new Headers())).toBe('unknown')
    expect(clientIp(undefined)).toBe('unknown')
  })
})

describe('login throttle', () => {
  it('per-email failures only add a capped exponential delay — never a lockout', () => {
    const t = createLoginThrottle()
    const now = 0
    for (let i = 0; i < 50; i++) t.after('owner@x.com', false, now)
    const g = t.before('owner@x.com', '192.0.2.1', now)
    expect(g.allowed).toBe(true) // the owner can still get in from another IP
    expect(g.delayMs).toBe(MAX_BACKOFF_MS)
    t.after('owner@x.com', true, now)
    expect(t.before('owner@x.com', '192.0.2.1', now).delayMs).toBe(0)
  })
  it('backoff grows 0,0,0,1s,2s,4s… capped at 30s', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 20].map(backoffMs)).toEqual([0, 0, 0, 1000, 2000, 4000, 8000, MAX_BACKOFF_MS])
  })
  it('per-IP window stops spraying many emails from one address', () => {
    const t = createLoginThrottle()
    for (let i = 0; i < LOGIN_IP_MAX; i++) expect(t.before(`e${i}@x.com`, '6.6.6.6', 0).allowed).toBe(true)
    const blocked = t.before('next@x.com', '6.6.6.6', 0)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterMs).toBe(LOGIN_IP_WINDOW)
    expect(t.before('next@x.com', '7.7.7.7', 0).allowed).toBe(true)
    expect(t.before('next@x.com', '6.6.6.6', LOGIN_IP_WINDOW).allowed).toBe(true)
  })
})

describe('POST /api/auth/register rate limit', () => {
  const env = { ...process.env }
  beforeEach(() => {
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:1/unused'
    process.env.AUTH_SECRET = 'test'
    _resetRateLimits()
  })
  afterEach(() => {
    process.env = { ...env }
    _resetRateLimits()
  })
  it('allows 5 attempts per IP per hour, then 429 (other IPs unaffected)', async () => {
    const { POST } = await import('@/app/api/auth/register/route')
    const req = (ip: string) => new Request('http://x/api/auth/register', { method: 'POST', body: '{"bad json', headers: { 'x-forwarded-for': ip } })
    for (let i = 0; i < REGISTER_IP_MAX; i++) expect((await POST(req('203.0.113.9'))).status).toBe(400)
    const limited = await POST(req('203.0.113.9'))
    expect(limited.status).toBe(429)
    expect(await limited.json()).toMatchObject({ code: 'rate_limited' })
    expect(Number(limited.headers.get('retry-after'))).toBeGreaterThan(0)
    expect((await POST(req('203.0.113.10'))).status).toBe(400)
  })
})
