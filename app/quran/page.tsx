import '../reader.css'
import type { Metadata } from 'next'
import { getChapters, getJuzs } from '@/lib/quran/data'
import { surahHref } from '@/lib/quran/chapters'
import { absoluteUrl, site } from '@/lib/site'
import { breadcrumbLd, quranBookLd } from '@/lib/reader/seo'
import { JsonLd } from '@/components/seo/json-ld'
import { ContinueReading, QuranIndex, SearchTrigger } from '@/components/reader/quran-index'

export const metadata: Metadata = {
  title: { absolute: `Read Al Quran Online — All 114 Surahs with Bangla & English Translation | আল কুরআন | ${site.name}` },
  description:
    'Read the Holy Quran online: all 114 surahs and 30 juz (para) with Arabic text, English (Saheeh International, Abdel Haleem) and Bangla translation, transliteration, word-by-word meaning, tajweed colours, tafsir and recitation audio.',
  alternates: { canonical: '/quran' },
  openGraph: { type: 'website', title: 'Read Al Quran Online — 114 Surahs with Translation', url: '/quran', siteName: site.name },
}

export default async function QuranPage() {
  const [all, juzs] = await Promise.all([getChapters(), getJuzs()])
  const order = [...all].sort((a, b) => a.revelationOrder - b.revelationOrder).map((c) => c.id)

  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Surahs of the Holy Quran',
      numberOfItems: all.length,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: all.map((c) => ({
        '@type': 'ListItem',
        position: c.id,
        url: absoluteUrl(surahHref(c.id)),
        name: `Surah ${c.nameSimple} (${c.nameArabic}) — ${c.meaning}`,
      })),
    },
    { '@context': 'https://schema.org', ...quranBookLd(), numberOfPages: 604, hasPart: { '@type': 'ItemList', numberOfItems: 114 } },
    breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Quran', path: '/quran' }]),
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 pb-36 pt-4 sm:px-6 sm:pt-8 lg:pb-20">
      <JsonLd data={ld} />
      <section className="relative overflow-hidden rounded-[2rem] border bg-card px-5 pb-8 pt-10 text-center sm:rounded-[2.5rem] sm:px-10 sm:pb-10 sm:pt-14">
        <div className="bg-pattern pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]" />
        <div className="relative">
          <p className="animate-fade-up font-arabic text-[2.6rem] leading-[1.8] text-gradient-gold sm:text-6xl" lang="ar">ٱلْقُرْآنُ ٱلْكَرِيمُ</p>
          <h1 className="animate-fade-up font-display text-3xl font-semibold tracking-tight [animation-delay:60ms] sm:text-5xl">The Noble Quran</h1>
          <p className="animate-fade-up mx-auto mt-3 max-w-xl text-[15px] text-muted-foreground [animation-delay:120ms] sm:text-base">
            114 surahs · 30 juz · 6,236 ayahs — with English & Bangla translation, word-by-word, tajweed and tafsir.
            <span className="mt-1 block font-bangla" lang="bn">বাংলা ও ইংরেজি অনুবাদসহ সম্পূর্ণ আল কুরআন</span>
          </p>
          <div className="animate-fade-up [animation-delay:180ms]"><SearchTrigger /></div>
          <ContinueReading />
        </div>
      </section>

      <QuranIndex order={order} juzs={juzs.map((j) => ({ juz: j.juz, map: j.map, count: j.count }))} />

    </div>
  )
}
