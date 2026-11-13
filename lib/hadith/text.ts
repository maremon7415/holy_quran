// Pure text helpers for hadith display: spacing fixes, narrator extraction, short factual titles. Client-safe.

/** The corpus often glues sentences after a colon ("saying:Don't …"); restore the space (but not in "2:255"). */
export function cleanEnglish(s: string): string {
  return s.replace(/\s+/g, ' ').replace(/([A-Za-z)’'"”])\:(?=[^\s\d])/g, '$1: ').trim()
}
export const cleanBangla = (s: string) => s.replace(/\s+/g, ' ').replace(/\s*\[\d+\]\s*/g, ' ').trim()
export const cleanArabic = (s: string) => s.replace(/\s+/g, ' ').replace(/‏\.‏/g, '.').trim()

const stripHonorifics = (s: string) => s.replace(/\s*\((?:ra|r\.a\.?|may Allah be pleased with (?:him|her|them))\)/gi, '').replace(/\s*\(raa?\)/gi, '').trim()

/** "Narrated 'Umar bin Al-Khattab: …" → "'Umar bin Al-Khattab". Returns undefined when no narrator clause is recognised. */
export function extractNarrator(english: string): string | undefined {
  const t = cleanEnglish(english)
  const pats = [
    /^Narrated\s+([^:]{2,90}?):/i,
    /^It (?:was|is) narrated (?:from|on the authority of|by)\s+([^:]{2,90}?)(?:\s+(?:that|who|said)\b|:|,)/i,
    /^It (?:was|is) narrated that\s+([^:]{2,70}?)\s+(?:said|reported|related)\b/i,
    /^([A-Z'‘’`][^:.,"“]{1,60}?)\s+(?:narrated|reported|related|stated|told)\b/,
    /^([A-Z'‘’`][^:.,"“]{1,50}?)\s+said\b/,
  ]
  for (const re of pats) {
    const m = t.match(re)
    if (m) {
      const n = stripHonorifics(m[1]).replace(/\s+/g, ' ').replace(/^(?:from|by)\s+/i, '').trim()
      if (n && n.split(' ').length <= 10 && !/^(?:the|this|a|an|when|whoever|if|he|she|they|allah)\b/i.test(n)) return n
    }
  }
  return undefined
}

const SKIP_TITLE = /^(?:the same|same|as above|this hadith|a hadith like|another chain|a similar|similar|the above|like the|with (?:the|a) chain|it was narrated with|\(another)/i

/** A short factual title from the first sentence of the matn (after the isnad), or '' when none fits. */
export function deriveTitle(english: string | undefined, max = 78): string {
  if (!english) return ''
  const t = cleanEnglish(english)
  const head = t.slice(0, 300)
  const q = head.search(/["“]/)
  const colon = head.indexOf(':')
  let start = 0
  if (q !== -1 && q < 260) start = q + 1
  else if (colon !== -1 && colon < 200) start = colon + 1
  let body = t.slice(start).replace(/^[\s"“'‘(]+/, '')
  if (SKIP_TITLE.test(body)) return ''
  // first sentence with at least 4 words
  const parts = body.split(/(?<=[.!?])\s+(?=[A-Z"“'])/)
  let s = parts[0] ?? ''
  for (let i = 1; s.split(' ').length < 4 && i < parts.length; i++) s += ' ' + parts[i]
  s = s.replace(/[\s"”'’)\]]+$/, '').replace(/[.;:,!?]+$/, '').trim()
  if (s.split(' ').length < 3) return ''
  if (s.length > max) s = s.slice(0, max).replace(/\s+\S*$/, '').replace(/[.;:,!?\s]+$/, '') + '…'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Trim to a snippet at a word boundary. */
export function clipText(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  return (/\s/.test(t[max - 1]) ? cut : cut.replace(/\s+\S*$/, '')).trimEnd() + '…'
}
