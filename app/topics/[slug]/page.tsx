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
import { UiIcon } from '@/components/ui-icon'
import { topics, topicBySlug, topicCategories } from '@/data/content/topics'
import { duaBySlug } from '@/data/content/duas'
import { topicVerses, refLabel } from '@/lib/content/resolve'
import { articleLd, buildMeta, clip } from '@/lib/content/seo'

type P = { params: Promise<{ slug: string }> }
export const dynamicParams = false
export const generateStaticParams = () => topics.map((t) => ({ slug: t.slug }))

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params
  const t = topicBySlug(slug)
  if (!t) return {}
  return buildMeta({
    title: `What Does the Quran Say About ${cap(t.en)}? ${t.bn} | ${t.refs.length} Verses`,
    description: clip(`${t.introEn} Read the verses in Arabic with English and Bangla translation. ${t.bn} সম্পর্কে কুরআনের আয়াত।`, 165),
    path: `/topics/${t.slug}`,
    type: 'article',
    keywords: [`Quran verses about ${t.en}`, `what does the Quran say about ${t.en}`, `${t.en} in Islam`, `${t.bn} কুরআনের আয়াত`, `${t.bn} নিয়ে কুরআন`, ...t.keywords],
  })
}

export default async function TopicPage({ params }: P) {
  const { slug } = await params
  const t = topicBySlug(slug)
  if (!t) notFound()
  const verses = await topicVerses(t)
  const cat = topicCategories.find((c) => c.id === t.cat)!
  const idx = topics.findIndex((x) => x.slug === t.slug)
  const prev = topics[(idx - 1 + topics.length) % topics.length]
  const next = topics[(idx + 1) % topics.length]
  const related = t.related.map((s) => topicBySlug(s)).filter((x) => !!x)
  const relDuas = t.duas.map((s) => duaBySlug(s)).filter((x) => !!x)

  // Quote the shortest of the first three verses in FAQ answers (always from the corpus).
  const quote = [...verses.slice(0, 3)].sort((a, b) => a.en.length - b.en.length)[0]
  const path = `/topics/${t.slug}`
  const faqs = [
    { q: `What does the Quran say about ${t.en}?`, a: `${t.introEn} For example, ${refLabel(`${quote.surah}:${quote.n}`)}: “${quote.en}”` },
    { q: `কুরআনে ${t.bn} সম্পর্কে কী বলা হয়েছে?`, a: `${t.introBn} যেমন, ${refLabel(`${quote.surah}:${quote.n}`)}: “${quote.bn}”` },
    { q: `Which verses of the Quran mention ${t.en}?`, a: `Key verses include ${t.refs.map(refLabel).join(', ')}.` },
    ...(relDuas.length ? [{ q: `Is there a dua related to ${t.en}?`, a: `Yes. Authentic duas on this theme include ${relDuas.map((d) => `“${d!.title.en}” (${d!.source})`).join('; ')}.` }] : []),
  ]

  return (
    <div className={pageShell}>
      <JsonLd data={articleLd({ headline: `What does the Quran say about ${t.en}?`, description: t.introEn, path, about: t.en, keywords: [t.en, t.bn, ...t.keywords] })} />
      <Breadcrumbs items={[{ name: 'Topics', href: '/topics' }, { name: cap(t.en), href: path }]} className="mb-4" />

      <PageHero
        eyebrow={`${cat.title.en} · ${cat.title.bn}`}
        icon={cat.icon}
        title={<>What does the Quran say about {t.en}? <span className="font-bangla mt-2 block text-xl font-medium text-gold sm:text-3xl">({t.bn})</span></>}
        subtitle={t.introEn}
      >
        <p lang="bn" className="font-bangla mt-3 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{t.introBn}</p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <ShareButton title={`What does the Quran say about ${t.en}?`} path={path} />
          <span className="rounded-full bg-card/80 px-3 py-2 text-xs font-semibold text-muted-foreground">{verses.length} verses · {t.refs.length} passages</span>
        </div>
      </PageHero>

      <nav aria-label="Verses on this page" className="mt-6 flex flex-wrap gap-2">
        {t.refs.map((r) => {
          const [s, a] = r.split(':'); const first = a.split('-')[0]
          return <a key={r} href={`#ayah-${s}-${first}`} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary">{refLabel(r)}</a>
        })}
      </nav>

      <section aria-label="Verses" className="mt-6 space-y-4">
        {verses.map((v, i) => <AyahCard key={v.k} verse={v} index={i} />)}
      </section>

      <Reveal className="mt-10">
        <section aria-labelledby="reflect-h" className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gold-soft/40 p-6 sm:p-8">
          <div aria-hidden className="bg-pattern pointer-events-none absolute -right-8 -top-8 size-40 rounded-full" />
          <h2 id="reflect-h" className="font-display relative flex items-center gap-2 text-xl font-semibold"><UiIcon name="sparkle" size={22} /> Reflect · ভাবুন</h2>
          <p className="relative mt-3 text-[15px] leading-relaxed">{t.reflect.en}</p>
          <p lang="bn" className="font-bangla relative mt-2 text-[15px] leading-relaxed text-muted-foreground">{t.reflect.bn}</p>
        </section>
      </Reveal>

      {relDuas.length > 0 && (
        <section aria-labelledby="duas-h" className="mt-12">
          <h2 id="duas-h" className="font-display mb-4 text-2xl font-semibold">Related duas <span className="font-bangla text-lg font-medium text-muted-foreground">· সংশ্লিষ্ট দোয়া</span></h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {relDuas.map((d, i) => (
              <li key={d!.slug}><Reveal delay={i * 0.05} className="h-full">
                <Link href={`/dua/${d!.slug}`} className="card-soft lift flex h-full items-start gap-3 rounded-3xl p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent"><UiIcon name="dua" size={22} /></span>
                  <span><span className="block text-[15px] font-semibold leading-snug">{d!.title.en}</span><span className="font-bangla block text-sm text-gold">{d!.title.bn}</span><span className="mt-1 block text-xs text-muted-foreground">{d!.source}</span></span>
                </Link>
              </Reveal></li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="rel-h" className="mt-12">
          <h2 id="rel-h" className="font-display mb-4 text-2xl font-semibold">Related topics <span className="font-bangla text-lg font-medium text-muted-foreground">· সম্পর্কিত বিষয়</span></h2>
          <div className="flex flex-wrap gap-2.5">
            {related.map((r) => (
              <Link key={r!.slug} href={`/topics/${r!.slug}`} className="lift rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-accent">
                <span className="capitalize">{r!.en}</span> <span className="font-bangla text-gold">· {r!.bn}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Faq faqs={faqs} />

      <nav aria-label="Previous and next topic" className="mt-12 grid gap-3 sm:grid-cols-2">
        <Link href={`/topics/${prev.slug}`} className="card-soft lift rounded-3xl p-4 text-sm"><span className="text-xs text-muted-foreground">← Previous topic</span><span className="mt-1 block font-semibold capitalize">{prev.en}</span></Link>
        <Link href={`/topics/${next.slug}`} className="card-soft lift rounded-3xl p-4 text-right text-sm"><span className="text-xs text-muted-foreground">Next topic →</span><span className="mt-1 block font-semibold capitalize">{next.en}</span></Link>
      </nav>
    </div>
  )
}
