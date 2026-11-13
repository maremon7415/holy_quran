import { describe, it, expect } from 'vitest'
import { GET, OPTIONS, POST } from '@/app/api/mcp/route'
import { createMcpServer, registerHadithTools } from '@/lib/mcp/server'
import type { HadithProvider } from '@/lib/mcp/extensions'

const HEADERS = { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }
let id = 0
async function rpc(method: string, params: Record<string, unknown> = {}) {
  const res = await POST(new Request('http://localhost/api/mcp', { method: 'POST', headers: HEADERS, body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }) }))
  expect(res.status).toBe(200)
  expect(res.headers.get('access-control-allow-origin')).toBe('*')
  return (await res.json()) as { result?: any; error?: any }
}
const call = async (name: string, args: Record<string, unknown>) => {
  const { result } = await rpc('tools/call', { name, arguments: args })
  return { isError: !!result.isError, data: JSON.parse(result.content[0].text) }
}

describe('MCP endpoint /api/mcp (JSON-RPC over Streamable HTTP, stateless)', () => {
  it('initialize returns server info + instructions', async () => {
    const { result } = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'vitest', version: '1' } })
    expect(result.serverInfo.name).toBe('noor-quran')
    expect(result.capabilities.tools).toBeDefined()
    expect(result.instructions).toMatch(/cite/i)
  })

  it('tools/list lists the Quran tools with read-only annotations', async () => {
    const { result } = await rpc('tools/list')
    const names = result.tools.map((t: { name: string }) => t.name)
    expect(names).toEqual(expect.arrayContaining(['search_quran', 'get_ayah', 'get_surah', 'get_tafsir', 'find_dua', 'get_topic_verses', 'get_name_of_allah']))
    expect(names).toEqual(expect.arrayContaining(['get_hadith', 'search_hadith'])) // hadith provider is wired
    for (const t of result.tools) {
      expect(t.annotations?.readOnlyHint).toBe(true)
      expect(t.inputSchema.type).toBe('object')
    }
  })

  it('get_ayah 2:255 returns Arabic, translations, uccharon, canonical URL + citation', async () => {
    const { isError, data } = await call('get_ayah', { reference: '2:255' })
    expect(isError).toBe(false)
    expect(data.reference).toBe('2:255')
    expect(data.url).toMatch(/^https:\/\/.+\/surah\/al-baqarah\/255$/)
    expect(data.citation).toContain(data.url)
    const a = data.ayahs[0]
    expect(a.arabic).toMatch(/[؀-ۿ]{3,}/)
    expect(a.translations.saheeh).toMatch(/Ever-Living/)
    expect(a.translations.bangla).toMatch(/[ঀ-৿]/)
    expect(a.uccharon).toMatch(/[ঀ-৿]/)
    expect(data.famousAs.en).toMatch(/Kursi/i)
  })

  it('get_ayah ranges + invalid refs', async () => {
    const r = await call('get_ayah', { reference: '2:255-257', translations: ['saheeh'] })
    expect(r.data.ayahs).toHaveLength(3)
    expect(r.data.ayahs[0].translations.bangla).toBeUndefined()
    expect((await call('get_ayah', { reference: '2:999' })).isError).toBe(true)
    expect((await call('get_ayah', { reference: '115:1' })).isError).toBe(true)
  })

  it('search_quran, get_surah, find_dua, get_topic_verses, get_name_of_allah all carry canonical URLs', async () => {
    const s = await call('search_quran', { query: 'patience', limit: 3 })
    expect(s.data.results).toHaveLength(3)
    for (const h of s.data.results) expect(h.url).toMatch(/^https:\/\/.+\/surah\/[a-z-]+\/\d+$/)

    const su = await call('get_surah', { surah: 'Yasin' })
    expect(su.data).toMatchObject({ id: 36, versesCount: 83, revelationPlace: 'makkah' })
    expect(su.data.url).toMatch(/\/surah\/ya-sin$/)

    const d = await call('find_dua', { occasion: 'before sleeping' })
    expect(d.data.results.length).toBeGreaterThan(0)
    expect(d.data.results[0].url).toMatch(/\/dua\//)
    expect(d.data.results[0].source).toBeTruthy()

    const t = await call('get_topic_verses', { topic: 'what does the Quran say about patience?' })
    expect(t.data.slug).toBe('patience')
    expect(t.data.quickAnswer).toMatch(/Quran/)
    expect(t.data.verses[0].url).toMatch(/^https:/)

    for (const q of [1, 'Ar-Rahman', 'rahman', 'الرَّحْمَٰن', 'ar-rahman']) {
      const n = await call('get_name_of_allah', { name: q })
      expect(n.data.number, String(q)).toBe(1)
      expect(n.data.url).toMatch(/\/names-of-allah\/ar-rahman$/)
    }
  })

  it('unknown tool / invalid args → JSON-RPC or tool error, never a 500', async () => {
    const r = await rpc('tools/call', { name: 'nope', arguments: {} })
    expect(r.error ?? r.result?.isError).toBeTruthy()
    const bad = await rpc('tools/call', { name: 'get_ayah', arguments: {} })
    expect(bad.error ?? bad.result?.isError).toBeTruthy()
  })

  it('GET without SSE accept returns a pointer to the docs; OPTIONS has CORS', async () => {
    const g = await GET(new Request('http://localhost/api/mcp'))
    expect(g.status).toBe(200)
    expect((await g.json()).docs).toMatch(/\/mcp$/)
    const o = OPTIONS()
    expect(o.status).toBe(204)
    expect(o.headers.get('access-control-allow-methods')).toContain('POST')
  })

  it('hadith extension point registers get_hadith / search_hadith when a provider exists', async () => {
    const provider: HadithProvider = {
      getHadith: async (ref) => ({ id: 'bukhari:1', collection: 'bukhari', number: '1', english: 'Actions are by intentions', url: 'https://x/hadith/bukhari/1', citation: `Sahih al-Bukhari 1 (${ref})` }),
      searchHadith: async () => ({ total: 0, results: [] }),
    }
    const server = createMcpServer({ hadith: null })
    registerHadithTools(server, provider)
    // @ts-expect-error private registry, enough to prove registration
    expect(Object.keys(server._registeredTools)).toEqual(expect.arrayContaining(['get_hadith', 'search_hadith']))
  })
})

describe('MCP ChatGPT-style search / fetch', () => {
  it('search returns ids that fetch resolves to markdown with the canonical URL', async () => {
    const s = await call('search', { query: 'ayatul kursi 2:255' })
    expect(Array.isArray(s.data.results)).toBe(true)
    const r = await call('search', { query: '2:255' })
    expect(r.data.results[0]).toMatchObject({ id: '/surah/al-baqarah/255' })
    const f = await call('fetch', { id: r.data.results[0].id })
    expect(f.data.url).toMatch(/\/surah\/al-baqarah\/255$/)
    expect(f.data.text).toMatch(/^# Quran 2:255/)
    expect(f.data.text).toContain('Cite:')
    const p = await call('search', { query: 'patience' })
    expect(p.data.results.map((x: { id: string }) => x.id)).toContain('/topics/patience')
    expect((await call('fetch', { id: '/nope' })).isError).toBe(true)
  })
})
