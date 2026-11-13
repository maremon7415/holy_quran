import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { AyahCard } from '@/components/content/ayah-card'
import { Faq } from '@/components/content/faq'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { Reveal } from '@/components/content/reveal'
import { ShareButton } from '@/components/content/copy-button'
import { NamesExplorer } from '@/components/content/names-grid'
import { asmaUlHusna, asmaBySlug } from '@/data/content/asma-ul-husna'
import { getVersesByRefs } from '@/lib/quran/data'
import { articleLd, buildMeta, clip, collectionLd } from '@/lib/content/seo'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { bnNum } from '@/lib/i18n/t'
import { refLabelL } from '@/lib/i18n/quran'
import { T, NotAr } from '@/lib/i18n/text'
import { Labelled } from '@/lib/i18n/labelled'

/* ───────────────────────────── /names-of-allah ───────────────────────────── */

const indexCopy = {
  en: {
    title: '99 Names of Allah (Asma ul Husna): Arabic, Meaning & Quran Reference | আল্লাহর ৯৯ নাম অর্থসহ',
    description: 'All 99 Beautiful Names of Allah (Asma ul Husna) in Arabic with transliteration, English and Bangla meaning, a short explanation and a Quran reference for each. Flashcards and quiz included. আল্লাহর ৯৯টি সুন্দর নাম অর্থসহ।',
    keywords: ['99 names of Allah', 'Asma ul Husna', '99 names of Allah meaning', 'Allah names in Arabic', 'আল্লাহর ৯৯ নাম', 'আসমাউল হুসনা', 'আল্লাহর নামের অর্থ'],
  },
  bn: {
    title: 'আল্লাহর ৯৯ নাম বাংলা অর্থসহ (আসমাউল হুসনা) | আরবি, উচ্চারণ ও ব্যাখ্যা',
    description: 'আল্লাহর ৯৯টি সুন্দর নাম (আসমাউল হুসনা) — আরবি, বাংলা উচ্চারণ, অর্থ, সংক্ষিপ্ত ব্যাখ্যা ও কুরআনের রেফারেন্সসহ। ফ্ল্যাশকার্ড ও কুইজের মাধ্যমে মুখস্থ করুন।',
    keywords: ['আল্লাহর ৯৯ নাম', 'আল্লাহর ৯৯ নাম বাংলা অর্থসহ', 'আসমাউল হুসনা', 'আল্লাহর নামের অর্থ', 'আল্লাহর গুণবাচক নাম', '99 names of Allah bangla'],
  },
}

export const namesIndexMeta = (locale: Locale): Metadata => buildMeta({ ...indexCopy[locale], path: '/names-of-allah', locale, ogImage: locale === 'bn' ? '/bn/opengraph-image' : undefined })

