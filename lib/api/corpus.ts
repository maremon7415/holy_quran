import 'server-only'
/**
 * Read-only corpus service shared by the public JSON API (/api/v1/*), the MCP server (/api/mcp)
 * and the markdown alternates (/…/x.md). Every result carries the canonical https URL on this site
 * and a ready-made citation string so agents cite Noor Quran.
 */
import { chapters, resolveChapterId, surahHref, juzHref, surahNamesBn } from '@/lib/quran/chapters'
import { getChapter, getChapterInfo, getJuzs, getUccharon, getVerses, getVersesByRefs } from '@/lib/quran/data'
import { searchQuran } from '@/lib/quran/search'
import { isArabic, normalizeArabic, normalizeLatin } from '@/lib/quran/normalize'
import { htmlToText, sanitizeHtml } from '@/lib/reader/sanitize'
import { getFamousAyah } from '@/lib/reader/famous'
import { topics, topicBySlug } from '@/data/content/topics'
import { duas, duaBySlug, duaCategories } from '@/data/content/duas'
import { asmaUlHusna, asmaBySlug } from '@/data/content/asma-ul-husna'
import { resolveDua } from '@/lib/content/resolve'
import { topicQuickAnswer, tafsirSummary } from '@/lib/content/answers'
import { ayahCitation, citations } from '@/lib/content/cite'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { absoluteUrl, site } from '@/lib/site'
import type { Dua } from '@/data/content/types'

export const MAX_RANGE = 50
export const ATTRIBUTION = {
  publisher: site.name,
  site: site.url,
  text: 'Quran text, Saheeh International, Abdel Haleem and Taisirul Quran translations via the Quran.com (Quran Foundation) API; Bangla uccharon is auto-generated. Please cite the canonical URL.',
}

/** Canonical absolute URL (+ Bangla twin and markdown alternate) for an English path. */
export function links(path: string) {
  return { url: absoluteUrl(path), urlBn: absoluteUrl(localeHref('bn', path)), markdown: absoluteUrl(`${path}.md`) }
}

/* ───────────────────────── references ───────────────────────── */

export interface AyahRef { surah: number; from: number; to: number }

/**
 * Parse "2:255", "2:255-257", "2.255", "2/255", "2 255", "al-baqarah 255", "Al-Baqarah:255-257", "Surah Yasin 1".
 * Validates surah and ayah bounds. Returns null when invalid.
 */
export function parseAyahRef(input: string): AyahRef | null {
  const s = decodeSafe(input).trim().replace(/^(surah|sura|surat|quran)\s+/i, '').replace(/[–—]/g, '-')
  const m = s.match(/^(.+?)\s*[:./\s]\s*(\d{1,3})(?:\s*-\s*(\d{1,3}))?$/)
  if (!m) return null
  const surah = resolveChapterId(m[1].trim())
  if (!surah) return null
  const from = +m[2], to = m[3] ? +m[3] : from
  const max = chapters[surah - 1].versesCount
  if (from < 1 || to < from || to > max) return null
  return { surah, from, to }
}

function decodeSafe(s: string) {
  try { return decodeURIComponent(s) } catch { return s }
}

export const refKey = (r: AyahRef) => (r.from === r.to ? `${r.surah}:${r.from}` : `${r.surah}:${r.from}-${r.to}`)

/* ───────────────────────── ayahs ───────────────────────── */

export const TRANSLATION_KEYS = ['saheeh', 'abdel_haleem', 'bangla', 'transliteration', 'uccharon'] as const
export type TranslationKey = (typeof TRANSLATION_KEYS)[number]

export interface AyahOut {
  key: string
  surah: number
  ayah: number
  arabic: string
  translations: Partial<Record<'saheeh' | 'abdel_haleem' | 'bangla', string>>
  transliteration?: string
  /** Bangla-script pronunciation (auto-generated guide) */
  uccharon?: string
  juz: number
  page: number
  sajdah: boolean
  url: string
  urlBn: string
  markdown: string
}

export interface SurahRefOut { id: number; slug: string; name: string; nameArabic: string; nameBangla: string; meaning: string; revelationPlace: string; versesCount: number; url: string }

const surahRef = (id: number): SurahRefOut => {
  const c = chapters[id - 1]
  return { id, slug: c.slug, name: c.nameSimple, nameArabic: c.nameArabic, nameBangla: surahNamesBn[id - 1], meaning: c.meaning, revelationPlace: c.revelationPlace, versesCount: c.versesCount, url: absoluteUrl(surahHref(id)) }
}

