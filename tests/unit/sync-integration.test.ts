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

    const reg = (body: object) => POST(new Request('http://x/api/auth/register', { method: 'POST', body: JSON.stringify(body) }))
    expect((await reg({ name: 'A', email: 'Ali@Example.com', password: 'correct horse' })).status).toBe(201)
    expect((await reg({ name: 'A', email: 'ali@example.com', password: 'correct horse' })).status).toBe(409)
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

    await handleDelete(repo, uid)
    expect((await handleGet(repo, uid)).body).toMatchObject({ version: 0 })
  }, 60_000)
})
