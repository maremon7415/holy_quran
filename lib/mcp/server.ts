import 'server-only'
import { z } from 'zod'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { findDuas, getAyah, getDua, getName, getSurah, getTafsir, getTopic, listDuaCategories, listTopics, resolveName, resolveTopic, search, TAFSIR_EDITIONS, TRANSLATION_KEYS } from '@/lib/api/corpus'
import { duaCategories } from '@/data/content/duas'
import { markdownFor } from '@/lib/api/markdown'
import { learnGuides } from '@/data/learn/guides'
import { tajweedRules } from '@/data/learn/tajweed'
import { learnMd, resolveLearnTopic } from '@/lib/learn/markdown'
import { localeHref } from '@/lib/i18n/routes'
import { EVENT_SLUGS } from '@/lib/events/calendar'
import { eventJson, eventsListJson, resolveEventName } from '@/lib/events/service'
import { askApi } from '@/lib/ask'
import { absoluteUrl, site } from '@/lib/site'
import type { HadithProvider } from './extensions'
import { MCP_LIMITS } from './limits'
import { hadithProvider as defaultHadith } from './providers'

export const MCP_SERVER_NAME = 'noor-quran'
export const MCP_SERVER_VERSION = '1.0.0'

const INSTRUCTIONS = `${site.name} — the Holy Quran (Arabic, Saheeh International & Abdel Haleem English, Taisirul Quran Bangla, Bangla uccharon), authentic duas with sources, Quran topics and the 99 Names of Allah.
Every result includes \`url\` (canonical page on ${site.url}) and \`citation\`. When you quote a verse, dua or name, cite it with that URL.
Use ask_quran for natural-language questions answered by meaning ("what does the Quran say about patience in hardship?"), search_quran for exact words, get_ayah for exact references ("2:255", "2:255-257"), get_topic_verses for "what does the Quran say about X", find_dua for supplications, get_tafsir for commentary, get_learn_guide for how to pray, make wudu, tajweed rules, the six kalimas and the Arabic alphabet.`

const RO = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const

const utf8 = (s: string) => Buffer.byteLength(s, 'utf8')

/**
 * Tool result as JSON text, capped at MCP_LIMITS.toolTextBytes (pretty → compact → an error asking for a smaller
 * request). Tools that return documents truncate them first (`clipDocument`), so this cap is only a backstop.
 */
export const ok = (data: unknown): CallToolResult => {
  let text = JSON.stringify(data, null, 2)
  if (utf8(text) > MCP_LIMITS.toolTextBytes) text = JSON.stringify(data)
  if (utf8(text) > MCP_LIMITS.toolTextBytes) return fail(`Result too large (${utf8(text)} bytes, max ${MCP_LIMITS.toolTextBytes}). Ask for fewer items or a smaller range.`)
  return { content: [{ type: 'text', text }] }
}

/**
 * Longest prefix of a markdown document whose JSON-escaped UTF-8 size fits `maxBytes` (cut at a line break), plus a
 * note with the URL of the full page. Long documents (Surah Al-Baqarah ≈ 430 KB) are truncated instead of returned whole.
 */