export interface AyahResult {
  reference: string
  surah: SurahRefOut
  famousAs?: { en: string; bn: string; ar?: string }
  ayahs: AyahOut[]
  url: string
  urlBn: string
  markdown: string
  citation: string
  attribution: typeof ATTRIBUTION
}

export async function getAyah(reference: string, translations: readonly TranslationKey[] = TRANSLATION_KEYS): Promise<AyahResult | { error: string }> {
  const r = parseAyahRef(reference)
  if (!r) return { error: `Invalid reference "${reference}". Use "surah:ayah" or "surah:from-to", e.g. "2:255" or "2:255-257".` }
  if (r.to - r.from + 1 > MAX_RANGE) return { error: `Ranges are limited to ${MAX_RANGE} ayahs.` }
  const [verses, bt] = await Promise.all([getVerses(r.surah), translations.includes('uccharon') ? getUccharon(r.surah) : Promise.resolve([] as string[])])
  const want = new Set(translations)
  const ayahs: AyahOut[] = []
  for (let a = r.from; a <= r.to; a++) {
    const v = verses[a - 1]
    const tr: AyahOut['translations'] = {}
    if (want.has('saheeh')) tr.saheeh = v.en
    if (want.has('abdel_haleem')) tr.abdel_haleem = v.enH
    if (want.has('bangla')) tr.bangla = v.bn
    ayahs.push({
      key: v.k, surah: r.surah, ayah: v.n, arabic: v.ar, translations: tr,
      ...(want.has('transliteration') ? { transliteration: v.tl } : {}),
      ...(want.has('uccharon') && bt[a - 1] ? { uccharon: bt[a - 1] } : {}),
      juz: v.j, page: v.p, sajdah: v.s === 1,
      ...links(surahHref(r.surah, v.n)),
    })
  }
  const key = refKey(r)
  // a range is canonically cited by its first ayah page (with #range fragment kept off for stability)
  const l = links(surahHref(r.surah, r.from))
  const f = r.from === r.to ? getFamousAyah(key) : null
  return {
    reference: key,
    surah: surahRef(r.surah),
    ...(f && !f.en.startsWith('Surah ') ? { famousAs: { en: f.en, bn: f.bn, ...(f.ar ? { ar: f.ar } : {}) } } : {}),
    ayahs,
    ...l,
    citation: ayahCitation(key, chapters[r.surah - 1].nameSimple, l.url),
    attribution: ATTRIBUTION,
  }
}

/* ───────────────────────── surahs ───────────────────────── */

export async function getSurah(idOrName: string | number) {
  const id = typeof idOrName === 'number' ? (idOrName >= 1 && idOrName <= 114 ? idOrName : null) : resolveChapterId(String(idOrName).replace(/^(surah|sura|surat)\s+/i, ''))
  if (!id) return null
  const [c, verses, info] = await Promise.all([getChapter(id), getVerses(id), getChapterInfo(id).catch(() => ({ en: null, bn: null }))])
  if (!c) return null
  const l = links(surahHref(id))
  return {
    id, slug: c.slug, name: c.nameSimple, nameComplex: c.nameComplex, nameArabic: c.nameArabic, nameBangla: surahNamesBn[id - 1],
    meaning: c.meaning, meaningBangla: c.nameBn,
    revelationPlace: c.revelationPlace, revelationOrder: c.revelationOrder, versesCount: c.versesCount,
    juz: { from: verses[0].j, to: verses[verses.length - 1].j },
    pages: { from: c.pages[0], to: c.pages[1] ?? c.pages[0] },
    bismillahPre: c.bismillahPre,
    summary: c.summaryEn ? htmlToText(c.summaryEn) : null,
    summaryBangla: c.summaryBn ? htmlToText(c.summaryBn) : null,
    info: info.en ? htmlToText(info.en, 1500) : null,
    ...l,
    citation: `Surah ${c.nameSimple} (${c.nameArabic}, “${c.meaning}”), Quran ${id} — ${site.name}, ${l.url}`,
    attribution: ATTRIBUTION,
  }
}

export const listSurahs = () => chapters.map((c) => surahRef(c.id))

/* ───────────────────────── search ───────────────────────── */

