import Link from 'next/link'
import type { Metadata } from 'next'
import { getChapters, getVerse } from '@/lib/quran/data'
import { readerHref, surahHref, surahNamesBn, toArabicDigits } from '@/lib/quran/chapters'
import { UiIcon } from '@/components/ui-icon'
import { ContinueReading } from '@/components/home/continue-reading'
import { HeroSearch } from '@/components/home/hero-search'
import { Reveal } from '@/components/home/reveal'
import { JsonLd } from '@/components/seo/json-ld'
import { site } from '@/lib/site'

export const revalidate = 3600

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const DAILY = ['2:255', '94:5', '13:28', '65:3', '39:53', '2:186', '3:139', '2:152', '29:69', '93:5', '40:60', '2:286', '8:46', '3:159', '17:24', '49:13', '55:13', '16:97', '20:114', '21:87', '28:24', '2:201', '14:7', '3:173', '25:63', '31:17', '57:4', '50:16', '7:56', '10:62']

const FEATURES = [
  { href: '/quran', icon: 'quran', en: 'Read the Quran', bn: 'কুরআন পড়ুন', d: 'Uthmani script, Bangla & English, tajweed colours, word-by-word', span: 'sm:col-span-2 sm:row-span-2' },
  { href: '/listen', icon: 'listen', en: 'Listen', bn: 'তিলাওয়াত', d: '20+ reciters, word-synced highlighting' },
  { href: '/hifz', icon: 'hifz', en: 'Hifz Studio', bn: 'হিফজ স্টুডিও', d: 'Memorise with spaced repetition & voice check' },
  { href: '/topics', icon: 'topics', en: 'Quran by Topic', bn: 'বিষয়ভিত্তিক', d: 'What the Quran says about life’s questions' },
  { href: '/dua', icon: 'dua', en: 'Duas', bn: 'দোয়া', d: 'Authentic duas with sources' },
  { href: '/names-of-allah', icon: 'names', en: '99 Names', bn: '৯৯ নাম', d: 'Asma ul Husna with meanings' },
  { href: '/prayer-times', icon: 'prayer', en: 'Prayer Times', bn: 'নামাজের সময়', d: 'For your exact location' },
  { href: '/qibla', icon: 'qibla', en: 'Qibla', bn: 'কিবলা', d: 'Live compass' },
  { href: '/journey', icon: 'journey', en: 'Khatam Planner', bn: 'খতম পরিকল্পনা', d: 'Streaks, goals & progress' },
]

const MOODS = [
  { en: 'Anxious', bn: 'দুশ্চিন্তাগ্রস্ত', emoji: '🌧️' }, { en: 'Sad', bn: 'দুঃখিত', emoji: '💧' }, { en: 'Grateful', bn: 'কৃতজ্ঞ', emoji: '🌿' },
  { en: 'Lonely', bn: 'একাকী', emoji: '🌙' }, { en: 'Hopeless', bn: 'হতাশ', emoji: '🕯️' }, { en: 'Angry', bn: 'রাগান্বিত', emoji: '🔥' },
  { en: 'Guilty', bn: 'অনুতপ্ত', emoji: '🤲' }, { en: 'Afraid', bn: 'ভীত', emoji: '🛡️' },
]

const POPULAR = [36, 67, 18, 55, 56, 1, 2, 112]

