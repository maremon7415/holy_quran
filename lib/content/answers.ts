/**
 * Answer-first snippets for AI / search engines. Pure and server-safe.
 * They only REARRANGE existing content (topic intros, corpus translations, tafsir text) — no new religious claims.
 */
import { refLabelL } from '@/lib/i18n/quran'
import type { Locale } from '@/lib/i18n/routes'

const strip = (html: string) =>
  html
    .replace(/<(h[1-6]|sup|script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

/** First sentence(s) of a text, up to `max` chars, never cutting mid-sentence unless one sentence is longer than `max`. */
export function firstSentences(text: string, max = 320, minLen = 60): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (!t) return ''
  const parts = t.split(/(?<=[.!?।])\s+(?=[^a-z])/u)
  let out = ''
  for (const p of parts) {
    if (!out) out = p
    else if ((out + ' ' + p).length <= max && out.length < minLen) out += ' ' + p
    else break
  }
  if (out.length > max) out = out.slice(0, max - 1).replace(/\s+\S*$/, '') + '…'
  return out
}

/** One-paragraph ayah summary taken from the opening of a tafsir excerpt. Empty when the tafsir is too short / missing. */
export function tafsirSummary(html: string | null | undefined, max = 360): string {
  if (!html) return ''
  const s = firstSentences(strip(html), max, 120)
  return s.length >= 40 ? s : ''
}

export interface QuickAnswerVerse { surah: number; n: number; en: string; bn: string }

/**
 * 2–3 sentence "Quick answer" for a topic page: key verses (cited inline), the first sentence of the
 * hand-written intro, and one short quotation from the corpus.
 */
export function topicQuickAnswer(locale: Locale, t: { en: string; bn: string; introEn: string; introBn: string; refs: string[] }, verses: QuickAnswerVerse[]): string {
  const refs = t.refs.slice(0, 3).map((r) => refLabelL(locale, r))
  const list = refs.length > 1 ? `${refs.slice(0, -1).join(', ')}${locale === 'bn' ? ' ও ' : ' and '}${refs[refs.length - 1]}` : refs[0]
  const quote = [...verses.slice(0, 3)].sort((a, b) => a.en.length - b.en.length)[0]
  const qRef = quote ? refLabelL(locale, `${quote.surah}:${quote.n}`) : ''
  if (locale === 'bn') {
    const intro = firstSentences(t.introBn, 260, 40)
    const q = quote ? ` যেমন ${qRef}: “${firstSentences(quote.bn, 200)}”` : ''
    return `কুরআন ${t.bn} সম্পর্কে কথা বলেছে ${list} সহ বিভিন্ন আয়াতে। ${intro}${q}`
  }
  const intro = firstSentences(t.introEn, 260, 40)
  const q = quote ? ` For example, ${qRef}: “${firstSentences(quote.en, 200)}”` : ''
  return `The Quran speaks about ${t.en} in verses such as ${list}. ${intro}${q}`
}
