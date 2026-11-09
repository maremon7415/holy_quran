/** Client + server safe chapter list (≈12KB). */
import data from './chapters-lite.json'
import type { ChapterLite } from './types'

export const chapters = data as ChapterLite[]
export const getChapterLite = (id: number) => chapters[id - 1]

/** Bengali transliterated surah names (index = surah id - 1). */
export { surahNamesBn } from './surah-names-bn'

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ঀ-৿؀-ۿ]/g, '')

/** Resolve "2", "al-baqarah", "baqarah", "Baqara" → chapter id */
export function resolveChapterId(input: string): number | null {
  const s = decodeURIComponent(input).trim()
  if (/^\d+$/.test(s)) {
    const n = Number(s)
    return n >= 1 && n <= 114 ? n : null
  }
  const q = norm(s)
  const hit =
    chapters.find((c) => c.slug === s.toLowerCase()) ||
    chapters.find((c) => norm(c.nameSimple) === q) ||
    chapters.find((c) => norm(c.nameSimple).replace(/^(al|an|ar|as|at|ad|az|ash)/, '') === q.replace(/^(al|an|ar|as|at|ad|az|ash)/, ''))
  return hit?.id ?? null
}

export const toArabicDigits = (n: number | string) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d])
export const toBanglaDigits = (n: number | string) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d])

/** Canonical URLs — always build links with these helpers. */
export const surahHref = (id: number, ayah?: number) => {
  const c = chapters[id - 1]
  return ayah ? `/surah/${c.slug}/${ayah}` : `/surah/${c.slug}`
}
/** Link into the reader scrolled to an ayah (instead of the single-ayah page) */
export const readerHref = (id: number, ayah?: number) => `${surahHref(id)}${ayah ? `#ayah-${ayah}` : ''}`
export const juzHref = (n: number) => `/juz/${n}`