const faqsEn = [
  { q: 'What are the 99 Names of Allah?', a: 'The 99 Names of Allah, known as Asma ul Husna (the Most Beautiful Names), are names and attributes by which Allah describes Himself in the Quran and the Sunnah, such as Ar-Rahman (the Most Gracious), Al-Ghafur (the Great Forgiver) and Al-Hakim (the All-Wise).' },
  { q: 'Where does the Quran mention the Beautiful Names?', a: 'The Quran says “To Allah belong the best names, so invoke Him by them” (7:180) and lists many of them together in Surah al-Hashr, 59:22–24.' },
  { q: 'আল্লাহর ৯৯ নাম কী?', a: 'আল্লাহর ৯৯টি সুন্দর নামকে আসমাউল হুসনা বলা হয়। কুরআন ও হাদিসে আল্লাহ নিজের যে নাম ও গুণাবলি উল্লেখ করেছেন, যেমন আর-রহমান, আল-গফুর, আল-হাকীম, সেগুলোই এর অন্তর্ভুক্ত।' },
  { q: 'Is the list of 99 Names the same everywhere?', a: 'Scholars agree on most of the names, but the exact list of 99 varies slightly between sources, because the hadith about the 99 names does not itself enumerate them. This page follows a widely used list, and marks where a name is derived from an attribute in the Quran rather than appearing in the verse as a name.' },
]
const faqsBn = [
  { q: 'আল্লাহর ৯৯ নাম কী?', a: 'আল্লাহর ৯৯টি সুন্দর নামকে আসমাউল হুসনা বলা হয়। কুরআন ও হাদিসে আল্লাহ নিজের যে নাম ও গুণাবলি উল্লেখ করেছেন, যেমন আর-রহমান (পরম করুণাময়), আল-গফুর (মহাক্ষমাশীল), আল-হাকীম (প্রজ্ঞাময়), সেগুলোই এর অন্তর্ভুক্ত।' },
  { q: 'কুরআনের কোথায় আল্লাহর সুন্দর নামের কথা আছে?', a: 'কুরআনে বলা হয়েছে, “আল্লাহর জন্যই রয়েছে সুন্দর নামসমূহ, সুতরাং সেগুলো দিয়েই তাঁকে ডাকো” (৭:১৮০)। সূরা হাশরের ৫৯:২২–২৪ আয়াতে একসঙ্গে অনেকগুলো নাম উল্লেখ করা হয়েছে।' },
  { q: 'সব জায়গায় কি ৯৯ নামের তালিকা একই?', a: 'অধিকাংশ নামের ব্যাপারে আলেমগণ একমত, তবে উৎসভেদে তালিকায় সামান্য পার্থক্য আছে, কারণ ৯৯ নামের হাদিসে নামগুলো আলাদাভাবে গণনা করা হয়নি। এই পাতায় বহুল প্রচলিত তালিকা অনুসরণ করা হয়েছে, এবং যে নাম কুরআনে সরাসরি নাম হিসেবে নয় বরং গুণ হিসেবে এসেছে তা চিহ্নিত করা হয়েছে।' },
]

