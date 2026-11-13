import { describe, it, expect, vi } from 'vitest'
import { readBodyCapped } from '@/lib/sync/body'
import { MAX_SYNC_BYTES } from '@/lib/sync/types'

/** A chunked request: no Content-Length, body arrives as a stream. Counts how much the server pulled. */
function chunked(totalBytes: number, chunk = 64 * 1024) {
  let sent = 0
  const stats = { pulled: 0, cancelled: false }
  const body = new ReadableStream<Uint8Array>({
    pull(ctrl) {
      if (sent >= totalBytes) return ctrl.close()
      const n = Math.min(chunk, totalBytes - sent)
      sent += n
      stats.pulled += n
      ctrl.enqueue(new Uint8Array(n).fill(0x61))
    },
    cancel() {
      stats.cancelled = true
    },
  })
  const req = new Request('http://localhost/api/sync', { method: 'PUT', body, duplex: 'half' } as RequestInit)
  return { req, stats }
}

describe('readBodyCapped', () => {
  it('reads small bodies', async () => {
    expect(await readBodyCapped(new Request('http://x', { method: 'PUT', body: '{"a":"é"}' }), 100)).toBe('{"a":"é"}')
    expect(await readBodyCapped(new Request('http://x', { method: 'PUT' }), 100)).toBe('')
  })
  it('accepts exactly the cap and rejects cap+1', async () => {
    expect((await readBodyCapped(chunked(1000, 7).req, 1000))?.length).toBe(1000)
    expect(await readBodyCapped(chunked(1001, 7).req, 1000)).toBeNull()
  })
  it('stops reading a huge chunked body right after the cap', async () => {
    const { req, stats } = chunked(50 * 1024 * 1024)
    expect(req.headers.get('content-length')).toBeNull()
    expect(await readBodyCapped(req, MAX_SYNC_BYTES)).toBeNull()
    expect(stats.pulled).toBeLessThan(MAX_SYNC_BYTES + 3 * 64 * 1024) // never buffered the 50 MB
    expect(stats.cancelled).toBe(true)
  })
  it('rejects early on a declared Content-Length over the cap', async () => {
    const req = new Request('http://x', { method: 'PUT', body: 'x', headers: { 'content-length': String(MAX_SYNC_BYTES + 1) } })
    expect(await readBodyCapped(req, MAX_SYNC_BYTES)).toBeNull()
  })
})

// next-auth's ESM build can't be loaded by vitest; the size check runs before auth anyway
vi.mock('@/auth', () => ({ auth: async () => null }))

describe('PUT /api/sync with a chunked body', () => {
  it('answers 413 for > 2 MB without buffering it all', async () => {
    const { PUT } = await import('@/app/api/sync/route')
    const { req, stats } = chunked(20 * 1024 * 1024)
    const res = await PUT(req)
    expect(res.status).toBe(413)
    expect(await res.json()).toMatchObject({ error: 'payload_too_large', max: MAX_SYNC_BYTES })
    expect(stats.pulled).toBeLessThan(MAX_SYNC_BYTES + 3 * 64 * 1024)
  })
  it('lets a small chunked body through to auth (401 when signed out)', async () => {
    process.env.MONGODB_URI ||= 'mongodb://127.0.0.1:1/unused'
    process.env.AUTH_SECRET ||= 'test'
    const { PUT } = await import('@/app/api/sync/route')
    const res = await PUT(chunked(1000).req)
    expect(res.status).toBe(401)
  })
})
