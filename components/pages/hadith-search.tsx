import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { pageShell } from '@/components/content/page-hero'
import { UiIcon } from '@/components/ui-icon'
import { CName } from '@/components/hadith/names'
import { HadithSearchForm } from '@/components/hadith/search-form'
import { Pagination } from '@/components/hadith/pagination'
import { buildMeta } from '@/lib/content/seo'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { bnNum } from '@/lib/i18n/t'
import { lt } from '@/lib/i18n/lt'
import { T } from '@/lib/i18n/text'
import { COLLECTIONS, collectionMeta } from '@/lib/hadith/collections'
import { searchHadith } from '@/lib/hadith/search'
import { highlightParts, MAX_HADITH_QUERY } from '@/lib/hadith/search-utils'
import { featuredFor } from '@/lib/hadith/hadith'
import { hadithUrl, searchUrl } from '@/lib/hadith/url'

const PAGE = 15
export type SearchProps = { searchParams: Promise<{ q?: string | string[]; c?: string | string[]; page?: string | string[] }> }
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

/** Search result pages are never indexed (thin, infinite URL space); links on them are still followed. */
export async function hadithSearchMeta(locale: Locale, { searchParams }: SearchProps): Promise<Metadata> {
  const q = one((await searchParams).q).trim().slice(0, 80)
  return buildMeta({
    title: q ? (locale === 'bn' ? `“${q}” — হাদিস অনুসন্ধান` : `“${q}” — hadith search`) : locale === 'bn' ? 'হাদিস অনুসন্ধান' : 'Search hadith',
    description: locale === 'bn' ? 'আরবি, বাংলা ও ইংরেজিতে হাদিস খুঁজুন।' : 'Search the hadith collections in Arabic, English and Bangla.',
    path: '/hadith/search', locale, noindex: true,
  })
}

