import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

/**
 * Real-MongoDB integration: register → verify credentials → sync GET/PUT/409 through the Mongo repo.
 * Skipped automatically when mongodb-memory-server cannot obtain a mongod binary (e.g. offline CI).
 */
let mongod: { getUri(): string; stop(): Promise<boolean> } | null = null

describe('accounts + sync against real MongoDB', () => {
  beforeAll(async () => {
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server')
      mongod = await MongoMemoryServer.create()
      process.env.MONGODB_URI = mongod.getUri()
      process.env.AUTH_SECRET = 'test-secret'
    } catch (e) {
      console.warn('[sync-integration] mongod unavailable, skipping:', (e as Error).message.split('\n')[0])
    }
  }, 120_000)
  afterAll(async () => {
    await mongoose.disconnect()
    await mongod?.stop()
  })

  it('register → login → sync GET/PUT/409 → delete', async (ctx) => {
    if (!mongod) return ctx.skip()
    const { POST } = await import('@/app/api/auth/register/route')
    const { verifyCredentials } = await import('@/lib/auth-credentials')
    const { mongoRepo } = await import('@/lib/sync/repo-mongo')
    const { handleGet, handlePut, handleDelete } = await import('@/lib/sync/handlers')
    const User = (await import('@/models/User')).default

    const { _resetRateLimits } = await import('@/lib/auth-ratelimit')
    _resetRateLimits()
    const reg = (body: object) => POST(new Request('http://x/api/auth/register', { method: 'POST', body: JSON.stringify(body) }))
    const first = await reg({ name: 'A', email: 'Ali@Example.com', password: 'correct horse' })
    expect(first.status).toBe(201)
    // an existing email answers exactly like a new one (no enumeration) and changes nothing
    const dup = await reg({ name: 'Mallory', email: 'ali@example.com', password: 'attacker pass' })
    expect(dup.status).toBe(201)
    expect(await dup.json()).toEqual(await first.json())
    expect(await User.countDocuments({ email: 'ali@example.com' })).toBe(1)
    expect((await User.findOne({ email: 'ali@example.com' }))!.name).toBe('A')
    expect((await User.findOne({ email: 'ali@example.com' }))!.emailVerified).toBe(false)
    expect((await reg({ name: 'A', email: 'b@example.com', password: 'short' })).status).toBe(400)

    expect(await verifyCredentials({ email: 'ali@example.com', password: 'wrong password' })).toBeNull()
    const user = await verifyCredentials({ email: 'ALI@example.com', password: 'correct horse' })
    expect(user?.email).toBe('ali@example.com')
    expect(await bcrypt.compare('correct horse', (await User.findOne({ email: 'ali@example.com' }))!.password!)).toBe(true)

    const repo = mongoRepo()
    const uid = user!.id
    expect((await handleGet(repo, uid)).body).toMatchObject({ version: 0 })
    const put = (version: number, stores: object) => handlePut(repo, uid, JSON.stringify({ version, stores, device: { id: 'dev-abcd', name: 'Test' } }))
    const snap = (d: object) => ({ 'quran-store': { updatedAt: '2026-01-01T00:00:00Z', data: d } })

    const r1 = await put(0, snap({ favoriteSurahs: [1], 'weird.key': 1 }))
    expect(r1.status).toBe(200)
    expect((r1.body as any).version).toBe(1)
    expect((await put(0, snap({ favoriteSurahs: [2] }))).status).toBe(409) // stale create
    const r2 = await put(1, { 'noor-hifz': { updatedAt: '2026-01-02T00:00:00Z', data: { cards: {} } } })
    expect((r2.body as any).version).toBe(2)
    const stale = await put(1, snap({ favoriteSurahs: [3] }))
    expect(stale.status).toBe(409)
    expect((stale.body as any).current.version).toBe(2)

    const got = (await handleGet(repo, uid)).body as any
    expect(got.stores['quran-store'].data).toEqual({ favoriteSurahs: [1], 'weird.key': 1 })
    expect(Object.keys(got.stores).sort()).toEqual(['noor-hifz', 'quran-store'])
    expect(got.devices).toHaveLength(1)

    // delete = clear + bump epoch; the doc survives so other devices learn about it
    const del = (await handleDelete(repo, uid)).body as any
    expect(del).toMatchObject({ version: 3, epoch: 1, stores: {}, devices: [] })
    expect((await handleGet(repo, uid)).body).toMatchObject({ version: 3, epoch: 1, stores: {} })
    // stale clients (version 0 retry, or the old epoch) can't recreate it
    expect((await put(0, snap({ favoriteSurahs: [9] }))).status).toBe(409)
    const staleEpoch = await handlePut(repo, uid, JSON.stringify({ version: 3, epoch: 0, stores: snap({ favoriteSurahs: [9] }) }))
    expect(staleEpoch).toMatchObject({ status: 409, body: { error: 'epoch_mismatch' } })
    expect((await handleGet(repo, uid)).body).toMatchObject({ stores: {} })
    const again = await handlePut(repo, uid, JSON.stringify({ version: 3, epoch: 1, stores: snap({ favoriteSurahs: [9] }) }))
    expect(again).toMatchObject({ status: 200, body: { version: 4, epoch: 1 } })
  }, 60_000)

  it('login throttling: wrong passwords add delay but never lock out the owner; per-IP window rejects', async (ctx) => {
    if (!mongod) return ctx.skip()
    const { POST } = await import('@/app/api/auth/register/route')
    const creds = await import('@/lib/auth-credentials')
    const { _resetRateLimits, LOGIN_IP_MAX, MAX_BACKOFF_MS } = await import('@/lib/auth-ratelimit')
    _resetRateLimits()
    const delays: number[] = []
    creds._setSleep(async (ms) => { delays.push(ms) })
    await POST(new Request('http://x/api/auth/register', { method: 'POST', body: JSON.stringify({ name: 'O', email: 'owner@example.com', password: 'owner password' }) }))
    // attacker: 10 wrong passwords from 10 different IPs (old code locked the email after 5)
    for (let i = 0; i < 10; i++) expect(await creds.verifyCredentials({ email: 'owner@example.com', password: `guess ${i}` }, { ip: `10.0.0.${i}` })).toBeNull()
    delays.length = 0
    const ok = await creds.verifyCredentials({ email: 'owner@example.com', password: 'owner password' }, { ip: '192.168.1.1' })
    expect(ok?.email).toBe('owner@example.com')
    expect(Math.max(...delays)).toBeLessThanOrEqual(MAX_BACKOFF_MS) // delayed, capped, not refused
    expect(Math.max(...delays)).toBeGreaterThan(0)
    // per-IP window: spraying many emails from one address is cut off
    _resetRateLimits()
    for (let i = 0; i < LOGIN_IP_MAX; i++) await creds.verifyCredentials({ email: `spray${i}@example.com`, password: 'x' }, { ip: '6.6.6.6' })
    await expect(creds.verifyCredentials({ email: 'spray-next@example.com', password: 'x' }, { ip: '6.6.6.6' })).rejects.toBeInstanceOf(creds.LoginRateLimited)
    // …while the owner from elsewhere is unaffected
    expect((await creds.verifyCredentials({ email: 'owner@example.com', password: 'owner password' }, { ip: '192.168.1.1' }))?.email).toBe('owner@example.com')
    creds._setSleep((ms) => new Promise((r) => setTimeout(r, ms)))
  }, 60_000)
})