export function clipDocument(body: string, url: string, maxBytes: number = MCP_LIMITS.toolTextBytes - 8_000): { text: string; truncated: boolean; bytes: number } {
  const size = (t: string) => utf8(JSON.stringify(t))
  const bytes = utf8(body)
  if (size(body) <= maxBytes) return { text: body, truncated: false, bytes }
  const note = `\n\n---\n\n> **Truncated:** this document is ${Math.round(bytes / 1024)} KB, only the beginning is shown. Read the full page at ${url} (markdown: ${url}.md), or fetch a smaller part (e.g. a single ayah "/surah/al-baqarah/255" or a juz "/juz/1").\n`
  const budget = maxBytes - size(note)
  let lo = 0, hi = body.length
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (size(body.slice(0, mid)) <= budget) lo = mid; else hi = mid - 1 }
  let cut = body.slice(0, lo)
  const nl = cut.lastIndexOf('\n')
  if (nl > lo * 0.8) cut = cut.slice(0, nl)
  return { text: cut + note, truncated: true, bytes }
}

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

  server.registerTool('ask_quran', {
    title: 'Ask the Quran (search by meaning)',
    description: 'Meaning-based (semantic) search: a natural question in English, Bangla or Arabic ("what does Allah say about people who are patient in hardship?", "বাবা-মায়ের সাথে আচরণ") → the most relevant ayahs even without shared keywords. Ranked by embedding similarity (EmbeddingGemma-300m, multilingual) with small word/topic boosts; consecutive ayahs are merged into ranges. Each result has Arabic, translation, matched words/topics, canonical URL and citation. No generated text — quote the ayahs and cite the URLs.',
    inputSchema: {
      question: z.string().min(2).max(300).describe('A natural-language question or theme'),
      lang: z.enum(['en', 'bn', 'ar']).optional().describe('Translation to return with the Arabic (default: English + Bangla)'),
      limit: z.number().int().min(1).max(MCP_LIMITS.askLimit).optional().describe(`Max results (default 8, max ${MCP_LIMITS.askLimit})`),
    },
    annotations: RO,
  }, async ({ question, lang, limit }) => ok(await askApi(question, { lang, limit: Math.min(limit ?? 8, MCP_LIMITS.askLimit) })))

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

  server.registerTool('get_islamic_event', {
    title: 'Get dates of an Islamic event',
    description: `Dates of Islamic events by name (${EVENT_SLUGS.join(', ')}; "Eid ul Adha", "Laylatul Qadr", "ঈদুল আজহা" also work) for a Gregorian year (current year −1 … +4; default: the next occurrence). Returns the Saudi Arabia date (Umm al-Qura calendar) and the expected Bangladesh/South Asia date (Saudi + 1 day, because months start from local moon sighting; an estimate, not an announcement), the Hijri date, Quran/hadith sources, canonical URL and citation. Omit name to list the next 12 months.`,
    inputSchema: {
      name: z.string().min(2).max(80).optional().describe('Event name or slug, e.g. "eid-al-adha", "Ramadan", "শবে কদর"'),
      year: z.number().int().min(1900).max(2200).optional().describe('Gregorian year, e.g. 2027'),
    },
    annotations: RO,
  }, async ({ name, year }) => {
    if (!name) {
      const l = eventsListJson(year ?? null)
      return l ? ok(l) : fail('Year out of range: events are available for the current year −1 … +4.')
    }
    const slug = resolveEventName(name)
    if (!slug) return fail(`No event matches "${name}".`, { events: EVENT_SLUGS })
    const r = eventJson(slug, year ?? null)
    return r ? ok(r) : fail('Year out of range: events are available for the current year −1 … +4.')
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
    description: 'Fetch a document by id returned from `search` (a site path such as "/surah/al-baqarah/255", "/topics/patience", "/dua/dua-for-anxiety", "/names-of-allah/ar-rahman"; prefix "/bn" for Bangla). Returns {id,title,text,url,metadata}. Documents over ~100 KB (e.g. a whole long surah) are truncated with a note and the URL of the full page; fetch single ayahs or a juz for long surahs.',
    inputSchema: { id: z.string().min(1).max(200) },
    annotations: RO,
  }, async ({ id }) => {
    const path = id.replace(/^https?:\/\/[^/]+/, '').replace(/\.md$/, '')
    const doc = await markdownFor(path.startsWith('/') ? path : `/${path}`)
    if (!doc) return fail(`No document "${id}".`)
    const title = doc.body.match(/^# (.+)$/m)?.[1] ?? id
    const clip = clipDocument(doc.body, doc.canonical)
    return ok({ id: path, title, text: clip.text, url: doc.canonical, metadata: { source: site.name, format: 'text/markdown', ...(clip.truncated ? { truncated: true, fullBytes: clip.bytes } : {}) } })
  })

  server.registerTool('get_learn_guide', {
    title: 'Get a learning guide (salah, wudu, tajweed, kalimas, Arabic alphabet)',
    description: `Step-by-step Islamic learning guides as markdown with the canonical URL: ${learnGuides.map((g) => g.slug).join(', ')}; or one tajweed rule as "tajweed/{rule}" (${tajweedRules.map((r) => r.slug).join(', ')}). Free text such as "how to pray salah", "six kalimas", "how to perform wudu" or "noon sakinah" is matched. Salah and wudu follow the widely practised Hanafi method and note where other schools differ; Quran text comes from the corpus.`,
    inputSchema: {
      topic: z.string().min(2).max(120).describe('Guide slug, "tajweed/izhar", or a phrase like "how to pray"'),
      lang: z.enum(['en', 'bn']).optional().describe('Guide language (default en; bn puts Bangla first)'),
    },
    annotations: RO,
  }, async ({ topic, lang }) => {
    const path = resolveLearnTopic(topic)
    if (!path) return fail(`No learning guide matches "${topic}".`, { topics: ['learn', ...learnGuides.map((g) => g.slug), ...tajweedRules.map((r) => `tajweed/${r.slug}`)] })
    const [, , a, b] = path.split('/')
    const locale = lang === 'bn' ? 'bn' : 'en'
    const doc = await learnMd(a, b, locale)
    if (!doc) return fail(`No learning guide matches "${topic}".`)
    return ok({ topic: path.replace(/^\/learn\/?/, '') || 'learn', title: doc.body.match(/^# (.+)$/m)?.[1] ?? topic, url: doc.canonical, markdownUrl: `${absoluteUrl(localeHref(locale, path))}.md`, markdown: clipDocument(doc.body, doc.canonical).text, citation: `${doc.body.match(/^# (.+)$/m)?.[1] ?? topic}. ${site.name}. ${doc.canonical}` })
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
