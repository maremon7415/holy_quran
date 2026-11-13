import Link from 'next/link'
import type { Chapter } from '@/lib/quran/types'
import { surahNamesBn, toBanglaDigits } from '@/lib/quran/chapters'
import { sanitizeHtml } from '@/lib/reader/sanitize'
import { UiIcon } from '@/components/ui-icon'
import { Disclosure, PlayButton, SettingsButton } from './client-bits'

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-muted-foreground/50">/</span>}
          {it.href ? <Link href={it.href} className="transition-colors hover:text-primary">{it.name}</Link> : <span className="text-foreground/80" aria-current="page">{it.name}</span>}
        </span>
      ))}
    </nav>
  )
}

export function Chip({ icon, children, title, className = '' }: { icon?: string; children: React.ReactNode; title?: string; className?: string }) {
  return (
    <span title={title} className={`inline-flex items-center gap-1.5 rounded-full border bg-card/70 px-2.5 py-1.5 text-[11px] font-semibold text-foreground/80 backdrop-blur sm:px-3 sm:text-xs ${className}`}>
      {icon && <UiIcon name={icon} size={16} />}
      {children}
    </span>
  )
}

export function SurahHeader({ chapter: c, juzFrom, juzTo, info }: { chapter: Chapter; juzFrom: number; juzTo: number; info: { en: string | null; bn: string | null } }) {
  const makki = c.revelationPlace === 'makkah'
  const bnName = surahNamesBn[c.id - 1]
  const infoEn = sanitizeHtml(info.en)
  const infoBn = sanitizeHtml(info.bn)
  return (
    <header data-reader-hero className="relative overflow-hidden rounded-[2rem] border bg-card px-5 pb-8 pt-6 sm:rounded-[2.5rem] sm:px-10 sm:pb-10 sm:pt-8">
      <div className="bg-pattern pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="relative">
        <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Quran', href: '/quran' }, { name: `Surah ${c.nameSimple}` }]} />

        <div className="flex flex-col items-center text-center">
          <span className="star-badge size-12 font-display text-base font-bold text-gold">{c.id}</span>
          <p className="mt-4 pb-2 font-arabic text-[3.2rem] leading-[1.9] text-arabic sm:text-[4.4rem]" lang="ar" dir="rtl">
            <span className="text-gradient-gold">سُورَةُ</span> {c.nameArabic}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.6rem] sm:leading-tight">
            Surah {c.nameSimple}
          </h1>
          <p className="mt-1.5 text-base text-muted-foreground sm:text-lg">
            <span className="italic">{c.meaning}</span>
            <span className="mx-2 text-muted-foreground/40">•</span>
            <span className="font-bangla" lang="bn">সূরা {bnName}{c.nameBn ? ` (${c.nameBn})` : ''}</span>
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Chip icon={makki ? 'kaaba' : 'mosque'}>{makki ? 'Makki · Meccan' : 'Madani · Medinan'}</Chip>
            <Chip icon="quran">{c.versesCount} Ayahs <span className="hidden font-bangla text-muted-foreground sm:inline">· {toBanglaDigits(c.versesCount)} আয়াত</span></Chip>
            <Chip icon="juz">Juz {juzFrom === juzTo ? juzFrom : `${juzFrom}–${juzTo}`}</Chip>
            <Chip icon="read" title="Madani mushaf pages">Page {c.pages[0] === c.pages[1] ? c.pages[0] : `${c.pages[0]}–${c.pages[1]}`}</Chip>
            <Chip icon="clock" title="Order of revelation" className="hidden sm:inline-flex">Revealed #{c.revelationOrder}</Chip>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <PlayButton surah={c.id} />
            <SettingsButton />
          </div>
        </div>

        {(c.summaryEn || c.summaryBn || infoEn) && (
          <section aria-labelledby="about-surah" className="mx-auto mt-8 max-w-2xl rounded-3xl border bg-background/60 p-5 text-left backdrop-blur sm:p-6">
            <h2 id="about-surah" className="flex items-center gap-2 font-display text-lg font-semibold">
              <UiIcon name="info" size={22} /> About Surah {c.nameSimple}
            </h2>
            <Disclosure preview label={{ en: 'Read the full introduction', bn: 'পূর্ণ ভূমিকা পড়ুন' }} className="mt-2">
              {c.summaryEn && <p className="text-[15px] leading-relaxed text-foreground/85">{c.summaryEn}</p>}
              {c.summaryBn && <p lang="bn" className="mt-2 font-bangla text-[15px] leading-relaxed text-foreground/85">{c.summaryBn}</p>}
              {infoEn && <div className="reader-prose mt-4 border-t pt-4" lang="en" dangerouslySetInnerHTML={{ __html: infoEn }} />}
              {infoBn && <div className="reader-prose mt-4 border-t pt-4 font-bangla" lang="bn" dangerouslySetInnerHTML={{ __html: infoBn }} />}
            </Disclosure>
          </section>
        )}
      </div>
    </header>
  )
}
