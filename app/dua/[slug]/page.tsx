import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { Faq } from '@/components/content/faq'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { Reveal } from '@/components/content/reveal'
import { CopyButton, ShareButton } from '@/components/content/copy-button'
import { DuaBookmark } from '@/components/content/dua-bookmark'
import { UiIcon } from '@/components/ui-icon'
import { duas, duaBySlug, duaCategories } from '@/data/content/duas'
import { topics } from '@/data/content/topics'
import { resolveDua, refLabel } from '@/lib/content/resolve'
import { articleLd, buildMeta, clip, howToLd, shortTitle } from '@/lib/content/seo'
import { chapters, readerHref } from '@/lib/quran/chapters'

type P = { params: Promise<{ slug: string }> }
export const dynamicParams = false
export const generateStaticParams = () => duas.map((d) => ({ slug: d.slug }))

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params
  const d = duaBySlug(slug)
  if (!d) return {}
  const r = await resolveDua(d)
  return buildMeta({
    title: `${d.title.en} | Arabic, Meaning & Source | ${d.title.bn}`,
    description: clip(`${r.meaning.en} — ${d.source}. Arabic text, transliteration and Bangla meaning. ${r.meaning.bn}`, 165),
    path: `/dua/${d.slug}`,
    type: 'article',
    keywords: [d.title.en, d.title.bn, ...(d.keywords ?? []), 'dua', 'দোয়া', 'dua meaning', 'dua in Arabic'],
  })
}

