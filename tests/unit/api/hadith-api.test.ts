import { afterEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/mcp/route'
import { GET as listGet } from '@/app/api/v1/hadith/route'
import { GET as oneGet } from '@/app/api/v1/hadith/[collection]/[number]/route'
import { GET as searchGet } from '@/app/api/v1/hadith/search/route'
import { markdownFor } from '@/lib/api/markdown'
import { _resetSearchCache } from '@/lib/hadith/search'

const h = (n: number, text: string, extra: Record<string, unknown> = {}) => ({ hadithnumber: n, arabicnumber: n, text, grades: [], reference: { book: 1, hadith: n }, ...extra })
const data: Record<string, unknown[]> = {
  'ara-bukhari/1': [h(1, 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ')],
  'eng-bukhari/1': [h(1, "Narrated 'Umar bin Al-Khattab: I heard Allah's Messenger (ﷺ) saying, \"The reward of deeds depends upon the intentions.")],
  'ben-bukhari/1': [h(1, 'নিয়তের উপরই কাজের ফলাফল।')],
  'eng-bukhari': [h(1, 'The reward of deeds depends upon the intentions.'), h(2, 'Be patient, patience is light.')],
}
function mock() {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const m = String(input).match(/editions\/([a-z-]+(?:\/\d+)?)\.min\.json$/)
    if (!m || !data[m[1]]) return new Response('no', { status: 404 })
    return new Response(JSON.stringify({ metadata: { name: 'x' }, hadiths: data[m[1]] }), { status: 200 })
  }))
}
afterEach(() => { vi.unstubAllGlobals(); _resetSearchCache() })
const ctx = (collection: string, number: string) => ({ params: Promise.resolve({ collection, number }) })

describe('/api/v1/hadith', () => {
  it('lists the nine collections', async () => {
    const j = await (await listGet()).json()
    expect(j.collections.map((c: { id: string }) => c.id)).toContain('muslim')
    expect(j.collections).toHaveLength(9)
  })
  it('returns one hadith with url and citation', async () => {
    mock()
    const res = await oneGet(new Request('http://x'), ctx('bukhari', '1'))
    expect(res.status).toBe(200)
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
    const j = await res.json()
    expect(j).toMatchObject({ id: 'bukhari:1', collection: 'bukhari', number: '1', narrator: "'Umar bin Al-Khattab" })
    expect(j.arabic).toContain('الْأَعْمَالُ'.replace('الْ', 'ال')) // Arabic present
    expect(j.url).toMatch(/\/hadith\/bukhari\/1$/)
    expect(j.citation).toContain('Sahih al-Bukhari 1')
    expect(j.grade).toMatch(/consensus/)
  })
  it('404 / 400 / 502 without crashing', async () => {
    mock()
    expect((await oneGet(new Request('http://x'), ctx('bukhari', '99999'))).status).toBe(404)
    expect((await oneGet(new Request('http://x'), ctx('nope', '1'))).status).toBe(404)
    expect((await oneGet(new Request('http://x'), ctx('bukhari', 'abc'))).status).toBe(400)
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('down') }))
    expect((await oneGet(new Request('http://x'), ctx('bukhari', '2'))).status).toBe(502)
  })
  it('search validates and returns ranked items', async () => {
    mock()
    expect((await searchGet(new Request('http://x/api/v1/hadith/search'))).status).toBe(400)
    expect((await searchGet(new Request('http://x/api/v1/hadith/search?q=patience&collection=zzz'))).status).toBe(400)
    const j = await (await searchGet(new Request('http://x/api/v1/hadith/search?q=patience&collection=bukhari'))).json()
    expect(j.total).toBe(1)
    expect(j.results[0]).toMatchObject({ id: 'bukhari:2', number: '2' })
    expect(j.results[0].url).toMatch(/\/hadith\/bukhari\/2$/)
  })
})

describe('MCP hadith tools (provider wired)', () => {
  const H = { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }
  const call = async (name: string, args: Record<string, unknown>) => {
    const res = await POST(new Request('http://localhost/api/mcp', { method: 'POST', headers: H, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }) }))
    const { result } = await res.json()
    return { isError: !!result.isError, data: JSON.parse(result.content[0].text) }
  }
  it('get_hadith resolves references; search_hadith searches', async () => {
    mock()
    const g = await call('get_hadith', { reference: 'Sahih Bukhari hadith 1' })
    expect(g.data).toMatchObject({ id: 'bukhari:1' })
    expect((await call('get_hadith', { reference: 'bukhari 99999' })).isError).toBe(true)
    const s = await call('search_hadith', { query: 'patience', collection: 'bukhari' })
    expect(s.data.total).toBe(1)
  })
})

describe('hadith markdown alternate', () => {
  it('renders /hadith/bukhari/1.md with citation and canonical', async () => {
    mock()
    const d = await markdownFor('/hadith/bukhari/1')
    expect(d?.body).toMatch(/^# Sahih al-Bukhari 1/)
    expect(d?.body).toContain('Cite:')
    expect(d?.canonical).toMatch(/\/hadith\/bukhari\/1$/)
    expect((await markdownFor('/bn/hadith/bukhari/1'))?.canonical).toMatch(/\/bn\/hadith\/bukhari\/1$/)
    expect(await markdownFor('/hadith/bukhari/99999')).toBeNull()
  })
})
