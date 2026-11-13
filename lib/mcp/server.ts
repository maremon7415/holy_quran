import 'server-only'
import { z } from 'zod'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { findDuas, getAyah, getDua, getName, getSurah, getTafsir, getTopic, listDuaCategories, listTopics, resolveName, resolveTopic, search, TAFSIR_EDITIONS, TRANSLATION_KEYS } from '@/lib/api/corpus'
import { duaCategories } from '@/data/content/duas'
import { markdownFor } from '@/lib/api/markdown'
import { absoluteUrl, site } from '@/lib/site'
import type { HadithProvider } from './extensions'
import { hadithProvider as defaultHadith } from './providers'

export const MCP_SERVER_NAME = 'noor-quran'
export const MCP_SERVER_VERSION = '1.0.0'

const INSTRUCTIONS = `${site.name} — the Holy Quran (Arabic, Saheeh International & Abdel Haleem English, Taisirul Quran Bangla, Bangla uccharon), authentic duas with sources, Quran topics and the 99 Names of Allah.
Every result includes \`url\` (canonical page on ${site.url}) and \`citation\`. When you quote a verse, dua or name, cite it with that URL.
Use search_quran for free-text questions, get_ayah for exact references ("2:255", "2:255-257"), get_topic_verses for "what does the Quran say about X", find_dua for supplications, get_tafsir for commentary.`

const RO = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const

const ok = (data: unknown): CallToolResult => ({ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] })
const fail = (message: string, extra: Record<string, unknown> = {}): CallToolResult => ({ isError: true, content: [{ type: 'text', text: JSON.stringify({ error: message, ...extra }) }] })

