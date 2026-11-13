'use client'
import type { ReactNode } from 'react'
import { toArabicDigits } from '@/lib/quran/chapters'
import type { HifzVerse } from '@/lib/hifz/verses'
import { cn } from '@/lib/utils'

/** Renders Arabic ayahs word by word. `renderWord` decides how each word looks. */
export function ArabicBlock({
  verses,
  renderWord,
  showMarkers = true,
  markerFor,
  className,
}: {
  verses: HifzVerse[]
  renderWord: (verse: HifzVerse, index: number, word: string) => ReactNode
  showMarkers?: boolean
  /** hide the marker of ayahs not yet reached */
  markerFor?: (verse: HifzVerse) => boolean
  className?: string
}) {
  return (
    <p
      dir="rtl"
      lang="ar"
      className={cn('quran-text text-center text-[length:clamp(26px,7vw,36px)] [line-height:2.3]', className)}
    >
      {verses.map((v) => (
        <span key={v.n}>
          {v.words.map((w, i) => (
            <span key={i}>{renderWord(v, i, w)} </span>
          ))}
          {showMarkers && (markerFor ? markerFor(v) : true) && <span className="ayah-marker">{toArabicDigits(v.n)}</span>}{' '}
        </span>
      ))}
    </p>
  )
}
