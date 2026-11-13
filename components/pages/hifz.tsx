import type { Metadata } from 'next'
import { HifzHome } from '@/components/hifz/hifz-home'
import { UiIcon } from '@/components/ui-icon'
import { JsonLd } from '@/components/seo/json-ld'
import { buildMeta, howToLd } from '@/lib/content/seo'
import { localeHref, type Locale } from '@/lib/i18n/routes'

const copy = {
  en: {
    title: 'Memorise the Quran Online — Hifz Studio with Spaced Repetition | কুরআন হিফজ',
    description: 'Memorise the Quran with a guided method: listen, read along, fade words, and test your recall — then let spaced repetition schedule every ayah. Free hifz studio with voice check, Juz Amma map and streaks. কুরআন মুখস্থ করুন বিজ্ঞানসম্মত পদ্ধতিতে।',
    keywords: ['memorise Quran', 'hifz', 'Quran memorization app', 'spaced repetition Quran', 'Juz Amma', 'কুরআন হিফজ', 'কুরআন মুখস্থ'],
  },
  bn: {
    title: 'অনলাইনে কুরআন হিফজ করুন — স্পেসড রিপিটেশনসহ হিফজ স্টুডিও | সহজে কুরআন মুখস্থ',
    description: 'নির্দেশিত পদ্ধতিতে কুরআন মুখস্থ করুন: শুনুন, সঙ্গে পড়ুন, শব্দ লুকিয়ে অনুশীলন করুন ও স্মৃতি যাচাই করুন — স্পেসড রিপিটেশন প্রতিটি আয়াতের রিভিশনের সময় ঠিক করে দেবে। ভয়েস চেক, আমপারা ম্যাপ ও স্ট্রিকসহ সম্পূর্ণ ফ্রি।',
    keywords: ['কুরআন হিফজ', 'কুরআন মুখস্থ করার উপায়', 'সহজে কুরআন মুখস্থ', 'হিফজ অ্যাপ', 'আমপারা মুখস্থ', 'সূরা মুখস্থ করার নিয়ম', 'Quran hifz bangla'],
  },
}

export const hifzMeta = (locale: Locale): Metadata => buildMeta({ ...copy[locale], path: '/hifz', locale, ogImage: locale === 'bn' ? '/opengraph-image' : undefined })

const steps = [
  { icon: 'listen', t: { en: '1 · Listen', bn: '১ · শুনুন' }, d: { en: 'Hear the ayah recited on loop with every word lighting up as it is spoken.', bn: 'লুপে আয়াতের তিলাওয়াত শুনুন — উচ্চারণের সঙ্গে সঙ্গে প্রতিটি শব্দ হাইলাইট হবে।' }, b: 'শুনুন — প্রতিটি শব্দ হাইলাইট হয়ে লুপে তিলাওয়াত।' },
  { icon: 'read', t: { en: '2 · Read along', bn: '২ · সঙ্গে পড়ুন' }, d: { en: 'Read the full text with translation. Tap any word to hear it alone.', bn: 'অনুবাদসহ পুরো আয়াত পড়ুন। যেকোনো শব্দে ট্যাপ করে আলাদাভাবে উচ্চারণ শুনুন।' }, b: 'পড়ুন — অনুবাদসহ পূর্ণ পাঠ; শব্দে ট্যাপ করলে উচ্চারণ শুনুন।' },
  { icon: 'focus', t: { en: '3 · Fade', bn: '৩ · ফেড' }, d: { en: 'Words disappear 30%, 60%, then 100% — with optional first-letter hints.', bn: 'ধাপে ধাপে ৩০%, ৬০%, তারপর ১০০% শব্দ লুকিয়ে যায় — চাইলে প্রথম অক্ষরের ইঙ্গিত দেখুন।' }, b: 'ফেড — ৩০%, ৬০%, তারপর ১০০% শব্দ লুকানো; প্রথম অক্ষরের ইঙ্গিত সহ।' },
  { icon: 'hifz', t: { en: '4 · Recall', bn: '৪ · স্মরণ' }, d: { en: 'Rebuild the ayah word by word from memory, then grade yourself honestly.', bn: 'স্মৃতি থেকে শব্দে শব্দে আয়াতটি সাজান, তারপর সততার সঙ্গে নিজেকে মূল্যায়ন করুন।' }, b: 'রিকল — স্মৃতি থেকে শব্দে শব্দে সাজান, তারপর নিজেকে মূল্যায়ন করুন।' },
]

