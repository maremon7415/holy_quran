import Link from 'next/link'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { lt } from '@/lib/i18n/lt'
import { bnNum } from '@/lib/i18n/t'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { chapters, surahHref, surahNamesBn } from '@/lib/quran/chapters'

function Card({ id, dir, locale }: { id: number; dir: 'prev' | 'next'; locale?: Locale }) {
  const bn = locale === 'bn'
  const c = chapters[id - 1]
  const next = dir === 'next'
  return (
    <Link
      href={localeHref(locale ?? 'en', surahHref(id))}
      className={`card-soft lift group flex items-center gap-3 p-4 sm:p-5 ${next ? 'flex-row-reverse text-end' : ''}`}
      rel={dir}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-primary transition-transform duration-300 group-hover:scale-110">
        {next ? <ChevronRight className="size-5 rtl:rotate-180" /> : <ChevronLeft className="size-5 rtl:rotate-180" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{next ? lt(locale, { en: 'Next surah', bn: 'পরের সূরা', ar: 'السورة التالية' }) : lt(locale, { en: 'Previous surah', bn: 'আগের সূরা', ar: 'السورة السابقة' })}</span>
        <span className="mt-0.5 block truncate font-display text-lg font-semibold">{bn ? `${bnNum(c.id)}. ${surahNamesBn[c.id - 1]}` : `${c.id}. ${c.nameSimple}`}</span>
        <span className="block truncate text-xs text-muted-foreground">{bn ? <span lang="en">{c.nameSimple} · {c.meaning}</span> : <>{c.meaning} · <span className="font-bangla">{surahNamesBn[c.id - 1]}</span></>}</span>
      </span>
      <span className="hidden font-arabic text-2xl text-gold sm:block" lang="ar">{c.nameArabic}</span>
    </Link>
  )
}

export function SurahPager({ id, locale }: { id: number; locale?: Locale }) {
  return (
    <nav aria-label={locale === 'bn' ? 'সূরা নেভিগেশন' : 'Surah navigation'} className="reader-chrome mt-12 grid gap-3 sm:grid-cols-2">
      {id > 1 ? <Card id={id - 1} dir="prev" locale={locale} /> : <span className="hidden sm:block" />}
      {id < 114 && <Card id={id + 1} dir="next" locale={locale} />}
    </nav>
  )
}
