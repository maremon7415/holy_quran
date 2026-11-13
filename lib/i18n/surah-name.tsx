'use client'
import { chapters, surahNamesBn } from '@/lib/quran/chapters'
import { useLang } from '@/lib/lang'
import { refLabelFor } from '@/lib/i18n/quran'

/** Surah transliterated name in the UI language: Al-Baqarah · আল-বাকারা · البقرة. */
export function surahNameFor(lang: string, id: number) {
  const c = chapters[id - 1]
  return lang === 'bn' ? surahNamesBn[id - 1] || c.nameSimple : lang === 'ar' ? c.nameArabic : c.nameSimple
}

export function SurahName({ id }: { id: number }) {
  return <>{surahNameFor(useLang(), id)}</>
}

/** "Al-Baqarah 2:255" in the UI language. */
export function RefLabel({ r }: { r: string }) {
  return <>{refLabelFor(useLang(), r)}</>
}

/** English meaning of the surah name; hidden in Arabic UI (the Arabic name already carries it). */
export function SurahMeaning({ id }: { id: number }) {
  const lang = useLang()
  if (lang === 'ar') return null
  return <>{chapters[id - 1].meaning}</>
}