export function NamesIndexPage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const items = asmaUlHusna.map(({ ref: _r, attr: _a, ...n }) => n)
  return (
    <div className={pageShell}>
      <JsonLd data={collectionLd({
        name: bn ? 'আল্লাহর ৯৯ নাম' : '99 Names of Allah', description: indexCopy[locale].description, path: h('/names-of-allah'), inLanguage: bn ? 'bn' : undefined,
        items: asmaUlHusna.map((n) => ({ name: bn ? `${n.tlBn} (${n.ar}) – ${n.bn}` : `${n.tl} (${n.ar}) – ${n.en}`, href: h(`/names-of-allah/${n.slug}`) })),
      })} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'আল্লাহর ৯৯ নাম' : '99 Names of Allah', href: '/names-of-allah' }]} className="mb-4" />
      {bn ? (
        <PageHero
          eyebrow="আসমাউল হুসনা"
          icon="names"
          arabic="أَسْمَاءُ ٱللَّهِ ٱلْحُسْنَىٰ"
          title="আল্লাহর ৯৯টি সুন্দর নাম"
          subtitle="প্রতিটি নামের অর্থ, ব্যাখ্যা ও কুরআনের রেফারেন্স সহ। কার্ডে ট্যাপ করে অর্থ দেখুন, ফ্ল্যাশকার্ডে অনুশীলন করুন বা কুইজে নিজেকে যাচাই করুন।"
        />
      ) : (
        <PageHero
          eyebrow={<><T en="Asma ul Husna" ar="أسماء الله الحسنى" /><NotAr> · আসমাউল হুসনা</NotAr></>}
          icon="names"
          arabic="أَسْمَاءُ ٱللَّهِ ٱلْحُسْنَىٰ"
          title={<T en="The 99 Beautiful Names of Allah" ar="أسماء الله الحسنى التسعة والتسعون" />}
          subtitle={<T en="Tap a card to reveal its meaning, practise with flashcards, or test yourself with a quiz." ar="اضغط على البطاقة لتعرف معناها، وتدرّب بالبطاقات التعليمية، أو اختبر نفسك." />}
        />
      )}
      <div className="mt-6"><NamesExplorer names={items} /></div>
      <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
        <h2 className="font-display mb-2 text-xl font-semibold text-foreground">{bn ? 'এক নজরে ৯৯টি নাম' : <T en="All 99 names at a glance" ar="الأسماء التسعة والتسعون في لمحة" />}</h2>
        <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
          {asmaUlHusna.map((n) => (
            <li key={n.n}>
              <Link href={h(`/names-of-allah/${n.slug}`)} className="hover:text-primary">
                <span className="inline-block w-7 text-xs text-muted-foreground">{bn ? bnNum(n.n) : n.n}.</span>
                {bn ? <>{n.tlBn} <span lang="ar" className="font-arabic">({n.ar})</span> – {n.bn}</> : <><NotAr>{n.tl} </NotAr><span lang="ar" className="font-arabic">{n.ar}</span> – <T en={n.en} ar={n.meaningAr} /></>}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Faq faqs={bn ? faqsBn : faqsEn} locale={bn ? 'bn' : undefined} />
    </div>
  )
}

/* ───────────────────────────── /names-of-allah/[slug] ───────────────────────────── */

export type SlugProps = { params: Promise<{ slug: string }> }
export const nameParams = () => asmaUlHusna.map((n) => ({ slug: n.slug }))

export async function nameMeta(locale: Locale, { params }: SlugProps): Promise<Metadata> {
  const { slug } = await params
  const n = asmaBySlug(slug)
  if (!n) return {}
  const path = `/names-of-allah/${n.slug}`
  if (locale === 'bn') {
    return buildMeta({
      title: `${n.tlBn} (${n.ar}) অর্থ কী? আল্লাহর ${bnNum(n.n)} নম্বর নাম | ${n.tl}`,
      description: clip(`${n.tlBn} (${n.ar}) অর্থ “${n.bn}”। ${n.expBn} আল্লাহর ৯৯ নামের ${bnNum(n.n)} নম্বর নাম, কুরআনের রেফারেন্সসহ।`, 165),
      path, locale, type: 'article', ogImage: `${localeHref(locale, path)}/opengraph-image`,
      keywords: [`${n.tlBn} অর্থ`, `${n.tlBn} আল্লাহর নাম`, `${n.tlBn} নামের অর্থ`, `${n.tl} meaning`, 'আল্লাহর ৯৯ নাম', 'আসমাউল হুসনা'],
    })
  }
  return buildMeta({
    title: `${n.tl} (${n.ar}) — Meaning of the Name of Allah | ${n.tlBn} অর্থ`,
    description: clip(`${n.tl} (${n.ar}) means “${n.en}”. ${n.expEn} Name ${n.n} of the 99 Names of Allah, with Quran reference. ${n.tlBn} অর্থ: ${n.bn}।`, 165),
    path, type: 'article',
    keywords: [`${n.tl} meaning`, `${n.tl} name of Allah`, `${n.tl} ${n.ar}`, `${n.tlBn} অর্থ`, `${n.tlBn} আল্লাহর নাম`, '99 names of Allah'],
  })
}

export async function NamePage({ locale, params }: SlugProps & { locale: Locale }) {
  const { slug } = await params
  const n = asmaBySlug(slug)
  if (!n) notFound()
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const [verse] = await getVersesByRefs([n.ref])
  const idx = n.n - 1
  const prev = asmaUlHusna[(idx + 98) % 99]
  const next = asmaUlHusna[(idx + 1) % 99]
  const path = `/names-of-allah/${n.slug}`
  const ref = refLabelL(locale, n.ref)
  const faqs = bn
    ? [
        { q: `${n.tlBn} এর অর্থ কী?`, a: `${n.tlBn} (${n.ar}) অর্থ “${n.bn}”। ${n.expBn}` },
        { q: n.attr ? `কুরআনে ${n.tlBn} গুণটি কোথায় পাওয়া যায়?` : `কুরআনের কোথায় ${n.tlBn} নামটি এসেছে?`, a: n.attr ? `${n.tlBn} নামটি ঐতিহ্যবাহী ৯৯ নামের তালিকাভুক্ত; এর গুণটি দেখা যায় ${ref} আয়াতে: “${verse.bn}”` : `যেমন, ${ref} আয়াতে নামটি এসেছে: “${verse.bn}”` },
        { q: `৯৯ নামের মধ্যে ${n.tlBn} কত নম্বর?`, a: `বহুল প্রচলিত তালিকায় ${n.tlBn} আল্লাহর ৯৯ নামের ${bnNum(n.n)} নম্বর নাম।` },
      ]
    : [
        { q: `What does ${n.tl} mean?`, a: `${n.tl} (${n.ar}) means “${n.en}”. ${n.expEn}` },
        { q: `${n.tlBn} এর অর্থ কী?`, a: `${n.tlBn} (${n.ar}) অর্থ “${n.bn}”। ${n.expBn}` },
        { q: n.attr ? `Where is the attribute of ${n.tl} found in the Quran?` : `Where is ${n.tl} mentioned in the Quran?`, a: n.attr ? `The name ${n.tl} is included in the traditional list of 99 names; its attribute can be seen in ${ref}: “${verse.en}”` : `The name appears, for example, in ${ref}: “${verse.en}”` },
        { q: `Which number is ${n.tl} among the 99 Names?`, a: `${n.tl} is number ${n.n} in the commonly used list of the 99 Names of Allah.` },
      ]
  const expEn = (
    <Reveal key="en"><section className="card-soft h-full rounded-3xl p-5">
      <h2 className="text-sm font-semibold">{bn ? 'ব্যাখ্যা (ইংরেজি)' : <T en="Explanation" ar="الشرح" />}</h2>
      <p lang="en" className="mt-2 text-[15px] leading-relaxed">{n.expEn}</p>
    </section></Reveal>
  )
  const expBn = (
    <Reveal key="bn" delay={bn ? 0 : 0.05}><section className="card-soft h-full rounded-3xl p-5">
      <h2 className="text-sm font-semibold">ব্যাখ্যা</h2>
      <p lang="bn" className="font-bangla mt-2 text-[15px] leading-relaxed">{n.expBn}</p>
    </section></Reveal>
  )
  return (
    <div className={pageShell}>
      <JsonLd data={articleLd({
        headline: bn ? `${n.tlBn} (${n.ar}) – আল্লাহর নামের অর্থ` : `${n.tl} (${n.ar}) – Meaning of the Name of Allah`,
        description: bn ? `${n.tlBn} অর্থ ${n.bn}। ${n.expBn}` : `${n.tl} means ${n.en}. ${n.expEn}`,
        path: h(path), image: `${h(path)}/opengraph-image`, about: bn ? n.tlBn : n.tl, inLanguage: bn ? 'bn' : undefined,
      })} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'আল্লাহর ৯৯ নাম' : '99 Names of Allah', ar: 'أسماء الله الحسنى', href: '/names-of-allah' }, { name: bn ? n.tlBn : n.tl, ar: n.ar, href: path }]} className="mb-4" />

      <section className="relative isolate overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-accent via-card to-gold-soft/50 px-5 py-10 text-center sm:py-14">
        <div aria-hidden className="bg-pattern absolute inset-0 -z-10 [mask-image:radial-gradient(circle,#000,transparent_72%)]" />
        <span className="inline-grid size-10 place-items-center rounded-full bg-card/80 text-sm font-bold text-primary">{bn ? bnNum(n.n) : n.n}</span>
        <p lang="ar" dir="rtl" className="font-arabic text-gradient-gold mt-2 text-[clamp(4rem,16vw,8rem)] py-3 leading-[1.9]">{n.ar}</p>
        {bn ? (
          <>
            <h1 className="font-display text-3xl font-semibold sm:text-5xl">{n.tlBn}</h1>
            <p lang="bn" className="mx-auto mt-5 max-w-xl text-lg">{n.bn}</p>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-semibold sm:text-5xl"><T en={n.tl} ar={n.ar} /></h1>
            <NotAr><p className="font-bangla mt-1 text-xl text-gold">{n.tlBn}</p></NotAr>
            <p className="mx-auto mt-5 max-w-xl text-lg"><T en={n.en} ar={n.meaningAr} /></p>
            <NotAr><p lang="bn" className="font-bangla mx-auto mt-1 max-w-xl text-lg text-muted-foreground">{n.bn}</p></NotAr>
          </>
        )}
        <div className="mt-6 flex justify-center"><ShareButton title={bn ? `${n.tlBn} – আল্লাহর নাম` : `${n.tl} – Name of Allah`} path={h(path)} /></div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">{bn ? [expBn] : [expEn, expBn]}</div>

      <section className="mt-10" aria-labelledby="ref-h">
        {bn ? (
          <h2 id="ref-h" className="font-display mb-1 text-2xl font-semibold">{n.attr ? 'সংশ্লিষ্ট আয়াত' : 'কুরআনে'}</h2>
        ) : (
          <h2 id="ref-h" className="font-display mb-1 text-2xl font-semibold"><T en={n.attr ? 'Related verse' : 'In the Quran'} ar={n.attr ? 'الآية ذات الصلة' : 'في القرآن'} /> <NotAr><span className="font-bangla text-lg font-medium text-muted-foreground">· {n.attr ? 'সংশ্লিষ্ট আয়াত' : 'কুরআনে'}</span></NotAr></h2>
        )}
        {n.attr && <p className="mb-3 text-sm text-muted-foreground">{bn ? 'এই আয়াতে নামটির গুণ প্রকাশ পেয়েছে; নামটি ঐতিহ্যবাহী ৯৯ নামের তালিকাভুক্ত।' : <T en="This verse shows the attribute behind the name; the name itself is part of the traditional list of 99 names." ar="تُظهر هذه الآية الصفة التي يدل عليها الاسم، والاسم نفسه من الأسماء الحسنى المشهورة." />}</p>}
        <AyahCard verse={verse} locale={locale} />
      </section>

      <Faq faqs={faqs} locale={bn ? 'bn' : undefined} />

      <Labelled as="nav" label={{ en: 'Previous and next Name', bn: 'আগের ও পরের নাম', ar: 'الاسم السابق والتالي' }} className="mt-12 grid gap-3 sm:grid-cols-2">
        <Link href={h(`/names-of-allah/${prev.slug}`)} className="card-soft lift rounded-3xl p-4"><span className="text-xs text-muted-foreground"><span className="inline-block rtl:rotate-180">←</span> {bn ? bnNum(prev.n) : prev.n}</span><span className="mt-1 flex items-baseline justify-between"><span className="font-semibold">{bn ? prev.tlBn : <NotAr>{prev.tl}</NotAr>}</span><span lang="ar" className="font-arabic text-2xl">{prev.ar}</span></span></Link>
        <Link href={h(`/names-of-allah/${next.slug}`)} className="card-soft lift rounded-3xl p-4"><span className="text-xs text-muted-foreground">{bn ? bnNum(next.n) : next.n} <span className="inline-block rtl:rotate-180">→</span></span><span className="mt-1 flex items-baseline justify-between"><span className="font-semibold">{bn ? next.tlBn : <NotAr>{next.tl}</NotAr>}</span><span lang="ar" className="font-arabic text-2xl">{next.ar}</span></span></Link>
      </Labelled>
      <p className="mt-6 text-center text-xs text-muted-foreground"><Link href={h('/names-of-allah')} className="font-semibold text-primary hover:underline"><span className="inline-block rtl:rotate-180">←</span> {bn ? 'আল্লাহর ৯৯টি নাম' : <><T en="All 99 Names" ar="الأسماء الحسنى كلها" /><NotAr>{` · ${bnNum(99)} নাম`}</NotAr></>}</Link></p>
    </div>
  )
}
