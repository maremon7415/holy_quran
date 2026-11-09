import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { DuaLibrary } from '@/components/content/dua-library'
import { duaCategories } from '@/data/content/duas'
import { resolveAllDuas } from '@/lib/content/resolve'
import { buildMeta, collectionLd } from '@/lib/content/seo'

export const metadata: Metadata = buildMeta({
  title: 'Daily Duas from the Quran & Sunnah: Arabic, Meaning & Bangla | দোয়া সমূহ',
  description: 'Authentic duas with Arabic, transliteration and English & Bangla meaning: morning and evening, sleep, travel, anxiety, rizq, forgiveness, the Rabbana duas of the Quran and more. প্রামাণ্য দোয়া, অর্থসহ।',
  path: '/dua',
  keywords: ['dua', 'duas', 'dua for anxiety', 'morning evening adhkar', 'Rabbana duas', 'daily duas', 'দোয়া', 'রিজিক বৃদ্ধির দোয়া', 'সকাল সন্ধ্যার দোয়া', 'ঘুমের দোয়া'],
})

export default async function DuaPage() {
  const all = await resolveAllDuas()
  const items = all.map((d) => ({ slug: d.slug, cat: d.cat, title: d.title, ar: d.ar, tl: d.tl, meaning: d.meaning, source: d.source, keywords: d.keywords }))
  const popular = ['dua-for-anxiety', 'ayatul-kursi', 'dua-before-sleeping', 'dua-for-rizq-halal', 'dua-qunut', 'rabbana-atina-fid-dunya-hasanah']
  return (
    <div className={pageShell}>
      <JsonLd data={collectionLd({ name: 'Duas from the Quran and Sunnah', description: metadata.description as string, path: '/dua', items: all.map((d) => ({ name: d.title.en, href: `/dua/${d.slug}` })) })} />
      <Breadcrumbs items={[{ name: 'Duas', href: '/dua' }]} className="mb-4" />
      <PageHero
        eyebrow="Duas · দোয়া"
        icon="dua"
        arabic="ٱدْعُونِىٓ أَسْتَجِبْ لَكُمْ"
        title="Duas from the Quran & Sunnah"
        subtitle={`${all.length} authentic supplications with Arabic, transliteration and meaning in English and Bangla. Every dua cites its source; Quranic duas are shown straight from the Quran text. প্রতিটি দোয়ার উৎস উল্লেখ করা আছে।`}
      />
      <div className="mt-6">
        <DuaLibrary duas={items} cats={duaCategories.map((c) => ({ id: c.id, title: c.title, icon: c.icon }))} />
      </div>
      <section className="mt-14 rounded-3xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground">
        <h2 className="font-display mb-2 text-lg font-semibold text-foreground">About these duas</h2>
        <p>Duas are listed with the Quran verse or hadith collection they come from, such as Sahih al-Bukhari or Sahih Muslim. Where a hadith number is shown it points to the standard numbering of that collection. For rulings on how and when to recite, please consult a qualified scholar.</p>
        <p lang="bn" className="font-bangla mt-2">প্রতিটি দোয়ার সঙ্গে কুরআনের আয়াত বা হাদিসের গ্রন্থের উৎস দেওয়া আছে। পাঠের নিয়ম ও বিধান জানতে যোগ্য আলেমের পরামর্শ নিন।</p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <span className="font-semibold text-foreground">Popular:</span>
          {popular.map((s) => { const d = all.find((x) => x.slug === s)!; return <Link key={s} href={`/dua/${s}`} className="text-primary hover:underline">{d.title.en.split(':')[0].split('—')[0].trim()}</Link> })}
        </p>
      </section>
    </div>
  )
}
