/** Waqf / pause marks that Quran.com renders as separate space-delimited tokens. */
const PAUSE_ONLY = /^[ۖ-ࣰۭ-ࣿؕ-ؚ]+$/

export interface ArabicToken { text: string; /** 1-based word position (matches audio segments), null for pause marks */ pos: number | null; /** trailing waqf mark glued to the word */ waqf?: string }

/** Split Uthmani text into word tokens. Pause marks don't advance the position (they belong to the preceding word). */
export function tokenizeArabic(ar: string): ArabicToken[] {
  const out: ArabicToken[] = []
  let pos = 0
  for (const raw of ar.split(/\s+/)) {
    if (!raw) continue
    if (PAUSE_ONLY.test(raw) && out.length) out[out.length - 1].waqf = raw // keep waqf glued to its word
    else if (PAUSE_ONLY.test(raw)) out.push({ text: raw, pos: null })
    else out.push({ text: raw, pos: ++pos })
  }
  return out
}

/** Same as tokenizeArabic, but for Quran.com tajweed HTML. Returns null if tags cross word boundaries. */
export function tokenizeTajweedHtml(html: string): ArabicToken[] | null {
  const clean = html.replace(/<span class=end>[^<]*<\/span>/g, '').trim()
  const parts = clean.split(/\s+/).filter(Boolean)
  const out: ArabicToken[] = []
  let pos = 0
  for (const p of parts) {
    const opens = (p.match(/<tajweed\b/g) || []).length
    const closes = (p.match(/<\/tajweed>/g) || []).length
    if (opens !== closes) return null
    const plain = p.replace(/<[^>]+>/g, '')
    if (PAUSE_ONLY.test(plain) && out.length) out[out.length - 1].waqf = p
    else if (PAUSE_ONLY.test(plain)) out.push({ text: p, pos: null })
    else out.push({ text: p, pos: ++pos })
  }
  return out
}
