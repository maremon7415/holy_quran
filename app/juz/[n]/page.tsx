import '../../reader.css'
import { Fragment } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { chapters, juzHref, surahHref, surahNamesBn, toArabicDigits, toBanglaDigits } from '@/lib/quran/chapters'
import { getJuzs, getJuzVerses } from '@/lib/quran/data'
import { absoluteUrl, site } from '@/lib/site'
import { getJuzName } from '@/lib/reader/juz'
import { breadcrumbLd, publisherLd, quranBookLd } from '@/lib/reader/seo'
import { JsonLd } from '@/components/seo/json-ld'
import { UiIcon } from '@/components/ui-icon'
import { Breadcrumbs, Chip } from '@/components/reader/surah-header'
import { Bismillah, VerseBlock, needsBismillah } from '@/components/reader/verse'
import { ReaderChrome } from '@/components/reader/reader-chrome'
import { ReaderPrefsInline } from '@/components/reader/prefs-script'
import { TranslationCredits } from '@/components/reader/translation-credits'
import { SettingsButton } from '@/components/reader/client-bits'
import { TajweedNotice } from '@/components/reader/side-rails'

type Props = { params: Promise<{ n: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return Array.from({ length: 30 }, (_, i) => ({ n: String(i + 1) }))
}

const parse = (n: string) => (/^\d{1,2}$/.test(n) && +n >= 1 && +n <= 30 ? +n : null)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = parse((await params).n)
  if (!n) return {}
  const name = getJuzName(n)
  const j = (await getJuzs()).find((x) => x.juz === n)!
  const surahs = Object.keys(j.map).map((s) => chapters[+s - 1].nameSimple)
  const title = `Juz ${n} (Para ${n}) — ${name.tl} (${name.ar}) | পারা ${toBanglaDigits(n)}`
  const description = `Read Juz ${n} (Para ${n}, “${name.tl}”) of the Holy Quran — ${j.count} ayahs from ${surahs.join(', ')}. Arabic text with English & Bangla translation, transliteration, tajweed, word-by-word and audio.`
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: juzHref(n) },
    openGraph: { type: 'article', title, description, url: juzHref(n), siteName: site.name },
  }
}

