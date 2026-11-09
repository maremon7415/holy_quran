import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { Reveal } from '@/components/content/reveal'
import { MoodPicker, type Mood } from '@/components/content/mood-picker'
import { UiIcon } from '@/components/ui-icon'
import { topics, topicCategories, topicBySlug } from '@/data/content/topics'
import { duaBySlug } from '@/data/content/duas'
import { getVersesByRefs } from '@/lib/quran/data'
import { readerHref } from '@/lib/quran/chapters'
import { buildMeta, collectionLd } from '@/lib/content/seo'
import { refLabel } from '@/lib/content/resolve'

export const metadata: Metadata = buildMeta({
  title: 'What Does the Quran Say About…? Verses by Topic & Feeling | কুরআনে বিষয়ভিত্তিক আয়াত',
  description: 'Explore what the Quran says about anxiety, patience, rizq, parents, forgiveness, death and 30+ more topics, with Arabic, English and Bangla translation for every verse. কুরআনের আয়াত বিষয়ভিত্তিক।',
  path: '/topics',
  keywords: ['what does the Quran say about', 'Quran verses about anxiety', 'Quran verses about patience', 'Quran topics', 'কুরআনের আয়াত বিষয়', 'ধৈর্য নিয়ে কুরআনের আয়াত'],
})

const moodDefs: { id: string; icon: string; label: { en: string; bn: string }; slug: string; refIndex?: number }[] = [
  { id: 'anxious', icon: 'heart', label: { en: 'Anxious', bn: 'দুশ্চিন্তিত' }, slug: 'anxiety' },
  { id: 'sad', icon: 'moon', label: { en: 'Sad', bn: 'মন খারাপ' }, slug: 'grief-sadness', refIndex: 1 },
  { id: 'lonely', icon: 'lantern', label: { en: 'Lonely', bn: 'একাকী' }, slug: 'loneliness' },
  { id: 'angry', icon: 'focus', label: { en: 'Angry', bn: 'রাগান্বিত' }, slug: 'anger' },
  { id: 'hopeless', icon: 'sun', label: { en: 'Hopeless', bn: 'হতাশ' }, slug: 'hopelessness' },
  { id: 'afraid', icon: 'kaaba', label: { en: 'Afraid', bn: 'ভীত' }, slug: 'fear' },
  { id: 'guilty', icon: 'hands', label: { en: 'Guilty', bn: 'অনুতপ্ত' }, slug: 'guilt-forgiveness', refIndex: 2 },
  { id: 'grateful', icon: 'sparkle', label: { en: 'Grateful', bn: 'কৃতজ্ঞ' }, slug: 'gratitude' },
  { id: 'content', icon: 'crescent', label: { en: 'At peace', bn: 'প্রশান্ত' }, slug: 'contentment' },
]

export default async function TopicsPage() {
  const moods: Mood[] = []
  for (const m of moodDefs) {
    const t = topicBySlug(m.slug)!
    const ref = t.refs[m.refIndex ?? 0]
    const [v] = await getVersesByRefs([ref])
    const dua = t.duas.map((s) => duaBySlug(s)).find(Boolean)
    moods.push({
      id: m.id, icon: m.icon, label: m.label, topicSlug: t.slug, topicTitle: { en: t.en, bn: t.bn },
      ayah: { ref: refLabel(`${v.surah}:${v.n}`), ar: v.ar, en: v.en, bn: v.bn, href: readerHref(v.surah, v.n) },
      duaSlug: dua?.slug, duaTitle: dua?.title,
    })
  }
  return (
    <div className={pageShell}>
      <JsonLd data={collectionLd({ name: 'Quran topics', description: metadata.description as string, path: '/topics', items: topics.map((t) => ({ name: `What the Quran says about ${t.en}`, href: `/topics/${t.slug}` })) })} />
      <Breadcrumbs items={[{ name: 'Topics', href: '/topics' }]} className="mb-4" />
      <PageHero
        eyebrow="Quran by topic · বিষয়ভিত্তিক"
        icon="topics"
        title={<>What does the Quran say about…<span className="mt-1 block text-lg font-medium text-muted-foreground sm:text-2xl">কুরআন কী বলে?</span></>}
        subtitle={`${topics.length} topics, each with carefully chosen verses in Arabic, English and Bangla. Browse by feeling, character, family, faith or society. প্রতিটি বিষয়ের জন্য বাছাই করা আয়াত, আরবি, ইংরেজি ও বাংলা অনুবাদসহ।`}
      />
      <div className="mt-8"><MoodPicker moods={moods} /></div>

      {topicCategories.map((cat) => {
        const items = topics.filter((t) => t.cat === cat.id)
        return (
          <section key={cat.id} id={cat.id} aria-labelledby={`${cat.id}-h`} className="mt-12 scroll-mt-24">
            <Reveal>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-accent"><UiIcon name={cat.icon} size={26} /></span>
                <div>
                  <h2 id={`${cat.id}-h`} className="font-display text-2xl font-semibold">{cat.title.en} <span className="font-bangla text-lg font-medium text-muted-foreground">· {cat.title.bn}</span></h2>
                  <p className="text-sm text-muted-foreground">{cat.blurb.en} · {cat.blurb.bn}</p>
                </div>
              </div>
            </Reveal>
            <ul className="grid gap-3 sm:grid-cols-2">
              {items.map((t, i) => (
                <li key={t.slug}>
                  <Reveal delay={Math.min(i * 0.04, 0.2)} className="h-full">
                    <Link href={`/topics/${t.slug}`} className="card-soft lift group flex h-full flex-col rounded-3xl p-5">
                      <span className="font-display text-lg font-semibold capitalize leading-snug group-hover:text-primary">{t.en}</span>
                      <span className="font-bangla text-sm text-gold">{t.bn}</span>
                      <span className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{t.introEn}</span>
                      <span className="mt-auto pt-4 text-xs font-semibold text-primary">{t.refs.length} verses →</span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
