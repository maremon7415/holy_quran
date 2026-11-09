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