export function HifzPage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const L = (v: { en: string; bn: string }) => (bn ? v.bn : v.en)
  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 lg:pb-16">
      <JsonLd data={howToLd({
        name: bn ? 'কীভাবে কুরআন মুখস্থ করবেন' : 'How to memorise the Quran', description: copy[locale].description, path: localeHref(locale, '/hifz'), inLanguage: bn ? 'bn' : undefined,
        steps: steps.map((s) => ({ name: L(s.t), text: L(s.d) })),
      })} />
      <header className="relative mb-8 overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-9 sm:px-10 sm:py-12">
        <div className="bg-pattern pointer-events-none absolute inset-0" />
        <div className="relative flex items-center gap-5">
          <UiIcon name="hifz" size={72} className="hidden sm:block" />
          {bn ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">হিফজ স্টুডিও · Hifz Studio</p>
              <h1 className="mt-2 font-display text-3xl leading-tight sm:text-5xl">কুরআন মুখস্থ করুন, <span className="text-gradient-gold">স্থায়ীভাবে</span></h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                স্পেসড রিপিটেশনসহ নির্দেশিত হিফজ পদ্ধতি — ভুলে যাওয়ার ঠিক আগে প্রতিটি আয়াত রিভিশনের জন্য সামনে আনে। শান্ত, ব্যক্তিগত এবং সম্পূর্ণ আপনার ডিভাইসে।
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Hifz Studio · হিফজ স্টুডিও</p>
              <h1 className="mt-2 font-display text-3xl leading-tight sm:text-5xl">Memorise the Quran, <span className="text-gradient-gold">for good</span></h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                A guided memorisation method with spaced repetition that schedules every ayah right before you would forget it. Calm, private, and entirely on your device.
              </p>
              <p className="mt-1 font-bangla text-sm text-muted-foreground">বিজ্ঞানসম্মত স্পেসড রিপিটেশনের মাধ্যমে কুরআন মুখস্থ করুন — সম্পূর্ণ আপনার ডিভাইসে।</p>
            </div>
          )}
        </div>
      </header>

      <HifzHome>
        <section aria-labelledby="method">
          <h2 id="method" className="mb-1 font-display text-2xl">{bn ? 'পদ্ধতি' : 'The method'}</h2>
          <p className="mb-5 text-sm text-muted-foreground">{bn ? 'প্রতিটি আয়াত-গুচ্ছের জন্য চারটি ছোট ধাপ — প্রচলিত হাফেজদের সেই একই পদ্ধতি, এখন পরিমাপযোগ্য।' : 'Four short steps per chunk of ayahs — the same loop traditional huffaz use, made measurable.'}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.t.en} className="card-soft lift rounded-3xl border border-border bg-card p-5">
                <UiIcon name={s.icon} size={40} />
                <h3 className="mt-3 font-semibold">{L(s.t)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{L(s.d)}</p>
                {!bn && <p className="mt-2 font-bangla text-xs text-muted-foreground">{s.b}</p>}
              </div>
            ))}
          </div>
          {bn ? (
            <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <p><strong className="text-foreground">স্পেসড রিপিটেশন।</strong> আবার, কঠিন, ভালো বা সহজ — আপনার মূল্যায়ন অনুযায়ী বিরতি মিনিট থেকে দিন, তারপর মাসে বাড়ে (SM-2)।</p>
              <p><strong className="text-foreground">ভয়েস চেক।</strong> সমর্থিত ব্রাউজারে জোরে তিলাওয়াত করুন, শব্দে শব্দে মিল সবুজ ও লালে দেখুন।</p>
              <p><strong className="text-foreground">সম্পূর্ণ ব্যক্তিগত।</strong> অগ্রগতি এই ডিভাইসেই সংরক্ষিত থাকে। যেকোনো সময় <a className="underline underline-offset-4" href="/journey#backup">আমার যাত্রা</a> থেকে ব্যাকআপ নিন।</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <p><strong className="text-foreground">Spaced repetition.</strong> Grade Again, Hard, Good or Easy — intervals grow from minutes to days to months (SM-2).</p>
              <p><strong className="text-foreground">Voice check.</strong> On supported browsers, recite aloud and see a word-by-word match in green and red.</p>
              <p><strong className="text-foreground">Private by design.</strong> Progress is stored on this device. Back it up anytime from <a className="underline underline-offset-4" href="/journey#backup">My Journey</a>.</p>
            </div>
          )}
        </section>
      </HifzHome>
    </div>
  )
}
