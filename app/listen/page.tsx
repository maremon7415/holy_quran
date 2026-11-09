import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/json-ld'
import { UiIcon } from '@/components/ui-icon'
import { PlayAllButton, ReciterGallery, SurahAudioList } from '@/components/player/listen-client'
import { reciters } from '@/lib/audio/reciters'
import { chapters, surahHref } from '@/lib/quran/chapters'
import { absoluteUrl, site } from '@/lib/site'

const title = 'Listen to the Holy Quran — 20+ Reciters (Mishary, Sudais, Abdul Basit…) | কুরআন তিলাওয়াত'
const description =
  'Listen to the Holy Quran online with 20+ reciters — Mishary Alafasy, As-Sudais, Abdul Basit, Al-Husary, Minshawi, Al-Muaiqly and more. Word-by-word highlighting, ayah repeat, memorisation loops and sleep timer. কুরআন তিলাওয়াত শুনুন।'

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: ['listen to Quran', 'Quran recitation', 'Quran audio', 'Mishary Alafasy', 'Sudais', 'Abdul Basit', 'Quran mp3', 'কুরআন তিলাওয়াত', 'কুরআন অডিও'],
  alternates: { canonical: '/listen' },
  openGraph: { type: 'website', title, description, url: absoluteUrl('/listen'), siteName: site.name },
  twitter: { card: 'summary_large_image', title, description },
}

const featured = [1, 18, 36, 55, 67, 112]
const audioLd = featured.map((id) => {
  const c = chapters[id - 1]
  return {
    '@type': 'AudioObject',
    name: `Surah ${c.nameSimple} (${c.nameArabic}) — recitation by Mishary Alafasy`,
    description: `Listen to Surah ${c.nameSimple} — ${c.meaning}, ${c.versesCount} ayahs.`,
    contentUrl: `https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${id}.mp3`,
    encodingFormat: 'audio/mpeg',
    inLanguage: 'ar',
    url: absoluteUrl(surahHref(id)),
  }
})

const ld = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: absoluteUrl('/listen'),
    inLanguage: ['en', 'bn', 'ar'],
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
      { '@type': 'ListItem', position: 1, name: site.name, item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Listen', item: absoluteUrl('/listen') },
    ],
  },
]

export default function ListenPage() {
  return (
    <div className="pb-36 lg:pb-28">
      <JsonLd data={ld} />
      <header className="relative isolate overflow-hidden border-b border-border">
        <div aria-hidden className="bg-pattern absolute inset-0 -z-10" />
        <div aria-hidden className="absolute -right-24 -top-24 -z-10 size-[26rem] rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden className="absolute -bottom-28 -left-16 -z-10 size-[22rem] rounded-full bg-gold/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <UiIcon name="listen" size={22} /> Listen · তিলাওয়াত
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Listen to the Holy Quran
          </h1>
          <p className="font-arabic mt-3 text-3xl text-gold sm:text-4xl" lang="ar">استمع إلى القرآن الكريم</p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {reciters.length} reciters, word-by-word highlighting, ayah repeat and memorisation loops, a sleep timer, and lock-screen controls. পবিত্র কুরআনের তিলাওয়াত শুনুন প্রিয় ক্বারীর কণ্ঠে।
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <PlayAllButton />
            <a href="#reciters-h" className="inline-flex h-12 items-center rounded-full border border-border bg-card px-6 text-sm font-semibold transition hover:bg-muted">Pick a reciter</a>
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
