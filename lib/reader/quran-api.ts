'use client'
/** Client-side enrichments from the public Quran.com API (CORS enabled). Promises are memoised per session. */

const API = 'https://api.quran.com/api/v4'
const memo = new Map<string, Promise<unknown>>()

function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  let p = memo.get(key) as Promise<T> | undefined
  if (!p) {
    p = fn().catch((e) => { memo.delete(key); throw e })
    memo.set(key, p)
  }
  return p
}

async function getJson<T>(url: string): Promise<T> {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return r.json() as Promise<T>
}

export interface WbwWord { position: number; ar: string; tl: string | null; tr: string | null; audio: string | null }
/** verse key → words */
export type WbwMap = Record<string, WbwWord[]>

interface ApiWord { position: number; char_type_name: string; text_uthmani: string; audio_url: string | null; translation?: { text: string | null }; transliteration?: { text: string | null } }

export const fetchWbw = (chapter: number, lang: 'en' | 'bn') =>
  cached(`wbw:${chapter}:${lang}`, async () => {
    const d = await getJson<{ verses: { verse_key: string; words: ApiWord[] }[] }>(
      `${API}/verses/by_chapter/${chapter}?words=true&word_fields=text_uthmani&per_page=300&language=${lang}`
    )
    const map: WbwMap = {}
    for (const v of d.verses) {
      map[v.verse_key] = v.words
        .filter((w) => w.char_type_name === 'word')
        .map((w) => ({ position: w.position, ar: w.text_uthmani, tl: w.transliteration?.text ?? null, tr: w.translation?.text ?? null, audio: w.audio_url }))
    }
    return map
  })

/** verse key → tajweed HTML */
export const fetchTajweed = (chapter: number) =>
  cached(`tj:${chapter}`, async () => {
    const d = await getJson<{ verses: { verse_key: string; text_uthmani_tajweed: string }[] }>(`${API}/quran/verses/uthmani_tajweed?chapter_number=${chapter}`)
    const map: Record<string, string> = {}
    for (const v of d.verses) map[v.verse_key] = v.text_uthmani_tajweed
    return map
  })

export const TAFSIRS = [
  { id: 169, lang: 'en', name: { en: 'Ibn Kathir', bn: 'ইবনে কাসীর' }, full: 'Tafsir Ibn Kathir (Abridged)' },
  { id: 165, lang: 'bn', name: { en: 'Ahsanul Bayaan', bn: 'আহসানুল বায়ান' }, full: 'Tafsir Ahsanul Bayaan' },
  { id: 16, lang: 'ar', name: { en: 'Al-Muyassar', bn: 'আল-মুয়াসসার' }, full: 'Tafsir Al-Muyassar' },
] as const

export const fetchTafsir = (id: number, key: string) =>
  cached(`tafsir:${id}:${key}`, async () => {
    const d = await getJson<{ tafsir: { text: string; resource_name: string; verses?: Record<string, unknown> } }>(`${API}/tafsirs/${id}/by_ayah/${key}`)
    return { text: d.tafsir.text || '', name: d.tafsir.resource_name, verses: Object.keys(d.tafsir.verses ?? {}) }
  })

export const wordAudioUrl = (path: string) => (path.startsWith('http') ? path : `https://verses.quran.com/${path}`)

let wordAudio: HTMLAudioElement | null = null
/** Play a single word's recitation (one shared element so taps don't overlap). */
export function playWordAudio(path: string) {
  try {
    wordAudio ??= new Audio()
    wordAudio.pause()
    wordAudio.src = wordAudioUrl(path)
    void wordAudio.play().catch(() => {})
  } catch {}
}

// ---------------------------------------------------------------- extra translations (Quran.com catalogue)

export interface TranslationMeta { id: number; name: string; author: string; lang: string; langName: string; rtl: boolean }

