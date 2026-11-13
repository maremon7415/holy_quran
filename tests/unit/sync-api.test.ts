import { describe, it, expect } from 'vitest'
import { handleDelete, handleGet, handlePut } from '@/lib/sync/handlers'
import { memoryRepo } from '@/lib/sync/repo'

const body = (version: number, stores: any = { 'noor-reader': { updatedAt: '2026-01-01T00:00:00Z', data: { tajweed: true } } }) => JSON.stringify({ version, stores, device: { id: 'dev-1234', name: 'Chrome on Linux' } })

describe('sync handlers (in-memory repo)', () => {
  it('GET empty → version 0', async () => {
    expect((await handleGet(memoryRepo(), 'u1')).body).toMatchObject({ version: 0, stores: {} })
  })
  it('PUT then GET round-trips and bumps version; stale version → 409 with current doc', async () => {
    const repo = memoryRepo()
    const r1 = await handlePut(repo, 'u1', body(0))
    expect(r1.status).toBe(200)
    expect((r1.body as any).version).toBe(1)
    const stale = await handlePut(repo, 'u1', body(0))
    expect(stale.status).toBe(409)
    expect((stale.body as any).current.version).toBe(1)
    const ok = await handlePut(repo, 'u1', body(1, { 'noor-hifz': { updatedAt: '2026-01-01T00:00:00Z', data: { cards: {} } } }))
    expect((ok.body as any).version).toBe(2)
    const got = (await handleGet(repo, 'u1')).body as any
    expect(Object.keys(got.stores).sort()).toEqual(['noor-hifz', 'noor-reader'])
    expect(got.devices[0].name).toBe('Chrome on Linux')
  })
  it('isolates users', async () => {
    const repo = memoryRepo()
    await handlePut(repo, 'u1', body(0))
    expect((await handleGet(repo, 'u2')).body).toMatchObject({ version: 0 })
  })
  it('rejects unknown keys, bad payloads, oversize', async () => {
    const repo = memoryRepo()
    expect((await handlePut(repo, 'u', body(0, { evil: { updatedAt: '2026-01-01T00:00:00Z', data: {} } }))).status).toBe(400)
    expect((await handlePut(repo, 'u', 'nope')).status).toBe(400)
    expect((await handlePut(repo, 'u', JSON.stringify({ version: 'x' }))).status).toBe(400)
    const big = body(0, { 'noor-hifz': { updatedAt: '2026-01-01T00:00:00Z', data: { s: 'x'.repeat(2 * 1024 * 1024) } } })
    expect((await handlePut(repo, 'u', big)).status).toBe(413)
  })
  it('DELETE clears the stores but keeps a reset marker (epoch) instead of removing the doc', async () => {
    const repo = memoryRepo()
    await handlePut(repo, 'u1', body(0))
    const del = await handleDelete(repo, 'u1')
    expect(del.body).toMatchObject({ version: 2, epoch: 1, stores: {}, devices: [] })
    expect((del.body as any).resetAt).toEqual(expect.any(String))
    expect((await handleGet(repo, 'u1')).body).toMatchObject({ version: 2, epoch: 1, stores: {} })
  })
  it('a device holding the pre-delete epoch cannot re-upload (not even with version 0)', async () => {
    const repo = memoryRepo()
    await handlePut(repo, 'u1', body(0))
    await handleDelete(repo, 'u1')
    // old client: no epoch, retries with version 0 after a 409 — the bug that recreated deleted data
    const v0 = await handlePut(repo, 'u1', body(0))
    expect(v0.status).toBe(409)
    expect((v0.body as any).error).toBe('epoch_mismatch')
    // right version, stale epoch
    const stale = await handlePut(repo, 'u1', JSON.stringify({ version: 2, epoch: 0, stores: {}, device: { id: 'dev-1234', name: 'x' } }))
    expect(stale.status).toBe(409)
    expect((stale.body as any)).toMatchObject({ error: 'epoch_mismatch', current: { epoch: 1, version: 2 } })
    expect((await handleGet(repo, 'u1')).body).toMatchObject({ stores: {} })
    // a client that saw the new epoch may upload again (user turned sync back on)
    const ok = await handlePut(repo, 'u1', JSON.stringify({ version: 2, epoch: 1, stores: JSON.parse(body(0)).stores }))
    expect(ok.status).toBe(200)
    expect(ok.body).toMatchObject({ version: 3, epoch: 1 })
  })
  it('DELETE without a doc is a no-op', async () => {
    expect((await handleDelete(memoryRepo(), 'nobody')).body).toMatchObject({ version: 0, epoch: 0 })
  })
})