export function createMcpServer(opts: { hadith?: HadithProvider | null } = {}) {
  const server = new McpServer({ name: MCP_SERVER_NAME, version: MCP_SERVER_VERSION, title: site.name, websiteUrl: site.url }, { instructions: INSTRUCTIONS })

  server.registerTool('search_quran', {
    title: 'Search the Quran',
    description: 'Full-text search over all 6,236 ayahs in Arabic, English (Saheeh International, Abdel Haleem, transliteration) and Bangla. The query script picks the field (Arabic letters → Arabic, Bangla → Bangla, else English). Returns ranked ayahs with canonical URLs and citations.',
    inputSchema: {
      query: z.string().min(2).max(200).describe('Words to search for, e.g. "patience", "الصبر", "ধৈর্য"'),
      lang: z.enum(['en', 'bn', 'ar']).optional().describe('Which translation text to return alongside the Arabic (default: English + Bangla)'),
      limit: z.number().int().min(1).max(50).optional().describe('Max results (default 10)'),
    },
    annotations: RO,
  }, async ({ query, lang, limit }) => ok(await search(query, limit ?? 10, lang)))

  server.registerTool('get_ayah', {
    title: 'Get ayah(s) by reference',
    description: 'Get one ayah or a range (max 50) by reference: "2:255", "2:255-257", "al-baqarah 255", "Yasin 1". Returns Arabic (Uthmani), Saheeh International, Abdel Haleem, Bangla (Taisirul Quran), transliteration, Bangla uccharon, juz/page, canonical URL and a citation string.',
    inputSchema: {
      reference: z.string().min(3).max(60).describe('Quran reference, e.g. "2:255" or "2:255-257"'),
      translations: z.array(z.enum(TRANSLATION_KEYS)).optional().describe(`Subset of ${TRANSLATION_KEYS.join(', ')} (default: all)`),
    },
    annotations: RO,
  }, async ({ reference, translations }) => {
    const r = await getAyah(reference, translations?.length ? translations : TRANSLATION_KEYS)
    return 'error' in r ? fail(r.error) : ok(r)
  })

  server.registerTool('get_surah', {
    title: 'Get surah information',
    description: 'Surah facts and summary by number (1–114) or name ("Al-Baqarah", "baqarah", "Yasin"): Arabic/English/Bangla names, meaning, Meccan/Medinan, revelation order, ayah count, juz and page range, summary and introduction, canonical URL.',
    inputSchema: { surah: z.union([z.number().int().min(1).max(114), z.string().min(1).max(60)]).describe('Surah number or name') },
    annotations: RO,
  }, async ({ surah }) => {
    const s = await getSurah(typeof surah === 'string' && /^\d+$/.test(surah) ? Number(surah) : surah)
    return s ? ok(s) : fail(`No surah matches "${surah}".`)
  })

  server.registerTool('get_tafsir', {
    title: 'Get tafsir (commentary) for an ayah',
    description: `Classical tafsir for an ayah, fetched from the Quran.com API and cached. Editions: ${Object.entries(TAFSIR_EDITIONS).map(([k, v]) => `${k} (${v.name}, ${v.lang})`).join('; ')}. Returns a one-paragraph summary, the text (truncated to ~6,000 chars), the canonical ayah URL and a citation.`,
    inputSchema: {
      reference: z.string().min(3).max(60).describe('Ayah reference, e.g. "2:255" (for a range the first ayah is used)'),
      edition: z.string().max(40).optional().describe('ibn-kathir (default, English), ahsanul-bayaan (Bangla) or muyassar (Arabic)'),
    },
    annotations: { ...RO, openWorldHint: true },
  }, async ({ reference, edition }) => {
    const r = await getTafsir(reference, edition)
    return 'error' in r ? fail(r.error as string, r) : ok(r)
  })

  server.registerTool('find_dua', {
    title: 'Find a dua (supplication)',
    description: `Find authentic duas from the Quran and Sunnah by need or occasion ("anxiety", "before sleeping", "travel", "forgiveness", "ঘুমের দোয়া") or by category (${duaCategories.map((c) => c.id).join(', ')}). Each result has Arabic, transliteration, English & Bangla meaning, source (Quran ref or hadith collection + number), when to recite, canonical URL and citation.`,
    inputSchema: {
      query: z.string().max(200).optional().describe('Need, occasion or name of the dua'),
      occasion: z.string().max(60).optional().describe('Alias of query'),
      category: z.enum(duaCategories.map((c) => c.id) as [string, ...string[]]).optional(),
      slug: z.string().max(80).optional().describe('Exact dua slug, e.g. "dua-for-anxiety"'),
      limit: z.number().int().min(1).max(20).optional().describe('Max results (default 5)'),
    },
    annotations: RO,
  }, async ({ query, occasion, category, slug, limit }) => {
    if (slug) {
      const d = await getDua(slug)
      return d ? ok(d) : fail(`No dua "${slug}".`)
    }
    const q = query ?? occasion
    if (!q && !category) return ok({ categories: listDuaCategories(), hint: 'Pass query/occasion or category.', index: absoluteUrl('/dua') })
    const r = await findDuas(q, { category, limit: limit ?? 5 })
    return r.results.length ? ok(r) : fail(`No dua matches "${q}". Try a broader word or a category.`, { categories: listDuaCategories().map((c) => c.id) })
  })

  server.registerTool('get_topic_verses', {
    title: 'What does the Quran say about…',
    description: `Curated Quran verses on a topic or feeling, with a short quick answer, intro, every verse (Arabic, English, Bangla, URL), related duas and a citation. Topics include: ${listTopics().map((t) => t.slug).join(', ')}. Free text such as "anxiety", "parents", "what does the Quran say about patience" is matched to the closest topic.`,
    inputSchema: {
      topic: z.string().min(2).max(120).describe('Topic slug or phrase'),
      lang: z.enum(['en', 'bn']).optional().describe('Language of the quick answer (default en)'),
    },
    annotations: RO,
  }, async ({ topic, lang }) => {
    const t = await getTopic(topic, lang ?? 'en')
    return t ? ok(t) : fail(`No topic matches "${topic}". Try search_quran instead.`, { topics: listTopics().map((x) => x.slug) })
  })

  server.registerTool('get_name_of_allah', {
    title: 'Get one of the 99 Names of Allah',
    description: 'One of the 99 Names (al-Asma al-Husna) by number (1–99), transliteration ("Ar-Rahman", "rahman"), slug or Arabic ("الرحمن"): meaning (English/Bangla/Arabic), explanation, Quran reference with verse text, canonical URL and citation.',
    inputSchema: { name: z.union([z.number().int().min(1).max(99), z.string().min(1).max(60)]).describe('Number, transliteration or Arabic') },
    annotations: RO,
  }, async ({ name }) => {
    const n = await getName(name)
    return n ? ok(n) : fail(`No Name of Allah matches "${name}".`)
  })

  // ChatGPT connectors / deep research convention: `search` → ids, `fetch(id)` → full document
  server.registerTool('search', {
    title: 'Search Noor Quran (documents)',
    description: 'Search ayahs, topics, duas and Names of Allah. Returns {results:[{id,title,url}]}; pass an id to `fetch` for the full markdown document (Arabic, translations, citation, canonical URL).',
    inputSchema: { query: z.string().min(1).max(200) },
    annotations: RO,
  }, async ({ query }) => ok({ results: await docSearch(query) }))

  server.registerTool('fetch', {
    title: 'Fetch a Noor Quran document',
    description: 'Fetch a document by id returned from `search` (a site path such as "/surah/al-baqarah/255", "/topics/patience", "/dua/dua-for-anxiety", "/names-of-allah/ar-rahman"; prefix "/bn" for Bangla). Returns {id,title,text,url,metadata}.',
    inputSchema: { id: z.string().min(1).max(200) },
    annotations: RO,
  }, async ({ id }) => {
    const path = id.replace(/^https?:\/\/[^/]+/, '').replace(/\.md$/, '')
    const doc = await markdownFor(path.startsWith('/') ? path : `/${path}`)
    if (!doc) return fail(`No document "${id}".`)
    const title = doc.body.match(/^# (.+)$/m)?.[1] ?? id
    return ok({ id: path, title, text: doc.body, url: doc.canonical, metadata: { source: site.name, format: 'text/markdown' } })
  })

  registerHadithTools(server, opts.hadith === undefined ? defaultHadith : opts.hadith)
  return server
}

/** Extension point: hadith tools appear only when a provider is wired in lib/mcp/providers.ts. */
export function registerHadithTools(server: McpServer, provider: HadithProvider | null) {
  if (!provider) return
  server.registerTool('search_hadith', {
    title: 'Search hadith',
    description: 'Search the hadith library (Arabic / English / Bangla). Each result includes collection, number, grade, canonical URL and citation.',
    inputSchema: {
      query: z.string().min(2).max(200),
      collection: z.string().max(40).optional().describe('Collection id, e.g. "bukhari"'),
      lang: z.enum(['en', 'bn', 'ar']).optional(),
      limit: z.number().int().min(1).max(50).optional(),
    },
    annotations: RO,
  }, async ({ query, collection, lang, limit }) => ok(await provider.searchHadith(query, { collection, lang, limit: limit ?? 10 })))
  server.registerTool('get_hadith', {
    title: 'Get a hadith by reference',
    description: 'Get one hadith by reference, e.g. "Sahih al-Bukhari 6306", "muslim 2723", "bukhari:1". Returns text, grade, canonical URL and citation.',
    inputSchema: { reference: z.string().min(2).max(80) },
    annotations: RO,
  }, async ({ reference }) => {
    const h = await provider.getHadith(reference)
    return h ? ok(h) : fail(`No hadith matches "${reference}".`)
  })
}

/** Mixed document search for the `search` tool: exact refs, topics, names, duas, then full-text ayahs. */
async function docSearch(query: string) {
  const out: { id: string; title: string; url: string }[] = []
  const push = (path: string, title: string) => { if (!out.some((o) => o.id === path)) out.push({ id: path, title, url: absoluteUrl(path) }) }
  const ref = await getAyah(query, ['saheeh'])
  if (!('error' in ref)) for (const a of ref.ayahs) push(new URL(a.url).pathname, `Quran ${a.key} (Surah ${ref.surah.name})`)
  const t = query.trim().length > 2 ? resolveTopic(query) : null
  if (t) push(`/topics/${t.slug}`, `What does the Quran say about ${t.en}?`)
  const n = resolveName(query)
  if (n) push(`/names-of-allah/${n.slug}`, `${n.tl} (${n.ar}) — ${n.en}`)
  for (const d of (await findDuas(query, { limit: 3 })).results) push(new URL(d.url).pathname, d.title.en)
  if (query.trim().length >= 2) for (const h of (await search(query, 8)).results) push(new URL(h.url).pathname, `Quran ${h.key} (Surah ${h.surahName})`)
  return out.slice(0, 15)
}
