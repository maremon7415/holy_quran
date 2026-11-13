/** Trilingual string. `ar` is optional (long editorial copy stays in en/bn by design, see docs/ARCHITECTURE.md). */
export interface L { en: string; bn: string; ar?: string }

/** A verified hadith citation used on the learn pages; checked against the open hadith corpus by `scripts/verify-learn-sources.mjs`. */
export interface LearnHadith {
  id: string
  /** Display reference, e.g. "Sahih al-Bukhari 8" */
  ref: string
  book: 'bukhari' | 'muslim' | 'abudawud' | 'tirmidhi' | 'nasai' | 'ibnmajah'
  number: number
  /** Arabic phrases (diacritics ignored) that the cited hadith must contain; ALL must be present */
  must: string[]
}
