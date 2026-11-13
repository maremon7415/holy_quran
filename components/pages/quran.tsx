import '@/app/reader.css'
import type { Metadata } from 'next'
import { getChapters, getJuzs } from '@/lib/quran/data'
import { surahHref } from '@/lib/quran/chapters'
import { absoluteUrl, site } from '@/lib/site'
import { breadcrumbLd } from '@/lib/reader/seo'
import { publisherRef, quranBookRef } from '@/lib/seo/structured'
import { JsonLd } from '@/components/seo/json-ld'
import { ContinueReading, QuranIndex, SearchTrigger } from '@/components/reader/quran-index'
import { alternatesFor, localeHref, type Locale } from '@/lib/i18n/routes'
import { lt } from '@/lib/i18n/lt'
import { surahNamesBn } from '@/lib/quran/chapters'

const metaEn: Metadata = {
  title: { absolute: `Read Al Quran Online — All 114 Surahs with Bangla & English Translation | আল কুরআন | ${site.name}` },
  description:
    'Read the Holy Quran online: all 114 surahs and 30 juz (para) with Arabic text, English (Saheeh International, Abdel Haleem) and Bangla translation, transliteration, word-by-word meaning, tajweed colours, tafsir and recitation audio.',
  alternates: alternatesFor('/quran', 'en'),
  openGraph: { type: 'website', title: 'Read Al Quran Online — 114 Surahs with Translation', url: '/quran', siteName: site.name },
}

const bnTitle = 'আল কুরআন বাংলা অর্থসহ — ১১৪টি সূরা, ৩০ পারা, বাংলা উচ্চারণ | নূর কুরআন'
const bnDesc = 'সম্পূর্ণ আল কুরআন অনলাইনে পড়ুন: ১১৪টি সূরা ও ৩০ পারা — আরবি পাঠ, বাংলা উচ্চারণ, বাংলা ও ইংরেজি অনুবাদ, শব্দে শব্দে অর্থ, তাজবীদ, তাফসীর ও তিলাওয়াত।'
export const quranMeta = (locale: Locale): Metadata =>
  locale === 'bn'
    ? {
        title: { absolute: bnTitle },
        description: bnDesc,
        keywords: ['আল কুরআন', 'কুরআন শরীফ বাংলা অর্থসহ', 'বাংলা কুরআন', 'কুরআন বাংলা উচ্চারণ', '১১৪ সূরা', '৩০ পারা', 'আমপারা'],
        alternates: alternatesFor('/quran', 'bn'),
        openGraph: { type: 'website', title: bnTitle, description: bnDesc, url: localeHref('bn', '/quran'), siteName: `${site.name} · নূর কুরআন`, locale: 'bn_BD', images: [{ url: '/bn/opengraph-image', width: 1200, height: 630 }] },
      }
    : metaEn

export async function QuranPage({ locale }: { locale: Locale }) {
  const isBn = locale === 'bn'
  const [all, juzs] = await Promise.all([getChapters(), getJuzs()])
  const order = [...all].sort((a, b) => a.revelationOrder - b.revelationOrder).map((c) => c.id)

  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: isBn ? 'পবিত্র কুরআনের সূরাসমূহ' : 'Surahs of the Holy Quran',
      ...(isBn ? { inLanguage: 'bn' } : {}),
      numberOfItems: all.length,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: all.map((c) => ({
        '@type': 'ListItem',
        position: c.id,
        url: absoluteUrl(localeHref(locale, surahHref(c.id))),
        name: isBn ? `সূরা ${surahNamesBn[c.id - 1]} (${c.nameArabic})` : `Surah ${c.nameSimple} (${c.nameArabic}) — ${c.meaning}`,
      })),
    },
    { '@context': 'https://schema.org', ...quranBookRef(locale), numberOfPages: 604, publisher: publisherRef(), hasPart: { '@type': 'ItemList', numberOfItems: 114 } },
    breadcrumbLd(isBn ? [{ name: 'হোম', path: '/bn' }, { name: 'কুরআন', path: '/bn/quran' }] : [{ name: 'Home', path: '/' }, { name: 'Quran', path: '/quran' }]),
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 pb-36 pt-4 sm:px-6 sm:pt-8 lg:pb-20">
      <JsonLd data={ld} />
      <section className="relative overflow-hidden rounded-[2rem] border bg-card px-5 pb-8 pt-10 text-center sm:rounded-[2.5rem] sm:px-10 sm:pb-10 sm:pt-14">
        <div className="bg-pattern pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]" />
        <div className="relative">
          <p className="animate-fade-up font-arabic text-[2.6rem] leading-[1.8] text-gradient-gold sm:text-6xl" lang="ar">ٱلْقُرْآنُ ٱلْكَرِيمُ</p>
          <h1 className="animate-fade-up font-display text-3xl font-semibold tracking-tight [animation-delay:60ms] sm:text-5xl">{isBn ? 'আল কুরআনুল কারীম' : lt(locale, { en: 'The Noble Quran', bn: 'আল কুরআনুল কারীম', ar: 'القرآن الكريم' })}</h1>
          <p className="animate-fade-up mx-auto mt-3 max-w-xl text-[15px] text-muted-foreground [animation-delay:120ms] sm:text-base">
            {isBn ? (
              <>১১৪টি সূরা · ৩০ পারা · ৬,২৩৬ আয়াত — বাংলা উচ্চারণ, বাংলা ও ইংরেজি অনুবাদ, শব্দে শব্দে অর্থ, তাজবীদ ও তাফসীরসহ।</>
            ) : (
              <>
                {lt(locale, { en: '114 surahs · 30 juz · 6,236 ayahs — with English & Bangla translation, word-by-word, tajweed and tafsir.', bn: '১১৪টি সূরা · ৩০ পারা · ৬,২৩৬ আয়াত', ar: '١١٤ سورة · ٣٠ جزءًا · ٦٢٣٦ آية — مع الترجمة الإنجليزية والبنغالية ومعاني الكلمات والتجويد والتفسير.' })}
                <span className="mt-1 block font-bangla" lang="bn">বাংলা ও ইংরেজি অনুবাদসহ সম্পূর্ণ আল কুরআন</span>
              </>
            )}
          </p>
          <div className="animate-fade-up [animation-delay:180ms]"><SearchTrigger /></div>
          <ContinueReading />
        </div>
      </section>

      <QuranIndex order={order} juzs={juzs.map((j) => ({ juz: j.juz, map: j.map, count: j.count }))} />

    </div>
  )
}
