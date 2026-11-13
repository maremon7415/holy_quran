import 'server-only'
import { sanitizeHtml } from './sanitize'

const API = 'https://api.quran.com/api/v4'
const WEEK = 604800

async function get<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { next: { revalidate: WEEK }, signal: AbortSignal.timeout(8000) })
    if (!r.ok) return null
    return (await r.json()) as T
  } catch {
    return null
  }
}

export interface ServerWord { position: number; ar: string; tl: string | null; en: string | null; bn: string | null }

interface ApiWord { position: number; char_type_name: string; text_uthmani: string; translation?: { text: string | null }; transliteration?: { text: string | null } }

/** Word-by-word (Arabic, transliteration, English & Bangla meaning). Empty array when offline. */
export async function getWordsForAyah(key: string): Promise<ServerWord[]> {
  const q = (lang: string) => get<{ verse: { words: ApiWord[] } }>(`${API}/verses/by_key/${key}?words=true&word_fields=text_uthmani&language=${lang}`)
  const [en, bn] = await Promise.all([q('en'), q('bn')])
  if (!en) return []
  const bnWords = (bn?.verse.words ?? []).filter((w) => w.char_type_name === 'word')
  return en.verse.words
    .filter((w) => w.char_type_name === 'word')
    .map((w, i) => ({ position: w.position, ar: w.text_uthmani, tl: w.transliteration?.text ?? null, en: w.translation?.text ?? null, bn: bnWords[i]?.translation?.text ?? null }))
}

export interface ServerTafsir { id: number; name: string; lang: 'en' | 'bn'; html: string; covers: string[] }

export async function getTafsirForAyah(key: string): Promise<ServerTafsir[]> {
  const list = [
    { id: 169, lang: 'en' as const, name: 'Tafsir Ibn Kathir (Abridged)' },
    { id: 165, lang: 'bn' as const, name: 'তাফসীর আহসানুল বায়ান' },
  ]
  const res = await Promise.all(
    list.map(async (t) => {
      const d = await get<{ tafsir: { text: string; verses?: Record<string, unknown> } }>(`${API}/tafsirs/${t.id}/by_ayah/${key}`)
      return d?.tafsir.text ? { ...t, html: sanitizeHtml(d.tafsir.text), covers: Object.keys(d.tafsir.verses ?? {}) } : null
    })
  )
  return res.filter((x): x is ServerTafsir => !!x)
}
