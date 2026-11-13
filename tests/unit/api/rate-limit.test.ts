/**
 * Regression tests for the MCP amplification / DoS report: a 12.5 KB JSON-RPC batch of 100 × tools/call
 * fetch {"id":"/surah/al-baqarah"} returned 43 MB from /api/mcp. Now: batches ≤ 5 messages, every tool result
 * ≤ 100 KB (long documents truncated with a link to the full page), responses ≤ 600 KB, ask_quran limit ≤ 10, and a
 * per-IP rate limit on /api/mcp, /api/ask and /api/v1/* (429 + Retry-After).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { POST } from '@/app/api/mcp/route'
import { GET as askGet } from '@/app/api/ask/route'
import { GET as v1AskGet } from '@/app/api/v1/ask/route'
import { GET as ayahGet } from '@/app/api/v1/ayah/[ref]/route'
import { GET as searchGet } from '@/app/api/v1/search/route'
import { _resetApiRateLimits, API_RATE, checkRateLimit, EMBED_RATE } from '@/lib/api/ratelimit'
import { MCP_LIMITS } from '@/lib/mcp/limits'
import { clipDocument } from '@/lib/mcp/server'
import { restoreEmbedder, useFakeEmbedder } from '../../helpers/fake-embedder'

const HEADERS = { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }
let ipN = 0
const freshIp = () => `203.0.113.${++ipN}`
const post = (body: unknown, ip = freshIp()) => POST(new Request('http://localhost/api/mcp', { method: 'POST', headers: { ...HEADERS, 'x-forwarded-for': ip }, body: JSON.stringify(body) }))
const fetchCall = (id: number, docId = '/surah/al-baqarah') => ({ jsonrpc: '2.0', id, method: 'tools/call', params: { name: 'fetch', arguments: { id: docId } } })
const bytes = (s: string) => Buffer.byteLength(s, 'utf8')

describe('MCP size limits (rate limiting off)', () => {
  it('rejects JSON-RPC batches over 5 messages with a JSON-RPC error, without running any tool', async () => {
    const batch = Array.from({ length: 100 }, (_, i) => fetchCall(i + 1))
    const t0 = Date.now()
    const res = await post(batch)
    expect(res.status).toBe(400)
    const j = await res.json()
    expect(j).toMatchObject({ jsonrpc: '2.0', id: null, error: { code: -32600 } })
    expect(j.error.message).toMatch(/limited to 5/)
    expect((await post(Array.from({ length: 6 }, (_, i) => fetchCall(i + 1)))).status).toBe(400)
    expect((await post([])).status).toBe(400)
    expect(Date.now() - t0).toBeLessThan(2000)
  })

  it('a single fetch of Surah Al-Baqarah (≈ 430 KB of markdown) is truncated to ≤ 100 KB with the full-page URL', async () => {
    const res = await post(fetchCall(1))
    expect(res.status).toBe(200)
    const j = await res.json()
    const text: string = j.result.content[0].text
    expect(bytes(text)).toBeLessThanOrEqual(MCP_LIMITS.toolTextBytes)
    const doc = JSON.parse(text)
    expect(doc.metadata).toMatchObject({ truncated: true })
    expect(doc.metadata.fullBytes).toBeGreaterThan(300_000)
    expect(doc.text).toMatch(/Truncated:.*https:\/\/\S+\/surah\/al-baqarah/)
    expect(doc.text.startsWith('# ')).toBe(true)
  })

  it('a batch of 5 heavy fetches stays under the total response cap (was 43 MB for 100)', async () => {
    const res = await post(Array.from({ length: 5 }, (_, i) => fetchCall(i + 1, i % 2 ? '/bn/surah/al-baqarah' : '/surah/al-baqarah')))
    expect(res.status).toBe(200)
    const raw = await res.text()
    expect(bytes(raw)).toBeLessThanOrEqual(MCP_LIMITS.responseBytes)
    const arr = JSON.parse(raw)
    expect(arr).toHaveLength(5)
    for (const m of arr) expect(bytes(m.result.content[0].text)).toBeLessThanOrEqual(MCP_LIMITS.toolTextBytes)
  })

  it('short documents are returned whole', async () => {
    const j = await (await post(fetchCall(1, '/surah/al-fatihah'))).json()
    const doc = JSON.parse(j.result.content[0].text)
    expect(doc.metadata.truncated).toBeUndefined()
    expect(doc.text).not.toMatch(/Truncated/)
  })

  it('clipDocument cuts at a line break and respects the byte budget for Bangla/Arabic text too', () => {
    const body = '# T\n' + 'বাংলা লাইন ঈমান\n'.repeat(20_000)
    const c = clipDocument(body, 'https://x.test/a', 50_000)
    expect(c.truncated).toBe(true)
    expect(bytes(JSON.stringify(c.text))).toBeLessThanOrEqual(50_000)
    expect(c.text).toMatch(/ঈমান\n\n---\n\n> \*\*Truncated/)
  })

  it('caps ask_quran at 10 results', async () => {
    const tools = (await (await post({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} })).json()).result.tools
    expect(tools.find((t: { name: string }) => t.name === 'ask_quran').inputSchema.properties.limit.maximum).toBe(MCP_LIMITS.askLimit)
    const j = await (await post({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'ask_quran', arguments: { question: 'patience in hardship', limit: 50 } } })).json()
    expect(j.result?.isError ?? !!j.error).toBe(true)
  })

  it('rejects oversized request bodies', async () => {
    const res = await post({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'search', arguments: { query: 'x'.repeat(70_000) } } })
    expect(res.status).toBe(413)
  })
})

describe('per-IP rate limits (API_RATE_LIMIT on)', () => {
  beforeEach(() => { process.env.API_RATE_LIMIT = 'on'; _resetApiRateLimits() })
  afterEach(() => { process.env.API_RATE_LIMIT = 'off'; _resetApiRateLimits(); restoreEmbedder() })

  const req = (url: string, ip: string) => new Request(url, { headers: { 'x-forwarded-for': `${ip}, 10.0.0.1` } })

  it('/api/v1/*: 60 requests per minute per IP, then 429 JSON with Retry-After; other IPs unaffected', async () => {
    const ip = freshIp()
    const ctx = { params: Promise.resolve({ ref: '1:1' }) }
    for (let i = 0; i < API_RATE.max; i++) expect((await ayahGet(req('http://x/api/v1/ayah/1:1', ip), ctx)).status).toBe(200)
    const res = await searchGet(req('http://x/api/v1/search?q=patience', ip))
    expect(res.status).toBe(429)
    expect(Number(res.headers.get('retry-after'))).toBeGreaterThan(0)
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(await res.json()).toMatchObject({ error: { status: 429, code: 'rate_limited' } })
    expect((await ayahGet(req('http://x/api/v1/ayah/1:1', freshIp()), ctx)).status).toBe(200)
  })

  it('the window slides: allowed again after a minute', () => {
    const r = new Request('http://x', { headers: { 'x-forwarded-for': freshIp() } })
    const t = 1_000_000
    for (let i = 0; i < API_RATE.max; i++) expect(checkRateLimit(r, {}, t).ok).toBe(true)
    const over = checkRateLimit(r, {}, t + 1000)
    expect(over).toMatchObject({ ok: false, scope: 'api' })
    expect((over as { retryAfterSec: number }).retryAfterSec).toBe(59)
    expect(checkRateLimit(r, {}, t + API_RATE.windowMs + 1).ok).toBe(true)
  })

  it('/api/ask and /api/v1/ask: 20 embedding searches per minute', async () => {
    useFakeEmbedder({}, '2:153')
    const ip = freshIp()
    for (let i = 0; i < EMBED_RATE.max; i++) {
      const g = i % 2 ? askGet : v1AskGet
      expect((await g(req(`http://x/api/ask?q=patience+${i}`, ip))).status).toBe(200)
    }
    const res = await askGet(req('http://x/api/ask?q=patience+again', ip))
    expect(res.status).toBe(429)
    expect((await res.json()).error.message).toMatch(/20 per minute/)
    // the cheap warm-up ping does not use the embedding budget
    expect((await askGet(req('http://x/api/ask?warm=1', ip))).status).toBe(202)
  })

  it('/api/mcp counts every batch message and every ask_quran call; over the limit → HTTP 429 JSON-RPC error', async () => {
    const ip = freshIp()
    const ask = (id: number) => ({ jsonrpc: '2.0', id, method: 'tools/call', params: { name: 'ask_quran', arguments: { question: 'patience', limit: 1 } } })
    useFakeEmbedder({}, '2:153')
    for (let i = 0; i < 4; i++) expect((await post(Array.from({ length: 5 }, (_, k) => ask(i * 5 + k + 1)), ip)).status).toBe(200) // 20 asks
    const res = await post(ask(99), ip)
    expect(res.status).toBe(429)
    expect(res.headers.get('retry-after')).toBeTruthy()
    expect(await res.json()).toMatchObject({ jsonrpc: '2.0', error: { code: -32000 } })
    // the plain API budget (60 / min) is shared by batch messages
    const ip2 = freshIp()
    const list = (id: number) => ({ jsonrpc: '2.0', id, method: 'tools/list', params: {} })
    for (let i = 0; i < API_RATE.max / 5; i++) expect((await post(Array.from({ length: 5 }, (_, k) => list(k + 1)), ip2)).status).toBe(200)
    expect((await post(list(1), ip2)).status).toBe(429)
  })
})
