// Hadith numbering used by the URLs (client-safe, pure).
//
// URL number = the number commonly cited for the hadith (what sunnah.com prints), i.e.
//  - Bukhari, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Malik, Nawawi, Qudsi: the corpus `hadithnumber`
//    (integer part). A few hadiths carry a sub-number (Bukhari 402 and 402.2 → "402a" and "402b"):
//    they are shown together on the page of the integer number.
//  - Muslim: the Muhammad Fu'ad 'Abd al-Baqi number, which is the corpus `arabicnumber` (integer part).
//    The corpus `hadithnumber` for Muslim is only an internal running index (1…7563) and is NOT used in URLs.
//    `arabicnumber` "2564.03" is the 3rd narration under number 2564 ("Sahih Muslim 2564c").
import type { CollectionSlug } from './collections'

export interface RawNumbers { hadithnumber: number; arabicnumber?: number | string | null }

/** The URL number of a corpus entry, or null if it has none (Muslim's introduction entries). */
export function urlNumberOf(collection: CollectionSlug, h: RawNumbers): number | null {
  if (collection === 'muslim') {
    if (h.arabicnumber == null || h.arabicnumber === '') return null
    const n = Math.floor(parseFloat(String(h.arabicnumber)))
    return Number.isFinite(n) && n >= 1 ? n : null
  }
  const n = Math.floor(h.hadithnumber)
  return Number.isFinite(n) && n >= 1 ? n : null
}

/** 0 → "a", 1 → "b" … (sub-narrations that share one citation number). */
export const subLetter = (i: number) => String.fromCharCode(97 + (i % 26)).repeat(Math.floor(i / 26) + 1)

/** Strict URL segment → positive integer ("12" yes; "012", "1.5", "1e3", "" no). */
export function parseHadithNumber(seg: string | undefined | null): number | null {
  if (!seg || !/^[1-9]\d{0,5}$/.test(seg)) return null
  return Number(seg)
}
