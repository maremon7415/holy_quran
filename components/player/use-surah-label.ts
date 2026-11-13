'use client'
import { chapters, surahNamesBn } from '@/lib/quran/chapters'
import { useLang } from '@/lib/lang'

/** Localised surah title helper for the player UI. */
export function useSurahLabel() {
  const lang = useLang()
  return (id: number) => {
    const c = chapters[id - 1]
    return lang === 'bn' ? surahNamesBn[id - 1] || c.nameSimple : lang === 'ar' ? c.nameArabic : c.nameSimple
  }
}

export const fmtTime = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}
