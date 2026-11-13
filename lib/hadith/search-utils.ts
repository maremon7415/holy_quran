// Query parsing + matching helpers for hadith search (client/server safe, pure).
import { isArabic, isBangla, normalizeArabic } from '@/lib/quran/normalize'
import { collectionMeta, type CollectionSlug, type HadithLang } from './collections'
import { collectionFromName } from './source'

const EN_STOP = new Set(['hadith', 'hadiths', 'hadis', 'about', 'on', 'the', 'of', 'a', 'an', 'in', 'for', 'and', 'to', 'is', 'are', 'what', 'does', 'do', 'say', 'says', 'regarding', 'concerning', 'from', 'with', 'by', 'at', 'how', 'islam', 'prophet'])
const BN_STOP = new Set(['হাদিস', 'হাদীস', 'হাদিসে', 'সম্পর্কে', 'বিষয়ে', 'ও', 'এবং', 'ও', 'কি', 'কী', 'নিয়ে'])

const BN_DIGITS = '০১২৩৪৫৬৭৮৯'
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'
/** Bangla / Arabic-Indic digits → ASCII. */
export const asciiDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d))).replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)))

export const detectLang = (q: string): HadithLang => (isArabic(q) ? 'ar' : isBangla(q) ? 'bn' : 'en')

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Bangla vowel signs often vary (হাদিস / হাদীস): let ি match ী and ু match ূ. */
const bnPattern = (t: string) => esc(t.normalize('NFC').replace(/[\u200c\u200d]/g, ''))
  .replace(/[িী]/g, '[িী]')
  .replace(/[ুূ]/g, '[ুূ]')
  // য় is stored either as য + nukta or precomposed, and is often doubled in spelling (নিয়ত / নিয়্যত / নিয়্যাত)
  .replace(new RegExp('য'+String.fromCharCode(0x9bc), 'g'), '(?:য'+String.fromCharCode(0x9bc)+'|'+String.fromCharCode(0x9df)+')(?:'+String.fromCharCode(0x9cd)+'য)?া?')

export interface Query {
  raw: string
  lang: HadithLang
  /** Significant tokens (stop words removed unless nothing else is left). */
  tokens: string[]
  /** Whole normalised phrase (for the phrase bonus). */
  phrase: string
}

