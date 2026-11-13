/** Bilingual string used by all hand-written content. */
export interface L { en: string; bn: string; ar?: string }

export type TopicCategory = 'emotions' | 'character' | 'life' | 'faith' | 'society'

export interface Topic {
  slug: string
  cat: TopicCategory
  /** English title, e.g. "anxiety" (used as: What does the Quran say about {en}?) */
  en: string
  bn: string
  /** Extra search phrases people use (en/bn) */
  keywords: string[]
  introEn: string
  introBn: string
  reflect: L
  /** Quran refs "2:255" or "94:5-6" — text is ALWAYS rendered from the corpus */
  refs: string[]
  related: string[]
  duas: string[]
}

export type DuaCategory =
  | 'morning-evening' | 'sleep' | 'eating' | 'travel' | 'home-masjid' | 'wudu-salah'
  | 'anxiety' | 'forgiveness' | 'family' | 'rizq' | 'knowledge' | 'illness' | 'protection' | 'rabbana'

export interface Dua {
  slug: string
  cat: DuaCategory
  title: L
  /** Arabic for hadith duas. Omit for Quranic duas (rendered from corpus via refs). */
  ar?: string
  tl?: string
  /** Quran refs when the dua is a Quran verse */
  refs?: string[]
  meaning?: L
  /** Human-readable source, e.g. "Sahih al-Bukhari 6306" or "Quran 2:201" */
  source: string
  when: L
  virtue?: L
  keywords?: string[]
  related?: string[]
  /** How many times, if specified in the source */
  count?: string
}

export interface AsmaName {
  n: number
  slug: string
  ar: string
  tl: string
  /** Bangla transliteration, e.g. আর-রহমান */
  tlBn: string
  en: string
  bn: string
  /** one-sentence explanation */
  expEn: string
  expBn: string
  /** Quran ref where the name (or the attribute, if attr=true) occurs */
  ref: string
  /** true when the exact name does not occur in the Quran and the ref shows the attribute */
  attr?: boolean
}
