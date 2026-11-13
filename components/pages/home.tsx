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
import { localeHref, alternatesFor, type Locale } from '@/lib/i18n/routes'
import { bnNum } from '@/lib/i18n/t'
import { T, NotAr } from '@/lib/i18n/text'
import { SurahName, SurahMeaning } from '@/lib/i18n/surah-name'

export function homeMeta(locale: Locale): Metadata {
  if (locale !== 'bn') {
    const title = `${site.name} — Read Al Quran Online in Bangla & English`
    const description = 'Read the Holy Quran with Arabic, Bangla & English translation, word-by-word, tajweed, tafsir and audio, plus duas, the 99 Names and prayer times. Free, ad-free.'
    return { title: { absolute: title }, description, alternates: alternatesFor('/', 'en'), twitter: { card: 'summary_large_image', title, description } }
  }
  const title = 'নূর কুরআন — বাংলা অর্থসহ আল কুরআন পড়ুন, শুনুন ও মুখস্থ করুন'
  return {
    title: { absolute: title },
    description: site.descriptionBn,
    keywords: ['আল কুরআন', 'কুরআন শরীফ বাংলা', 'বাংলা অর্থসহ কুরআন', 'কুরআন তিলাওয়াত', 'আয়াতুল কুরসি', 'সূরা ইয়াসিন', 'সূরা মুলক', 'দোয়া', 'আল্লাহর ৯৯ নাম', 'নামাজের সময়'],
    alternates: alternatesFor('/', 'bn'),
    openGraph: { type: 'website', siteName: `${site.name} · নূর কুরআন`, title, description: site.descriptionBn, url: `${site.url}/bn`, locale: 'bn_BD', alternateLocale: ['en_US'], images: [{ url: '/bn/opengraph-image', width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description: site.descriptionBn },
  }
}

const DAILY = ['2:255', '94:5', '13:28', '65:3', '39:53', '2:186', '3:139', '2:152', '29:69', '93:5', '40:60', '2:286', '8:46', '3:159', '17:24', '49:13', '55:13', '16:97', '20:114', '21:87', '28:24', '2:201', '14:7', '3:173', '25:63', '31:17', '57:4', '50:16', '7:56', '10:62']

const FEATURES = [
  { href: '/quran', icon: 'quran', en: 'Read the Quran', ar: 'اقرأ القرآن', bn: 'কুরআন পড়ুন', d: 'Uthmani script, Bangla & English, tajweed colours, word-by-word', dAr: 'الرسم العثماني وترجمة بنغالية وإنجليزية وألوان التجويد وكلمة بكلمة', dBn: 'উসমানি লিপি, বাংলা ও ইংরেজি অনুবাদ, তাজবীদ রং, শব্দে শব্দে অর্থ', span: 'sm:col-span-2 sm:row-span-2' },
  { href: '/listen', icon: 'listen', en: 'Listen', ar: 'استماع', bn: 'তিলাওয়াত', d: '20+ reciters, word-synced highlighting', dAr: 'أكثر من 20 قارئًا مع تمييز الكلمات أثناء التلاوة', dBn: '২০+ ক্বারী, শব্দে শব্দে হাইলাইট' },
  { href: '/hifz', icon: 'hifz', en: 'Hifz Studio', ar: 'استوديو الحفظ', bn: 'হিফজ স্টুডিও', d: 'Memorise with spaced repetition & voice check', dAr: 'احفظ بالتكرار المتباعد والتحقق الصوتي', dBn: 'স্পেসড রিপিটেশন ও ভয়েস চেকসহ মুখস্থ করুন' },
  { href: '/topics', icon: 'topics', en: 'Quran by Topic', ar: 'القرآن حسب الموضوع', bn: 'বিষয়ভিত্তিক', d: 'What the Quran says about life’s questions', dAr: 'ماذا يقول القرآن عن أسئلة الحياة', dBn: 'জীবনের প্রশ্নে কুরআন কী বলে' },
  { href: '/dua', icon: 'dua', en: 'Duas', ar: 'الأدعية', bn: 'দোয়া', d: 'Authentic duas with sources', dAr: 'أدعية صحيحة مع مصادرها', dBn: 'উৎসসহ প্রামাণ্য দোয়া' },
  { href: '/names-of-allah', icon: 'names', en: '99 Names', ar: 'الأسماء الحسنى', bn: '৯৯ নাম', d: 'Asma ul Husna with meanings', dAr: 'أسماء الله الحسنى ومعانيها', dBn: 'আসমাউল হুসনা অর্থসহ' },
  { href: '/prayer-times', icon: 'prayer', en: 'Prayer Times', ar: 'مواقيت الصلاة', bn: 'নামাজের সময়', d: 'For your exact location', dAr: 'حسب موقعك بدقة', dBn: 'আপনার অবস্থান অনুযায়ী' },
  { href: '/qibla', icon: 'qibla', en: 'Qibla', ar: 'القبلة', bn: 'কিবলা', d: 'Live compass', dAr: 'بوصلة مباشرة', dBn: 'লাইভ কম্পাস' },
  { href: '/journey', icon: 'journey', en: 'Khatam Planner', ar: 'مخطط الختمة', bn: 'খতম পরিকল্পনা', d: 'Streaks, goals & progress', dAr: 'مواظبة وأهداف وتقدّم', dBn: 'স্ট্রিক, লক্ষ্য ও অগ্রগতি' },
]

const MOODS = [
  { slug: 'anxiety', en: 'Anxious', ar: 'قلِق', bn: 'দুশ্চিন্তাগ্রস্ত', emoji: '🌧️' }, { slug: 'grief-sadness', en: 'Sad', ar: 'حزين', bn: 'দুঃখিত', emoji: '💧' }, { slug: 'gratitude', en: 'Grateful', ar: 'شاكر', bn: 'কৃতজ্ঞ', emoji: '🌿' },
  { slug: 'loneliness', en: 'Lonely', ar: 'وحيد', bn: 'একাকী', emoji: '🌙' }, { slug: 'hopelessness', en: 'Hopeless', ar: 'يائس', bn: 'হতাশ', emoji: '🕯️' }, { slug: 'anger', en: 'Angry', ar: 'غاضب', bn: 'রাগান্বিত', emoji: '🔥' },
  { slug: 'guilt-forgiveness', en: 'Guilty', ar: 'نادم', bn: 'অনুতপ্ত', emoji: '🤲' }, { slug: 'fear', en: 'Afraid', ar: 'خائف', bn: 'ভীত', emoji: '🛡️' },
]

const POPULAR = [36, 67, 18, 55, 56, 1, 2, 112]

export async function HomePage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const day = Math.floor(Date.now() / 86_400_000)
  const [s, a] = DAILY[day % DAILY.length].split(':').map(Number)
  const [verse, chapters] = await Promise.all([getVerse(s, a), getChapters()])
  const ch = chapters[s - 1]

  return (
    <div className="pb-10">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebApplication', name: site.name, url: site.url, applicationCategory: 'ReferenceApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, inLanguage: bn ? 'bn' : ['en', 'bn', 'ar'], description: bn ? site.descriptionBn : site.description, ...(bn ? { url: `${site.url}/bn` } : {}) }} />

      {/* ---------------- HERO ---------------- */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-12rem] size-[46rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)]" />
          <div className="bg-pattern absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
          <StarRing className="absolute left-1/2 top-8 w-[44rem] max-w-[140vw] -translate-x-1/2 animate-spin-slow text-gold opacity-[0.16]" />
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-24">
          <p className="animate-fade-up font-arabic text-3xl text-gold sm:text-4xl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
          {bn ? (
            <>
              <h1 className="mx-auto mt-6 max-w-4xl animate-fade-up font-display text-[2.4rem] font-semibold leading-[1.2] [animation-delay:120ms] sm:text-6xl">
                পবিত্র কুরআন, <span className="text-gradient-gold animate-shimmer">অর্থসহ</span> বুঝে পড়ুন
              </h1>
              <p className="mx-auto mt-5 max-w-2xl animate-fade-up text-base text-muted-foreground [animation-delay:240ms] sm:text-lg">
                আরবির সঙ্গে বাংলা ও ইংরেজি অনুবাদে পড়ুন, শব্দে শব্দে হাইলাইটসহ তিলাওয়াত শুনুন, তাফসীর দেখুন এবং এমন এক সহায়কের সঙ্গে মুখস্থ করুন যে আপনার রিভিশনের হিসাব রাখে।
              </p>
            </>
          ) : (
            <>
              <h1 className="mx-auto mt-6 max-w-4xl animate-fade-up font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight [animation-delay:120ms] sm:text-7xl">
                <T en="The Holy Quran, " ar="القرآن الكريم، " /><span className="text-gradient-gold animate-shimmer italic"><T en="beautifully" ar="فهمٌ" /></span> <T en="understood." ar="أعمق وأجمل." />
              </h1>
              <p className="mx-auto mt-5 max-w-2xl animate-fade-up text-base text-muted-foreground [animation-delay:240ms] sm:text-lg">
                <T en="Read in Arabic with Bangla & English, listen with word-by-word highlighting, explore tafsir, and memorise with a coach that remembers for you." ar="اقرأ بالعربية مع الترجمة البنغالية والإنجليزية، واستمع مع تظليل كل كلمة، واستكشف التفسير، واحفظ مع مساعد يتذكّر عنك مواعيد المراجعة." />
              </p>
              <p className="mx-auto mt-2 max-w-2xl animate-fade-up font-bangla text-sm text-muted-foreground [animation-delay:300ms]">{site.taglineBn}</p>
            </>
          )}
          <div className="mt-8 animate-fade-up [animation-delay:380ms]"><HeroSearch /></div>
          <div className="mt-6 flex animate-fade-up flex-wrap items-center justify-center gap-3 [animation-delay:460ms]">
            <Link href={h('/quran')} className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-[0_14px_30px_-12px_var(--glow)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_var(--glow)] active:scale-[0.98]">
              <UiIcon name="read" size={22} /> {bn ? 'পড়া শুরু করুন' : <T en="Start reading" ar="ابدأ القراءة" />}
            </Link>
            <Link href={h('/surah/al-baqarah/255')} className="inline-flex h-12 items-center gap-2 rounded-full border bg-card/70 px-6 font-semibold transition hover:-translate-y-0.5 hover:border-primary/40">
              {bn ? 'আয়াতুল কুরসি' : <T en="Ayatul Kursi" ar="آية الكرسي" />}
            </Link>
            <Link href={h('/hifz')} className="inline-flex h-12 items-center gap-2 rounded-full border bg-card/70 px-6 font-semibold transition hover:-translate-y-0.5 hover:border-primary/40">
              <UiIcon name="hifz" size={20} /> {bn ? 'মুখস্থ করুন' : <T en="Memorise" ar="احفظ" />}
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
                  <h2 id="votd" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><UiIcon name="sparkle" size={18} /> {bn ? 'আজকের আয়াত' : <T en="Ayah of the day" ar="آية اليوم" />}</h2>
                  <Link href={h(surahHref(s, a))} className="rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-foreground">{bn ? `${surahNamesBn[s - 1]} · ${bnNum(s)}:${bnNum(a)}` : <><SurahName id={s} /> · {verse.k}</>}</Link>
                </div>
                <p dir="rtl" lang="ar" className="quran-text mt-8 text-center text-[1.9rem] sm:text-[2.6rem]">
                  {verse.ar} <span className="ayah-marker">{toArabicDigits(a)}</span>
                </p>
                <div className="mx-auto mt-8 max-w-3xl space-y-3 text-center">
                  {bn ? (
                    <>
                      <p lang="bn" className="text-lg leading-relaxed sm:text-xl">“{verse.bn}”</p>
                      <p lang="en" className="font-display text-base leading-relaxed text-muted-foreground">{verse.en}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-display text-lg leading-relaxed sm:text-xl">“{verse.en}”</p>
                      <p lang="bn" className="font-bangla text-base leading-relaxed text-muted-foreground">{verse.bn}</p>
                    </>
                  )}
                </div>
                <div className="mt-8 flex justify-center gap-3">
                  <Link href={h(readerHref(s, a))} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5">{bn ? 'প্রসঙ্গসহ পড়ুন' : <T en="Read in context" ar="اقرأ في السياق" />}</Link>
                  <Link href={h(surahHref(s, a))} className="rounded-full border bg-card px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5">{bn ? 'তাফসীর ও অর্থ' : <T en="Tafsir & meaning" ar="التفسير والمعنى" />}</Link>
                </div>
              </div>
            </section>
          </Reveal>
        )}

        {/* ---------------- FEATURES BENTO ---------------- */}
        <section aria-labelledby="explore">
          <Reveal><SectionTitle id="explore" kicker={bn ? 'সবকিছু এক জায়গায়' : <T en="Everything in one place" ar="كل شيء في مكان واحد" />} title={bn ? 'কুরআন চর্চার পূর্ণাঙ্গ সঙ্গী' : <T en="A complete Quran companion" ar="رفيقك المتكامل مع القرآن" />} /></Reveal>
          <div className="mt-8 grid auto-rows-[minmax(150px,auto)] grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.href} delay={i * 0.04} className={f.span ?? ''}>
                <Link href={h(f.href)} className="card-soft lift group relative flex h-full flex-col justify-between overflow-hidden p-5 sm:p-6">
                  {f.span && <div aria-hidden className="bg-pattern absolute inset-0" />}
                  <span className={`relative grid place-items-center rounded-2xl bg-surface-2 transition duration-500 group-hover:-rotate-6 group-hover:scale-110 ${f.span ? 'size-20' : 'size-14'}`}>
                    <UiIcon name={f.icon} size={f.span ? 56 : 38} />
                  </span>
                  <span className="relative mt-4 block">
                    <span className={`block font-display font-semibold ${f.span ? 'text-3xl' : 'text-lg'}`}>{bn ? f.bn : <T en={f.en} ar={f.ar} />}</span>
                    {!bn && <NotAr><span className="block font-bangla text-sm text-primary">{f.bn}</span></NotAr>}
                    <span className={`mt-1 block text-muted-foreground ${f.span ? 'text-base' : 'hidden text-sm sm:block'}`}>{bn ? f.dBn : <T en={f.d} ar={f.dAr} />}</span>
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
          <Reveal><SectionTitle id="feel" kicker={bn ? 'হৃদয়ের জন্য কুরআন' : <T en="Quran for the heart" ar="القرآن للقلب" />} title={bn ? 'আজ আপনার মন কেমন?' : <T en="How are you feeling today?" ar="كيف تشعر اليوم؟" />} center /></Reveal>
          <Reveal delay={0.1}>
            <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2.5">
              {MOODS.map((m) => (
                <Link key={m.en} href={h(`/topics/${m.slug}`)} className="group inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 hover:border-primary/50 hover:bg-accent active:scale-95">
                  <span className="transition-transform group-hover:scale-125">{m.emoji}</span> {bn ? m.bn : <><T en={m.en} ar={m.ar} /> <NotAr><span className="font-bangla text-muted-foreground">· {m.bn}</span></NotAr></>}
                </Link>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ---------------- POPULAR SURAHS ---------------- */}
        <section aria-labelledby="popular">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <SectionTitle id="popular" kicker={bn ? 'সবচেয়ে বেশি পঠিত' : <T en="Most read" ar="الأكثر قراءة" />} title={bn ? 'জনপ্রিয় সূরা' : <T en="Popular surahs" ar="سور مختارة" />} />
              <Link href={h('/quran')} className="shrink-0 text-sm font-semibold text-primary hover:underline">{bn ? 'সব ১১৪টি সূরা' : <T en="All 114" ar="السور الـ114 كلها" />} <span className="inline-block rtl:rotate-180">→</span></Link>
            </div>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {POPULAR.map((id, i) => {
              const c = chapters[id - 1]
              return (
                <Reveal key={id} delay={i * 0.04}>
                  <Link href={h(surahHref(id))} className="card-soft lift group flex items-center gap-4 p-4">
                    <StarBadge n={bn ? bnNum(id) : id} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{bn ? `সূরা ${surahNamesBn[id - 1]}` : <SurahName id={id} />}</span>
                      <span className="block truncate text-xs text-muted-foreground">{bn ? <>{bnNum(c.versesCount)} আয়াত</> : <><SurahMeaning id={id} /> <NotAr><span className="font-bangla">· {surahNamesBn[id - 1]}</span></NotAr></>}</span>
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
            <StarRing className="absolute -end-24 -top-24 w-[28rem] animate-spin-slow text-[#f0cf7c] opacity-20" />
            <div className="relative grid gap-10 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f0cf7c]">{bn ? 'কেন নূর' : <T en="Why Noor" ar="لماذا نور" />}</p>
                <h2 id="why" className="mt-3 font-display text-3xl font-semibold sm:text-5xl">{bn ? 'ভালোবাসায় তৈরি। চিরকাল ফ্রি। কোনো বিজ্ঞাপন নেই।' : <T en="Built with love. Free forever. No ads." ar="صُنع بحب. مجاني للأبد. بلا إعلانات." />}</h2>
                <p className="mt-4 max-w-lg text-white/75">{bn ? 'প্রতিটি আয়াত আগেই তৈরি থাকে বলে মুহূর্তে লোড হয়, অ্যাপ হিসেবে অফলাইনেও চলে, আর আপনার বুকমার্ক, নোট ও অগ্রগতি থাকে আপনার ডিভাইসেই, সম্পূর্ণ ব্যক্তিগত।' : <T en="Every verse is pre-rendered for instant loading, works offline as an app, and keeps your bookmarks, notes and progress private on your device." ar="كل آية مُجهَّزة مسبقًا للتحميل الفوري، ويعمل كتطبيق دون إنترنت، وتبقى علاماتك وملاحظاتك وتقدّمك خاصة على جهازك." />}</p>
              </div>
              <ul className="grid grid-cols-2 gap-4 text-sm">
                {(bn ? [['৬,২৩৬', 'আয়াত, ৩টি অনুবাদসহ', ''], ['২০+', 'বিশ্বখ্যাত ক্বারী', ''], ['৫', 'পড়ার থিম', ''], ['০', 'বিজ্ঞাপন বা ট্র্যাকার', '']] : [['6,236', 'ayahs with 3 translations', 'آية بثلاث ترجمات'], ['20+', 'world-class reciters', 'قارئًا من أشهر القرّاء'], ['5', 'reading themes', 'أنماط للقراءة'], ['0', 'ads or trackers', 'إعلانات أو متتبّعات']]).map(([n, l, la]) => (
                  <li key={l} className="rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur">
                    <span className="block font-display text-4xl font-semibold text-[#f0cf7c]">{n}</span>
                    <span className="text-white/75">{bn ? l : <T en={l} ar={la} />}</span>
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

function SectionTitle({ id, kicker, title, center }: { id: string; kicker: React.ReactNode; title: React.ReactNode; center?: boolean }) {
  return (
    <div className={center ? 'text-center' : ''}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{kicker}</p>
      <h2 id={id} className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
    </div>
  )
}

function StarBadge({ n }: { n: number | string }) {
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
