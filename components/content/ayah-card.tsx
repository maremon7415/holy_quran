import Link from 'next/link'
import { BookOpen, ArrowUpRight } from 'lucide-react'
import type { RVerse } from '@/lib/content/resolve'
import { chapters, readerHref, surahHref, toArabicDigits } from '@/lib/quran/chapters'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { refLabelL } from '@/lib/i18n/quran'
import { Reveal } from './reveal'
import { T, NotAr } from '@/lib/i18n/text'
import { RefLabel } from '@/lib/i18n/surah-name'

/** One ayah rendered from the corpus: Arabic + English + Bangla, with links to the reader and the ayah page. */
export function AyahCard({ verse, index = 0, locale = 'en' }: { verse: RVerse; index?: number; locale?: Locale }) {
  const c = chapters[verse.surah - 1]
  const bn = locale === 'bn'
  const trEn = <p key="en" data-tr="en" lang="en" className="text-[length:var(--trans-size,17px)] leading-relaxed text-foreground/90">{verse.en}</p>
  const trBn = <p key="bn" data-tr="bn" lang="bn" className="font-bangla text-[length:var(--trans-size,17px)] leading-relaxed text-foreground/90">{verse.bn}</p>
  return (
    <Reveal delay={Math.min(index * 0.04, 0.2)}>
      <article id={`ayah-${verse.surah}-${verse.n}`} className="card-soft group relative overflow-hidden rounded-3xl p-5 sm:p-7">
        <div aria-hidden className="bg-pattern pointer-events-none absolute -end-10 -top-10 size-44 rounded-full [mask-image:radial-gradient(circle,#000,transparent_70%)]" />
        <header className="relative mb-4 flex flex-wrap items-center justify-between gap-2">
          <Link href={localeHref(locale, surahHref(verse.surah, verse.n))} className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition hover:bg-primary hover:text-primary-foreground">
            <span className="font-arabic text-sm leading-none">{c.nameArabic}</span>
            <span>{bn ? refLabelL(locale, `${verse.surah}:${verse.n}`) : <RefLabel r={`${verse.surah}:${verse.n}`} />}</span>
          </Link>
          <Link href={localeHref(locale, readerHref(verse.surah, verse.n))} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-primary">
            <BookOpen className="size-3.5" /> {bn ? 'প্রসঙ্গসহ পড়ুন' : <T en="Read in context" ar="اقرأ في سياقها" />} <ArrowUpRight className="size-3 opacity-60 rtl:-scale-x-100" />
          </Link>
        </header>
        <p lang="ar" dir="rtl" className="quran-text relative text-right text-[length:var(--quran-size,30px)] leading-[2.2]">
          {verse.ar} <span className="ayah-marker">{toArabicDigits(verse.n)}</span>
        </p>
        {verse.tl && (
          <p data-tr="tl" className="relative mt-3 text-sm italic leading-relaxed text-muted-foreground">{verse.tl}</p>
        )}
        <div className="relative mt-4 space-y-3 border-t border-border/70 pt-4">
          {bn ? [trBn, trEn] : [trEn, trBn]}
        </div>
        <p className="relative mt-3 text-[11px] text-muted-foreground">{bn ? 'তাইসিরুল কুরআন · Saheeh International' : <>Saheeh International<NotAr> · তাইসিরুল কুরআন</NotAr></>}</p>
      </article>
    </Reveal>
  )
}
