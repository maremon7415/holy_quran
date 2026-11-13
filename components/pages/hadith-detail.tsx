import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { CopyButton, ShareButton } from '@/components/content/copy-button'
import { UiIcon } from '@/components/ui-icon'
import { Labelled } from '@/lib/i18n/labelled'
import { CName } from '@/components/hadith/names'
import { EntryBody } from '@/components/hadith/entry-body'
import { GradeChip, GradeList } from '@/components/hadith/grades'
import { CiteThis } from '@/components/hadith/cite-this'
import { HadithSearchForm } from '@/components/hadith/search-form'
import { buildMeta, breadcrumbLd, clip, publisherLd } from '@/lib/content/seo'
import { absoluteUrl, site } from '@/lib/site'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { bnNum } from '@/lib/i18n/t'
import { lt } from '@/lib/i18n/lt'
import { T } from '@/lib/i18n/text'
import { duaBySlug } from '@/data/content/duas'
import { collectionMeta, resolveCollectionSlug, type CollectionMeta } from '@/lib/hadith/collections'
import { featured } from '@/lib/hadith/featured'
import { collectionIndex, isServable } from '@/lib/hadith/data'
import { getHadith, type Hadith } from '@/lib/hadith/hadith'
import { duaSlugsForHadith } from '@/lib/hadith/dua-sources'
import { parseHadithNumber } from '@/lib/hadith/numbering'
import { bookUrl, collectionUrl, hadithUrl } from '@/lib/hadith/url'
import { clipText } from '@/lib/hadith/text'


export type HadithProps = { params: Promise<{ collection: string; number: string }> }

/**
 * Pre-rendered hadiths: only the curated famous ones (≈ 46 per locale). Everything else is generated on first request
 * (ISR). Kept small on purpose: every prerender fetches the corpus from jsDelivr, and a page whose texts cannot be
 * loaded now throws (see `load`), so a long list would make `next build` fragile when the CDN is briefly flaky.
 */
export function hadithParams() {
  const seen = new Set<string>()
  const out: { collection: string; number: string }[] = []
  for (const f of featured) {
    const k = `${f.c}/${f.n}`
    if (!seen.has(k) && isServable(f.c as never, f.n)) { seen.add(k); out.push({ collection: f.c, number: String(f.n) }) }
  }
  return out
}

async function load(p: { collection: string; number: string }) {
  const r = resolveCollectionSlug(p.collection)
  const n = parseHadithNumber(p.number)
  if (!r || n === null) return null
  const meta = collectionMeta(r.slug)!
  if (!isServable(r.slug, n)) return null
  // A HadithFetchError (corpus unreachable) is deliberately NOT caught: the render fails, Next answers 500 for this
  // request and ISR keeps serving the last good version instead of caching an error page (with noindex) for hours.
  // null = the number has no text in any served language → 404.
  const hadith: Hadith | null = await getHadith(r.slug, n)
  if (!hadith) return null
  return { r, n, meta, hadith }
}

const tl = (locale: Locale, en: string, bn: string) => (locale === 'bn' ? bn : en)

