import '@/app/reader.css'
import { Fragment } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { chapters, juzHref, surahHref, surahNamesBn, toArabicDigits, toBanglaDigits } from '@/lib/quran/chapters'
import { getJuzs, getJuzVerses, getUccharon } from '@/lib/quran/data'
import { absoluteUrl, site } from '@/lib/site'
import { getJuzName } from '@/lib/reader/juz'
import { breadcrumbLd } from '@/lib/reader/seo'
import { JsonLd } from '@/components/seo/json-ld'
import { markdownAlternate } from '@/lib/content/seo'
import { publisherRef, quranBookRef } from '@/lib/seo/structured'
import { UiIcon } from '@/components/ui-icon'
import { Breadcrumbs, Chip } from '@/components/reader/surah-header'
import { Bismillah, VerseBlock, needsBismillah } from '@/components/reader/verse'
import { ReaderChrome } from '@/components/reader/reader-chrome'
import { TranslationCredits } from '@/components/reader/translation-credits'
import { SettingsButton } from '@/components/reader/client-bits'
import { TajweedNotice } from '@/components/reader/side-rails'
import { alternatesFor, localeHref, type Locale } from '@/lib/i18n/routes'
import { lt } from '@/lib/i18n/lt'
import { NotAr } from '@/lib/i18n/text'
import { SurahName } from '@/lib/i18n/surah-name'
import { Labelled } from '@/lib/i18n/labelled'
import { bnNum } from '@/lib/i18n/t'

export type JuzProps = { params: Promise<{ n: string }> }
type Props = JuzProps

export function juzParams() {
  return Array.from({ length: 30 }, (_, i) => ({ n: String(i + 1) }))
}

const parse = (n: string) => (/^\d{1,2}$/.test(n) && +n >= 1 && +n <= 30 ? +n : null)

export async function juzMeta(locale: Locale, { params }: Props): Promise<Metadata> {
  const n = parse((await params).n)
  if (!n) return {}
  const name = getJuzName(n)
  const j = (await getJuzs()).find((x) => x.juz === n)!
  const surahs = Object.keys(j.map).map((s) => chapters[+s - 1].nameSimple)
  const title = `Juz ${n} (Para ${n}) — ${name.tl} (${name.ar}) | পারা ${toBanglaDigits(n)}`
  const description = `Read Juz ${n} (Para ${n}, “${name.tl}”) of the Holy Quran — ${j.count} ayahs from ${surahs.join(', ')}. Arabic text with English & Bangla translation, transliteration, tajweed, word-by-word and audio.`
  if (locale === 'bn') {
    const bnTitle = `পারা ${toBanglaDigits(n)} (${name.bn}) — বাংলা উচ্চারণ ও অর্থসহ | Juz ${n}`
    const bnDesc = `পবিত্র কুরআনের ${toBanglaDigits(n)} নম্বর পারা (${name.bn}, ${name.ar}) — ${Object.keys(j.map).map((s) => surahNamesBn[+s - 1]).join(', ')} থেকে ${toBanglaDigits(j.count)}টি আয়াত। আরবি, বাংলা উচ্চারণ, বাংলা ও ইংরেজি অনুবাদ, তাজবীদ ও তিলাওয়াত।`
    return {
      title: { absolute: bnTitle },
      description: bnDesc,
      keywords: [`পারা ${toBanglaDigits(n)}`, `${toBanglaDigits(n)} পারা বাংলা`, name.bn, ...(n === 30 ? ['আমপারা', 'আমপারা বাংলা উচ্চারণ'] : []), `Juz ${n} Bangla`],
      alternates: { ...alternatesFor(juzHref(n), 'bn'), types: markdownAlternate(localeHref('bn', juzHref(n))) },
      openGraph: { type: 'article', title: bnTitle, description: bnDesc, url: localeHref('bn', juzHref(n)), siteName: `${site.name} · নূর কুরআন`, locale: 'bn_BD', alternateLocale: ['en_US'], images: [{ url: `${juzHref(n)}/opengraph-image`, width: 1200, height: 630 }] },
    }
  }
  return {
    title: { absolute: title },
    description,
    alternates: { ...alternatesFor(juzHref(n), 'en'), types: markdownAlternate(juzHref(n)) },
    openGraph: { type: 'article', title, description, url: juzHref(n), siteName: site.name },
  }
}