export function parseQuery(raw: string, lang: HadithLang = detectLang(raw)): Query {
  const cleaned = raw.replace(/[\u200c\u200d]/g, '').trim().slice(0, 200)
  let words: string[]
  let phrase: string
  if (lang === 'ar') {
    phrase = normalizeArabic(cleaned).replace(/[^؀-ۿ0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
    words = phrase.split(' ').filter(Boolean)
  } else if (lang === 'bn') {
    phrase = cleaned.normalize('NFC').replace(/[^ঀ-৿0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
    words = phrase.split(' ').filter(Boolean)
  } else {
    phrase = cleaned.toLowerCase().replace(/[’‘`´]/g, "'").replace(/[^a-z0-9'\s-]/g, ' ').replace(/\s+/g, ' ').trim()
    words = phrase.split(' ').filter(Boolean)
  }
  const stop = lang === 'en' ? EN_STOP : lang === 'bn' ? BN_STOP : new Set<string>()
  const kept = words.filter((w) => !stop.has(w))
  return { raw: cleaned, lang, tokens: (kept.length ? kept : words).slice(0, 8), phrase }
}

/** Regex source for one token (English: word-prefix with light stemming; Bangla/Arabic: substring). */
export function tokenSource(token: string, lang: HadithLang): string {
  if (lang === 'en') {
    const stem = token.length >= 6 ? token.slice(0, token.length - 2) : token.length >= 5 && /[ys]$/.test(token) ? token.slice(0, -1) : token
    return `\\b${esc(stem)}`
  }
  if (lang === 'bn') return bnPattern(token)
  return esc(token)
}

export const tokenRegex = (token: string, lang: HadithLang, flags = 'i') => new RegExp(tokenSource(token, lang), flags)

/** Split a snippet into plain / highlighted parts for rendering. */
export function highlightParts(text: string, tokens: string[], lang: HadithLang): { t: string; hit: boolean }[] {
  if (!tokens.length || !text) return [{ t: text, hit: false }]
  const re = new RegExp(`(${tokens.map((t) => tokenSource(t, lang)).join('|')})`, 'gi')
  const parts: { t: string; hit: boolean }[] = []
  let last = 0
  for (const m of text.matchAll(re)) {
    if (m.index === undefined || !m[0]) continue
    // extend a word-prefix hit to the end of the word for readability
    let end = m.index + m[0].length
    if (lang === 'en') while (end < text.length && /[A-Za-z'’]/.test(text[end])) end++
    if (m.index < last) continue
    if (m.index > last) parts.push({ t: text.slice(last, m.index), hit: false })
    parts.push({ t: text.slice(m.index, end), hit: true })
    last = end
  }
  if (last < text.length) parts.push({ t: text.slice(last), hit: false })
  return parts
}

// ── "Sahih Bukhari hadith 1", "বুখারী হাদিস ১", "bukhari:7", "صحيح مسلم 2564" → a direct hadith reference ──
const BN_NAMES: [RegExp, CollectionSlug][] = [
  [/বুখারী|বুখারি|বোখারী|বোখারি/, 'bukhari'],
  [/মুসলিম/, 'muslim'],
  [/আবু\s*দাউদ|আবূ\s*দাউদ|আবু\s*দাঊদ/, 'abudawud'],
  [/তিরমিজি|তিরমিযী|তিরমিযি|তিরমিজী|তিরমিধি/, 'tirmidhi'],
  [/নাসায়ী|নাসাঈ|নাসাই|নাসায়ি/, 'nasai'],
  [/ইবনে\s*মাজাহ|ইবনু\s*মাজাহ|ইবনে\s*মাজা|ইবন\s*মাজাহ/, 'ibnmajah'],
  [/মুয়াত্তা|মোয়াত্তা|মালিক|মালেক/, 'malik'],
  [/নববী|নবভী|চল্লিশ\s*হাদিস/, 'nawawi40'],
  [/কুদসি|কুদসী|কুদসিয়া/, 'qudsi40'],
]
const AR_NAMES: [RegExp, CollectionSlug][] = [
  [/البخاري|بخاري/, 'bukhari'],
  [/مسلم/, 'muslim'],
  [/ابو\s*داود|أبو\s*داود|ابي\s*داود|أبي\s*داود/, 'abudawud'],
  [/الترمذي|ترمذي/, 'tirmidhi'],
  [/النسائي|نسائي/, 'nasai'],
  [/ابن\s*ماجه|ابن\s*ماجة/, 'ibnmajah'],
  [/موطا|موطأ|مالك/, 'malik'],
  [/النووي|نووية|الاربعين/, 'nawawi40'],
  [/قدسي|القدسية/, 'qudsi40'],
]

const EN_FILLER = new Set(['hadith', 'hadis', 'hadeeth', 'no', 'no.', 'number', 'num', 'sahih', 'sahih.', 'sunan', 'jami', 'jami`', "jami'", 'al', 'an', 'at', 'as', 'of', 'in', 'book', 'imam', 'the'])
const BN_FILLER = /হাদিস|হাদীস|শরীফ|সহীহ|সহিহ|সুনানে|সুনান|জামে|ইমাম|নং|নম্বর|নাম্বার|এর|-/g
const AR_FILLER = /صحيح|حديث|رقم|سنن|جامع|كتاب|ال(?=\s)|\bال\b/g

/** Longest accepted search / reference query; every entry point (page, API, MCP, palette) is cut to this. */
export const MAX_HADITH_QUERY = 200

const isDigit = (c: number) => c >= 48 && c <= 57
/**
 * The last run of ASCII digits (its last ≤ 5 digits), found with one backward scan — same result as
 * `/(\d{1,5})(?!.*\d)/` without its quadratic backtracking on inputs like "1 1 1 1 …".
 */
export function lastDigitRun(s: string): { digits: string; index: number } | null {
  let end = s.length
  while (end > 0 && !isDigit(s.charCodeAt(end - 1))) end--
  if (end === 0) return null
  let start = end
  while (start > 0 && end - start < 5 && isDigit(s.charCodeAt(start - 1))) start--
  return { digits: s.slice(start, end), index: start }
}

/**
 * "Sahih Bukhari hadith 1", "বুখারী হাদিস ১", "bukhari:7", "صحيح مسلم 2564" → a direct hadith reference.
 * Deliberately strict: after removing filler words the rest must be exactly a collection name, so that
 * "muslim women 100" or "hadith about prayer 5" stay ordinary searches.
 */
export function parseHadithReference(q: string): { collection: CollectionSlug; number: number } | null {
  const s = asciiDigits(q.slice(0, MAX_HADITH_QUERY)).trim().replace(/\s+/g, ' ')
  const nm = lastDigitRun(s)
  if (!nm) return null
  const number = Number(nm.digits)
  const rest = (s.slice(0, nm.index) + ' ' + s.slice(nm.index + nm.digits.length)).replace(/[:#/.,\-–—()]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!rest) return null
  let slug: CollectionSlug | null = null
  if (/[\u0980-\u09FF]/.test(rest)) {
    for (const [re, c] of BN_NAMES) {
      const m = rest.match(re)
      if (m && !rest.replace(re, ' ').replace(BN_FILLER, ' ').trim()) { slug = c; break }
    }
  } else if (/[\u0600-\u06FF]/.test(rest)) {
    for (const [re, c] of AR_NAMES) {
      const m = rest.match(re)
      if (m && !rest.replace(re, ' ').replace(AR_FILLER, ' ').replace(/\s+/g, '').trim()) { slug = c; break }
    }
  } else {
    const low = rest.toLowerCase().replace(/[’‘`´]/g, "'")
    const words = low.split(' ').filter((w) => !EN_FILLER.has(w))
    const name = words.join(' ')
    if (!words.length) return null
    slug = collectionFromName(name) ?? (/^(?:an-?)?nawawi(?:'?s)?(?: forty| 40)?$/.test(name) ? 'nawawi40' : /^(?:forty )?qudsi$|^hadith qudsi$/.test(name) ? 'qudsi40' : /^abu ?dawu?d$|^abi ?dawu?d$/.test(name) ? 'abudawud' : /^ibn ?maja?h?$/.test(name) ? 'ibnmajah' : null)
  }
  const meta = slug && collectionMeta(slug)
  if (!slug || !meta || number < 1 || number > meta.max) return null
  return { collection: slug, number }
}