/** language_name (Quran.com) → BCP-47 code */
const LANG_CODES: Record<string, string> = {
  english: 'en', bengali: 'bn', urdu: 'ur', hindi: 'hi', indonesian: 'id', turkish: 'tr', persian: 'fa', french: 'fr', spanish: 'es',
  german: 'de', russian: 'ru', malay: 'ms', chinese: 'zh', japanese: 'ja', korean: 'ko', italian: 'it', portuguese: 'pt', dutch: 'nl',
  swahili: 'sw', somali: 'so', hausa: 'ha', tamil: 'ta', telugu: 'te', malayalam: 'ml', kannada: 'kn', gujarati: 'gu', marathi: 'mr',
  punjabi: 'pa', sindhi: 'sd', pashto: 'ps', kurdish: 'ku', uzbek: 'uz', kazakh: 'kk', azeri: 'az', albanian: 'sq', bosnian: 'bs',
  thai: 'th', vietnamese: 'vi', tagalog: 'tl', amharic: 'am', yoruba: 'yo', swedish: 'sv', norwegian: 'no', polish: 'pl', czech: 'cs',
  romanian: 'ro', bulgarian: 'bg', ukrainian: 'uk', hebrew: 'he', tajik: 'tg', uighur: 'ug', dhivehi: 'dv', divehi: 'dv', dari: 'prs', 'central khmer': 'km', chechen: 'ce', amazigh: 'ber', ganda: 'lg', kinyarwanda: 'rw', bambara: 'bm', maranao: 'mrw', sinhala: 'si', nepali: 'ne',
  assamese: 'as', oromo: 'om', finnish: 'fi', greek: 'el', hungarian: 'hu', khmer: 'km', lithuanian: 'lt', macedonian: 'mk', tatar: 'tt',
}
const RTL = new Set(['ur', 'fa', 'prs', 'ar', 'he', 'ps', 'sd', 'ug', 'dv', 'ku'])

/** Commonly wanted editions, shown first in the picker. */
export const FEATURED_TRANSLATIONS = [163, 162, 213, 22, 19, 203, 84, 95, 97, 54, 234, 122, 33, 77]

export const fetchTranslationCatalogue = () =>
  cached('tr:catalogue', async () => {
    const d = await getJson<{ translations: { id: number; name: string; author_name: string; language_name: string; translated_name?: { name: string } }[] }>(`${API}/resources/translations`)
    return d.translations
      .map((t): TranslationMeta => {
        const langName = t.language_name.split(',')[0].trim().toLowerCase()
        const lang = LANG_CODES[langName] ?? 'und'
        return { id: t.id, name: t.translated_name?.name || t.name, author: t.author_name, lang, langName, rtl: RTL.has(lang) }
      })
      .sort((a, b) => a.langName.localeCompare(b.langName) || a.name.localeCompare(b.name))
  })

/** Translation HTML → plain text without footnote markers. */
function cleanTranslation(html: string) {
  return html
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

/** verse key → resource id → text */
export type ExtraTrMap = Record<string, Record<number, string>>

interface ApiTrVerse { verse_key: string; translations?: { resource_id: number; text: string }[] }
function toMap(verses: ApiTrVerse[]): ExtraTrMap {
  const map: ExtraTrMap = {}
  for (const v of verses) {
    const row: Record<number, string> = {}
    for (const t of v.translations ?? []) row[t.resource_id] = cleanTranslation(t.text)
    map[v.verse_key] = row
  }
  return map
}

/** One translation for a whole chapter (cached per chapter + edition, so adding an edition only fetches that one). */
export const fetchChapterTranslation = (chapter: number, id: number) =>
  cached(`tr:${chapter}:${id}`, async () => {
    const d = await getJson<{ verses: ApiTrVerse[] }>(`${API}/verses/by_chapter/${chapter}?translations=${id}&per_page=300&fields=verse_key`)
    const m = toMap(d.verses)
    const out: Record<string, string> = {}
    for (const k in m) out[k] = m[k][id] ?? ''
    return out
  })
