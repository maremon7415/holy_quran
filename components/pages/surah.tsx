import '@/app/reader.css'
import { Labelled } from '@/lib/i18n/labelled'
import { Fragment } from 'react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { chapters, resolveChapterId, surahHref, surahNamesBn } from '@/lib/quran/chapters'
import { getChapter, getChapterInfo, getUccharon, getVerses } from '@/lib/quran/data'
import { absoluteUrl, site } from '@/lib/site'
import { htmlToText } from '@/lib/reader/sanitize'
import { breadcrumbLd } from '@/lib/reader/seo'
import { markdownAlternate } from '@/lib/content/seo'
import { publisherRef, quranBookRef } from '@/lib/seo/structured'
import { surahSameAs } from '@/lib/seo/wikidata'
import { SurahKeyFacts } from '@/components/seo/surah-key-facts'
import { JsonLd } from '@/components/seo/json-ld'
import { SurahHeader } from '@/components/reader/surah-header'
import { Bismillah, VerseBlock, needsBismillah } from '@/components/reader/verse'
import { ReaderChrome } from '@/components/reader/reader-chrome'
import { SurahPager } from '@/components/reader/surah-pager'
import { AyahRail, SurahRail, TajweedNotice } from '@/components/reader/side-rails'
import { TranslationCredits } from '@/components/reader/translation-credits'
import { alternatesFor, localeHref, type Locale } from '@/lib/i18n/routes'
import { bnNum } from '@/lib/i18n/t'

export type SurahProps = { params: Promise<{ slug: string }> }
type Props = SurahProps

export function surahParams() {
  return chapters.map((c) => ({ slug: c.slug }))
}

async function resolve(slug: string) {
  const id = resolveChapterId(slug)
  if (!id) notFound()
  const canonical = chapters[id - 1].slug
  return { id, canonical, isCanonical: decodeURIComponent(slug) === canonical }
}