export async function hadithMeta(locale: Locale, { params }: HadithProps): Promise<Metadata> {
  const x = await load(await params)
  if (!x) return {}
  const { n, meta, hadith } = x
  const path = `/hadith/${meta.slug}/${n}`
  const bn = locale === 'bn'
  const first = hadith.entries[0]
  const t = clipText(hadith.title, 62)
  const tBn = hadith.titleBn
  const gradeNote = meta.authenticity === 'consensus' ? 'Sahih' : first.grades[0]?.grade
  if (bn) {
    const txt = first.bn ?? first.en ?? first.ar ?? ''
    return buildMeta({
      title: `${meta.name.bn} হাদিস ${bnNum(n)}${tBn ? ` — ${tBn}` : ''} | ${meta.aliasBn} ${bnNum(n)} নং হাদিস`,
      description: clip(`${meta.name.bn} ${bnNum(n)}${hadith.book ? `, ${hadith.book.name}` : ''}: ${txt} — আরবি পাঠ, বাংলা ও ইংরেজি অনুবাদ, বর্ণনাকারী ও রেফারেন্সসহ।`, 165),
      path, locale, type: 'article', markdown: true,
      keywords: [`${meta.name.bn} ${bnNum(n)}`, `${meta.aliasBn} হাদিস ${bnNum(n)}`, `${meta.name.bn} ${bnNum(n)} নং হাদিস`, ...(tBn ? [tBn] : []), `${meta.cite} ${n}`, 'হাদিস', 'হাদিস বাংলা অনুবাদ'],
    })
  }
  const txt = first.en ?? first.bn ?? first.ar ?? ''
  return buildMeta({
    title: `${meta.cite} ${n}${t ? ` — ${t}` : ''} | ${meta.name.bn} ${bnNum(n)}`,
    description: clip(`${meta.cite} ${n}${hadith.book ? `, ${hadith.book.name}` : ''}: “${txt}” Arabic text, English and Bangla translation, narrator${gradeNote ? `, grade (${gradeNote})` : ''} and citation.`, 165),
    path, type: 'article', markdown: true,
    keywords: [`${meta.cite} ${n}`, `${meta.cite} hadith ${n}`, `${meta.name.en.replace(/^Sahih /, '')} hadith ${n}`, ...(t ? [t] : []), 'hadith', `${meta.aliasBn} হাদিস ${bnNum(n)}`],
  })
}

function faqs(locale: Locale, meta: CollectionMeta, n: number, h: Hadith): { q: string; a: string }[] {
  const bn = locale === 'bn'
  const first = h.entries[0]
  const gr = h.entries.flatMap((e) => e.grades)
  const ref = first.ref.hadith ? `Book ${first.ref.book}, Hadith ${first.ref.hadith}` : `Book ${first.ref.book}`
  const out: { q: string; a: string }[] = []
  out.push(bn
    ? { q: `${meta.name.bn} ${bnNum(n)} নং হাদিসটি কী?`, a: `এটি ${meta.name.bn} গ্রন্থের ${bnNum(n)} নম্বর হাদিস${h.book ? ` (${h.book.name}, ${ref})` : ''}।${first.bn ? ` ${clipText(first.bn, 220)}` : ''}` }
    : { q: `What is ${meta.cite} ${n}?`, a: `${meta.cite} ${n} is hadith number ${n} in ${meta.cite}${h.book ? `, in the Book “${h.book.name}” (${ref})` : ''}.${first.narrator ? ` It is narrated by ${first.narrator}.` : ''}${first.en ? ` ${clipText(first.en, 240)}` : ''}` })
  if (meta.authenticity === 'consensus') {
    out.push(bn
      ? { q: `${meta.name.bn} ${bnNum(n)} হাদিসটি কি সহীহ?`, a: `${meta.name.bn} আহলুস সুন্নাহর আলেমদের ঐকমত্যে কুরআনের পর সবচেয়ে বিশুদ্ধ গ্রন্থগুলোর একটি এবং এর হাদিসগুলো সহীহ হিসেবে গৃহীত। ব্যক্তিগতভাবে প্রতিটি হাদিসের আলাদা মান এখানে দেওয়া হয়নি। বিস্তারিত জানতে যোগ্য আলেমের শরণাপন্ন হোন।` }
      : { q: `Is ${meta.cite} ${n} authentic?`, a: `${meta.cite} is one of the two books (the Sahihayn) whose hadiths are accepted as authentic by the consensus of the scholars of Ahl as-Sunnah. Individual hadiths are not separately graded here; for detailed questions consult a qualified scholar.` })
  } else if (gr.length) {
    const list = gr.map((g) => `${g.grader}: ${g.grade}`).join('; ')
    out.push(bn
      ? { q: `${meta.name.bn} ${bnNum(n)} হাদিসটির মান কী?`, a: `পরবর্তী মুহাদ্দিসদের মান: ${list}। এগুলো আলেমদের মত; মতভেদ থাকতে পারে।` }
      : { q: `What is the grade of ${meta.cite} ${n}?`, a: `Grades by later scholars: ${list}. These are scholarly opinions and can differ between scholars.` })
  } else {
    out.push(bn
      ? { q: `${meta.name.bn} ${bnNum(n)} হাদিসটির মান কী?`, a: 'এই ডেটাসেটে এ হাদিসের কোনো মান উল্লেখ নেই। নির্ভরযোগ্য মান জানতে যোগ্য আলেম বা মুহাদ্দিসের গ্রন্থ দেখুন।' }
      : { q: `What is the grade of ${meta.cite} ${n}?`, a: 'No grade is recorded for this hadith in our data. Consult the works of qualified hadith scholars for its status.' })
  }
  out.push(bn
    ? { q: 'এই হাদিস কীভাবে উদ্ধৃত করবেন?', a: `লিখুন “${meta.name.bn} ${bnNum(n)}” (${meta.cite} ${n})। এখানে প্রচলিত (sunnah.com) নম্বর ব্যবহার করা হয়েছে${meta.slug === 'muslim' ? '; সহীহ মুসলিমে মুহাম্মাদ ফুআদ আবদুল বাকী নম্বর' : ''}। স্থায়ী লিংক: ${absoluteUrl(localeHref('bn', h.url))}` }
    : { q: 'How do I cite this hadith?', a: `Cite it as “${meta.cite} ${n}”. This site uses the commonly cited numbering (as on sunnah.com)${meta.slug === 'muslim' ? ', which for Sahih Muslim is the Muhammad Fu’ad ‘Abd al-Baqi numbering' : ''}. Permanent link: ${absoluteUrl(h.url)}` })
  return out
}

