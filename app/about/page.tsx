import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { Reveal } from '@/components/content/reveal'
import { UiIcon } from '@/components/ui-icon'
import { buildMeta, publisherLd } from '@/lib/content/seo'
import { site, absoluteUrl } from '@/lib/site'

export const metadata: Metadata = buildMeta({
  title: 'About Noor Quran: Features, Sources & Privacy | নূর কুরআন সম্পর্কে',
  description: 'What Noor Quran is, what it offers, where the Quran text, translations and audio come from, how your data is handled, and how to contribute to the open-source project.',
  path: '/about',
  keywords: ['about Noor Quran', 'Quran app sources', 'Quran translation authors', 'নূর কুরআন'],
})

const features: { icon: string; title: string; text: string; href: string }[] = [
  { icon: 'quran', title: 'Read', text: 'The full Quran in Uthmani script with Saheeh International, Abdel Haleem and Bangla (Taisirul Quran) translations, word-by-word meaning, tajweed colours and tafsir.', href: '/quran' },
  { icon: 'listen', title: 'Listen', text: 'Recitations by many reciters with ayah-by-ayah audio and word-synced highlighting.', href: '/listen' },
  { icon: 'hifz', title: 'Memorise', text: 'A hifz studio with repetition and review to help you memorise at your own pace.', href: '/hifz' },
  { icon: 'topics', title: 'Topics', text: 'Verses grouped by feeling, character, family, faith and society, so you can find what the Quran says about what is on your mind.', href: '/topics' },
  { icon: 'dua', title: 'Duas', text: 'Authentic duas from the Quran and Sunnah with Arabic, transliteration, meaning and source.', href: '/dua' },
  { icon: 'names', title: '99 Names of Allah', text: 'Each Beautiful Name with meaning, explanation, a Quran reference, flashcards and a quiz.', href: '/names-of-allah' },
  { icon: 'prayer', title: 'Prayer times & Qibla', text: 'Prayer times for your location, a Qibla compass and a Hijri calendar.', href: '/prayer-times' },
  { icon: 'journey', title: 'Khatam journey', text: 'A planner and streak tracker to help you complete the Quran.', href: '/journey' },
]

const credits: { name: string; role: string; href?: string }[] = [
  { name: 'Quran.com / Quran Foundation API', role: 'Quran text in Uthmani and simple script, chapter information, word-by-word data, tajweed text, tafsir, audio timing data and the translations below.', href: 'https://quran.com' },
  { name: 'Saheeh International', role: 'English translation of the meanings of the Quran.' },
  { name: 'M.A.S. Abdel Haleem', role: 'English translation, The Qur’an (Oxford World’s Classics).' },
  { name: 'Taisirul Quran (তাইসিরুল কুরআন)', role: 'Bangla translation.' },
  { name: 'Tanzil Project', role: 'The English transliteration originates from the Tanzil Project’s Quran data.', href: 'https://tanzil.net' },
  { name: 'EveryAyah', role: 'Per-ayah recitation audio files.', href: 'https://everyayah.com' },
]

export default function AboutPage() {
  return (
    <div className={pageShell}>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'AboutPage', name: 'About Noor Quran', url: absoluteUrl('/about'), mainEntity: { ...publisherLd, description: site.description, sameAs: [site.github] } }} />
      <Breadcrumbs items={[{ name: 'About', href: '/about' }]} className="mb-4" />
      <PageHero eyebrow="About · পরিচিতি" icon="info" arabic="نُور" title="Noor Quran" subtitle={`${site.tagline}. ${site.taglineBn}।`}>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">Noor is a free, ad-free and open-source Quran companion built to make the Quran easy to read, listen to, understand and memorise in Arabic, English and Bangla. নূর একটি বিনামূল্যের, বিজ্ঞাপনমুক্ত ও ওপেন সোর্স কুরআন সঙ্গী।</p>
      </PageHero>

      <section className="mt-12" aria-labelledby="features-h">
        <h2 id="features-h" className="font-display mb-5 text-2xl font-semibold">What you can do</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {features.map((f, i) => (
            <li key={f.title}><Reveal delay={Math.min(i, 5) * 0.04} className="h-full">
              <Link href={f.href} className="card-soft lift flex h-full gap-4 rounded-3xl p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent"><UiIcon name={f.icon} size={28} /></span>
                <span><span className="block font-semibold">{f.title}</span><span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{f.text}</span></span>
              </Link>
            </Reveal></li>
          ))}
        </ul>
      </section>

      <section className="mt-12" aria-labelledby="sources-h">
        <h2 id="sources-h" className="font-display mb-2 text-2xl font-semibold">Data sources & credits</h2>
        <p className="mb-5 text-sm text-muted-foreground">The Quran text and translations are stored in this project as a static corpus generated from open data, so every verse you see on Noor, including those on topic, dua and name pages, comes from the same checked source. Credit and thanks to everyone below.</p>
        <dl className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {credits.map((c) => (
            <div key={c.name} className="grid gap-1 px-5 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
              <dt className="font-semibold">{c.href ? <a href={c.href} rel="noopener" className="text-primary hover:underline">{c.name}</a> : c.name}</dt>
              <dd className="text-sm leading-relaxed text-muted-foreground">{c.role}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Duas and hadith references are cited by collection (for example Sahih al-Bukhari or Sahih Muslim) next to each dua. Short explanations on topic and name pages are original editorial summaries, not fatwas or tafsir; please refer to qualified scholars for rulings.</p>
        <p lang="bn" className="font-bangla mt-2 text-sm leading-relaxed text-muted-foreground">বিষয়ভিত্তিক ও আসমাউল হুসনা পাতার সংক্ষিপ্ত ব্যাখ্যাগুলো সম্পাদকীয় সারসংক্ষেপ, ফতোয়া বা তাফসীর নয়। বিধানগত বিষয়ে যোগ্য আলেমের শরণাপন্ন হোন।</p>
      </section>

      <section className="mt-12" aria-labelledby="privacy-h">
        <h2 id="privacy-h" className="font-display mb-3 text-2xl font-semibold">Privacy</h2>
        <div className="card-soft space-y-3 rounded-3xl p-6 text-sm leading-relaxed">
          <p>Noor does not show ads and does not sell or share personal data. Your bookmarks, reading progress, notes, settings and hifz progress are stored locally in your browser (on your device), not on our servers.</p>
          <p>The site uses Vercel Analytics for anonymous, aggregate page-view statistics, and no other tracking. If you choose to use prayer times or Qibla, your location is used in your browser to calculate them and is sent only to the prayer-time service to fetch times for that place.</p>
          <p lang="bn" className="font-bangla text-muted-foreground">আপনার বুকমার্ক, পড়ার অগ্রগতি, নোট ও সেটিংস কেবল আপনার ডিভাইসের ব্রাউজারে সংরক্ষিত থাকে। সাইটে বিজ্ঞাপন নেই; ভিজিটর সংখ্যার জন্য শুধু Vercel Analytics ব্যবহৃত হয়।</p>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="oss-h">
        <h2 id="oss-h" className="font-display mb-3 text-2xl font-semibold">Open source</h2>
        <div className="card-soft flex flex-col items-start gap-3 rounded-3xl p-6 text-sm leading-relaxed">
          <p>Noor is open source. If you spot a mistake in a translation, a dua or a reference, or want to contribute code, please open an issue or pull request. Accuracy of the Quran text matters more than anything else here.</p>
          <a href={site.github} rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition active:scale-95">View on GitHub</a>
        </div>
      </section>
    </div>
  )
}