export async function JuzPage({ params, locale }: Props & { locale: Locale }) {
  const isBn = locale === 'bn'
  const h = (x: string) => localeHref(locale, x)
  const N = (x: number | string) => (isBn ? bnNum(x) : String(x))
  const n = parse((await params).n)
  if (!n) notFound()
  const [verses, juzs] = await Promise.all([getJuzVerses(n), getJuzs()])
  const btBySurah = new Map(await Promise.all([...new Set(verses.map((v) => v.surah))].map(async (s) => [s, await getUccharon(s)] as const)))
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
      url: absoluteUrl(h(juzHref(n))),
      position: n,
      inLanguage: isBn ? ['ar', 'bn'] : ['ar', 'en', 'bn'],
      isPartOf: quranBookRef(locale),
      publisher: publisherRef(),
      hasPart: chapterIds.map((s) => ({ '@type': 'Chapter', name: `Surah ${chapters[s - 1].nameSimple}`, url: absoluteUrl(h(surahHref(s))) })),
    },
    breadcrumbLd(isBn ? [{ name: 'হোম', path: '/bn' }, { name: 'কুরআন', path: h('/quran') }, { name: `পারা ${toBanglaDigits(n)}`, path: h(juzHref(n)) }] : [{ name: 'Home', path: '/' }, { name: 'Quran', path: '/quran' }, { name: `Juz ${n}`, path: juzHref(n) }]),
  ]

  return (
    <div className="mx-auto max-w-[860px] px-3 pb-36 pt-3 sm:px-6 sm:pt-6 lg:pb-20">
      <JsonLd data={ld} />
      <header data-reader-hero className="relative overflow-hidden rounded-[2rem] border bg-card px-5 pb-8 pt-6 text-center sm:rounded-[2.5rem] sm:px-10 sm:pt-8">
        <div className="bg-pattern pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]" />
        <div className="relative">
          <div className="text-start"><Breadcrumbs locale={locale} items={[{ name: lt(locale, { en: 'Home', bn: 'হোম', ar: 'الرئيسية' }), href: '/' }, { name: lt(locale, { en: 'Quran', bn: 'কুরআন', ar: 'القرآن' }), href: '/quran' }, { name: lt(locale, { en: `Juz ${n}`, bn: `পারা ${toBanglaDigits(n)}`, ar: `الجزء ${n}` }) }]} /></div>
          <span className="star-badge mx-auto size-12 font-display text-base font-bold text-gold">{N(n)}</span>
          <p className="mt-4 pb-1 font-arabic text-[3rem] leading-[1.9] text-arabic sm:text-[4rem]" lang="ar" dir="rtl">
            <span className="text-gradient-gold">الجُزْءُ {toArabicDigits(n)}</span> · {name.ar}
          </p>
          {isBn ? (
            <>
              <h1 className="font-display text-3xl font-semibold sm:text-[2.6rem] sm:leading-tight">পারা {toBanglaDigits(n)} <span className="text-muted-foreground">· {name.bn}</span></h1>
              <p lang="en" className="mt-1.5 text-muted-foreground">Juz {n} · {name.tl}</p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-[2.6rem] sm:leading-tight">{lt(locale, { en: `Juz ${n}`, bn: `পারা ${toBanglaDigits(n)}`, ar: `الجزء ${n}` })} <NotAr><span className="text-muted-foreground">· {name.tl}</span></NotAr></h1>
              <NotAr>
                <p className="mt-1.5 text-muted-foreground">
                  Para {n} <span className="mx-2 text-muted-foreground/40">•</span> <span className="font-bangla" lang="bn">পারা {toBanglaDigits(n)} · {name.bn}</span>
                </p>
              </NotAr>
            </>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Chip icon="quran">{N(j.count)} {lt(locale, { en: 'Ayahs', bn: 'আয়াত', ar: 'آية' })}</Chip>
            <Chip icon="read">{N(first.k)} <span className="inline-block rtl:rotate-180">→</span> {N(last.k)}</Chip>
            <Chip icon="read">{lt(locale, { en: 'Page', bn: 'পৃষ্ঠা', ar: 'الصفحة' })} {N(first.p)}–{N(last.p)}</Chip>
          </div>
          <div className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
            {chapterIds.map((s) => (
              <Link key={s} href={h(surahHref(s))} className="shrink-0 rounded-full border bg-background/60 px-3 py-1.5 text-xs font-semibold transition hover:border-primary/40 hover:text-primary">
                {N(s)}. {isBn ? surahNamesBn[s - 1] : <SurahName id={s} />} <span className="text-muted-foreground">{isBn ? bnNum(j.map[String(s)]) : j.map[String(s)]}</span>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex justify-center"><SettingsButton /></div>
        </div>
      </header>
      <TajweedNotice />
      <TranslationCredits className="mt-6" />

      <div className={isBn ? 'verse-list bn-first mt-2' : 'verse-list mt-2'}>
        {verses.map((v, i) => {
          const startsSurah = i === 0 || v.surah !== verses[i - 1].surah
          const c = chapters[v.surah - 1]
          return (
            <Fragment key={v.k}>
              {startsSurah && (
                <div className="surah-sep my-6 first:mt-0">
                  <Link href={h(surahHref(v.surah))} className="group mx-auto flex max-w-xl items-center gap-4 rounded-3xl border bg-surface-2 px-5 py-4 transition hover:border-primary/40">
                    <span className="star-badge size-10 shrink-0 text-sm font-bold text-gold">{N(v.surah)}</span>
                    <span className="min-w-0 flex-1 text-start">
                      {isBn ? (
                        <>
                          <span className="block font-display text-lg font-semibold">সূরা {surahNamesBn[v.surah - 1]}</span>
                          <span className="surah-sep-trans block text-xs text-muted-foreground"><span lang="en">{c.nameSimple}</span> · {v.n > 1 ? `${toBanglaDigits(v.n)} নম্বর আয়াত থেকে` : `${toBanglaDigits(c.versesCount)} আয়াত`}</span>
                        </>
                      ) : (
                        <>
                          <span className="block font-display text-lg font-semibold">{lt(locale, { en: `Surah ${c.nameSimple}`, bn: `সূরা ${surahNamesBn[v.surah - 1]}`, ar: `سورة ${c.nameArabic}` })}</span>
                          <span className="surah-sep-trans block text-xs text-muted-foreground"><NotAr>{c.meaning} · <span className="font-bangla">{surahNamesBn[v.surah - 1]}</span> · </NotAr>{lt(locale, { en: v.n > 1 ? `from ayah ${v.n}` : `${c.versesCount} ayahs`, bn: '', ar: v.n > 1 ? `من الآية ${v.n}` : `${c.versesCount} آية` })}</span>
                        </>
                      )}
                    </span>
                    <span className="font-arabic text-2xl text-gold" lang="ar">{c.nameArabic}</span>
                  </Link>
                  {v.n === 1 && needsBismillah(v.surah) && <Bismillah locale={locale} />}
                </div>
              )}
              {!startsSurah && <div className="ayah-divider" aria-hidden />}
              <VerseBlock verse={v} surah={v.surah} scoped bt={btBySurah.get(v.surah)?.[v.n - 1]} locale={locale} />
            </Fragment>
          )
        })}
      </div>

      <Labelled as="nav" label={{ en: 'Juz navigation', bn: 'পারা নেভিগেশন', ar: 'التنقل بين الأجزاء' }} className="reader-chrome mt-12 grid grid-cols-2 gap-3">
        {n > 1 ? (
          <Link href={h(juzHref(n - 1))} className="card-soft lift flex items-center gap-3 p-4">
            <ChevronLeft className="size-5 text-primary rtl:rotate-180" />
            <span><span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{lt(locale, { en: 'Previous', bn: 'আগের', ar: 'السابق' })}</span><span className="font-display text-lg font-semibold">{lt(locale, { en: `Juz ${n - 1}`, bn: `পারা ${toBanglaDigits(n - 1)}`, ar: `الجزء ${n - 1}` })}</span></span>
          </Link>
        ) : <span />}
        {n < 30 ? (
          <Link href={h(juzHref(n + 1))} className="card-soft lift flex items-center justify-end gap-3 p-4 text-end">
            <span><span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{lt(locale, { en: 'Next', bn: 'পরের', ar: 'التالي' })}</span><span className="font-display text-lg font-semibold">{lt(locale, { en: `Juz ${n + 1}`, bn: `পারা ${toBanglaDigits(n + 1)}`, ar: `الجزء ${n + 1}` })}</span></span>
            <ChevronRight className="size-5 text-primary rtl:rotate-180" />
          </Link>
        ) : <span />}
      </Labelled>
      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"><UiIcon name="juz" size={16} /> {isBn ? `${toBanglaDigits(verses.length)}টি আয়াত · ${toBanglaDigits(chapterIds.length)}টি সূরা` : lt(locale, { en: `${verses.length} ayahs · ${chapterIds.length} ${chapterIds.length > 1 ? 'surahs' : 'surah'}`, bn: '', ar: `${verses.length} آية · ${chapterIds.length} ${chapterIds.length > 1 ? 'سور' : 'سورة'}` })}</p>

      <ReaderChrome chapterIds={chapterIds} title={isBn ? `পারা ${toBanglaDigits(n)} · ${name.bn}` : `Juz ${n} · ${name.tl}`} titleAr={`الجزء ${n} · ${name.ar}`} />
    </div>
  )
}
