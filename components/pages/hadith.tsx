import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { Reveal } from '@/components/content/reveal'
import { Faq } from '@/components/content/faq'
import { UiIcon } from '@/components/ui-icon'
import { CName } from '@/components/hadith/names'
import { CollectionCard, HadithRow } from '@/components/hadith/cards'
import { GradeChip } from '@/components/hadith/grades'
import { HadithSearchForm } from '@/components/hadith/search-form'
import { Pagination } from '@/components/hadith/pagination'
import { buildMeta, clip, collectionLd } from '@/lib/content/seo'
import { absoluteUrl } from '@/lib/site'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { bnNum } from '@/lib/i18n/t'
import { lt } from '@/lib/i18n/lt'
import { T } from '@/lib/i18n/text'
import { COLLECTIONS, collectionMeta, resolveCollectionSlug } from '@/lib/hadith/collections'
import { featured, hadithOfTheDay } from '@/lib/hadith/featured'
import { bookRow, collectionIndex, indexMeta } from '@/lib/hadith/data'
import { getBook, getCollections, getHadith } from '@/lib/hadith/hadith'
import { HadithFetchError } from '@/lib/hadith/fetch'
import { parseHadithNumber } from '@/lib/hadith/numbering'
import { bookUrl, collectionUrl, hadithUrl, BOOK_PAGE_SIZE } from '@/lib/hadith/url'
import { clipText } from '@/lib/hadith/text'


const N = (locale: Locale, v: number | string) => (locale === 'bn' ? bnNum(v) : String(v))
const fmt = (locale: Locale, n: number) => N(locale, n.toLocaleString('en-US'))

/* ───────────────────────────── /hadith ───────────────────────────── */

const indexCopy = {
  en: {
    title: 'Hadith Library: Sahih Bukhari, Muslim, Abu Dawud, Tirmidhi & more | হাদিস',
    description: 'Read and search 30,000+ hadiths from Sahih al-Bukhari, Sahih Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah, Muwatta Malik, Nawawi’s Forty and Hadith Qudsi in Arabic with English and Bangla translation, narrator, grade and citation.',
    keywords: ['hadith', 'Sahih Bukhari hadith', 'Sahih Muslim hadith', 'hadith in Arabic and English', 'hadith about patience', 'Nawawi 40 hadith', 'hadith Bangla', 'হাদিস', 'বুখারী শরীফ', 'মুসলিম শরীফ', 'হাদিস বাংলা'],
  },
  bn: {
    title: 'হাদিস সমগ্র: সহীহ বুখারী, মুসলিম, আবু দাউদ, তিরমিযী | আরবি ও বাংলা অনুবাদ',
    description: 'বুখারী শরীফ, মুসলিম শরীফ, আবু দাউদ, তিরমিযী, নাসায়ী, ইবনে মাজাহ, মুয়াত্তা মালিক, ইমাম নববীর চল্লিশ হাদিস ও হাদিসে কুদসি — আরবি পাঠ, বাংলা ও ইংরেজি অনুবাদ, রাবী, মান ও রেফারেন্সসহ ৩০ হাজারের বেশি হাদিস পড়ুন ও খুঁজুন।',
    keywords: ['হাদিস', 'বুখারী শরীফ হাদিস', 'মুসলিম শরীফ হাদিস', 'সহীহ বুখারী', 'হাদিস বাংলা অনুবাদ', 'নিয়তের হাদিস', 'ধৈর্য সম্পর্কে হাদিস', 'চল্লিশ হাদিস', 'হাদিস সমগ্র'],
  },
}
export const hadithIndexMeta = (locale: Locale): Metadata => buildMeta({ ...indexCopy[locale], path: '/hadith', locale, ogImage: locale === 'bn' ? '/bn/opengraph-image' : undefined })

const POPULAR = [
  { q: 'patience', l: 'en' }, { q: 'intentions', l: 'en' }, { q: 'mercy', l: 'en' }, { q: 'neighbour', l: 'en' },
  { q: 'ধৈর্য', l: 'bn' }, { q: 'নিয়ত', l: 'bn' }, { q: 'দয়া', l: 'bn' }, { q: 'الصبر', l: 'ar' },
]