export default async function Home() {
  const day = Math.floor(Date.now() / 86_400_000)
  const [s, a] = DAILY[day % DAILY.length].split(':').map(Number)
  const [verse, chapters] = await Promise.all([getVerse(s, a), getChapters()])
  const ch = chapters[s - 1]

  return (
    <div className="pb-10">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebApplication', name: site.name, url: site.url, applicationCategory: 'ReferenceApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, inLanguage: ['en', 'bn', 'ar'], description: site.description }} />

      {/* ---------------- HERO ---------------- */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-12rem] size-[46rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)]" />
          <div className="bg-pattern absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
          <StarRing className="absolute left-1/2 top-8 w-[44rem] max-w-[140vw] -translate-x-1/2 animate-spin-slow text-gold opacity-[0.16]" />
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-24">
          <p className="animate-fade-up font-arabic text-3xl text-gold sm:text-4xl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
          <h1 className="mx-auto mt-6 max-w-4xl animate-fade-up font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight [animation-delay:120ms] sm:text-7xl">
            The Holy Quran, <span className="text-gradient-gold animate-shimmer italic">beautifully</span> understood.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl animate-fade-up text-base text-muted-foreground [animation-delay:240ms] sm:text-lg">
            Read in Arabic with Bangla &amp; English, listen with word-by-word highlighting, explore tafsir, and memorise with a coach that remembers for you.
          </p>
          <p className="mx-auto mt-2 max-w-2xl animate-fade-up font-bangla text-sm text-muted-foreground [animation-delay:300ms]">{site.taglineBn}</p>
          <div className="mt-8 animate-fade-up [animation-delay:380ms]"><HeroSearch /></div>
          <div className="mt-6 flex animate-fade-up flex-wrap items-center justify-center gap-3 [animation-delay:460ms]">
            <Link href="/quran" className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-[0_14px_30px_-12px_var(--glow)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_var(--glow)] active:scale-[0.98]">
              <UiIcon name="read" size={22} /> Start reading
            </Link>
            <Link href="/surah/al-baqarah/255" className="inline-flex h-12 items-center gap-2 rounded-full border bg-card/70 px-6 font-semibold transition hover:-translate-y-0.5 hover:border-primary/40">
              Ayatul Kursi
            </Link>
            <Link href="/hifz" className="inline-flex h-12 items-center gap-2 rounded-full border bg-card/70 px-6 font-semibold transition hover:-translate-y-0.5 hover:border-primary/40">
              <UiIcon name="hifz" size={20} /> Memorise
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 sm:px-6">
        <Reveal><ContinueReading /></Reveal>

        {/* ---------------- VERSE OF THE DAY ---------------- */}
        {verse && (
          <Reveal>
            <section aria-labelledby="votd" className="relative overflow-hidden rounded-[2rem] border bg-gradient-to-br from-card via-card to-accent/60 p-6 sm:p-12">
              <div aria-hidden className="bg-pattern absolute inset-0" />
              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 id="votd" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><UiIcon name="sparkle" size={18} /> Ayah of the day</h2>
                  <Link href={surahHref(s, a)} className="rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-foreground">{ch.nameSimple} · {verse.k}</Link>
                </div>
                <p dir="rtl" lang="ar" className="quran-text mt-8 text-center text-[1.9rem] sm:text-[2.6rem]">
                  {verse.ar} <span className="ayah-marker">{toArabicDigits(a)}</span>
                </p>
                <div className="mx-auto mt-8 max-w-3xl space-y-3 text-center">
                  <p className="font-display text-lg leading-relaxed sm:text-xl">“{verse.en}”</p>
                  <p lang="bn" className="font-bangla text-base leading-relaxed text-muted-foreground">{verse.bn}</p>
                </div>
                <div className="mt-8 flex justify-center gap-3">
                  <Link href={readerHref(s, a)} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5">Read in context</Link>
                  <Link href={surahHref(s, a)} className="rounded-full border bg-card px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5">Tafsir &amp; meaning</Link>
                </div>
              </div>
            </section>
          </Reveal>
        )}

        {/* ---------------- FEATURES BENTO ---------------- */}
        <section aria-labelledby="explore">
          <Reveal><SectionTitle id="explore" kicker="Everything in one place" title="A complete Quran companion" /></Reveal>
          <div className="mt-8 grid auto-rows-[minmax(150px,auto)] grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.href} delay={i * 0.04} className={f.span ?? ''}>
                <Link href={f.href} className="card-soft lift group relative flex h-full flex-col justify-between overflow-hidden p-5 sm:p-6">
                  {f.span && <div aria-hidden className="bg-pattern absolute inset-0" />}
                  <span className={`relative grid place-items-center rounded-2xl bg-surface-2 transition duration-500 group-hover:-rotate-6 group-hover:scale-110 ${f.span ? 'size-20' : 'size-14'}`}>
                    <UiIcon name={f.icon} size={f.span ? 56 : 38} />
                  </span>
                  <span className="relative mt-4 block">
                    <span className={`block font-display font-semibold ${f.span ? 'text-3xl' : 'text-lg'}`}>{f.en}</span>
                    <span className="block font-bangla text-sm text-primary">{f.bn}</span>
                    <span className={`mt-1 block text-muted-foreground ${f.span ? 'text-base' : 'hidden text-sm sm:block'}`}>{f.d}</span>
                  </span>
                  {f.span && (
                    <span className="relative mt-6 block font-arabic text-3xl leading-loose text-arabic/80" dir="rtl">ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ</span>
                  )}
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------- MOODS ---------------- */}
        <section aria-labelledby="feel" className="text-center">
          <Reveal><SectionTitle id="feel" kicker="Quran for the heart" title="How are you feeling today?" center /></Reveal>
          <Reveal delay={0.1}>
            <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2.5">
              {MOODS.map((m) => (
                <Link key={m.en} href={`/topics?feeling=${m.en.toLowerCase()}`} className="group inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 hover:border-primary/50 hover:bg-accent active:scale-95">
                  <span className="transition-transform group-hover:scale-125">{m.emoji}</span> {m.en} <span className="font-bangla text-muted-foreground">· {m.bn}</span>
                </Link>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ---------------- POPULAR SURAHS ---------------- */}
        <section aria-labelledby="popular">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <SectionTitle id="popular" kicker="Most read" title="Popular surahs" />
              <Link href="/quran" className="shrink-0 text-sm font-semibold text-primary hover:underline">All 114 →</Link>
            </div>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {POPULAR.map((id, i) => {
              const c = chapters[id - 1]
              return (
                <Reveal key={id} delay={i * 0.04}>
                  <Link href={surahHref(id)} className="card-soft lift group flex items-center gap-4 p-4">
                    <StarBadge n={id} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{c.nameSimple}</span>
                      <span className="block truncate text-xs text-muted-foreground">{c.meaning} · <span className="font-bangla">{surahNamesBn[id - 1]}</span></span>
                    </span>
                    <span className="font-arabic text-2xl text-muted-foreground transition-colors group-hover:text-gold">{c.nameArabic}</span>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </section>

        {/* ---------------- WHY NOOR ---------------- */}
        <Reveal>
          <section aria-labelledby="why" className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#0b4a38,#0e6b51_45%,#123d33)] p-8 text-white sm:p-14">
            <div aria-hidden className="absolute inset-0 bg-[url('/patterns/girih.svg')] bg-[length:120px] opacity-[0.08] invert" />
            <StarRing className="absolute -right-24 -top-24 w-[28rem] animate-spin-slow text-[#f0cf7c] opacity-20" />
            <div className="relative grid gap-10 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f0cf7c]">Why Noor</p>
                <h2 id="why" className="mt-3 font-display text-3xl font-semibold sm:text-5xl">Built with love. Free forever. No ads.</h2>
                <p className="mt-4 max-w-lg text-white/75">Every verse is pre-rendered for instant loading, works offline as an app, and keeps your bookmarks, notes and progress private on your device.</p>
              </div>
              <ul className="grid grid-cols-2 gap-4 text-sm">
                {[['6,236', 'ayahs with 3 translations'], ['20+', 'world-class reciters'], ['5', 'reading themes'], ['0', 'ads or trackers']].map(([n, l]) => (
                  <li key={l} className="rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur">
                    <span className="block font-display text-4xl font-semibold text-[#f0cf7c]">{n}</span>
                    <span className="text-white/75">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  )
}

function SectionTitle({ id, kicker, title, center }: { id: string; kicker: string; title: string; center?: boolean }) {
  return (
    <div className={center ? 'text-center' : ''}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{kicker}</p>
      <h2 id={id} className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
    </div>
  )
}

function StarBadge({ n }: { n: number }) {
  return (
    <span className="relative grid size-12 shrink-0 place-items-center text-sm font-bold">
      <svg viewBox="0 0 48 48" className="absolute inset-0 text-gold transition-transform duration-700 group-hover:rotate-45" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M24 3l6.2 8.8L41 9.5l-2.3 10.8L45 24l-6.3 3.7L41 38.5l-10.8-2.3L24 45l-6.2-8.8L7 38.5l2.3-10.8L3 24l6.3-3.7L7 9.5l10.8 2.3z" fill="var(--gold-soft)" fillOpacity="0.5" />
      </svg>
      <span className="relative">{n}</span>
    </span>
  )
}

function StarRing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} fill="none" stroke="currentColor" strokeWidth="0.8" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <g key={i} transform={`rotate(${i * 15} 200 200)`}>
          <rect x="80" y="80" width="240" height="240" />
        </g>
      ))}
      <circle cx="200" cy="200" r="170" />
      <circle cx="200" cy="200" r="196" strokeDasharray="2 6" />
      <circle cx="200" cy="200" r="60" />
    </svg>
  )
}
