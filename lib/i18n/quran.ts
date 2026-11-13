import { chapters, surahNamesBn } from '@/lib/quran/chapters'
import { bnNum } from './t'
import type { Locale } from './routes'

/** "Al-Baqarah 2:255" (en) or "আল-বাকারা ২:২৫৫" (bn). Accepts "s:a" and "s:a-b". */
export function refLabelL(locale: Locale, ref: string) {
  const m = ref.match(/^(\d+):(\d+)(?:-(\d+))?$/)
  if (!m) return ref
  const c = chapters[+m[1] - 1]
  if (locale !== 'bn') return `${c.nameSimple} ${m[1]}:${m[2]}${m[3] ? `–${m[3]}` : ''}`
  return `${surahNamesBn[+m[1] - 1]} ${bnNum(m[1])}:${bnNum(m[2])}${m[3] ? `–${bnNum(m[3])}` : ''}`
}

/** Like refLabelL but also handles the Arabic UI: "البقرة 2:255". */
export function refLabelFor(lang: string, ref: string) {
  if (lang !== 'ar') return refLabelL(lang === 'bn' ? 'bn' : 'en', ref)
  const m = ref.match(/^(\d+):(\d+)(?:-(\d+))?$/)
  if (!m) return ref
  return `${chapters[+m[1] - 1].nameArabic} ${m[1]}:${m[2]}${m[3] ? `–${m[3]}` : ''}`
}

/** Surah display name for a locale. */
export const surahNameL = (locale: Locale, id: number) => (locale === 'bn' ? surahNamesBn[id - 1] : chapters[id - 1].nameSimple)
