import Link from 'next/link'
import type { Metadata } from 'next'
import { Search } from 'lucide-react'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { Marked } from '@/components/content/marked'
import { Reveal } from '@/components/content/reveal'
import { searchQuran } from '@/lib/quran/search'
import { chapters, readerHref, surahHref, toArabicDigits } from '@/lib/quran/chapters'
import { parseRef } from '@/lib/quran/data'
import { buildMeta } from '@/lib/content/seo'
import { topics } from '@/data/content/topics'

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
      <Breadcrumbs items={[{ name: 'Search', href: '/search' }]} className="mb-4" />
      <PageHero eyebrow="Search · অনুসন্ধান" icon="search" title={q ? <>Results for “{q}”</> : 'Search the Quran'} subtitle="Search by word or phrase in Arabic, English or Bangla. Try “patience”, “رحمة” or “সবর”.">
        <form action="/search" role="search" className="relative mt-6 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input name="q" defaultValue={q} autoComplete="off" placeholder="Search the Quran…" className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-28 text-[15px] shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15" />
          <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition active:scale-95">Search</button>
        </form>
      </PageHero>

      {ref && (
        <Link href={readerHref(ref.surah, ref.from)} className="card-soft lift mt-6 flex items-center justify-between rounded-3xl p-4">
          <span><span className="text-xs text-muted-foreground">Go to verse</span><span className="block font-semibold">{chapters[ref.surah - 1].nameSimple} {ref.surah}:{ref.from}{ref.to > ref.from ? `–${ref.to}` : ''}</span></span>
          <span lang="ar" className="font-arabic text-2xl">{chapters[ref.surah - 1].nameArabic}</span>
        </Link>
      )}

      {q.length >= 2 && (
        <>
          <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
            <strong className="text-foreground">{total.toLocaleString()}</strong> verse{total === 1 ? '' : 's'} found{surah ? <> · in <strong className="text-foreground">{chapters[surah - 1].nameSimple}</strong> ({hits.length})</> : null}
          </p>
          {facets.length > 1 && (
            <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              <Link href={qs({ surah: undefined, limit: undefined })} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${!surah ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-accent'}`}>All surahs</Link>
              {facets.map((f) => (
                <Link key={f.id} href={qs({ surah: f.id, limit: undefined })} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${surah === f.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-accent'}`}>
                  {chapters[f.id - 1].nameSimple} <span className="opacity-60">{f.n}</span>
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
                        <span lang="ar" className="font-arabic text-sm">{chapters[h.surah - 1].nameArabic}</span> {h.surahName} {h.surah}:{h.ayah}
                      </Link>
                      <Link href={readerHref(h.surah, h.ayah)} className="text-xs font-medium text-muted-foreground hover:text-primary">Read in context →</Link>
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
              <Link href={qs({ limit: limit + STEP })} scroll={false} className="inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition active:scale-95">Show {Math.min(STEP, hits.length - shown.length)} more of {hits.length - shown.length}</Link>
            </div>
          )}
        </>
      )}

      {(q.length < 2 || total === 0) && (
        <section className="mt-8">
          {q.length >= 2 && total === 0 && <p className="card-soft rounded-3xl p-6 text-sm">No verses matched “{q}”. Try a shorter or different word, or browse the suggestions below.</p>}
          <h2 className="font-display mb-3 mt-6 text-xl font-semibold">Try searching for</h2>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="lift rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-accent">{s}</Link>)}
          </div>
          <h2 className="font-display mb-3 mt-8 text-xl font-semibold">Or explore by topic</h2>
          <div className="flex flex-wrap gap-2">
            {topics.slice(0, 14).map((t) => <Link key={t.slug} href={`/topics/${t.slug}`} className="lift rounded-full border border-border bg-card px-4 py-2 text-sm hover:bg-accent"><span className="capitalize">{t.en}</span></Link>)}
            <Link href="/topics" className="rounded-full px-4 py-2 text-sm font-semibold text-primary hover:underline">All topics →</Link>
          </div>
        </section>
      )}
    </div>
  )
}