export async function surahMeta(locale: Locale, { params }: Props): Promise<Metadata> {
  const { slug } = await params
  const id = resolveChapterId(slug)
  if (!id) return { title: 'Surah not found' }
  const c = await getChapter(id)
  if (!c) return {}
  const bn = surahNamesBn[id - 1]
  const title = `Surah ${c.nameSimple} (${c.nameArabic}) — Read with Bangla & English Translation | সূরা ${bn}`
  const summary = c.summaryEn ? htmlToText(c.summaryEn, 170) : ''
  const description = `Read Surah ${c.nameSimple} (${c.meaning}), surah ${c.id} of the Quran — ${c.versesCount} ayahs, ${c.revelationPlace === 'makkah' ? 'Meccan' : 'Medinan'}. Arabic text with English (Saheeh International, Abdel Haleem) & Bangla translation, Bangla uccharon (pronunciation), transliteration, word-by-word, tajweed, tafsir and audio. ${summary}`.slice(0, 300)
  const url = surahHref(id)
  if (locale === 'bn') {
    const bnTitle = `সূরা ${bn} বাংলা উচ্চারণ ও অর্থসহ (${c.nameArabic}) — ${bnNum(c.versesCount)} আয়াত | Surah ${c.nameSimple}`
    const bnDesc = `সূরা ${bn} (${c.nameArabic}) — কুরআনের ${bnNum(c.id)} নম্বর সূরা, ${bnNum(c.versesCount)} আয়াত, ${c.revelationPlace === 'makkah' ? 'মাক্কী' : 'মাদানী'}। আরবি পাঠ, বাংলা উচ্চারণ, বাংলা ও ইংরেজি অনুবাদ, শব্দে শব্দে অর্থ, তাজবীদ, তাফসীর ও তিলাওয়াত।${c.summaryBn ? ' ' + htmlToText(c.summaryBn, 140) : ''}`.slice(0, 300)
    const bnUrl = localeHref('bn', url)
    return {
      title: { absolute: bnTitle },
      description: bnDesc,
      keywords: [`সূরা ${bn}`, `সূরা ${bn} বাংলা উচ্চারণ`, `সূরা ${bn} বাংলা অর্থসহ`, `সূরা ${bn} আরবি`, `সূরা ${bn} তিলাওয়াত`, `Surah ${c.nameSimple} Bangla`, c.nameArabic],
      alternates: { ...alternatesFor(url, 'bn'), types: markdownAlternate(bnUrl) },
      openGraph: { type: 'article', title: `সূরা ${bn} (${c.nameArabic}) — বাংলা উচ্চারণ ও অর্থ`, description: bnDesc, url: bnUrl, siteName: `${site.name} · নূর কুরআন`, locale: 'bn_BD', alternateLocale: ['en_US'], images: [{ url: `${localeHref('bn', url)}/opengraph-image`, width: 1200, height: 630 }] },
      twitter: { card: 'summary_large_image', title: `সূরা ${bn} — বাংলা উচ্চারণ ও অর্থ`, description: bnDesc },
    }
  }
  return {
    title: { absolute: title },
    description,
    keywords: [`Surah ${c.nameSimple}`, `${c.nameSimple} translation`, `${c.nameSimple} Bangla`, `সূরা ${bn}`, `সূরা ${bn} বাংলা উচ্চারণ`, c.nameArabic, `Surah ${c.id}`, c.meaning, 'Quran'],
    alternates: { ...alternatesFor(url, 'en'), types: markdownAlternate(url) },
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

export async function SurahPage({ params, locale }: Props & { locale: Locale }) {
  const { slug } = await params
  const { id, canonical, isCanonical } = await resolve(slug)
  if (!isCanonical) permanentRedirect(localeHref(locale, `/surah/${canonical}`))
  const isBn = locale === 'bn'

  const [c, verses, info, bt] = await Promise.all([getChapter(id), getVerses(id), getChapterInfo(id).catch(() => ({ en: null, bn: null })), getUccharon(id)])
  if (!c) notFound()
  const juzFrom = verses[0].j
  const juzTo = verses[verses.length - 1].j
  const url = absoluteUrl(localeHref(locale, surahHref(id)))

  const chapterLd = {
    '@context': 'https://schema.org',
    '@type': 'Chapter',
    '@id': `${url}#chapter`,
    name: isBn ? `সূরা ${surahNamesBn[id - 1]}` : `Surah ${c.nameSimple}`,
    alternateName: [c.nameArabic, c.meaning, `সূরা ${surahNamesBn[id - 1]}`, c.nameComplex],
    headline: `Surah ${c.nameSimple} (${c.nameArabic}) — ${c.meaning}`,
    position: id,
    url,
    inLanguage: isBn ? ['ar', 'bn'] : ['ar', 'en', 'bn'],
    description: isBn && c.summaryBn ? htmlToText(c.summaryBn, 500) : c.summaryEn ? htmlToText(c.summaryEn, 500) : `${c.meaning} — ${c.versesCount} ayahs`,
    isPartOf: quranBookRef(locale),
    publisher: publisherRef(),
    sameAs: surahSameAs(id, locale),
    numberOfPages: c.pages[1] - c.pages[0] + 1,
    pageStart: c.pages[0],
    pageEnd: c.pages[1],
    about: { '@type': 'Thing', name: c.meaning },
  }

  return (
    <div className="mx-auto max-w-[1440px] px-3 pb-36 pt-3 sm:px-6 sm:pt-6 lg:pb-20">
      <JsonLd data={[chapterLd, breadcrumbLd(isBn ? [{ name: 'হোম', path: '/bn' }, { name: 'কুরআন', path: localeHref('bn', '/quran') }, { name: `সূরা ${surahNamesBn[id - 1]}`, path: localeHref('bn', surahHref(id)) }] : [{ name: 'Home', path: '/' }, { name: 'Quran', path: '/quran' }, { name: `Surah ${c.nameSimple}`, path: surahHref(id) }])]} />
      <div className="xl:grid xl:grid-cols-[240px_minmax(0,860px)_240px] xl:justify-center xl:gap-8">
        <Labelled as="aside" label={{ en: 'Surahs', bn: 'সূরাসমূহ', ar: 'السور' }} className="reader-chrome hidden xl:block">
          <div className="sticky top-24"><SurahRail current={id} /></div>
        </Labelled>

        <div className="mx-auto w-full max-w-[860px] min-w-0">
          <SurahHeader chapter={c} juzFrom={juzFrom} juzTo={juzTo} info={info} locale={locale} />
          <SurahKeyFacts chapter={c} juzFrom={juzFrom} juzTo={juzTo} locale={locale} />
          <TajweedNotice className="xl:hidden" />
          {needsBismillah(id) && <Bismillah className="mt-6" locale={locale} />}
          <TranslationCredits className={needsBismillah(id) ? '' : 'mt-6'} />
          <div className={isBn ? 'verse-list bn-first mt-2' : 'verse-list mt-2'}>
            {verses.map((v, i) => (
              <Fragment key={v.n}>
                {i > 0 && <div className="ayah-divider" aria-hidden />}
                <VerseBlock verse={v} surah={id} bt={bt[i]} locale={locale} />
              </Fragment>
            ))}
          </div>
          <p className="mt-10 text-center font-arabic text-2xl text-gold hide-in-mushaf" lang="ar">صَدَقَ ٱللَّهُ ٱلْعَظِيمُ</p>
          <SurahPager id={id} locale={locale} />
        </div>

        <Labelled as="aside" label={{ en: 'Ayahs', bn: 'আয়াতসমূহ', ar: 'الآيات' }} className="reader-chrome hidden xl:block">
          <div className="sticky top-24"><AyahRail surah={id} total={c.versesCount} /></div>
        </Labelled>
      </div>
      <ReaderChrome surah={id} chapterIds={[id]} title={isBn ? `${bnNum(id)}. ${surahNamesBn[id - 1]}` : `${id}. ${c.nameSimple}`} titleAr={c.nameArabic} total={c.versesCount} />
    </div>
  )
}