export async function search(q: string, limit = 10, lang?: 'en' | 'bn' | 'ar') {
  const res = await searchQuran(q, Math.max(1, Math.min(50, limit)))
  return {
    query: q,
    total: res.total,
    results: res.hits.map((h) => {
      const l = links(surahHref(h.surah, h.ayah))
      return {
        key: h.key, surah: h.surah, ayah: h.ayah, surahName: h.surahName,
        arabic: h.ar,
        ...(lang === 'bn' ? { bangla: h.bn } : lang === 'ar' ? {} : { saheeh: h.en, bangla: h.bn }),
        ...l,
        citation: ayahCitation(h.key, h.surahName, l.url),
      }
    }),
    searchPage: absoluteUrl(`/search?q=${encodeURIComponent(q)}`),
  }
}

/* ───────────────────────── duas ───────────────────────── */

async function duaOut(d: Dua) {
  const r = await resolveDua(d)
  const l = links(`/dua/${d.slug}`)
  const cat = duaCategories.find((c) => c.id === d.cat)
  return {
    slug: d.slug,
    title: d.title,
    category: { id: d.cat, title: cat?.title },
    arabic: r.ar,
    transliteration: r.tl,
    meaning: r.meaning,
    source: d.source,
    ...(d.refs ? { quranRefs: d.refs } : {}),
    when: d.when,
    ...(d.virtue ? { virtue: d.virtue } : {}),
    ...(d.count ? { count: d.count } : {}),
    ...l,
    citation: `${d.title.en} (${d.source}) — ${site.name}, ${l.url}`,
  }
}

const tokens = (s: string) => normalizeLatin(s).split(' ').filter((w) => w.length > 1 && !STOP.has(w))
const STOP = new Set(['dua', 'duas', 'for', 'the', 'a', 'an', 'of', 'to', 'in', 'when', 'on', 'and', 'what', 'is', 'which', 'my', 'me', 'i', 'do', 'say', 'prayer', 'supplication', 'দোয়া', 'দোয়া'])