export async function HadithSearchPage({ locale, searchParams }: { locale: Locale } & SearchProps) {
  const sp = await searchParams
  const q = one(sp.q).slice(0, MAX_HADITH_QUERY).trim()
  const cRaw = one(sp.c)
  const col = COLLECTIONS.find((c) => c.slug === cRaw)?.slug
  const page = Math.min(Math.max(parseInt(one(sp.page), 10) || 1, 1), 200)
  const bn = locale === 'bn'
  const res = q.length >= 2 ? await searchHadith(q, { collection: col, limit: PAGE, offset: (page - 1) * PAGE }) : null
  const pages = res ? Math.max(1, Math.ceil(res.total / PAGE)) : 1
  const N = (v: number | string) => (bn ? bnNum(v) : String(v))
  const examples = bn ? ['ধৈর্য', 'নিয়ত', 'বুখারী ১', 'মুসলিম ২৫৬৪'] : ['patience', 'intentions', 'Bukhari 1', 'Muslim 2564', 'بخاري ١']
  return (
    <div className={pageShell}>
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'হাদিস' : 'Hadith', ar: 'الحديث', href: '/hadith' }, { name: bn ? 'অনুসন্ধান' : 'Search', ar: 'بحث', href: '/hadith/search' }]} className="mb-4" />
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{lt(locale, { en: 'Search hadith', bn: 'হাদিস অনুসন্ধান', ar: 'البحث في الأحاديث' })}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{lt(locale, { en: 'Type in English, Bangla or Arabic. The language is detected automatically; use a collection filter for faster results.', bn: 'ইংরেজি, বাংলা বা আরবিতে লিখুন। ভাষা স্বয়ংক্রিয়ভাবে শনাক্ত হয়; দ্রুত ফলের জন্য একটি গ্রন্থ বেছে নিন।', ar: 'اكتب بالإنجليزية أو البنغالية أو العربية؛ يُكتشف نوع اللغة تلقائيًا، وللنتائج الأسرع اختر كتابًا محددًا.' })}</p>
      <div className="mt-5"><HadithSearchForm locale={locale} defaultValue={q} collection={col} /></div>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label={bn ? 'গ্রন্থ ফিল্টার' : 'Collection filter'}>
        <li><Link href={q ? searchUrl(q, locale) : localeHref(locale, '/hadith/search')} aria-current={!col ? 'true' : undefined} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${!col ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary/40'}`}>{lt(locale, { en: 'All collections', bn: 'সব গ্রন্থ', ar: 'كل الكتب' })}</Link></li>
        {COLLECTIONS.map((c) => (
          <li key={c.slug}><Link href={q ? searchUrl(q, locale, { collection: c.slug }) : `${localeHref(locale, '/hadith/search')}?c=${c.slug}`} aria-current={col === c.slug ? 'true' : undefined} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${col === c.slug ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary/40'}`}><CName slug={c.slug} locale={locale} /></Link></li>
        ))}
      </ul>

      {!res && (
        <div className="card-soft mt-8 rounded-3xl p-6">
          <p className="font-semibold">{lt(locale, { en: 'Try searching for', bn: 'যেমন খুঁজে দেখুন', ar: 'جرّب البحث عن' })}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {examples.map((e) => <li key={e}><Link href={searchUrl(e, locale)} className="rounded-full bg-accent px-3.5 py-1.5 text-sm font-semibold text-primary" dir="auto">{e}</Link></li>)}
          </ul>
        </div>
      )}

      {res?.exact && (
        <Link href={hadithUrl(res.exact.collection, res.exact.number, locale)} className="card-soft lift mt-8 flex items-center gap-4 rounded-3xl border-primary/30 p-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10"><UiIcon name="quran" size={26} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-primary">{lt(locale, { en: 'Go to hadith', bn: 'হাদিসে যান', ar: 'انتقل إلى الحديث' })}</span>
            <span className="block text-lg font-semibold" lang={bn ? 'bn' : 'en'}>{bn ? `${collectionMeta(res.exact.collection)!.name.bn} ${bnNum(res.exact.number)}` : `${collectionMeta(res.exact.collection)!.cite} ${res.exact.number}`}</span>
          </span>
          <ArrowRight className="size-5 text-primary rtl:rotate-180" />
        </Link>
      )}

      {res && !res.exact && (
        <section aria-live="polite" className="mt-8">
          <p className="text-sm text-muted-foreground" role="status">
            {res.total > 0
              ? lt(locale, { en: `${res.total.toLocaleString('en-US')} hadith${res.total === 1 ? '' : 's'} for “${res.query}”${col ? ` in ${collectionMeta(col)!.cite}` : ''}`, bn: `“${res.query}” এর জন্য ${bnNum(res.total.toLocaleString('en-US'))}টি হাদিস${col ? ` (${collectionMeta(col)!.name.bn})` : ''}`, ar: `${res.total.toLocaleString('en-US')} نتيجة لـ «${res.query}»` })
              : lt(locale, { en: `No hadith found for “${res.query}”.`, bn: `“${res.query}” এর জন্য কোনো হাদিস পাওয়া যায়নি।`, ar: `لا توجد نتائج لـ «${res.query}».` })}
          </p>
          {res.failed.length > 0 && <p className="mt-2 rounded-2xl border border-border bg-muted/60 px-4 py-3 text-xs text-muted-foreground" role="alert">{lt(locale, { en: 'Some collections could not be searched right now (network). Results may be incomplete, please try again.', bn: 'কিছু গ্রন্থে এখন অনুসন্ধান করা যায়নি (নেটওয়ার্ক)। ফল অসম্পূর্ণ হতে পারে; আবার চেষ্টা করুন।', ar: 'تعذّر البحث في بعض الكتب الآن؛ قد تكون النتائج ناقصة، فحاول مجددًا.' })}</p>}
          {res.total === 0 && res.failed.length === 0 && <p className="mt-2 text-sm text-muted-foreground">{lt(locale, { en: 'Try different or fewer words, or another spelling. Bangla and Arabic searches only match text in that language.', bn: 'ভিন্ন বা কম শব্দ, অথবা অন্য বানান চেষ্টা করুন। বাংলা ও আরবি অনুসন্ধান কেবল সেই ভাষার পাঠে মেলে।', ar: 'جرّب كلمات مختلفة أو أقل، أو تهجئة أخرى؛ البحث بالعربية والبنغالية يطابق نصوص تلك اللغة فقط.' })}</p>}
          <ol className="mt-4 grid gap-3" data-list="results">
            {res.results.map((r) => {
              const m = collectionMeta(r.collection)!
              const f = featuredFor(r.collection, r.number)
              return (
                <li key={`${r.collection}-${r.number}`} className="card-soft lift group relative rounded-3xl p-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <Link href={hadithUrl(r.collection, r.number, locale)} className="font-display text-[17px] font-semibold after:absolute after:inset-0 after:content-[''] group-hover:text-primary" lang={bn ? 'bn' : 'en'}>{bn ? `${m.name.bn} ${bnNum(r.number)}` : `${m.cite} ${r.number}`}</Link>
                    {f && <span className="text-sm text-foreground/80" lang={bn ? 'bn' : 'en'}>{bn ? f.bn : f.en}</span>}
                  </div>
                  <p className={`mt-2 text-[15px] leading-relaxed text-muted-foreground ${res.lang === 'bn' ? 'font-bangla' : res.lang === 'ar' ? 'font-arabic text-arabic text-lg leading-[2]' : ''}`} lang={res.lang} dir={res.lang === 'ar' ? 'rtl' : undefined}>
                    {highlightParts(r.snippet, res.terms, res.lang).map((p, i) => (p.hit ? <mark key={i} className="rounded bg-gold-soft px-0.5 text-foreground">{p.t}</mark> : <span key={i}>{p.t}</span>))}
                  </p>
                </li>
              )
            })}
          </ol>
          <Pagination page={page} pages={pages} locale={locale} href={(p) => searchUrl(res.query, locale, { collection: col, page: p })} />
          {res.lang === 'ar' && <p className="mt-4 text-center text-[11px] text-muted-foreground"><T en="Arabic results are shown without diacritics; open a hadith for the full vocalised text." bn="আরবি ফল হারাকাত ছাড়া দেখানো হয়েছে; পূর্ণ পাঠের জন্য হাদিস খুলুন।" ar="تُعرض النتائج العربية بلا تشكيل؛ افتح الحديث لقراءة النص مشكولًا." /></p>}
        </section>
      )}
    </div>
  )
}
