import '../../reader.css'
import { Fragment } from 'react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { chapters, resolveChapterId, surahHref, surahNamesBn } from '@/lib/quran/chapters'
import { getChapter, getChapterInfo, getVerses } from '@/lib/quran/data'
import { absoluteUrl, site } from '@/lib/site'
import { htmlToText } from '@/lib/reader/sanitize'
import { breadcrumbLd, publisherLd, quranBookLd } from '@/lib/reader/seo'
import { JsonLd } from '@/components/seo/json-ld'
import { SurahHeader } from '@/components/reader/surah-header'
import { Bismillah, VerseBlock, needsBismillah } from '@/components/reader/verse'
import { ReaderChrome } from '@/components/reader/reader-chrome'
import { SurahPager } from '@/components/reader/surah-pager'
import { AyahRail, SurahRail, TajweedNotice } from '@/components/reader/side-rails'
import { ReaderPrefsInline } from '@/components/reader/prefs-script'
import { TranslationCredits } from '@/components/reader/translation-credits'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = true

export function generateStaticParams() {
  return chapters.map((c) => ({ slug: c.slug }))
}

async function resolve(slug: string) {
  const id = resolveChapterId(slug)
  if (!id) notFound()
  const canonical = chapters[id - 1].slug
  return { id, canonical, isCanonical: decodeURIComponent(slug) === canonical }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const id = resolveChapterId(slug)
  if (!id) return { title: 'Surah not found' }
  const c = await getChapter(id)
  if (!c) return {}
  const bn = surahNamesBn[id - 1]
  const title = `Surah ${c.nameSimple} (${c.nameArabic}) — Read with Bangla & English Translation | সূরা ${bn}`
  const summary = c.summaryEn ? htmlToText(c.summaryEn, 170) : ''
  const description = `Read Surah ${c.nameSimple} (${c.meaning}), surah ${c.id} of the Quran — ${c.versesCount} ayahs, ${c.revelationPlace === 'makkah' ? 'Meccan' : 'Medinan'}. Arabic text with English (Saheeh International, Abdel Haleem) & Bangla translation, transliteration, word-by-word, tajweed, tafsir and audio. ${summary}`.slice(0, 300)
  const url = surahHref(id)
  return {
    title: { absolute: title },
    description,
    keywords: [`Surah ${c.nameSimple}`, `${c.nameSimple} translation`, `${c.nameSimple} Bangla`, `সূরা ${bn}`, c.nameArabic, `Surah ${c.id}`, c.meaning, 'Quran'],
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: `Surah ${c.nameSimple} (${c.nameArabic}) — ${c.meaning}`,
      description,
      url,
      siteName: site.name,
      locale: 'en_US',
      alternateLocale: ['bn_BD', 'ar_SA'],
    },
    twitter: { card: 'summary_large_image', title: `Surah ${c.nameSimple} — ${c.meaning}`, description },
  }
}

export default async function SurahPage({ params }: Props) {
  const { slug } = await params
  const { id, canonical, isCanonical } = await resolve(slug)
  if (!isCanonical) permanentRedirect(`/surah/${canonical}`)

  const [c, verses, info] = await Promise.all([getChapter(id), getVerses(id), getChapterInfo(id).catch(() => ({ en: null, bn: null }))])
  if (!c) notFound()
  const juzFrom = verses[0].j
  const juzTo = verses[verses.length - 1].j
  const url = absoluteUrl(surahHref(id))

  const chapterLd = {
    '@context': 'https://schema.org',
    '@type': 'Chapter',
    '@id': `${url}#chapter`,
    name: `Surah ${c.nameSimple}`,
    alternateName: [c.nameArabic, c.meaning, `সূরা ${surahNamesBn[id - 1]}`, c.nameComplex],
    headline: `Surah ${c.nameSimple} (${c.nameArabic}) — ${c.meaning}`,
    position: id,
    url,
    inLanguage: ['ar', 'en', 'bn'],
    description: c.summaryEn ? htmlToText(c.summaryEn, 500) : `${c.meaning} — ${c.versesCount} ayahs`,
    isPartOf: quranBookLd(),
    publisher: publisherLd(),
    pageStart: c.pages[0],
    pageEnd: c.pages[1],
    about: { '@type': 'Thing', name: c.meaning },
  }

  return (
    <div className="mx-auto max-w-[1440px] px-3 pb-36 pt-3 sm:px-6 sm:pt-6 lg:pb-20">
      <JsonLd data={[chapterLd, breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Quran', path: '/quran' }, { name: `Surah ${c.nameSimple}`, path: surahHref(id) }])]} />
      <ReaderPrefsInline />
      <div className="xl:grid xl:grid-cols-[240px_minmax(0,860px)_240px] xl:justify-center xl:gap-8">
        <aside className="reader-chrome hidden xl:block" aria-label="Surahs">
          <div className="sticky top-24"><SurahRail current={id} /></div>
        </aside>

        <div className="mx-auto w-full max-w-[860px] min-w-0">
          <SurahHeader chapter={c} juzFrom={juzFrom} juzTo={juzTo} info={info} />
          <TajweedNotice className="xl:hidden" />
          {needsBismillah(id) && <Bismillah className="mt-6" />}
          <TranslationCredits className={needsBismillah(id) ? '' : 'mt-6'} />
          <div className="verse-list mt-2">
            {verses.map((v, i) => (
              <Fragment key={v.n}>
                {i > 0 && <div className="ayah-divider" aria-hidden />}
                <VerseBlock verse={v} surah={id} />
              </Fragment>
            ))}
          </div>
          <p className="mt-10 text-center font-arabic text-2xl text-gold hide-in-mushaf" lang="ar">صَدَقَ ٱللَّهُ ٱلْعَظِيمُ</p>
          <SurahPager id={id} />
        </div>

        <aside className="reader-chrome hidden xl:block" aria-label="Ayahs">
          <div className="sticky top-24"><AyahRail surah={id} total={c.versesCount} /></div>
        </aside>
      </div>
      <ReaderChrome surah={id} chapterIds={[id]} title={`${id}. ${c.nameSimple}`} titleAr={c.nameArabic} total={c.versesCount} />
    </div>
  )
}