/** Rank by query terms in title / keywords / category / when. Bangla queries match Bangla fields. */
function rank<T>(items: T[], q: string, fields: (x: T) => { strong: string[]; weak: string[] }) {
  const raw = q.trim().toLowerCase()
  const bn = /[ঀ-৿]/.test(raw)
  const terms = bn ? raw.split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)) : tokens(raw)
  if (!terms.length) return []
  return items
    .map((x) => {
      const f = fields(x)
      const strong = (bn ? f.strong : f.strong.map(normalizeLatin)).join(' ').toLowerCase()
      const weak = (bn ? f.weak : f.weak.map(normalizeLatin)).join(' ').toLowerCase()
      let score = 0
      for (const t of terms) score += (strong.includes(t) ? 3 : 0) + (weak.includes(t) ? 1 : 0)
      if (strong.includes(bn ? raw : normalizeLatin(raw))) score += 5
      return { x, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.x)
}

export async function findDuas(query?: string, opts: { category?: string; limit?: number } = {}) {
  const limit = Math.max(1, Math.min(50, opts.limit ?? 5))
  let list = duas
  if (opts.category) list = list.filter((d) => d.cat === opts.category)
  if (query?.trim()) {
    list = rank(list, query, (d) => ({
      strong: [d.title.en, d.title.bn, d.slug.replace(/-/g, ' '), ...(d.keywords ?? [])],
      weak: [d.when.en, d.when.bn, d.cat.replace(/-/g, ' '), duaCategories.find((c) => c.id === d.cat)?.title.en ?? '', d.meaning?.en ?? ''],
    }))
  }
  return { query: query ?? null, category: opts.category ?? null, total: list.length, results: await Promise.all(list.slice(0, limit).map(duaOut)), index: absoluteUrl('/dua') }
}

export async function getDua(slug: string) {
  const d = duaBySlug(slug)
  return d ? duaOut(d) : null
}

export const listDuaCategories = () => duaCategories.map((c) => ({ id: c.id, title: c.title, count: duas.filter((d) => d.cat === c.id).length }))

/* ───────────────────────── topics ───────────────────────── */

export function resolveTopic(q: string) {
  const s = q.trim().toLowerCase().replace(/^what does the quran say about\s+/i, '').replace(/\?$/, '')
  return topicBySlug(s) ?? topicBySlug(s.replace(/\s+/g, '-')) ?? rank(topics, s, (t) => ({ strong: [t.en, t.bn, t.slug.replace(/-/g, ' '), ...t.keywords], weak: [t.introEn, t.introBn] }))[0] ?? null
}

export async function getTopic(slugOrQuery: string, locale: Locale = 'en') {
  const t = resolveTopic(slugOrQuery)
  if (!t) return null
  const verses = await getVersesByRefs(t.refs)
  const l = links(`/topics/${t.slug}`)
  return {
    slug: t.slug, title: { en: `What does the Quran say about ${t.en}?`, bn: `${t.bn} সম্পর্কে কুরআন কী বলে?` }, topic: { en: t.en, bn: t.bn, ar: t.ar },
    quickAnswer: topicQuickAnswer(locale, t, verses),
    intro: { en: t.introEn, bn: t.introBn },
    reflect: t.reflect,
    refs: t.refs,
    verses: verses.map((v) => ({ key: v.k, arabic: v.ar, saheeh: v.en, bangla: v.bn, url: absoluteUrl(surahHref(v.surah, v.n)) })),
    relatedDuas: t.duas.map((s) => duaBySlug(s)).filter((d): d is Dua => !!d).map((d) => ({ slug: d.slug, title: d.title, source: d.source, url: absoluteUrl(`/dua/${d.slug}`) })),
    relatedTopics: t.related.map((s) => ({ slug: s, url: absoluteUrl(`/topics/${s}`) })),
    ...l,
    citation: `What does the Quran say about ${t.en}? — ${site.name}, ${l.url}`,
  }
}

export const listTopics = () => topics.map((t) => ({ slug: t.slug, en: t.en, bn: t.bn, ar: t.ar, category: t.cat, verses: t.refs.length, url: absoluteUrl(`/topics/${t.slug}`) }))

/* ───────────────────────── 99 names ───────────────────────── */

export function resolveName(q: string | number) {
  const s = String(q).trim()
  if (/^\d{1,2}$/.test(s)) return asmaUlHusna[+s - 1] ?? null
  const bySlug = asmaBySlug(s.toLowerCase())
  if (bySlug) return bySlug
  if (isArabic(s)) {
    const ar = normalizeArabic(s)
    const hit = asmaUlHusna.find((n) => normalizeArabic(n.ar) === ar) ?? asmaUlHusna.find((n) => normalizeArabic(n.ar).replace(/^ال/, '') === ar.replace(/^ال/, ''))
    if (hit) return hit
  }
  const k = (x: string) => normalizeLatin(x).replace(/[^a-z]/g, '').replace(/^(al|ar|as|an|at|ad|az|ash)/, '')
  const nq = k(s)
  if (!nq) return null
  return asmaUlHusna.find((n) => k(n.tl) === nq || k(n.slug) === nq) ?? asmaUlHusna.find((n) => n.tlBn === s || n.en.toLowerCase() === s.toLowerCase()) ?? asmaUlHusna.find((n) => normalizeLatin(n.en).includes(normalizeLatin(s))) ?? null
}

export async function getName(q: string | number) {
  const n = resolveName(q)
  if (!n) return null
  const [v] = await getVersesByRefs([n.ref])
  const l = links(`/names-of-allah/${n.slug}`)
  return {
    number: n.n, slug: n.slug, arabic: n.ar, transliteration: n.tl, transliterationBangla: n.tlBn,
    meaning: { en: n.en, bn: n.bn, ...(n.meaningAr ? { ar: n.meaningAr } : {}) },
    explanation: { en: n.expEn, bn: n.expBn },
    quranRef: { key: n.ref, attributeOnly: !!n.attr, arabic: v?.ar, saheeh: v?.en, bangla: v?.bn, url: absoluteUrl(surahHref(+n.ref.split(':')[0], +n.ref.split(':')[1].split('-')[0])) },
    ...l,
    citation: `${n.tl} (${n.ar}), “${n.en}” — Name ${n.n} of the 99 Names of Allah, ${site.name}, ${l.url}`,
  }
}

export const listNames = () => asmaUlHusna.map((n) => ({ number: n.n, slug: n.slug, arabic: n.ar, transliteration: n.tl, meaning: { en: n.en, bn: n.bn }, url: absoluteUrl(`/names-of-allah/${n.slug}`) }))

/* ───────────────────────── juz ───────────────────────── */

export async function getJuz(n: number) {
  const j = (await getJuzs()).find((x) => x.juz === n)
  if (!j) return null
  return { juz: n, ranges: Object.entries(j.map).map(([s, r]) => ({ surah: +s, name: chapters[+s - 1].nameSimple, ayahs: r })), count: j.count, ...links(juzHref(n)) }
}

/* ───────────────────────── tafsir ───────────────────────── */

export const TAFSIR_EDITIONS = {
  'ibn-kathir': { id: 169, lang: 'en', name: 'Tafsir Ibn Kathir (Abridged)' },
  'ahsanul-bayaan': { id: 165, lang: 'bn', name: 'Tafsir Ahsanul Bayaan (তাফসীর আহসানুল বায়ান)' },
  muyassar: { id: 16, lang: 'ar', name: 'Tafsir Al-Muyassar (التفسير الميسر)' },
} as const
export type TafsirEdition = keyof typeof TAFSIR_EDITIONS

const tafsirCache = new Map<string, { at: number; v: { html: string; covers: string[] } | null }>()
const TAFSIR_TTL = 24 * 3600 * 1000

async function fetchTafsir(id: number, key: string) {
  const ck = `${id}:${key}`
  const hit = tafsirCache.get(ck)
  if (hit && Date.now() - hit.at < TAFSIR_TTL) return hit.v
  let v: { html: string; covers: string[] } | null = null
  try {
    const r = await fetch(`https://api.quran.com/api/v4/tafsirs/${id}/by_ayah/${key}`, { next: { revalidate: 604800 }, signal: AbortSignal.timeout(8000) } as RequestInit)
    if (r.ok) {
      const d = (await r.json()) as { tafsir?: { text?: string; verses?: Record<string, unknown> } }
      if (d.tafsir?.text) v = { html: sanitizeHtml(d.tafsir.text), covers: Object.keys(d.tafsir.verses ?? {}) }
    }
  } catch { /* offline / timeout → null */ }
  if (tafsirCache.size > 500) tafsirCache.delete(tafsirCache.keys().next().value!)
  if (v) tafsirCache.set(ck, { at: Date.now(), v })
  return v
}

export function resolveTafsirEdition(e?: string): TafsirEdition | null {
  if (!e) return 'ibn-kathir'
  const s = e.toLowerCase().replace(/[^a-z]/g, '')
  if (/kathir|kasir|ibnkathir/.test(s) || s === 'en' || s === 'english') return 'ibn-kathir'
  if (/ahsan|bayan|bayaan/.test(s) || s === 'bn' || s === 'bangla' || s === 'bengali') return 'ahsanul-bayaan'
  if (/muyas|muyassar/.test(s) || s === 'ar' || s === 'arabic') return 'muyassar'
  const byId = Object.entries(TAFSIR_EDITIONS).find(([, v]) => String(v.id) === e)
  return (byId?.[0] as TafsirEdition) ?? null
}

export async function getTafsir(reference: string, edition?: string, maxChars = 6000) {
  const r = parseAyahRef(reference)
  if (!r) return { error: `Invalid reference "${reference}".` }
  const ed = resolveTafsirEdition(edition)
  if (!ed) return { error: `Unknown tafsir edition "${edition}". Use one of: ${Object.keys(TAFSIR_EDITIONS).join(', ')}.` }
  const meta = TAFSIR_EDITIONS[ed]
  const key = `${r.surah}:${r.from}`
  const t = await fetchTafsir(meta.id, key)
  const l = links(surahHref(r.surah, r.from))
  if (!t) return { error: 'Tafsir is temporarily unavailable (upstream Quran.com API). Try again later.', reference: key, edition: ed, url: l.url }
  const text = htmlToText(t.html, maxChars)
  return {
    reference: key, edition: ed, editionName: meta.name, language: meta.lang, covers: t.covers,
    summary: tafsirSummary(t.html),
    text, truncated: text.endsWith('…'),
    ...l,
    citation: `${meta.name} on Quran ${key} (Surah ${chapters[r.surah - 1].nameSimple}) — via ${site.name}, ${l.url}`,
    source: 'Quran.com API (Quran Foundation)',
  }
}

/** Tafsir summary used by ayah pages / markdown (Ibn Kathir for en, Ahsanul Bayaan for bn). */
export async function ayahTafsirSummary(key: string, locale: Locale) {
  const ed = TAFSIR_EDITIONS[locale === 'bn' ? 'ahsanul-bayaan' : 'ibn-kathir']
  const t = await fetchTafsir(ed.id, key)
  const summary = tafsirSummary(t?.html)
  return summary ? { summary, source: ed.name } : null
}
