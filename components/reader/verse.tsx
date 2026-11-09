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
      className="ayah group/ayah scroll-mt-28 px-3 py-6 sm:px-6 sm:py-8"
      aria-label={`Ayah ${v.k}`}
    >
      <div className="ayah-head mb-3 flex items-center justify-between gap-3">
        <Link
          href={surahHref(surah, v.n)}
          className="ayah-num inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-full border bg-surface-2 px-2.5 text-xs font-bold tabular-nums text-muted-foreground transition-colors duration-300 hover:border-primary/40 hover:text-primary"
          title={`Open ayah ${v.k}`}
        >
          {v.k}
          {v.s === 1 && <span className="text-gold" title="Sajdah">۩</span>}
        </Link>
        <AyahActions k={v.k} surah={surah} ayah={v.n} />
      </div>

      <div className="ayah-ar">
        <p className="quran-text ar-plain text-right text-[length:var(--quran-size,34px)]" lang="ar" dir="rtl">
          {tokens.map((t, i) =>
            t.pos ? (
              <span key={i} className="w" data-w={t.pos}>{t.text}{' '}</span>
            ) : (
              <span key={i} className="waqf">{t.text}{' '}</span>
            )
          )}
          <span className="ayah-marker" aria-label={`Ayah ${v.n}`}>{toArabicDigits(v.n)}</span>
        </p>
        <div className="tj-slot" data-slot-tj={v.k} />
        <div className="wbw-slot" data-slot-wbw={v.k} />
      </div>

      <div className="ayah-tr mt-4 space-y-3.5">
        <p data-tr="tl" className="text-[length:calc(var(--trans-size,17px)*0.92)] italic leading-relaxed text-muted-foreground">{v.tl}</p>
        <div data-tr="en" data-ed="sahih">
          <p className="text-[length:var(--trans-size,17px)] leading-[1.75] text-foreground/90">{v.en}</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">Saheeh International</p>
        </div>
        <div data-tr="en" data-ed="haleem">
          <p className="text-[length:var(--trans-size,17px)] leading-[1.75] text-foreground/90">{v.enH}</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">Abdel Haleem</p>
        </div>
        <div data-tr="bn" lang="bn">
          <p className="font-bangla text-[length:calc(var(--trans-size,17px)*1.04)] leading-[1.85] text-foreground/90">{v.bn}</p>
          <p className="mt-1 font-bangla text-[11px] font-semibold tracking-wide text-muted-foreground/70">তাইসীরুল কুরআন</p>
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
