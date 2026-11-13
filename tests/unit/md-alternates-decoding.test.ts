/**
 * Regression tests:
 *  - hadith markdown alternates 404'd: `proxy.ts` had no matcher for `/hadith/{collection}/{number}.md` although the
 *    hadith pages advertise it (`rel="alternate" type="text/markdown"`).
 *  - malformed percent-encoding answered 500 (`/topics/%E0%A4.md`, `/md/topics/%E0%A4`, `/api/v1/ayah/%E0%A4`):
 *    app/md/[...path]/route.ts decoded the already-decoded params a second time; /api/v1/events/[slug] did the same.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { config, proxy } from '@/proxy'
import { GET as mdRoute } from '@/app/md/[...path]/route'
import { GET as ayahGet } from '@/app/api/v1/ayah/[ref]/route'
import { GET as eventGet } from '@/app/api/v1/events/[slug]/route'
import { GET as nameGet } from '@/app/api/v1/names/[id]/route'
import { GET as surahGet } from '@/app/api/v1/surah/[id]/route'
import { GET as duaGet } from '@/app/api/v1/duas/[slug]/route'
import { GET as topicGet } from '@/app/api/v1/topics/[slug]/route'
import { GET as hadithGet } from '@/app/api/v1/hadith/[collection]/[number]/route'
import { safeDecode } from '@/lib/api/http'

afterEach(() => vi.unstubAllGlobals())
const matches = (url: string) => unstable_doesMiddlewareMatch({ config, url })

describe('proxy matcher: markdown alternates', () => {
  it.each([
    '/hadith/bukhari/1.md', '/bn/hadith/muslim/2564.md', '/hadith/nawawi40/42.md',
    '/surah/al-baqarah/255.md', '/juz/30.md', '/topics/patience.md', '/dua/dua-for-anxiety.md', '/names-of-allah/ar-rahman.md',
    '/learn/salah.md', '/events/eid-al-adha.md', '/bn/topics/patience.md',
  ])('%s runs the proxy', (p) => expect(matches(p)).toBe(true))
  it.each(['/hadith/bukhari/1', '/hadith', '/about'])('%s does not', (p) => expect(matches(p)).toBe(false))
  it('rewrites the hadith .md to the markdown route', () => {
    const r = proxy(new NextRequest(new URL('/bn/hadith/bukhari/1.md', 'https://noor.test')))
    expect(r.headers.get('x-middleware-rewrite')).toMatch(/\/md\/bn\/hadith\/bukhari\/1$/)
  })
  it('the md route serves the hadith (text/markdown + canonical)', async () => {
    const h = (n: number, text: string) => ({ hadithnumber: n, arabicnumber: n, text, grades: [], reference: { book: 1, hadith: n } })
    vi.stubGlobal('fetch', vi.fn(async (u: RequestInfo | URL) => (/-bukhari\/1\.min\.json$/.test(String(u)) ? new Response(JSON.stringify({ metadata: { name: 'x' }, hadiths: [h(1, 'The reward of deeds depends upon the intentions.')] })) : new Response('no', { status: 404 }))))
    const res = await mdRoute(new Request('http://x'), { params: Promise.resolve({ path: ['hadith', 'bukhari', '1'] }) })
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/markdown')
    expect(res.headers.get('link')).toMatch(/\/hadith\/bukhari\/1>; rel="canonical"/)
    expect(await res.text()).toMatch(/intentions/)
  })
})

describe('malformed percent-encoding → 404, never a 500', () => {
  const BAD = '%E0%A4' // truncated UTF-8 sequence: decodeURIComponent throws URIError
  // In production Next decodes dynamic params itself and answers a bare 500 before any handler runs, so proxy.ts
  // checks every path that contains a percent-escape.
  const run = (p: string) => proxy(new NextRequest(new URL(p, 'https://noor.test')))
  it.each(['/api/v1/ayah/%E0%A4', '/api/v1/events/%E0%A4', '/md/topics/%E0%A4', '/topics/%E0%A4.md', '/topics/%E0%A4', '/hadith/bukhari/%E0%A4', '/bn/dua/%E0%A4', '/juz/%E0%A4'])('proxy: %s is matched and answered 404', async (p) => {
    expect(matches(p)).toBe(true)
    const r = run(p)
    expect(r.status).toBe(404)
    if (p.startsWith('/api/')) expect(await r.json()).toMatchObject({ error: { status: 404, code: 'not_found' } })
    if (p.endsWith('.md') || p.startsWith('/md/')) expect(r.headers.get('content-type')).toContain('text/markdown')
  })
  it('proxy: valid percent-encoded paths pass through untouched', () => {
    for (const p of ['/api/v1/names/%E0%A6%A7', '/api/v1/ayah/2%3A255', '/topics/%E0%A6%A7']) expect(run(p).headers.get('x-middleware-next'), p).toBe('1')
    expect(matches('/_next/static/chunks/a%20b.js')).toBe(false)
    expect(matches('/topics/patience')).toBe(false)
  })
  it('safeDecode', () => {
    expect(safeDecode(BAD)).toBeNull()
    expect(safeDecode('%E0%A6%A7')).toBe('ধ')
    expect(safeDecode('plain')).toBe('plain')
  })
  it.each([
    [['topics', BAD]], [['bn', 'topics', BAD]], [['surah', BAD]], [['names-of-allah', BAD]], [['events', BAD]], [['hadith', BAD, '1']], [['learn', BAD]], [[BAD]],
  ])('md route %j', async (path) => {
    const res = await mdRoute(new Request('http://x'), { params: Promise.resolve({ path }) })
    expect(res.status).toBe(404)
  })
  it('md route does not double-decode (a literal "%25" stays "%25")', async () => {
    const res = await mdRoute(new Request('http://x'), { params: Promise.resolve({ path: ['topics', '%25E0%25A4'] }) })
    expect(res.status).toBe(404)
  })
  it('/api/v1 routes with a malformed param', async () => {
    const r = new Request('http://x')
    expect((await ayahGet(r, { params: Promise.resolve({ ref: BAD }) })).status).toBe(404)
    expect((await eventGet(r, { params: Promise.resolve({ slug: BAD }) })).status).toBe(404)
    expect((await nameGet(r, { params: Promise.resolve({ id: BAD }) })).status).toBe(404)
    expect((await surahGet(r, { params: Promise.resolve({ id: BAD }) })).status).toBe(404)
    expect((await duaGet(r, { params: Promise.resolve({ slug: BAD }) })).status).toBe(404)
    expect((await topicGet(r, { params: Promise.resolve({ slug: BAD }) })).status).toBe(404)
    expect((await hadithGet(r, { params: Promise.resolve({ collection: BAD, number: '1' }) })).status).toBe(404)
    // still-encoded but valid input keeps working
    expect((await eventGet(r, { params: Promise.resolve({ slug: 'eid-al-adha' }) })).status).toBe(200)
  })
})
