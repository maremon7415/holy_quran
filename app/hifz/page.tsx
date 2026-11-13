import type { Metadata } from 'next'
import { HifzHome } from '@/components/hifz/hifz-home'
import { UiIcon } from '@/components/ui-icon'
import { absoluteUrl } from '@/lib/site'

const title = 'Memorise the Quran Online — Hifz Studio with Spaced Repetition | কুরআন হিফজ'
const description =
  'Memorise the Quran with a guided method: listen, read along, fade words, and test your recall — then let spaced repetition schedule every ayah. Free hifz studio with voice check, Juz Amma map and streaks. কুরআন মুখস্থ করুন বিজ্ঞানসম্মত পদ্ধতিতে।'

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: ['memorise Quran', 'hifz', 'Quran memorization app', 'spaced repetition Quran', 'Juz Amma', 'কুরআন হিফজ', 'কুরআন মুখস্থ'],
  alternates: { canonical: '/hifz' },
  openGraph: { title, description, url: absoluteUrl('/hifz'), type: 'website' },
}

const steps = [
  { icon: 'listen', t: '1 · Listen', d: 'Hear the ayah recited on loop with every word lighting up as it is spoken.', b: 'শুনুন — প্রতিটি শব্দ হাইলাইট হয়ে লুপে তিলাওয়াত।' },
  { icon: 'read', t: '2 · Read along', d: 'Read the full text with translation. Tap any word to hear it alone.', b: 'পড়ুন — অনুবাদসহ পূর্ণ পাঠ; শব্দে ট্যাপ করলে উচ্চারণ শুনুন।' },
  { icon: 'focus', t: '3 · Fade', d: 'Words disappear 30%, 60%, then 100% — with optional first-letter hints.', b: 'ফেড — ৩০%, ৬০%, তারপর ১০০% শব্দ লুকানো; প্রথম অক্ষরের ইঙ্গিত সহ।' },
  { icon: 'hifz', t: '4 · Recall', d: 'Rebuild the ayah word by word from memory, then grade yourself honestly.', b: 'রিকল — স্মৃতি থেকে শব্দে শব্দে সাজান, তারপর নিজেকে মূল্যায়ন করুন।' },
]

export default function HifzPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 lg:pb-16">
      <header className="relative mb-8 overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-9 sm:px-10 sm:py-12">
        <div className="bg-pattern pointer-events-none absolute inset-0" />
        <div className="relative flex items-center gap-5">
          <UiIcon name="hifz" size={72} className="hidden sm:block" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Hifz Studio · হিফজ স্টুডিও</p>
            <h1 className="mt-2 font-display text-3xl leading-tight sm:text-5xl">Memorise the Quran, <span className="text-gradient-gold">for good</span></h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              A guided memorisation method with spaced repetition that schedules every ayah right before you would forget it. Calm, private, and entirely on your device.
            </p>
            <p className="mt-1 font-bangla text-sm text-muted-foreground">বিজ্ঞানসম্মত স্পেসড রিপিটেশনের মাধ্যমে কুরআন মুখস্থ করুন — সম্পূর্ণ আপনার ডিভাইসে।</p>
          </div>
        </div>
      </header>

      <HifzHome>
        <section aria-labelledby="method">
          <h2 id="method" className="mb-1 font-display text-2xl">The method</h2>
          <p className="mb-5 text-sm text-muted-foreground">Four short steps per chunk of ayahs — the same loop traditional huffaz use, made measurable.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.t} className="card-soft lift rounded-3xl border border-border bg-card p-5">
                <UiIcon name={s.icon} size={40} />
                <h3 className="mt-3 font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                <p className="mt-2 font-bangla text-xs text-muted-foreground">{s.b}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <p><strong className="text-foreground">Spaced repetition.</strong> Grade Again, Hard, Good or Easy — intervals grow from minutes to days to months (SM-2).</p>
            <p><strong className="text-foreground">Voice check.</strong> On supported browsers, recite aloud and see a word-by-word match in green and red.</p>
            <p><strong className="text-foreground">Private by design.</strong> Progress is stored on this device. Back it up anytime from <a className="underline underline-offset-4" href="/journey#backup">My Journey</a>.</p>
          </div>
        </section>
      </HifzHome>
    </main>
  )
}
