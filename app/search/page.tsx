import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { Marked } from '@/components/content/marked'
import { Reveal } from '@/components/content/reveal'
import { searchQuran } from '@/lib/quran/search'
import { chapters, readerHref, surahHref, toArabicDigits } from '@/lib/quran/chapters'
import { parseRef } from '@/lib/quran/data'
import { buildMeta } from '@/lib/content/seo'
import { topics } from '@/data/content/topics'
import { lt } from '@/lib/i18n/lt'
import { T } from '@/lib/i18n/text'
import { SurahName } from '@/lib/i18n/surah-name'
import { SearchBox } from '@/components/content/search-box'

type SP = Promise<{ q?: string | string[]; limit?: string | string[]; surah?: string | string[] }>
const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? ''
const STEP = 20

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const q = one((await searchParams).q).trim()
  if (!q) {
    return buildMeta({ title: 'Search the Quran in Arabic, English & Bangla | কুরআন অনুসন্ধান', description: 'Search all 6,236 verses of the Quran by word or phrase in Arabic, English or Bangla.', path: '/search', noindex: true })
  }
  return buildMeta({ title: `“${q}” in the Quran: Search Results | কুরআনে অনুসন্ধান`, description: `Verses of the Quran matching “${q}”, with Arabic text and English and Bangla translation.`, path: `/search?q=${encodeURIComponent(q)}`, noindex: true })
}