export default async function JuzPage({ params }: Props) {
  const n = parse((await params).n)
  if (!n) notFound()
  const [verses, juzs] = await Promise.all([getJuzVerses(n), getJuzs()])
  const j = juzs.find((x) => x.juz === n)
  if (!j || !verses.length) notFound()
  const name = getJuzName(n)
  const chapterIds = Object.keys(j.map).map(Number)
  const first = verses[0]
  const last = verses[verses.length - 1]

  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: `Juz ${n} — ${name.tl}`,
      alternateName: [name.ar, `Para ${n}`, `পারা ${toBanglaDigits(n)}`],
      url: absoluteUrl(juzHref(n)),
      position: n,
      inLanguage: ['ar', 'en', 'bn'],
      isPartOf: quranBookLd(),
      publisher: publisherLd(),
      hasPart: chapterIds.map((s) => ({ '@type': 'Chapter', name: `Surah ${chapters[s - 1].nameSimple}`, url: absoluteUrl(surahHref(s)) })),
    },
    breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Quran', path: '/quran' }, { name: `Juz ${n}`, path: juzHref(n) }]),
  ]

  return (
    <div className="mx-auto max-w-[860px] px-3 pb-36 pt-3 sm:px-6 sm:pt-6 lg:pb-20">
      <JsonLd data={ld} />
      <ReaderPrefsInline />
      <header data-reader-hero className="relative overflow-hidden rounded-[2rem] border bg-card px-5 pb-8 pt-6 text-center sm:rounded-[2.5rem] sm:px-10 sm:pt-8">
        <div className="bg-pattern pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]" />
        <div className="relative">
          <div className="text-left"><Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Quran', href: '/quran' }, { name: `Juz ${n}` }]} /></div>
          <span className="star-badge mx-auto size-12 font-display text-base font-bold text-gold">{n}</span>
          <p className="mt-4 pb-1 font-arabic text-[3rem] leading-[1.9] text-arabic sm:text-[4rem]" lang="ar" dir="rtl">
            <span className="text-gradient-gold">الجُزْءُ {toArabicDigits(n)}</span> · {name.ar}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.6rem] sm:leading-tight">Juz {n} <span className="text-muted-foreground">· {name.tl}</span></h1>
          <p className="mt-1.5 text-muted-foreground">
            Para {n} <span className="mx-2 text-muted-foreground/40">•</span> <span className="font-bangla" lang="bn">পারা {toBanglaDigits(n)} · {name.bn}</span>
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Chip icon="quran">{j.count} Ayahs</Chip>
            <Chip icon="read">{first.k} → {last.k}</Chip>
            <Chip icon="read">Page {first.p}–{last.p}</Chip>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {chapterIds.map((s) => (
              <Link key={s} href={surahHref(s)} className="rounded-full border bg-background/60 px-3 py-1.5 text-xs font-semibold transition hover:border-primary/40 hover:text-primary">
                {s}. {chapters[s - 1].nameSimple} <span className="text-muted-foreground">{j.map[String(s)]}</span>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex justify-center"><SettingsButton /></div>
        </div>
      </header>
      <TajweedNotice />
      <TranslationCredits className="mt-6" />

      <div className="verse-list mt-2">
        {verses.map((v, i) => {
          const startsSurah = i === 0 || v.surah !== verses[i - 1].surah
          const c = chapters[v.surah - 1]
          return (
            <Fragment key={v.k}>
              {startsSurah && (
                <div className="surah-sep my-6 first:mt-0">
                  <Link href={surahHref(v.surah)} className="group mx-auto flex max-w-xl items-center gap-4 rounded-3xl border bg-surface-2 px-5 py-4 transition hover:border-primary/40">
                    <span className="star-badge size-10 shrink-0 text-sm font-bold text-gold">{v.surah}</span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block font-display text-lg font-semibold">Surah {c.nameSimple}</span>
                      <span className="surah-sep-trans block text-xs text-muted-foreground">{c.meaning} · <span className="font-bangla">{surahNamesBn[v.surah - 1]}</span> · {v.n > 1 ? `from ayah ${v.n}` : `${c.versesCount} ayahs`}</span>
                    </span>
                    <span className="font-arabic text-2xl text-gold" lang="ar">{c.nameArabic}</span>
                  </Link>
                  {v.n === 1 && needsBismillah(v.surah) && <Bismillah />}
                </div>
              )}
              {!startsSurah && <div className="ayah-divider" aria-hidden />}
              <VerseBlock verse={v} surah={v.surah} scoped />
            </Fragment>
          )
        })}
      </div>

      <nav aria-label="Juz navigation" className="reader-chrome mt-12 grid grid-cols-2 gap-3">
        {n > 1 ? (
          <Link href={juzHref(n - 1)} className="card-soft lift flex items-center gap-3 p-4">
            <ChevronLeft className="size-5 text-primary" />
            <span><span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Previous</span><span className="font-display text-lg font-semibold">Juz {n - 1}</span></span>
          </Link>
        ) : <span />}
        {n < 30 ? (
          <Link href={juzHref(n + 1)} className="card-soft lift flex items-center justify-end gap-3 p-4 text-right">
            <span><span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Next</span><span className="font-display text-lg font-semibold">Juz {n + 1}</span></span>
            <ChevronRight className="size-5 text-primary" />
          </Link>
        ) : <span />}
      </nav>
      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"><UiIcon name="juz" size={16} /> {verses.length} ayahs · {chapterIds.length} {chapterIds.length > 1 ? 'surahs' : 'surah'}</p>

      <ReaderChrome chapterIds={chapterIds} title={`Juz ${n} · ${name.tl}`} titleAr={name.ar} />
    </div>
  )
}
