import type { ReactNode } from 'react'
import type { Verse } from '@/lib/quran/types'
import { surahHref, toArabicDigits } from '@/lib/quran/chapters'
import { tokenizeArabic } from '@/lib/reader/words'

/**
 * Arabic text as plain text runs (+ gold waqf marks). Word spans (`.w[data-w]`) for the
 * recited-word highlight are created on demand, only for the ayah being recited
 * (lib/reader/dom.ts → wrapWords), which keeps 286-ayah pages light.
 */
export function arabicRuns(ar: string): ReactNode[] {
  const tokens = tokenizeArabic(ar)
  const out: ReactNode[] = []
  let buf = ''
  tokens.forEach((t, i) => {
    const last = i === tokens.length - 1
    if (t.pos) {
      buf += t.text
      if (t.waqf) {
        out.push(buf + ' ')
        out.push(<span key={i} className="waqf">{t.waqf}</span>)
        buf = ''
      }
      buf += last ? ' ' : ' '
    } else {
      if (buf) out.push(buf)
      out.push(<span key={i} className="waqf">{t.text}</span>)
      buf = last ? ' ' : ' '
    }
  })
  if (buf) out.push(buf)
  return out
}

export const AyahMarker = ({ n }: { n: number }) => (
  <span className={n >= 100 ? 'ayah-marker ayah-marker-3' : 'ayah-marker'} aria-label={`Ayah ${n}`}>{toArabicDigits(n)}</span>
)

/**
 * One ayah — server component. Markup stays deliberately minimal: the per-ayah toolbar,
 * word spans, tajweed / word-by-word / extra-translation layers are all added on the
 * client by page-level controllers (reader-controller.tsx, verse-enhancer.tsx).
 *
 * `full` (single-ayah pages) also renders Abdel Haleem + Latin transliteration; on surah / juz
 * pages those are fetched on demand when the reader turns them on.
 */
export function VerseBlock({ verse, surah, scoped = false, bt, full = false }: {
  verse: Verse
  surah: number
  /** juz pages hold several surahs → ids like ayah-2-255 */
  scoped?: boolean
  /** Bangla uccharon (pronunciation) */
  bt?: string
  full?: boolean
}) {
  const v = verse
  return (
    <article id={scoped ? `ayah-${surah}-${v.n}` : `ayah-${v.n}`} data-ayah={v.k} data-j={v.j} data-p={v.p} className="ayah group/ayah">
      <div className="ayah-head">
        <a href={surahHref(surah, v.n)} className="ayah-num" title={`Open ayah ${v.k}`}>
          {v.k}
          {v.s === 1 && <span className="text-gold" title="Sajdah">۩</span>}
        </a>
      </div>
      <div className="ayah-ar">
        <p className="quran-text ar-plain" lang="ar" dir="rtl">
          {arabicRuns(v.ar)}
          <AyahMarker n={v.n} />
        </p>
      </div>
      <div className="ayah-tr">
        {bt && <p data-tr="bt" lang="bn" className="tr-bt">{bt}</p>}
        {full && <p data-tr="tl" className="tr-tl">{v.tl}</p>}
        <p data-tr="en" data-ed="sahih" className="tr-en">{v.en}</p>
        {full && <p data-tr="en" data-ed="haleem" className="tr-en">{v.enH}</p>}
        <p data-tr="bn" lang="bn" className="tr-bn">{v.bn}</p>
      </div>
    </article>
  )
}

/** Bismillah header shown before every surah except 1 (where it is ayah 1) and 9 (none). */
export function Bismillah({ className = '' }: { className?: string }) {
  return (
    <div className={`relative mx-auto flex max-w-xl flex-col items-center py-6 ${className}`}>
      <p className="quran-text text-center text-[length:calc(var(--quran-size,34px)*1.05)] leading-[1.9]" lang="ar" dir="rtl">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
      </p>
      <p className="mt-1 text-center text-xs tracking-wide text-muted-foreground hide-in-mushaf">
        In the name of Allah, the Entirely Merciful, the Especially Merciful
      </p>
    </div>
  )
}

export const needsBismillah = (surah: number) => surah !== 1 && surah !== 9