const suggestions = ['patience', 'mercy', 'forgive', 'paradise', 'prayer', 'light', 'সবর', 'দয়া', 'رحمة', 'صبر']
/** Suggestions are search queries, so they stay in their own script. */

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams
  const q = one(sp.q).trim()
  const limit = Math.min(Math.max(parseInt(one(sp.limit)) || STEP, STEP), 200)
  const surah = parseInt(one(sp.surah)) || 0
  const ref = q ? parseRef(q) : null

  let total = 0
  let hits: Awaited<ReturnType<typeof searchQuran>>['hits'] = []
  let facets: { id: number; n: number }[] = []
  if (q.length >= 2) {
    // Fetch a wide window so we can build the surah facets and filter without a second index pass.
    const res = await searchQuran(q, 800)
    total = res.total
    const counts = new Map<number, number>()
    for (const h of res.hits) counts.set(h.surah, (counts.get(h.surah) ?? 0) + 1)
    facets = [...counts].map(([id, n]) => ({ id, n })).sort((a, b) => b.n - a.n).slice(0, 12)
    hits = surah ? res.hits.filter((h) => h.surah === surah) : res.hits
  }
  const shown = hits.slice(0, limit)
  const qs = (extra: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    const merged: Record<string, string | number | undefined> = { surah: surah || undefined, ...extra }
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, String(v))
    return `/search?${p.toString()}`
  }

  return (
    <div className={pageShell}>
      <Breadcrumbs items={[{ name: 'Search', ar: 'بحث', href: '/search' }]} className="mb-4" />
      <PageHero eyebrow={<>{lt(undefined, { en: 'Search', bn: 'অনুসন্ধান', ar: 'بحث' })}</>} icon="search" title={q ? <>{lt(undefined, { en: 'Results for', bn: 'ফলাফল:', ar: 'نتائج' })} “{q}”</> : lt(undefined, { en: 'Search the Quran', bn: 'কুরআনে অনুসন্ধান', ar: 'ابحث في القرآن' })} subtitle={<>{lt(undefined, { en: 'Search by word or phrase in Arabic, English or Bangla. Try “patience”, “رحمة” or “সবর”.', bn: 'আরবি, ইংরেজি বা বাংলায় শব্দ বা বাক্যাংশ দিয়ে খুঁজুন। চেষ্টা করুন “patience”, “رحمة” বা “সবর”।', ar: 'ابحث بكلمة أو عبارة بالعربية أو الإنجليزية أو البنغالية. جرّب «رحمة» أو «patience» أو «সবর».' })}</>}>
        <SearchBox q={q} />
      </PageHero>

      {ref && (
        <Link href={readerHref(ref.surah, ref.from)} className="card-soft lift mt-6 flex items-center justify-between rounded-3xl p-4">
          <span><span className="text-xs text-muted-foreground">{lt(undefined, { en: 'Go to verse', bn: 'আয়াতে যান', ar: 'انتقل إلى الآية' })}</span><span className="block font-semibold"><SurahName id={ref.surah} /> {ref.surah}:{ref.from}{ref.to > ref.from ? `–${ref.to}` : ''}</span></span>
          <span lang="ar" className="font-arabic text-2xl">{chapters[ref.surah - 1].nameArabic}</span>
        </Link>
      )}

      {q.length >= 2 && (
        <>
          <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
            <strong className="text-foreground">{total.toLocaleString()}</strong> {lt(undefined, { en: total === 1 ? 'verse found' : 'verses found', bn: 'টি আয়াত পাওয়া গেছে', ar: total === 1 ? 'آية مطابقة' : 'آيات مطابقة' })}{surah ? <> · {lt(undefined, { en: 'in', bn: 'সূরা', ar: 'في' })} <strong className="text-foreground"><SurahName id={surah} /></strong> ({hits.length})</> : null}
          </p>
          {facets.length > 1 && (
            <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              <Link href={qs({ surah: undefined, limit: undefined })} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${!surah ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-accent'}`}>{lt(undefined, { en: 'All surahs', bn: 'সব সূরা', ar: 'كل السور' })}</Link>
              {facets.map((f) => (
                <Link key={f.id} href={qs({ surah: f.id, limit: undefined })} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${surah === f.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-accent'}`}>
                  <SurahName id={f.id} /> <span className="text-muted-foreground">{f.n}</span>
                </Link>
              ))}
            </div>
          )}

          <ol className="mt-5 space-y-3">
            {shown.map((h, i) => (
              <li key={h.key}>
                <Reveal delay={Math.min(i, 5) * 0.03}>
                  <article className="card-soft rounded-3xl p-5">
                    <header className="mb-3 flex items-center justify-between gap-2">
                      <Link href={surahHref(h.surah, h.ayah)} className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:bg-primary hover:text-primary-foreground">
                        <span lang="ar" className="font-arabic text-sm">{chapters[h.surah - 1].nameArabic}</span> <SurahName id={h.surah} /> {h.surah}:{h.ayah}
                      </Link>
                      <Link href={readerHref(h.surah, h.ayah)} className="text-xs font-medium text-muted-foreground hover:text-primary">{lt(undefined, { en: 'Read in context', bn: 'প্রসঙ্গসহ পড়ুন', ar: 'اقرأ في سياقها' })} <span aria-hidden className="inline-block rtl:rotate-180">→</span></Link>
                    </header>
                    <p lang="ar" dir="rtl" className="quran-text text-right text-[26px] leading-[2.1]"><Marked text={h.ar} query={q} /> <span className="ayah-marker">{toArabicDigits(h.ayah)}</span></p>
                    <p data-tr="en" lang="en" className="mt-3 text-[15px] leading-relaxed text-foreground/90"><Marked text={h.en} query={q} /></p>
                    <p data-tr="bn" lang="bn" className="font-bangla mt-2 text-[15px] leading-relaxed text-foreground/90"><Marked text={h.bn} query={q} /></p>
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>

          {hits.length > shown.length && (
            <div className="mt-6 text-center">
              <Link href={qs({ limit: limit + STEP })} scroll={false} className="inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition active:scale-95">{lt(undefined, { en: `Show ${Math.min(STEP, hits.length - shown.length)} more of ${hits.length - shown.length}`, bn: `আরও ${Math.min(STEP, hits.length - shown.length)}টি দেখান (বাকি ${hits.length - shown.length}টির মধ্যে)`, ar: `عرض ${Math.min(STEP, hits.length - shown.length)} أخرى من ${hits.length - shown.length}` })}</Link>
            </div>
          )}
        </>
      )}

      {(q.length < 2 || total === 0) && (
        <section className="mt-8">
          {q.length >= 2 && total === 0 && <p className="card-soft rounded-3xl p-6 text-sm">{lt(undefined, { en: `No verses matched “${q}”. Try a shorter or different word, or browse the suggestions below.`, bn: `“${q}” এর সঙ্গে মিলে এমন কোনো আয়াত পাওয়া যায়নি। ছোট বা অন্য শব্দ দিয়ে চেষ্টা করুন, বা নিচের পরামর্শ দেখুন।`, ar: `لم نجد آيات تطابق «${q}». جرّب كلمة أقصر أو مختلفة، أو تصفّح الاقتراحات أدناه.` })}</p>}
          <h2 className="font-display mb-3 mt-6 text-xl font-semibold">{lt(undefined, { en: 'Try searching for', bn: 'এগুলো খুঁজে দেখুন', ar: 'جرّب البحث عن' })}</h2>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="lift rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-accent">{s}</Link>)}
          </div>
          <h2 className="font-display mb-3 mt-8 text-xl font-semibold">{lt(undefined, { en: 'Or explore by topic', bn: 'অথবা বিষয় অনুযায়ী দেখুন', ar: 'أو تصفّح حسب الموضوع' })}</h2>
          <div className="flex flex-wrap gap-2">
            {topics.slice(0, 14).map((t) => <Link key={t.slug} href={`/topics/${t.slug}`} className="lift rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-accent"><span className="capitalize"><T en={t.en} bn={t.bn} ar={t.ar} /></span></Link>)}
            <Link href="/topics" className="rounded-full px-4 py-2 text-sm font-semibold text-primary hover:underline">{lt(undefined, { en: 'All topics', bn: 'সব বিষয়', ar: 'كل المواضيع' })} <span aria-hidden className="inline-block rtl:rotate-180">→</span></Link>
          </div>
        </section>
      )}
    </div>
  )
}
