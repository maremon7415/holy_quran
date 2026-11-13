import Link from 'next/link'
import type { Verse } from '@/lib/quran/types'
import { surahHref, toArabicDigits } from '@/lib/quran/chapters'
import { tokenizeArabic } from '@/lib/reader/words'
import { AyahActions } from './ayah-actions'

/**
 * One ayah — server component. Markup stays deliberately light: all interactivity
 * (word sync, current-ayah highlight, tajweed / word-by-word layers) is applied by
 * single page-level client controllers via data attributes and portals.
 */
export function VerseBlock({ verse, surah, scoped = false }: { verse: Verse; surah: number; /** juz pages hold several surahs → ids like ayah-2-255 */ scoped?: boolean }) {
  const v = verse
  const tokens = tokenizeArabic(v.ar)
  return (
    <article
      id={scoped ? `ayah-${surah}-${v.n}` : `ayah-${v.n}`}
      data-ayah={v.k}
      data-j={v.j}
      data-p={v.p}
      className="ayah group/ayah"
      aria-label={`Ayah ${v.k}`}
    >
      <div className="ayah-head">
        <Link
          href={surahHref(surah, v.n)}
          className="ayah-num"
          title={`Open ayah ${v.k}`}
        >
          {v.k}
          {v.s === 1 && <span className="text-gold" title="Sajdah">۩</span>}
        </Link>
        <AyahActions k={v.k} surah={surah} ayah={v.n} />
      </div>

      <div className="ayah-ar">
        <p className="quran-text ar-plain" lang="ar" dir="rtl">
          {tokens.map((t, i) =>
            t.pos ? (
              <span key={i} className="w" data-w={t.pos}>{t.text}{t.waqf && <>{'\u00a0'}<span className="waqf">{t.waqf}</span></>}{i === tokens.length - 1 ? '\u00a0' : ' '}</span>
            ) : (
              <span key={i} className="waqf">{t.text}{i === tokens.length - 1 ? '\u00a0' : ' '}</span>
            )
          )}
          <span className={v.n >= 100 ? 'ayah-marker ayah-marker-3' : 'ayah-marker'} aria-label={`Ayah ${v.n}`}>{toArabicDigits(v.n)}</span>
        </p>
        <div className="tj-slot" data-slot-tj={v.k} />
        <div className="wbw-slot" data-slot-wbw={v.k} />
      </div>

      <div className="ayah-tr">
        <p data-tr="tl" className="tr-tl">{v.tl}</p>
        <div data-tr="en" data-ed="sahih">
          <p className="tr-en">{v.en}</p>
        </div>
        <div data-tr="en" data-ed="haleem">
          <p className="tr-en">{v.enH}</p>
        </div>
        <div data-tr="bn" lang="bn">
          <p className="tr-bn">{v.bn}</p>
        </div>
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