async function DayCard({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const f = hadithOfTheDay()
  const meta = collectionMeta(f.c)!
  let h = null
  try { h = await getHadith(f.c, f.n) } catch (e) { if (!(e instanceof HadithFetchError)) throw e }
  const e = h?.entries[0]
  const text = e && (bn ? e.bn ?? e.en : e.en ?? e.bn)
  return (
    <section aria-labelledby="hod-h" className="relative isolate overflow-hidden rounded-[2rem] border border-border bg-card p-6 sm:p-8">
      <div aria-hidden className="bg-pattern absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_top_left,#000,transparent_65%)]" />
      <p className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold"><UiIcon name="sparkle" size={14} /> <span id="hod-h">{lt(locale, { en: 'Hadith of the day', bn: 'আজকের হাদিস', ar: 'حديث اليوم' })}</span></p>
      <h2 className="font-display mt-3 text-2xl font-semibold sm:text-3xl" lang={bn ? 'bn' : 'en'}>{bn ? f.bn : f.en}</h2>
      {e?.ar && <p lang="ar" dir="rtl" className="font-arabic text-arabic mt-4 text-right text-[26px] leading-[2.1] sm:text-[30px]">{e.ar}</p>}
      {text ? <p className={`mt-3 text-[16px] leading-[1.85] text-foreground/90 ${bn && e?.bn ? 'font-bangla' : ''}`} lang={bn && e?.bn ? 'bn' : 'en'}>{clipText(text, 600)}</p>
        : <p className="mt-3 text-sm text-muted-foreground">{lt(locale, { en: 'The text could not be loaded right now; open the hadith page below.', bn: 'পাঠ এই মুহূর্তে লোড করা যায়নি; নিচের লিংকে হাদিসটি খুলুন।', ar: 'تعذّر تحميل النص الآن؛ افتح صفحة الحديث أدناه.' })}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link href={hadithUrl(f.c, f.n, locale)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition active:scale-95">
          {lt(locale, { en: 'Read the full hadith', bn: 'সম্পূর্ণ হাদিস পড়ুন', ar: 'اقرأ الحديث كاملًا' })} <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
        <span className="text-sm font-semibold text-muted-foreground" lang={bn ? 'bn' : 'en'}>{bn ? `${meta.name.bn} ${bnNum(f.n)}` : `${meta.cite} ${f.n}`}</span>
        {meta.authenticity === 'consensus' && <GradeChip category="sahih" locale={locale} />}
      </div>
    </section>
  )
}

export async function HadithIndexPage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const sums = getCollections()
  const total = sums.reduce((a, s) => a + s.count, 0)
  const h = (p: string) => localeHref(locale, p)
  const famous = featured.filter((f, i, a) => a.findIndex((x) => x.c === f.c && x.n === f.n) === i && f.c !== 'nawawi40').slice(0, 12)
  const faqs = bn ? [
    { q: 'এখানে কোন কোন হাদিস গ্রন্থ আছে?', a: 'সহীহ বুখারী, সহীহ মুসলিম, সুনানে আবু দাউদ, জামে আত-তিরমিযী, সুনানে নাসায়ী, সুনানে ইবনে মাজাহ, মুয়াত্তা ইমাম মালিক, ইমাম নববীর চল্লিশ হাদিস ও চল্লিশ হাদিসে কুদসি।' },
    { q: 'হাদিসের নম্বর কীভাবে দেওয়া হয়েছে?', a: 'প্রচলিতভাবে উদ্ধৃত নম্বর (sunnah.com-এর অনুরূপ) ব্যবহার করা হয়েছে। সহীহ মুসলিমের ক্ষেত্রে মুহাম্মাদ ফুআদ আবদুল বাকী নম্বর; যেমন “সহীহ মুসলিম ২৫৬৪”।' },
    { q: 'সব হাদিসই কি সহীহ?', a: 'না। সহীহ বুখারী ও সহীহ মুসলিমের হাদিস আলেমদের ঐকমত্যে সহীহ হিসেবে গৃহীত। অন্য গ্রন্থগুলোতে সহীহ, হাসান ও দাঈফ বর্ণনা রয়েছে; প্রতিটি হাদিসের পাতায় মুহাদ্দিসদের মান দেখানো হয়েছে।' },
    { q: 'হাদিসের পাঠ ও অনুবাদ কোথা থেকে নেওয়া?', a: 'উন্মুক্ত hadith-api (fawazahmed0) থেকে, যা jsDelivr-এ প্রকাশিত। বিস্তারিত “পরিচিতি” পাতায়।' },
  ] : [
    { q: 'Which hadith collections are available?', a: 'Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami at-Tirmidhi, Sunan an-Nasa’i, Sunan Ibn Majah, Muwatta Malik, An-Nawawi’s Forty Hadith and the Forty Hadith Qudsi, in Arabic with English and Bangla translations.' },
    { q: 'How are the hadiths numbered?', a: 'With the commonly cited numbering (as on sunnah.com). For Sahih Muslim this is the Muhammad Fu’ad ‘Abd al-Baqi numbering, e.g. “Sahih Muslim 2564”. Narrations that share a number appear together as a, b, c.' },
    { q: 'Are all of these hadiths authentic?', a: 'The hadiths of Sahih al-Bukhari and Sahih Muslim are accepted as authentic by the consensus of the scholars. The other collections contain Sahih, Hasan and Da‘if narrations; every hadith page shows the grades given by later scholars.' },
    { q: 'Where do the texts and translations come from?', a: 'From the open hadith-api project (fawazahmed0), published on jsDelivr. See the About page for credits and licence.' },
  ]
  return (
    <div className={pageShell}>
      <JsonLd data={collectionLd({
        name: bn ? 'হাদিস সমগ্র' : 'Hadith Library', description: indexCopy[locale].description, path: h('/hadith'), inLanguage: bn ? 'bn' : undefined,
        items: sums.map((s) => ({ name: bn ? s.name.bn : s.name.en, href: h(`/hadith/${s.slug}`) })),
      })} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'হাদিস' : 'Hadith', ar: 'الحديث', href: '/hadith' }]} className="mb-4" />
      <PageHero
        eyebrow={bn ? 'হাদিস' : <><T en="Hadith" ar="الحديث" /> · হাদিস</>}
        icon="read"
        arabic="قَالَ رَسُولُ ٱللَّهِ ﷺ"
        title={bn ? 'হাদিস সমগ্র' : <T en="Hadith Library" ar="مكتبة الحديث" />}
        subtitle={bn
          ? `${bnNum(total.toLocaleString('en-US'))}টিরও বেশি হাদিস: আরবি পাঠ, বাংলা ও ইংরেজি অনুবাদ, বর্ণনাকারী, মান ও রেফারেন্সসহ। সহীহ বুখারী, মুসলিম ও অন্যান্য প্রধান গ্রন্থ।`
          : <T en={`${total.toLocaleString('en-US')} hadiths from the major collections: Arabic text, English and Bangla translation, narrator, grade and a citation you can trust. Search by topic, or jump straight to “Bukhari 1”.`} bn="" ar={`أكثر من ${total.toLocaleString('en-US')} حديثًا من أمهات الكتب: النص العربي والترجمة الإنجليزية والبنغالية والراوي والحكم والتوثيق.`} />}
      >
        <div className="mt-6 max-w-xl"><HadithSearchForm locale={locale} /></div>
        <ul className="mt-3 flex flex-wrap gap-2" aria-label={bn ? 'জনপ্রিয় অনুসন্ধান' : 'Popular searches'}>
          {POPULAR.filter((p) => (bn ? p.l !== 'en' || p.q === 'patience' : p.l !== 'ar')).map((p) => (
            <li key={p.q}><Link href={`${h('/hadith/search')}?q=${encodeURIComponent(p.q)}`} className="rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-semibold text-foreground/80 hover:border-primary/40 hover:text-primary" lang={p.l}>{p.q}</Link></li>
          ))}
        </ul>
      </PageHero>

      <div className="mt-8"><DayCard locale={locale} /></div>

      <section aria-labelledby="cols-h" className="mt-12">
        <h2 id="cols-h" className="font-display mb-5 text-2xl font-semibold">{lt(locale, { en: 'Collections', bn: 'হাদিস গ্রন্থসমূহ', ar: 'كتب الحديث' })}</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.map((m, i) => (
            <li key={m.slug}><Reveal delay={Math.min(i, 5) * 0.04} className="h-full"><CollectionCard meta={m} sum={sums.find((s) => s.slug === m.slug)!} locale={locale} /></Reveal></li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="famous-h" className="mt-14">
        <h2 id="famous-h" className="font-display mb-5 text-2xl font-semibold">{lt(locale, { en: 'Famous hadiths', bn: 'প্রসিদ্ধ হাদিস', ar: 'أحاديث مشهورة' })}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {famous.map((f) => {
            const m = collectionMeta(f.c)!
            return (
              <li key={`${f.c}-${f.n}`}><Link href={hadithUrl(f.c, f.n, locale)} className="card-soft lift flex h-full flex-col gap-1 rounded-3xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wide text-gold" lang={bn ? 'bn' : 'en'}>{bn ? `${m.name.bn} ${bnNum(f.n)}` : `${m.cite} ${f.n}`}</span>
                <span className="font-semibold leading-snug" lang={bn ? 'bn' : 'en'}>{bn ? f.bn : f.en}</span>
              </Link></li>
            )
          })}
        </ul>
      </section>

      <section className="mt-14 rounded-3xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground">
        <h2 className="font-display mb-2 text-lg font-semibold text-foreground">{lt(locale, { en: 'About these texts and numbering', bn: 'পাঠ ও নম্বর সম্পর্কে', ar: 'عن النصوص والترقيم' })}</h2>
        <p>{lt(locale, {
          en: 'Hadith numbers follow the commonly cited numbering, so “Sahih al-Bukhari 1” and “Sahih Muslim 2564” match the references used in books, lectures and sunnah.com. Texts and translations are served from the open hadith-api project; translation quality varies and none replaces study with qualified teachers. Grades shown on each hadith are the opinions of the scholars named.',
          bn: 'হাদিসের নম্বর প্রচলিত উদ্ধৃত নম্বর অনুসারে, তাই “সহীহ বুখারী ১” বা “সহীহ মুসলিম ২৫৬৪” বই, বক্তৃতা ও sunnah.com-এর রেফারেন্সের সঙ্গে মেলে। পাঠ ও অনুবাদ উন্মুক্ত hadith-api প্রকল্প থেকে; অনুবাদের মান ভিন্ন হতে পারে এবং যোগ্য শিক্ষকের কাছে পড়ার বিকল্প নয়। প্রতিটি হাদিসের মান উল্লেখিত আলেমদের মত।',
          ar: 'يتبع ترقيم الأحاديث الترقيم المتداول في الإحالات، فيطابق «صحيح البخاري ١» و«صحيح مسلم ٢٥٦٤» ما في الكتب والدروس. النصوص والترجمات من مشروع hadith-api المفتوح، وتتفاوت جودة الترجمات ولا تغني عن التعلّم على أهل العلم. والأحكام المعروضة هي آراء العلماء المذكورين.',
        })}</p>
        <p className="mt-2 text-xs">{lt(locale, { en: `Index built ${indexMeta.generated} from ${indexMeta.source}.`, bn: `সূচি তৈরি: ${indexMeta.generated} (${indexMeta.source})।`, ar: `فهرس مبني بتاريخ ${indexMeta.generated} من ${indexMeta.source}.` })}</p>
      </section>

      <Faq faqs={faqs} locale={locale} />
    </div>
  )
}

/* ───────────────────────────── /hadith/[collection] ───────────────────────────── */

export type CollectionProps = { params: Promise<{ collection: string }> }
export const collectionParams = () => COLLECTIONS.map((c) => ({ collection: c.slug }))

export async function collectionPageMeta(locale: Locale, { params }: CollectionProps): Promise<Metadata> {
  const r = resolveCollectionSlug((await params).collection)
  if (!r) return {}
  const m = collectionMeta(r.slug)!
  const idx = collectionIndex(r.slug)
  const path = `/hadith/${m.slug}`
  if (locale === 'bn') {
    return buildMeta({
      title: `${m.name.bn} (${m.aliasBn}) — সকল হাদিস আরবি ও বাংলা অনুবাদসহ | হাদিস ${bnNum(1)}–${bnNum(idx.last)}`,
      description: clip(`${m.name.bn} (${m.aliasBn}): ${bnNum(idx.count)}টি হাদিস, ${bnNum(idx.books.length)}টি অধ্যায়। ${m.desc.bn}`, 165),
      path, locale, keywords: [m.name.bn, m.aliasBn, `${m.aliasBn} হাদিস`, `${m.name.bn} হাদিস বাংলা`, m.cite, 'হাদিস'],
    })
  }
  return buildMeta({
    title: `${m.cite}: all ${idx.count.toLocaleString('en-US')} hadiths in Arabic, English & Bangla | ${m.name.bn}`,
    description: clip(`${m.cite} (${m.name.ar}) by ${m.compiler.en}: ${idx.count.toLocaleString('en-US')} hadiths in ${idx.books.length} books with Arabic text, English and Bangla translation. ${m.desc.en}`, 165),
    path, keywords: [m.cite, `${m.cite} hadith`, `${m.cite} hadith list`, m.name.ar, m.name.bn, m.aliasBn, 'hadith'],
  })
}

export async function CollectionPage({ locale, params }: { locale: Locale } & CollectionProps) {
  const r = resolveCollectionSlug((await params).collection)
  if (!r) notFound()
  if (!r.canonical) permanentRedirect(collectionUrl(r.slug, locale))
  const m = collectionMeta(r.slug)!
  const idx = collectionIndex(r.slug)
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const pop = featured.filter((f) => f.c === m.slug).filter((f, i, a) => a.findIndex((x) => x.n === f.n) === i).slice(0, 8)
  const g = idx.grades
  const gTotal = g ? g.sahih + g.hasan + g.daif + g.other : 0
  const faqs = bn ? [
    { q: `${m.name.bn} কী?`, a: `${m.desc.bn} সংকলক: ${m.compiler.bn}${m.died ? ` (মৃত্যু ${m.died})` : ''}।` },
    { q: `${m.name.bn}-এ কতটি হাদিস আছে?`, a: `এই লাইব্রেরিতে ${bnNum(idx.count)}টি হাদিস ও ${bnNum(idx.books.length)}টি অধ্যায় আছে (নম্বর ${bnNum(idx.first)}–${bnNum(idx.last)})।` },
    { q: `${m.name.bn}-এর সব হাদিস কি সহীহ?`, a: m.authenticity === 'consensus' ? 'আহলুস সুন্নাহর আলেমদের ঐকমত্যে এই গ্রন্থের হাদিস সহীহ হিসেবে গৃহীত।' : 'না, এতে বিভিন্ন মানের বর্ণনা আছে; প্রতিটি হাদিসের পাতায় মুহাদ্দিসদের মান দেখানো হয়েছে।' },
  ] : [
    { q: `What is ${m.cite}?`, a: `${m.desc.en} Compiled by ${m.compiler.en}${m.died ? ` (d. ${m.died})` : ''}.` },
    { q: `How many hadiths are in ${m.cite}?`, a: `This library has ${idx.count.toLocaleString('en-US')} hadiths in ${idx.books.length} books (numbers ${idx.first}–${idx.last}${m.slug === 'muslim' ? ', ‘Abd al-Baqi numbering' : ''}).` },
    { q: `Are all hadiths in ${m.cite} authentic?`, a: m.authenticity === 'consensus' ? `Its hadiths are accepted as authentic by the consensus of the scholars of Ahl as-Sunnah.` : 'No: it contains narrations of different strength. Each hadith page shows the grades given by later scholars.' },
  ]
  return (
    <div className={pageShell}>
      <JsonLd data={[
        collectionLd({ name: bn ? m.name.bn : m.name.en, description: bn ? m.desc.bn : m.desc.en, path: h(`/hadith/${m.slug}`), inLanguage: bn ? 'bn' : undefined, items: idx.books.map((b) => ({ name: `${b[0]}. ${b[1]}`, href: bookUrl(m.slug, b[0], locale) })) }),
        { '@context': 'https://schema.org', '@type': 'Book', '@id': `${absoluteUrl(h(`/hadith/${m.slug}`))}#book`, name: m.name.en, alternateName: [m.name.ar, m.name.bn, m.aliasBn], inLanguage: 'ar', author: { '@type': 'Person', name: m.compiler.en }, url: absoluteUrl(h(`/hadith/${m.slug}`)), numberOfPages: idx.books.length, description: m.desc.en },
      ]} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'হাদিস' : 'Hadith', ar: 'الحديث', href: '/hadith' }, { name: bn ? m.name.bn : m.name.en, ar: m.name.ar, href: `/hadith/${m.slug}` }]} className="mb-4" />
      <PageHero eyebrow={lt(locale, { en: 'Hadith collection', bn: 'হাদিস গ্রন্থ', ar: 'كتاب حديث' })} icon={m.icon} arabic={m.name.ar} title={<CName slug={m.slug} locale={locale} />} subtitle={bn ? m.desc.bn : <T en={m.desc.en} bn={m.desc.bn} ar={m.desc.ar} />}>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-card/80 px-3 py-1.5">{fmt(locale, idx.count)} {lt(locale, { en: 'hadiths', bn: 'হাদিস', ar: 'حديثًا' })}</span>
          <span className="rounded-full bg-card/80 px-3 py-1.5">{N(locale, idx.books.length)} {lt(locale, { en: 'books', bn: 'অধ্যায়', ar: 'كتابًا' })}</span>
          <span className="rounded-full bg-card/80 px-3 py-1.5">{lt(locale, { en: 'Numbers', bn: 'নম্বর', ar: 'الأرقام' })} {N(locale, idx.first)}–{N(locale, idx.last)}</span>
          {m.authenticity === 'consensus' && <GradeChip category="sahih" locale={locale} className="py-1.5">{bn ? 'সহীহ: ঐকমত্যে গৃহীত' : <T en="Sahih: authentic by consensus" bn="সহীহ: ঐকমত্যে গৃহীত" ar="صحيح بإجماع العلماء" />}</GradeChip>}
        </div>
        <div className="mt-6 max-w-xl"><HadithSearchForm locale={locale} collection={m.slug} size="md" /></div>
      </PageHero>

      {g && gTotal > 0 && (
        <section aria-labelledby="gsum-h" className="mt-10">
          <h2 id="gsum-h" className="font-display mb-3 text-xl font-semibold">{lt(locale, { en: 'Grades at a glance', bn: 'এক নজরে মান', ar: 'نظرة على الأحكام' })}</h2>
          <div className="card-soft rounded-3xl p-5">
            <div className="flex h-3 overflow-hidden rounded-full bg-muted" role="img" aria-label={`Sahih ${g.sahih}, Hasan ${g.hasan}, Da'if ${g.daif}`}>
              <span className="bg-primary" style={{ width: `${(g.sahih / gTotal) * 100}%` }} />
              <span className="bg-gold" style={{ width: `${(g.hasan / gTotal) * 100}%` }} />
              <span className="bg-destructive" style={{ width: `${(g.daif / gTotal) * 100}%` }} />
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <li><span className="me-1.5 inline-block size-2.5 rounded-full bg-primary" />{lt(locale, { en: 'Sahih', bn: 'সহীহ', ar: 'صحيح' })} {fmt(locale, g.sahih)}</li>
              <li><span className="me-1.5 inline-block size-2.5 rounded-full bg-gold" />{lt(locale, { en: 'Hasan', bn: 'হাসান', ar: 'حسن' })} {fmt(locale, g.hasan)}</li>
              <li><span className="me-1.5 inline-block size-2.5 rounded-full bg-destructive" />{lt(locale, { en: 'Da‘if', bn: 'দাঈফ', ar: 'ضعيف' })} {fmt(locale, g.daif)}</li>
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">{lt(locale, { en: `According to ${g.by}, counted per hadith. Other scholars may differ.`, bn: `${g.by}-এর মান অনুযায়ী (প্রতিটি হাদিস গুনে)। অন্য আলেমদের ভিন্নমত থাকতে পারে।`, ar: `بحسب ${g.by}، محسوبة لكل حديث. وقد يختلف غيره من العلماء.` })}</p>
          </div>
        </section>
      )}

      {pop.length > 0 && (
        <section aria-labelledby="pop-h" className="mt-10">
          <h2 id="pop-h" className="font-display mb-3 text-xl font-semibold">{lt(locale, { en: 'Well-known hadiths', bn: 'প্রসিদ্ধ হাদিস', ar: 'أحاديث مشهورة' })}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {pop.map((f) => (
              <li key={f.n}><Link href={hadithUrl(m.slug, f.n, locale)} className="card-soft lift flex h-full flex-col gap-1 rounded-3xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wide text-gold" lang={bn ? 'bn' : 'en'}>{bn ? `${m.name.bn} ${bnNum(f.n)}` : `${m.cite} ${f.n}`}</span>
                <span className="font-semibold leading-snug" lang={bn ? 'bn' : 'en'}>{bn ? f.bn : f.en}</span>
              </Link></li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="books-h" className="mt-12">
        <h2 id="books-h" className="font-display mb-5 text-2xl font-semibold">{lt(locale, { en: `Books of ${m.cite}`, bn: `${m.name.bn}-এর অধ্যায়সমূহ`, ar: `كتب ${m.name.ar}` })}</h2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {idx.books.map((b) => (
            <li key={b[0]}>
              <Link href={bookUrl(m.slug, b[0], locale)} className="card-soft lift group flex h-full items-start gap-3 rounded-2xl p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-sm font-bold text-primary">{N(locale, b[0])}</span>
                <span className="min-w-0">
                  <span className="block font-semibold leading-snug group-hover:text-primary" lang="en">{b[1]}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{lt(locale, { en: 'Hadith', bn: 'হাদিস', ar: 'الأحاديث' })} {N(locale, b[2])}–{N(locale, b[3])} · {N(locale, b[4])}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        {!bn && <p className="mt-3 text-xs text-muted-foreground"><T en="Book titles are in English (from the source data)." bn="অধ্যায়ের নাম ইংরেজিতে (উৎস ডেটা অনুযায়ী)।" ar="عناوين الكتب بالإنجليزية كما في البيانات المصدرية." /></p>}
      </section>
      <Faq faqs={faqs} locale={locale} />
    </div>
  )
}

/* ───────────────────────────── /hadith/[collection]/book/[book](/page/[p]) ───────────────────────────── */

export type BookProps = { params: Promise<{ collection: string; book: string; p?: string }> }
/** One static param per book (page 1); later pages render on demand (ISR). */
export function bookParams() {
  return COLLECTIONS.flatMap((c) => collectionIndex(c.slug).books.map((b) => ({ collection: c.slug, book: String(b[0]) })))
}

/** `/book/3` → 1, `/book/3/page/2` → 2; "page/1", "page/0", "page/x" → null (404). */
function pageOf(seg: string | undefined): number | null {
  if (seg === undefined) return 1
  const p = parseHadithNumber(seg)
  return p && p >= 2 ? p : null
}

export async function bookMeta(locale: Locale, { params }: BookProps): Promise<Metadata> {
  const p = await params
  const r = resolveCollectionSlug(p.collection)
  const bk = /^\d{1,3}$/.test(p.book) ? Number(p.book) : NaN
  const page = pageOf(p.p)
  const row = r && bookRow(r.slug, bk)
  if (!r || !row || page === null) return {}
  const m = collectionMeta(r.slug)!
  const path = `/hadith/${m.slug}/book/${bk}${page > 1 ? `/page/${page}` : ''}`
  const pg = page > 1 ? (locale === 'bn' ? ` (পৃষ্ঠা ${bnNum(page)})` : ` (page ${page})`) : ''
  if (locale === 'bn') {
    return buildMeta({ title: `${m.name.bn} — অধ্যায় ${bnNum(bk)}: ${row[1]}${pg} | ${m.aliasBn}`, description: clip(`${m.name.bn} অধ্যায় ${bnNum(bk)} (${row[1]}): হাদিস ${bnNum(row[2])}–${bnNum(row[3])}, মোট ${bnNum(row[4])}টি হাদিস আরবি ও বাংলা অনুবাদসহ।`, 165), path, locale })
  }
  return buildMeta({ title: `${m.cite}, Book ${bk}: ${row[1]}${pg} | ${m.name.bn}`, description: clip(`${m.cite} Book ${bk}, “${row[1]}”: hadiths ${row[2]}–${row[3]} (${row[4]} in total) with Arabic text and English and Bangla translation.`, 165), path })
}

export async function BookPage({ locale, params }: { locale: Locale } & BookProps) {
  const p = await params
  const r = resolveCollectionSlug(p.collection)
  const bk = /^\d{1,3}$/.test(p.book) ? Number(p.book) : NaN
  const page = pageOf(p.p)
  if (!r || !Number.isInteger(bk) || page === null) notFound()
  if (!r.canonical) permanentRedirect(bookUrl(r.slug, bk, locale, page))
  const m = collectionMeta(r.slug)!
  const row = bookRow(r.slug, bk)
  if (!row) notFound()
  let data = null
  let error = false
  try { data = await getBook(r.slug, bk, page) } catch (e) { if (e instanceof HadithFetchError) error = true; else throw e }
  if (!data && !error) notFound()
  const bn = locale === 'bn'
  const h = (u: string) => localeHref(locale, u)
  const prevBook = collectionIndex(r.slug).books.filter((b) => b[0] < bk).slice(-1)[0]
  const nextBook = collectionIndex(r.slug).books.find((b) => b[0] > bk)
  const pages = data?.pages ?? Math.max(1, Math.ceil(row[4] / BOOK_PAGE_SIZE))
  return (
    <div className={pageShell}>
      {data && (
        <JsonLd data={collectionLd({ name: `${bn ? m.name.bn : m.cite} — ${row[1]}`, description: `${m.cite}, Book ${bk}: ${row[1]}`, path: h(`/hadith/${m.slug}/book/${bk}${page > 1 ? `/page/${page}` : ''}`), inLanguage: bn ? 'bn' : undefined, items: data.items.map((i) => ({ name: `${m.cite} ${i.number}${i.title ? ` — ${i.title}` : ''}`, href: hadithUrl(m.slug, i.number, locale) })) })} />
      )}
      <Breadcrumbs locale={locale} items={[
        { name: bn ? 'হাদিস' : 'Hadith', ar: 'الحديث', href: '/hadith' },
        { name: bn ? m.name.bn : m.name.en, ar: m.name.ar, href: `/hadith/${m.slug}` },
        { name: bn ? `অধ্যায় ${bnNum(bk)}` : `Book ${bk}`, ar: `الكتاب ${bk}`, href: `/hadith/${m.slug}/book/${bk}` },
      ]} className="mb-4" />
      <PageHero eyebrow={<><CName slug={m.slug} locale={locale} /> · {lt(locale, { en: `Book ${bk}`, bn: `অধ্যায় ${bnNum(bk)}`, ar: `الكتاب ${bk}` })}</>} icon={m.icon} title={<span lang="en">{row[1]}</span>}
        subtitle={lt(locale, {
          en: `${m.cite}, hadiths ${row[2]}–${row[3]} (${row[4]} in this book)${page > 1 ? `. Page ${page} of ${pages}.` : '.'}`,
          bn: `${m.name.bn}, হাদিস ${bnNum(row[2])}–${bnNum(row[3])} (এই অধ্যায়ে ${bnNum(row[4])}টি)${page > 1 ? `। পৃষ্ঠা ${bnNum(page)}/${bnNum(pages)}।` : '।'}`,
          ar: `${m.name.ar}، الأحاديث ${row[2]}–${row[3]} (${row[4]} حديثًا في هذا الكتاب)`,
        })} />
      {error || !data ? (
        <div className="card-soft mt-8 rounded-3xl p-8 text-center" role="status">
          <p className="text-sm text-muted-foreground">{lt(locale, { en: 'The hadiths of this book could not be loaded right now. Please try again shortly.', bn: 'এই অধ্যায়ের হাদিস এখন লোড করা যায়নি। একটু পরে আবার চেষ্টা করুন।', ar: 'تعذّر تحميل أحاديث هذا الكتاب الآن. حاول مجددًا بعد قليل.' })}</p>
          <Link className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground" href={bookUrl(m.slug, bk, locale, page)} prefetch={false}>{lt(locale, { en: 'Try again', bn: 'আবার চেষ্টা করুন', ar: 'حاول مرة أخرى' })}</Link>
        </div>
      ) : (
        <ol className="mt-8 grid gap-3" start={data.items[0]?.number} data-list="hadiths">
          {data.items.map((i) => <HadithRow key={i.number} collection={m} number={i.number} title={i.title} entries={i.entries} locale={locale} />)}
        </ol>
      )}
      <Pagination page={page} pages={pages} locale={locale} href={(pg) => bookUrl(m.slug, bk, locale, pg)} />
      <nav className="mt-10 flex items-center justify-between gap-3 text-sm font-semibold" aria-label={bn ? 'অধ্যায় নেভিগেশন' : 'Book navigation'}>
        {prevBook && prevBook[0] !== bk ? <Link href={bookUrl(m.slug, prevBook[0], locale)} className="flex min-w-0 items-center gap-1.5 rounded-full border bg-card px-4 py-2.5 hover:border-primary/40"><ArrowLeft className="size-4 shrink-0 rtl:rotate-180" /><span className="truncate" lang="en">{prevBook[0]}. {prevBook[1]}</span></Link> : <span />}
        {nextBook ? <Link href={bookUrl(m.slug, nextBook[0], locale)} className="flex min-w-0 items-center gap-1.5 rounded-full border bg-card px-4 py-2.5 hover:border-primary/40"><span className="truncate" lang="en">{nextBook[0]}. {nextBook[1]}</span><ArrowRight className="size-4 shrink-0 rtl:rotate-180" /></Link> : <span />}
      </nav>
      <p className="mt-6 text-center text-xs"><Link className="text-muted-foreground hover:text-primary" href={collectionUrl(m.slug, locale)}>← <CName slug={m.slug} locale={locale} /></Link></p>
    </div>
  )
}