export default async function DuaPage({ params }: P) {
  const { slug } = await params
  const d0 = duaBySlug(slug)
  if (!d0) notFound()
  const d = await resolveDua(d0)
  const cat = duaCategories.find((c) => c.id === d.cat)!
  const path = `/dua/${d.slug}`
  const related = (d.related ?? []).map((s) => duaBySlug(s)).filter((x) => !!x)
  const relTopics = topics.filter((t) => t.duas.includes(d.slug))
  const copyText = `${d.ar}\n\n${d.tl}\n\n${d.meaning.en}\n\n${d.meaning.bn}\n\n— ${d.source}`

  const faqs = [
    { q: `What is the meaning of ${shortTitle(d.title.en)}?`, a: d.meaning.en },
    { q: `${shortTitle(d.title.bn)} এর অর্থ কী?`, a: d.meaning.bn },
    { q: 'When should I recite this dua?', a: d.when.en + (d.count ? ` Number of times: ${d.count}.` : '') },
    { q: 'What is the source of this dua?', a: `${d.source}.` },
  ]
  const steps = [
    { name: 'Choose the right moment', text: d.when.en },
    { name: 'Recite the dua', text: `${d.tl}${d.count ? ` (${d.count})` : ''}` },
    { name: 'Reflect on the meaning', text: d.meaning.en },
  ]

  return (
    <div className={pageShell}>
      <JsonLd data={[
        articleLd({ headline: d.title.en, description: d.meaning.en, path, about: 'Dua', keywords: [...(d.keywords ?? [])] }),
        howToLd({ name: `How to recite: ${d.title.en}`, description: `When and how to make this dua. ${d.source}.`, path, steps }),
      ]} />
      <Breadcrumbs items={[{ name: 'Duas', href: '/dua' }, { name: cat.title.en, href: `/dua#${cat.id}` }, { name: shortTitle(d.title.en), href: path }]} className="mb-4" />

      <PageHero eyebrow={`${cat.title.en} · ${cat.title.bn}`} icon={cat.icon} title={d.title.en} subtitle={undefined}>
        <p lang="bn" className="font-bangla mt-2 text-xl font-medium text-gold sm:text-2xl">{d.title.bn}</p>
      </PageHero>

      <Reveal className="mt-6">
        <article className="card-soft relative overflow-hidden rounded-[2rem] p-6 sm:p-10">
          <div aria-hidden className="bg-pattern pointer-events-none absolute -left-12 -top-12 size-56 rounded-full [mask-image:radial-gradient(circle,#000,transparent_70%)]" />
          <p lang="ar" dir="rtl" className="quran-text relative text-center text-[clamp(1.75rem,5.5vw,3rem)] leading-[2.2]">{d.ar}</p>
          <div className="relative mx-auto mt-6 max-w-2xl space-y-5 text-center">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gold">Transliteration</h2>
              <p className="mt-1 text-[15px] italic leading-relaxed text-muted-foreground">{d.tl}</p>
            </div>
            <div data-tr="en">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gold">Meaning</h2>
              <p lang="en" className="mt-1 text-lg leading-relaxed">{d.meaning.en}</p>
            </div>
            <div data-tr="bn">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gold">অর্থ</h2>
              <p lang="bn" className="font-bangla mt-1 text-lg leading-relaxed">{d.meaning.bn}</p>
            </div>
          </div>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-2">
            <CopyButton text={copyText} label={{ en: 'Copy dua', bn: 'দোয়া কপি' }} />
            <ShareButton title={d.title.en} text={d.meaning.en} path={path} />
            <DuaBookmark slug={d.slug} variant="pill" />
          </div>
        </article>
      </Reveal>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Reveal><section className="card-soft h-full rounded-3xl p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><UiIcon name="info" size={18} /> Source · উৎস</h2>
          <p className="mt-2 text-[15px] font-medium">{d.source}</p>
          {d.verses && (
            <p className="mt-2 flex flex-wrap gap-2 text-xs">
              {d.refs!.map((r) => { const [s, a] = r.split(':'); const first = +a.split('-')[0]; return (
                <Link key={r} href={readerHref(+s, first)} className="rounded-full bg-accent px-3 py-1.5 font-semibold text-accent-foreground hover:bg-primary hover:text-primary-foreground">
                  <span className="font-arabic">{chapters[+s - 1].nameArabic}</span> {refLabel(r)} · Read in context
                </Link>) })}
            </p>
          )}
        </section></Reveal>
        <Reveal delay={0.05}><section className="card-soft h-full rounded-3xl p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><UiIcon name="clock" size={18} /> When to recite · কখন পড়বেন</h2>
          <p className="mt-2 text-[15px] leading-relaxed">{d.when.en}</p>
          <p lang="bn" className="font-bangla mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{d.when.bn}</p>
          {d.count && <p className="mt-2 text-xs font-semibold text-gold">Repeat: {d.count}</p>}
        </section></Reveal>
      </div>

      {d.virtue && (
        <Reveal className="mt-4"><section className="rounded-3xl border border-gold/30 bg-gold-soft/40 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><UiIcon name="sparkle" size={18} /> Virtue · ফজিলত</h2>
          <p className="mt-2 text-[15px] leading-relaxed">{d.virtue.en}</p>
          <p lang="bn" className="font-bangla mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{d.virtue.bn}</p>
        </section></Reveal>
      )}

      {related.length > 0 && (
        <section aria-labelledby="rel-h" className="mt-12">
          <h2 id="rel-h" className="font-display mb-4 text-2xl font-semibold">Related duas <span className="font-bangla text-lg font-medium text-muted-foreground">· সম্পর্কিত দোয়া</span></h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {related.map((r, i) => (
              <li key={r!.slug}><Reveal delay={i * 0.05} className="h-full">
                <Link href={`/dua/${r!.slug}`} className="card-soft lift block h-full rounded-3xl p-4">
                  <span className="block text-[15px] font-semibold leading-snug">{r!.title.en}</span>
                  <span className="font-bangla block text-sm text-gold">{r!.title.bn}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{r!.source}</span>
                </Link>
              </Reveal></li>
            ))}
          </ul>
        </section>
      )}

      {relTopics.length > 0 && (
        <section className="mt-10" aria-labelledby="topics-h">
          <h2 id="topics-h" className="font-display mb-3 text-xl font-semibold">What the Quran says about…</h2>
          <div className="flex flex-wrap gap-2.5">
            {relTopics.map((t) => <Link key={t.slug} href={`/topics/${t.slug}`} className="lift rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-accent"><span className="capitalize">{t.en}</span> <span className="font-bangla text-gold">· {t.bn}</span></Link>)}
          </div>
        </section>
      )}

      <Faq faqs={faqs} />
      <p className="mt-8 text-center text-xs text-muted-foreground"><Link href="/dua" className="font-semibold text-primary hover:underline">← All duas · সব দোয়া</Link></p>
    </div>
  )
}