export async function HadithPage({ locale, params }: { locale: Locale } & HadithProps) {
  const p = await params
  const x = await load(p)
  if (!x) notFound()
  const { r, n, meta, hadith } = x
  if (!r.canonical) permanentRedirect(hadithUrl(r.slug, n, locale))
  const bn = locale === 'bn'
  const h = (u: string) => localeHref(locale, u)
  const path = `/hadith/${meta.slug}/${n}`
  const N = (v: number | string) => (bn ? bnNum(v) : v)
  const name = <CName slug={meta.slug} locale={locale} />
  const crumbs = [
    { name: bn ? 'হাদিস' : 'Hadith', ar: 'الحديث', href: '/hadith' },
    { name: bn ? meta.name.bn : meta.name.en, ar: meta.name.ar, href: collectionUrl(meta.slug) },
    ...(hadith?.book ? [{ name: bn ? `অধ্যায় ${bnNum(hadith.book.n)}` : `Book ${hadith.book.n}`, ar: `الكتاب ${hadith.book.n}`, href: bookUrl(meta.slug, hadith.book.n) }] : []),
    { name: bn ? `হাদিস ${bnNum(n)}` : `Hadith ${n}`, ar: `الحديث ${n}`, href: path },
  ]
  const url = absoluteUrl(h(path))

  const first = hadith.entries[0]
  const allGrades = hadith.entries.flatMap((e) => e.grades)
  const mainText = (bn ? first.bn ?? first.en : first.en ?? first.bn) ?? ''
  const title = bn ? hadith.titleBn || '' : hadith.title
  const duaSlugs = duaSlugsForHadith(meta.slug, n)
  const refText = first.ref.book > 0 ? (first.ref.hadith ? `Book ${first.ref.book}, Hadith ${first.ref.hadith}` : `Book ${first.ref.book}`) : ''
  const cite = `${meta.cite} ${n}`
  const bnCite = `${meta.name.bn} ${bnNum(n)}`
  const formats = {
    short: bn ? `${bnCite} (${cite})` : cite,
    full: `${cite}${refText ? ` (${refText})` : ''}. ${site.name}${bn ? ' · নূর কুরআন' : ''}. ${url}`,
    quote: `${mainText ? `“${clipText(mainText, 360)}”\n` : ''}— ${bn ? `${bnCite} / ` : ''}${cite}\n${url}`,
    markdown: `[${bn ? bnCite : cite}](${url})`,
  }
  const copyAll = [first.ar, bn ? first.bn : first.en, bn ? first.en : first.bn, `— ${bn ? bnCite : cite}`, url].filter(Boolean).join('\n\n')
  const f = faqs(locale, meta, n, hadith)

  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': ['CreativeWork', 'Quotation'],
      '@id': `${url}#hadith`,
      name: `${bn ? bnCite : cite}${title ? ` — ${title}` : ''}`,
      headline: bn ? bnCite : cite,
      url,
      identifier: cite,
      position: n,
      inLanguage: bn ? 'bn' : 'en',
      text: mainText || first.ar,
      ...(title ? { alternativeHeadline: title } : {}),
      isPartOf: {
        '@type': 'Book',
        '@id': `${absoluteUrl(collectionUrl(meta.slug, locale))}#book`,
        name: bn ? meta.name.bn : meta.name.en,
        alternateName: [meta.name.ar, meta.name.en, meta.name.bn],
        url: absoluteUrl(collectionUrl(meta.slug, locale)),
        inLanguage: 'ar',
        author: { '@type': 'Person', name: meta.compiler.en },
      },
      ...(hadith.book ? { pagination: refText, about: { '@type': 'Thing', name: hadith.book.name } } : {}),
      workTranslation: [
        ...(first.ar ? [{ '@type': 'CreativeWork', inLanguage: 'ar', text: first.ar }] : []),
        ...(first.en && bn ? [{ '@type': 'CreativeWork', inLanguage: 'en', text: first.en }] : []),
        ...(first.bn && !bn ? [{ '@type': 'CreativeWork', inLanguage: 'bn', text: first.bn }] : []),
      ],
      ...(hadith.entries.length > 1 ? { hasPart: hadith.entries.map((e) => ({ '@type': 'CreativeWork', identifier: `${cite}${e.sub}`, inLanguage: bn ? 'bn' : 'en', text: (bn ? e.bn ?? e.en : e.en ?? e.bn) ?? e.ar })) } : {}),
      isBasedOn: 'https://github.com/fawazahmed0/hadith-api',
      citation: formats.full,
      publisher: publisherLd,
    },
    breadcrumbLd(crumbs.map((c) => ({ name: c.name, href: h(c.href) }))),
    { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: bn ? 'bn' : 'en', mainEntity: f.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) },
  ]

  const card = 'card-soft rounded-3xl p-5 sm:p-6'
  const dt = 'text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground'
  return (
    <div className="mx-auto max-w-[860px] px-3 pb-36 pt-3 sm:px-6 sm:pt-6 lg:pb-20" data-hadith={`${meta.slug}:${n}`}>
      <JsonLd data={ld} />
      <article className="relative overflow-hidden rounded-[2rem] border bg-card px-5 pb-8 pt-6 sm:rounded-[2.5rem] sm:px-10 sm:pt-8">
        <div className="bg-pattern pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]" />
        <div className="relative">
          <Breadcrumbs locale={locale} items={crumbs} />
          <header className="text-center">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-gold-soft px-3.5 py-1.5 text-xs font-bold text-gold">
              <UiIcon name={meta.icon} size={16} /> {name}
              <span lang="ar" className="font-arabic text-sm font-semibold">· {meta.name.ar}</span>
            </p>
            <h1 className="font-display text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2.4rem]">
              {bn ? <>{meta.name.bn} হাদিস {bnNum(n)}</> : <>{meta.cite} {n}</>}
            </h1>
            {title && <p className="mx-auto mt-2 max-w-xl text-pretty text-lg font-medium text-foreground/80" lang={bn ? 'bn' : 'en'}>{title}</p>}
            <p className="mt-1.5 text-sm text-muted-foreground">
              {bn ? <span lang="en">{cite}</span> : <span className="font-bangla" lang="bn">{bnCite} · {meta.aliasBn}</span>}
              {hadith.book && <><span className="mx-2 text-muted-foreground/40">•</span><span lang="en">{hadith.book.name}</span></>}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {meta.authenticity === 'consensus' && <GradeChip category="sahih" locale={locale}>{bn ? 'সহীহ: আলেমদের ঐকমত্যে গৃহীত' : <T en="Sahih: authentic by consensus" bn="সহীহ: আলেমদের ঐকমত্যে গৃহীত" ar="صحيح بإجماع العلماء" />}</GradeChip>}
              {meta.authenticity !== 'consensus' && allGrades[0] && <GradeChip category={allGrades[0].category} locale={locale}><span lang="en">{allGrades[0].grader}: {allGrades[0].grade}</span></GradeChip>}
              {hadith.entries.length > 1 && <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold">{bn ? `${bnNum(hadith.entries.length)}টি বর্ণনা` : <T en={`${hadith.entries.length} narrations`} ar={`${hadith.entries.length} روايات`} />}</span>}
            </div>
          </header>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <CopyButton text={copyAll} label={{ en: 'Copy hadith', bn: 'হাদিস কপি', ar: 'نسخ الحديث' }} />
            <ShareButton title={cite} text={clipText(mainText, 200)} path={h(path)} />
            <a href="#cite" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground/80 transition hover:border-primary/40 hover:bg-accent"><UiIcon name="note" size={14} /> {lt(locale, { en: 'Cite this', bn: 'উদ্ধৃত করুন', ar: 'اقتبس' })}</a>
          </div>

          <div className="mt-8 flex flex-col gap-10">
            {hadith.entries.map((e) => (
              <section key={e.id} aria-label={e.sub ? `${cite}${e.sub}` : undefined} data-entry={e.sub || undefined}>
                {e.sub && <h2 className="mb-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary" lang="en">{cite}{e.sub}</h2>}
                <EntryBody e={e} locale={locale} />
                {meta.authenticity !== 'consensus' && e.grades.length > 0 && <GradeList grades={e.grades} locale={locale} />}
              </section>
            ))}
          </div>
          {hadith.failed.length > 0 && (
            <p role="status" className="mt-6 rounded-2xl border border-border bg-muted/60 px-4 py-3 text-xs text-muted-foreground">{lt(locale, { en: 'Some translations could not be loaded right now and may be missing above.', bn: 'কিছু অনুবাদ এখন লোড করা যায়নি, তাই উপরে নাও থাকতে পারে।', ar: 'تعذّر تحميل بعض الترجمات الآن وقد لا تظهر أعلاه.' })}</p>
          )}
        </div>
      </article>

      {/* grade explanation */}
      <section aria-labelledby="grade-h" className="mt-8">
        <h2 id="grade-h" className="font-display mb-3 text-2xl font-semibold">{lt(locale, { en: 'Authenticity & grade', bn: 'মান ও বিশুদ্ধতা', ar: 'الحكم على الحديث' })}</h2>
        <div className={card}>
          {meta.authenticity === 'consensus' ? (
            <p className="text-[15px] leading-relaxed text-foreground/85">{bn
              ? `${meta.name.bn} আহলুস সুন্নাহর আলেমদের ঐকমত্যে কুরআনের পর সবচেয়ে বিশুদ্ধ গ্রন্থগুলোর একটি; এর হাদিস সহীহ হিসেবে গৃহীত। এ কারণে প্রতিটি হাদিসের আলাদা মান এখানে দেখানো হয়নি।`
              : <T en={`${meta.cite} is one of the two Sahih collections whose hadiths are accepted as authentic by the consensus of the scholars of Ahl as-Sunnah, so individual hadiths are not graded separately here.`} bn={`${meta.name.bn} আহলুস সুন্নাহর আলেমদের ঐকমত্যে কুরআনের পর সবচেয়ে বিশুদ্ধ গ্রন্থগুলোর একটি; এর হাদিস সহীহ হিসেবে গৃহীত।`} ar={`${meta.name.ar} أحد الصحيحين اللذين تلقّت الأمة أحاديثهما بالقبول، ولذلك لا يُفرد كل حديث بحكم مستقل هنا.`} />}</p>
          ) : allGrades.length ? (
            <>
              <p className="text-[15px] leading-relaxed text-foreground/85">{lt(locale, { en: 'Grades given by later hadith scholars for this narration. They are scholarly opinions and may differ; Sahih and Hasan are acceptable as evidence, Da‘if (weak) is not on its own.', bn: 'এই বর্ণনা সম্পর্কে পরবর্তী মুহাদ্দিসদের দেওয়া মান। এগুলো আলেমদের মত, মতভেদ থাকতে পারে; সহীহ ও হাসান দলিলযোগ্য, দাঈফ (দুর্বল) এককভাবে নয়।', ar: 'أحكام العلماء المتأخرين على هذه الرواية، وهي اجتهادات قد تختلف؛ الصحيح والحسن يُحتجّ بهما، والضعيف لا يُحتجّ به منفردًا.' })}</p>
              {hadith.entries.length === 1 && <GradeList grades={allGrades} locale={locale} />}
            </>
          ) : (
            <p className="text-[15px] leading-relaxed text-foreground/85">{lt(locale, { en: 'No grade is recorded for this hadith in our data. Please consult the works of qualified hadith scholars.', bn: 'আমাদের ডেটায় এই হাদিসের কোনো মান উল্লেখ নেই। যোগ্য মুহাদ্দিসদের গ্রন্থ দেখুন।', ar: 'لا يوجد حكم مسجَّل لهذا الحديث في بياناتنا؛ يُرجى الرجوع إلى كتب أهل الحديث.' })}</p>
          )}
        </div>
      </section>

      {/* reference block */}
      <section aria-labelledby="ref-h" className="mt-8">
        <h2 id="ref-h" className="font-display mb-3 text-2xl font-semibold">{lt(locale, { en: 'Reference', bn: 'রেফারেন্স', ar: 'التوثيق' })}</h2>
        <dl className={`${card} grid gap-x-6 gap-y-4 sm:grid-cols-2`}>
          <div><dt className={dt}>{lt(locale, { en: 'Reference', bn: 'রেফারেন্স', ar: 'الإحالة' })}</dt><dd className="mt-1 font-semibold" lang="en">{cite}</dd></div>
          <div><dt className={dt}>{lt(locale, { en: 'Collection', bn: 'গ্রন্থ', ar: 'الكتاب' })}</dt><dd className="mt-1"><Link className="font-semibold hover:text-primary" href={collectionUrl(meta.slug, locale)}>{name}</Link></dd></div>
          {hadith.book && <div><dt className={dt}>{lt(locale, { en: 'Book', bn: 'অধ্যায়', ar: 'الكتاب (الباب)' })}</dt><dd className="mt-1"><Link className="font-semibold hover:text-primary" href={bookUrl(meta.slug, hadith.book.n, locale)}><span lang="en">{hadith.book.n}. {hadith.book.name}</span></Link></dd></div>}
          {refText && <div><dt className={dt}>{lt(locale, { en: 'In-book reference', bn: 'অধ্যায়ভিত্তিক রেফারেন্স', ar: 'الإحالة داخل الكتاب' })}</dt><dd className="mt-1 font-semibold" lang="en">{refText}</dd></div>}
          <div><dt className={dt}>{lt(locale, { en: 'Numbering', bn: 'নম্বর পদ্ধতি', ar: 'الترقيم' })}</dt><dd className="mt-1 text-sm text-foreground/85">{meta.slug === 'muslim' ? lt(locale, { en: 'Muhammad Fu’ad ‘Abd al-Baqi (as cited worldwide)', bn: 'মুহাম্মাদ ফুআদ আবদুল বাকী (বিশ্বব্যাপী প্রচলিত)', ar: 'ترقيم محمد فؤاد عبد الباقي' }) : lt(locale, { en: 'Standard numbering (as on sunnah.com)', bn: 'প্রচলিত নম্বর (sunnah.com-এর অনুরূপ)', ar: 'الترقيم المعتمد المتداول' })}</dd></div>
          <div><dt className={dt}>{lt(locale, { en: 'Permanent link', bn: 'স্থায়ী লিংক', ar: 'الرابط الدائم' })}</dt><dd className="mt-1 break-all text-sm"><a href={url} className="hover:text-primary" dir="ltr">{url}</a></dd></div>
        </dl>
      </section>

      {/* cite */}
      <section id="cite" aria-labelledby="cite-h" className="mt-8 scroll-mt-24">
        <h2 id="cite-h" className="font-display mb-3 text-2xl font-semibold">{lt(locale, { en: 'Cite this hadith', bn: 'এই হাদিস উদ্ধৃত করুন', ar: 'اقتباس هذا الحديث' })}</h2>
        <div className={card}><CiteThis formats={formats} /></div>
      </section>

      {duaSlugs.length > 0 && (
        <section aria-labelledby="dua-h" className="mt-8">
          <h2 id="dua-h" className="font-display mb-3 flex items-center gap-2 text-2xl font-semibold"><UiIcon name="dua" size={26} /> {lt(locale, { en: 'Related duas', bn: 'সংশ্লিষ্ট দোয়া', ar: 'أدعية مرتبطة' })}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {duaSlugs.map((s) => {
              const d = duaBySlug(s)
              if (!d) return null
              return (
                <li key={s}><Link href={h(`/dua/${s}`)} className="card-soft lift flex h-full flex-col gap-1 rounded-3xl p-4">
                  <span className="font-semibold">{bn ? d.title.bn : <T en={d.title.en} bn={d.title.bn} ar={d.title.ar} />}</span>
                  <span className="text-xs text-muted-foreground">{lt(locale, { en: 'This hadith is a source of this dua', bn: 'এই হাদিস এ দোয়ার উৎস', ar: 'هذا الحديث مصدر هذا الدعاء' })}</span>
                </Link></li>
              )
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="faq-h" className="mt-10">
        <h2 id="faq-h" className="font-display mb-3 text-2xl font-semibold">{lt(locale, { en: 'Frequently asked questions', bn: 'সচরাচর জিজ্ঞাসা', ar: 'أسئلة شائعة' })}</h2>
        <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {f.map((x, i) => (
            <details key={i} className="group px-5 py-4 open:bg-accent/40" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-semibold [&::-webkit-details-marker]:hidden"><span lang={bn ? 'bn' : 'en'}>{x.q}</span><span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-transform duration-300 group-open:rotate-45">+</span></summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground" lang={bn ? 'bn' : 'en'}>{x.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-8"><HadithSearchForm locale={locale} collection={meta.slug} size="md" /></div>

      <Labelled as="nav" label={{ en: 'Hadith navigation', bn: 'হাদিস নেভিগেশন', ar: 'التنقل بين الأحاديث' }} className="mt-8 flex items-center justify-between gap-3 text-sm font-semibold">
        {hadith.prev ? <Link href={hadithUrl(meta.slug, hadith.prev, locale)} rel="prev" className="flex items-center gap-1.5 rounded-full border bg-card px-4 py-2.5 transition hover:border-primary/40"><ArrowLeft className="size-4 rtl:rotate-180" /> {N(hadith.prev)}</Link> : <span />}
        <Link href={hadith.book ? bookUrl(meta.slug, hadith.book.n, locale) : collectionUrl(meta.slug, locale)} className="truncate text-muted-foreground transition hover:text-primary">{hadith.book ? <span lang="en">{hadith.book.name}</span> : name}</Link>
        {hadith.next ? <Link href={hadithUrl(meta.slug, hadith.next, locale)} rel="next" className="flex items-center gap-1.5 rounded-full border bg-card px-4 py-2.5 transition hover:border-primary/40">{N(hadith.next)} <ArrowRight className="size-4 rtl:rotate-180" /></Link> : <span />}
      </Labelled>
      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">{lt(locale, { en: 'Hadith text and translations: open hadith-api (fawazahmed0). See About for credits and licence.', bn: 'হাদিসের পাঠ ও অনুবাদ: ওপেন hadith-api (fawazahmed0)। কৃতজ্ঞতা ও লাইসেন্সের জন্য “পরিচিতি” দেখুন।', ar: 'نصوص الأحاديث وترجماتها من مشروع hadith-api المفتوح (fawazahmed0). راجع صفحة «عن الموقع» للشكر والترخيص.' })}</p>
    </div>
  )
}
