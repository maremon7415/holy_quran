import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/json-ld'
import { UiIcon } from '@/components/ui-icon'
import { PlayAllButton, ReciterGallery, SurahAudioList } from '@/components/player/listen-client'
import { reciters } from '@/lib/audio/reciters'
import { chapters, surahHref, surahNamesBn } from '@/lib/quran/chapters'
import { absoluteUrl, site } from '@/lib/site'
import { buildMeta } from '@/lib/content/seo'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { bnNum } from '@/lib/i18n/t'

const copy = {
  en: {
    title: 'Listen to the Holy Quran — 20+ Reciters (Mishary, Sudais, Abdul Basit…) | কুরআন তিলাওয়াত',
    description: 'Listen to the Holy Quran online with 20+ reciters — Mishary Alafasy, As-Sudais, Abdul Basit, Al-Husary, Minshawi, Al-Muaiqly and more. Word-by-word highlighting, ayah repeat, memorisation loops and sleep timer. কুরআন তিলাওয়াত শুনুন।',
    keywords: ['listen to Quran', 'Quran recitation', 'Quran audio', 'Mishary Alafasy', 'Sudais', 'Abdul Basit', 'Quran mp3', 'কুরআন তিলাওয়াত', 'কুরআন অডিও'],
  },
  bn: {
    title: 'কুরআন তিলাওয়াত শুনুন — ২০+ ক্বারী (মিশারী, সুদাইস, আব্দুল বাসিত…) | অডিও কুরআন',
    description: 'মিশারী রাশিদ আলাফাসি, আস-সুদাইস, আব্দুল বাসিত, আল-হুসারী, মিনশাভী সহ ২০ জনেরও বেশি ক্বারীর কণ্ঠে পবিত্র কুরআনের তিলাওয়াত শুনুন। শব্দে শব্দে হাইলাইট, আয়াত রিপিট, হিফজ লুপ ও স্লিপ টাইমার।',
    keywords: ['কুরআন তিলাওয়াত', 'কুরআন তিলাওয়াত অডিও', 'সূরা ইয়াসিন তিলাওয়াত', 'মিশারী রাশিদ তিলাওয়াত', 'কুরআন অডিও ডাউনলোড', 'সুন্দর কুরআন তিলাওয়াত'],
  },
}

export const listenMeta = (locale: Locale): Metadata => buildMeta({ ...copy[locale], path: '/listen', locale, ogImage: locale === 'bn' ? '/opengraph-image' : undefined })

const featured = [1, 18, 36, 55, 67, 112]

function ld(locale: Locale) {
  const bn = locale === 'bn'
  const h = (p: string) => absoluteUrl(localeHref(locale, p))
  const audioLd = featured.map((id) => {
    const c = chapters[id - 1]
    return {
      '@type': 'AudioObject',
      name: bn ? `সূরা ${surahNamesBn[id - 1]} (${c.nameArabic}) — মিশারী আলাফাসির তিলাওয়াত` : `Surah ${c.nameSimple} (${c.nameArabic}) — recitation by Mishary Alafasy`,
      description: bn ? `সূরা ${surahNamesBn[id - 1]} শুনুন — ${bnNum(c.versesCount)} আয়াত।` : `Listen to Surah ${c.nameSimple} — ${c.meaning}, ${c.versesCount} ayahs.`,
      contentUrl: `https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${id}.mp3`,
      encodingFormat: 'audio/mpeg',
      inLanguage: 'ar',
      url: h(surahHref(id)),
    }
  })
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: copy[locale].title,
      description: copy[locale].description,
      url: h('/listen'),
      inLanguage: bn ? 'bn' : ['en', 'bn', 'ar'],
      isPartOf: { '@type': 'WebSite', name: site.name, url: site.url },
      hasPart: audioLd,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: reciters.length,
        itemListElement: reciters.map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: `${r.name} (${r.style})` })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: bn ? 'হোম' : site.name, item: h('/') },
        { '@type': 'ListItem', position: 2, name: bn ? 'তিলাওয়াত' : 'Listen', item: h('/listen') },
      ],
    },
  ]
}

export function ListenPage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  return (
    <div className="pb-36 lg:pb-28">
      <JsonLd data={ld(locale)} />
      <header className="relative isolate overflow-hidden border-b border-border">
        <div aria-hidden className="bg-pattern absolute inset-0 -z-10" />
        <div aria-hidden className="absolute -end-24 -top-24 -z-10 size-[26rem] rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden className="absolute -bottom-28 -start-16 -z-10 size-[22rem] rounded-full bg-gold/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <UiIcon name="listen" size={22} /> {bn ? 'তিলাওয়াত · Listen' : 'Listen · তিলাওয়াত'}
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            {bn ? 'পবিত্র কুরআনের তিলাওয়াত শুনুন' : 'Listen to the Holy Quran'}
          </h1>
          <p className="font-arabic mt-3 text-3xl text-gold sm:text-4xl" lang="ar">استمع إلى القرآن الكريم</p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {bn
              ? `${bnNum(reciters.length)} জন ক্বারী, শব্দে শব্দে হাইলাইট, আয়াত রিপিট ও হিফজ লুপ, স্লিপ টাইমার এবং লক-স্ক্রিন কন্ট্রোল। প্রিয় ক্বারীর কণ্ঠে পবিত্র কুরআন শুনুন।`
              : `${reciters.length} reciters, word-by-word highlighting, ayah repeat and memorisation loops, a sleep timer, and lock-screen controls. পবিত্র কুরআনের তিলাওয়াত শুনুন প্রিয় ক্বারীর কণ্ঠে।`}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <PlayAllButton />
            <a href="#reciters-h" className="inline-flex h-12 items-center rounded-full border border-border bg-card px-6 text-sm font-semibold transition hover:bg-muted">{bn ? 'ক্বারী বেছে নিন' : 'Pick a reciter'}</a>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl space-y-14 px-4 py-10 sm:px-6 sm:py-14">
        <ReciterGallery />
        <SurahAudioList />
      </div>
    </div>
  )
}
