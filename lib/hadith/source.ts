// Parse dua / citation source strings such as "Sahih al-Bukhari 6306; Sahih Muslim 595; Quran 2:255"
// into parts, marking the ones that point at a hadith we serve. Client-safe.
import { collectionMeta, resolveCollectionSlug, type CollectionSlug } from './collections'

export interface SourcePart {
  /** The original text of this segment ("Sahih al-Bukhari 6306"). */
  text: string
  hadith?: { collection: CollectionSlug; number: number }
}

const NAMES: Record<string, CollectionSlug> = {
  'sahih al-bukhari': 'bukhari', 'sahih bukhari': 'bukhari', 'sahih al bukhari': 'bukhari', 'al-bukhari': 'bukhari', bukhari: 'bukhari',
  'sahih muslim': 'muslim', muslim: 'muslim',
  'sunan abi dawud': 'abudawud', 'sunan abu dawud': 'abudawud', 'sunan abi daud': 'abudawud', 'abu dawud': 'abudawud', 'abi dawud': 'abudawud',
  'jami at-tirmidhi': 'tirmidhi', "jami' at-tirmidhi": 'tirmidhi', 'jami at tirmidhi': 'tirmidhi', 'sunan at-tirmidhi': 'tirmidhi', tirmidhi: 'tirmidhi',
  "sunan an-nasa'i": 'nasai', 'sunan an-nasai': 'nasai', "sunan al-nasa'i": 'nasai', "nasa'i": 'nasai', nasai: 'nasai',
  'sunan ibn majah': 'ibnmajah', 'ibn majah': 'ibnmajah', 'sunan ibn maja': 'ibnmajah',
  'muwatta malik': 'malik', 'muwatta imam malik': 'malik', "al-muwatta'": 'malik', muwatta: 'malik',
  "an-nawawi's forty hadith": 'nawawi40', "nawawi's forty hadith": 'nawawi40', 'forty hadith of an-nawawi': 'nawawi40', 'forty hadith nawawi': 'nawawi40', 'forty hadith an-nawawi': 'nawawi40',
  'forty hadith qudsi': 'qudsi40', 'hadith qudsi': 'qudsi40',
}

const norm = (s: string) => s.toLowerCase().replace(/[’‘`´]/g, "'").replace(/\s+/g, ' ').trim()

/** Map a citation name ("Sahih Muslim") to a collection slug. */
export function collectionFromName(name: string): CollectionSlug | null {
  const n = norm(name)
  return (Object.hasOwn(NAMES, n) ? NAMES[n] : undefined) ?? resolveCollectionSlug(n.replace(/\s+/g, ''))?.slug ?? null
}

/** Split a source string on ";" and mark segments that cite a servable hadith number. */
export function parseHadithSource(source: string): SourcePart[] {
  return source.split(';').map((raw) => raw.trim()).filter(Boolean).map((text) => {
    const m = text.match(/^(.*?)\s+(\d{1,5})\s*[a-z]?$/i)
    if (!m) return { text }
    const slug = collectionFromName(m[1])
    const n = Number(m[2])
    const meta = slug && collectionMeta(slug)
    if (!slug || !meta || n < 1 || n > meta.max) return { text }
    return { text, hadith: { collection: slug, number: n } }
  })
}
