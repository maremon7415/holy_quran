import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { Faq } from '@/components/content/faq'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { NamesExplorer } from '@/components/content/names-grid'
import { asmaUlHusna } from '@/data/content/asma-ul-husna'
import { buildMeta, collectionLd } from '@/lib/content/seo'

export const metadata: Metadata = buildMeta({
  title: '99 Names of Allah (Asma ul Husna): Arabic, Meaning & Quran Reference | আল্লাহর ৯৯ নাম অর্থসহ',
  description: 'All 99 Beautiful Names of Allah (Asma ul Husna) in Arabic with transliteration, English and Bangla meaning, a short explanation and a Quran reference for each. Flashcards and quiz included. আল্লাহর ৯৯টি সুন্দর নাম অর্থসহ।',
  path: '/names-of-allah',
  keywords: ['99 names of Allah', 'Asma ul Husna', '99 names of Allah meaning', 'Allah names in Arabic', 'আল্লাহর ৯৯ নাম', 'আসমাউল হুসনা', 'আল্লাহর নামের অর্থ'],
})

const faqs = [
  { q: 'What are the 99 Names of Allah?', a: 'The 99 Names of Allah, known as Asma ul Husna (the Most Beautiful Names), are names and attributes by which Allah describes Himself in the Quran and the Sunnah, such as Ar-Rahman (the Most Gracious), Al-Ghafur (the Great Forgiver) and Al-Hakim (the All-Wise).' },
  { q: 'Where does the Quran mention the Beautiful Names?', a: 'The Quran says “To Allah belong the best names, so invoke Him by them” (7:180) and lists many of them together in Surah al-Hashr, 59:22–24.' },
  { q: 'আল্লাহর ৯৯ নাম কী?', a: 'আল্লাহর ৯৯টি সুন্দর নামকে আসমাউল হুসনা বলা হয়। কুরআন ও হাদিসে আল্লাহ নিজের যে নাম ও গুণাবলি উল্লেখ করেছেন, যেমন আর-রহমান, আল-গফুর, আল-হাকীম, সেগুলোই এর অন্তর্ভুক্ত।' },
  { q: 'Is the list of 99 Names the same everywhere?', a: 'Scholars agree on most of the names, but the exact list of 99 varies slightly between sources, because the hadith about the 99 names does not itself enumerate them. This page follows a widely used list, and marks where a name is derived from an attribute in the Quran rather than appearing in the verse as a name.' },
]

export default function NamesPage() {
  const items = asmaUlHusna.map(({ ref: _r, attr: _a, ...n }) => n)
  return (
    <div className={pageShell}>
      <JsonLd data={collectionLd({ name: '99 Names of Allah', description: metadata.description as string, path: '/names-of-allah', items: asmaUlHusna.map((n) => ({ name: `${n.tl} (${n.ar}) – ${n.en}`, href: `/names-of-allah/${n.slug}` })) })} />
      <Breadcrumbs items={[{ name: '99 Names of Allah', href: '/names-of-allah' }]} className="mb-4" />
      <PageHero
        eyebrow="Asma ul Husna · আসমাউল হুসনা"
        icon="names"
        arabic="أَسْمَاءُ ٱللَّهِ ٱلْحُسْنَىٰ"
        title="The 99 Beautiful Names of Allah"
        subtitle="Tap a card to reveal its meaning, practise with flashcards, or test yourself with a quiz. প্রতিটি নামের অর্থ, ব্যাখ্যা ও কুরআনের রেফারেন্স সহ।"
      />
      <div className="mt-6"><NamesExplorer names={items} /></div>
      <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
        <h2 className="font-display mb-2 text-xl font-semibold text-foreground">All 99 names at a glance</h2>
        <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
          {asmaUlHusna.map((n) => (
            <li key={n.n}><Link href={`/names-of-allah/${n.slug}`} className="hover:text-primary"><span className="inline-block w-7 text-xs opacity-60">{n.n}.</span>{n.tl} <span lang="ar" className="font-arabic">({n.ar})</span> – {n.en}</Link></li>
          ))}
        </ul>
      </section>
      <Faq faqs={faqs} />
    </div>
  )
}
