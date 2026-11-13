import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { CopyButton } from '@/components/content/copy-button'
import { buildMeta } from '@/lib/content/seo'
import { corpusDatasetLd } from '@/lib/seo/structured'
import { absoluteUrl, site } from '@/lib/site'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { lt } from '@/lib/i18n/lt'

const copy = {
  en: {
    title: 'Noor Quran API for Developers: Quran, Duas & 99 Names JSON',
    description: 'Free, keyless JSON API for the Quran in Arabic, English & Bangla, authentic duas, topics and the 99 Names of Allah. OpenAPI 3.1, CORS, markdown and MCP.',
  },
  bn: {
    title: 'ডেভেলপারদের জন্য নূর কুরআন API: কুরআন, দোয়া ও ৯৯ নাম',
    description: 'কুরআন (আরবি, ইংরেজি, বাংলা, উচ্চারণ), দোয়া, বিষয়ভিত্তিক আয়াত ও আল্লাহর ৯৯ নামের বিনামূল্যের JSON API — OpenAPI 3.1, CORS, মার্কডাউন পাতা ও AI এজেন্টের জন্য MCP সার্ভার।',
  },
}

export const developersMeta = (locale: Locale): Metadata =>
  buildMeta({ ...copy[locale], path: '/developers', locale, keywords: ['Quran API', 'Quran JSON API', 'Bangla Quran API', 'dua API', '99 names of Allah API', 'Quran MCP', 'কুরআন API'] })

export const API_ENDPOINTS: { path: string; example: string; en: string; bn: string }[] = [
  { path: '/api/v1/ayah/{ref}', example: '/api/v1/ayah/2:255', en: 'One ayah or a range (max 50): Arabic, Saheeh, Abdel Haleem, Bangla, transliteration, uccharon. ?translations=saheeh,bangla', bn: 'একটি আয়াত বা পরিসর (সর্বোচ্চ ৫০): আরবি, ইংরেজি, বাংলা, উচ্চারণ।' },
  { path: '/api/v1/surah/{id}', example: '/api/v1/surah/al-mulk', en: 'Surah facts, summary and introduction (1–114 or a name).', bn: 'সূরার তথ্য, সারসংক্ষেপ ও ভূমিকা (১–১১৪ বা নাম)।' },
  { path: '/api/v1/surahs', example: '/api/v1/surahs', en: 'All 114 surahs.', bn: '১১৪টি সূরার তালিকা।' },
  { path: '/api/v1/search?q=', example: '/api/v1/search?q=patience&limit=5', en: 'Full-text search in Arabic, English and Bangla (lang=en|bn|ar, limit ≤ 50).', bn: 'আরবি, ইংরেজি ও বাংলায় পূর্ণ-পাঠ অনুসন্ধান।' },
  { path: '/api/v1/ask?q=', example: '/api/v1/ask?q=what%20does%20the%20Quran%20say%20about%20patience%20in%20hardship&limit=5', en: 'Ask the Quran — meaning-based (semantic) search: a natural question in English, Bangla or Arabic → the most relevant ayahs (ranges), matched words/topics, url and citation. Also the ask_quran MCP tool.', bn: 'কুরআনে প্রশ্ন — অর্থভিত্তিক অনুসন্ধান: বাংলা, ইংরেজি বা আরবিতে প্রশ্ন → সবচেয়ে প্রাসঙ্গিক আয়াত, মিল থাকা শব্দ/বিষয় ও রেফারেন্স। MCP টুল: ask_quran।' },
  { path: '/api/v1/duas', example: '/api/v1/duas?q=anxiety', en: 'List / search duas (q, category, limit).', bn: 'দোয়ার তালিকা / অনুসন্ধান।' },
  { path: '/api/v1/duas/{slug}', example: '/api/v1/duas/dua-for-anxiety', en: 'One dua with Arabic, transliteration, meaning and source.', bn: 'একটি দোয়া — আরবি, উচ্চারণ, অর্থ ও উৎস।' },
  { path: '/api/v1/topics/{slug}', example: '/api/v1/topics/patience', en: 'What the Quran says about a topic: quick answer + verses.', bn: 'কোনো বিষয়ে কুরআন কী বলে: সংক্ষিপ্ত উত্তর ও আয়াত।' },
  { path: '/api/v1/names', example: '/api/v1/names', en: 'The 99 Names of Allah (also /api/v1/names/{number|slug}).', bn: 'আল্লাহর ৯৯ নাম (এবং /api/v1/names/{নম্বর})।' },
  { path: '/api/v1/events', example: '/api/v1/events?year=2027', en: 'Islamic events (Ramadan, Laylatul Qadr, Eid, Arafah, Ashura…): next 12 months, or ?year= / ?event=. Saudi (Umm al-Qura) and expected Bangladesh dates.', bn: 'ইসলামি দিবস (রমজান, শবে কদর, ঈদ, আরাফা, আশুরা…): আগামী ১২ মাস, বা ?year= / ?event=। সৌদি (উম্মুল কুরা) ও বাংলাদেশের সম্ভাব্য তারিখ।' },
  { path: '/api/v1/events/{slug}', example: '/api/v1/events/eid-al-adha?year=2027', en: 'One event: dates, Hijri label, Quran & hadith sources, url and citation.', bn: 'একটি দিবস — তারিখ, হিজরি তারিখ, কুরআন-হাদিসের উৎস ও রেফারেন্স।' },
  { path: '/api/v1/hadith', example: '/api/v1/hadith', en: 'Hadith collections (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah, Malik, Nawawi, Qudsi) with counts.', bn: 'হাদিস গ্রন্থসমূহ ও সংখ্যা (বুখারী, মুসলিম, আবু দাউদ ইত্যাদি)।' },
  { path: '/api/v1/hadith/{collection}/{number}', example: '/api/v1/hadith/bukhari/1', en: 'One hadith: Arabic, English, Bangla, narrator, grade, url and citation (Muslim = Abd al-Baqi numbers).', bn: 'একটি হাদিস — আরবি, ইংরেজি, বাংলা, রাবী, মান ও রেফারেন্স।' },
  { path: '/api/v1/hadith/search?q=', example: '/api/v1/hadith/search?q=patience&collection=bukhari', en: 'Search hadith in Arabic, English and Bangla (collection, lang, limit, offset).', bn: 'আরবি, ইংরেজি ও বাংলায় হাদিস অনুসন্ধান।' },
]

function Code({ children, label }: { children: string; label?: string }) {
  return (
    <div className="relative mt-3">
      <pre className="overflow-x-auto rounded-2xl bg-muted/70 p-4 pe-24 text-[13px] leading-relaxed" dir="ltr"><code>{children}</code></pre>
      <CopyButton text={children} className="absolute end-2 top-2 py-1.5" label={label ? { en: label, bn: label } : undefined} />
    </div>
  )
}

export function DevelopersPage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const L = (en: string, bnText: string) => lt(locale, { en, bn: bnText })
  return (
    <div className={pageShell}>
      <JsonLd data={corpusDatasetLd(locale)} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'ডেভেলপার' : 'Developers', ar: 'المطورون', href: '/developers' }]} className="mb-4" />
      <PageHero
        eyebrow={L('For developers & AI agents', 'ডেভেলপার ও AI এজেন্টের জন্য')}
        icon="chart"
        title={L('Noor Quran API', 'নূর কুরআন API')}
        subtitle={L(
          'A free, keyless, read-only JSON API over the same verified corpus that powers this site: the Quran in Arabic, English and Bangla, authentic duas, Quran topics and the 99 Names of Allah. Every object carries its canonical URL and a citation string.',
          'এই সাইটের একই যাচাইকৃত তথ্যভান্ডারের ওপর বিনামূল্যের, চাবিবিহীন, শুধু-পাঠযোগ্য JSON API: আরবি, ইংরেজি ও বাংলায় কুরআন, প্রামাণ্য দোয়া, বিষয়ভিত্তিক আয়াত ও আল্লাহর ৯৯ নাম। প্রতিটি ফলাফলে স্থায়ী লিংক ও উদ্ধৃতি থাকে।'
        )}
      >
        <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
          <a href="/openapi.json" className="rounded-full bg-primary px-4 py-2.5 text-primary-foreground">OpenAPI 3.1</a>
          <Link href={h('/mcp')} className="rounded-full border border-border bg-card px-4 py-2.5">{L('MCP server for AI agents', 'AI এজেন্টের জন্য MCP')}</Link>
          <a href="/llms.txt" className="rounded-full border border-border bg-card px-4 py-2.5">llms.txt</a>
        </div>
      </PageHero>

      <section aria-labelledby="endpoints-h" className="mt-12">
        <h2 id="endpoints-h" className="font-display mb-2 text-2xl font-semibold">{L('Endpoints', 'এন্ডপয়েন্ট')}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{L('Base URL', 'বেস URL')}: <code dir="ltr">{site.url}</code> · CORS <code>*</code> · {L('cached at the edge for 24 h', 'এজ ক্যাশ ২৪ ঘণ্টা')} · {L('errors are JSON with real 400/404 status codes', 'ত্রুটি JSON আকারে, সঠিক ৪০০/৪০৪ স্ট্যাটাসসহ')}</p>
        <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {API_ENDPOINTS.map((e) => (
            <li key={e.path} className="px-5 py-4">
              <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-primary">GET</span><code dir="ltr" className="break-all text-sm font-semibold">{e.path}</code></p>
              <p className="mt-1 text-sm text-muted-foreground">{bn ? e.bn : e.en}</p>
              <a href={e.example} className="mt-1 inline-block break-all text-xs font-medium text-primary hover:underline" dir="ltr">{e.example}</a>
            </li>
          ))}
        </ul>
        <Code>{`curl -s "${site.url}/api/v1/ayah/2:255?translations=saheeh,bangla"`}</Code>
        <Code>{`const res = await fetch('${site.url}/api/v1/search?q=mercy&limit=5')
const { results } = await res.json()
// results[i].url → canonical page to cite, results[i].citation → ready-made citation`}</Code>
      </section>

      <section aria-labelledby="md-h" className="mt-12">
        <h2 id="md-h" className="font-display mb-2 text-2xl font-semibold">{L('Markdown pages for LLMs', 'LLM-এর জন্য মার্কডাউন পাতা')}</h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground">{L(
          'Append .md to any ayah, surah, juz, topic, dua or Name page to get clean markdown (title, Arabic, translations, pronunciation, a short tafsir excerpt for ayahs, citation and canonical link). Pages advertise it with <link rel="alternate" type="text/markdown">.',
          'যেকোনো আয়াত, সূরা, পারা, বিষয়, দোয়া বা নামের পাতার শেষে .md যোগ করলে পরিষ্কার মার্কডাউন পাওয়া যায় (শিরোনাম, আরবি, অনুবাদ, উচ্চারণ, আয়াতের ক্ষেত্রে সংক্ষিপ্ত তাফসীর, উদ্ধৃতি ও স্থায়ী লিংক)। বাংলার জন্য /bn দিয়ে শুরু করুন।'
        )}</p>
        <ul className="mt-3 grid gap-1 text-sm" dir="ltr">
          {['/surah/al-baqarah/255.md', '/surah/al-mulk.md', '/juz/30.md', '/topics/patience.md', '/dua/dua-for-anxiety.md', '/names-of-allah/ar-rahman.md', '/bn/surah/al-baqarah/255.md'].map((p) => (
            <li key={p}><a href={p} className="break-all font-medium text-primary hover:underline">{p}</a></li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="cite-h2" className="mt-12">
        <h2 id="cite-h2" className="font-display mb-2 text-2xl font-semibold">{L('Citing Noor Quran', 'নূর কুরআন উদ্ধৃত করা')}</h2>
        <ul className="list-disc space-y-1.5 ps-5 text-[15px] leading-relaxed text-muted-foreground">
          <li>{L('Link every quoted verse to its page: /surah/{slug}/{ayah}. Short links /2:255, /2/255 and /2.255 redirect there.', 'প্রতিটি উদ্ধৃত আয়াতের সঙ্গে তার পাতার লিংক দিন: /surah/{slug}/{ayah}। ছোট লিংক /2:255 সেখানে নিয়ে যায়।')}</li>
          <li>{L('Name the translation (Saheeh International, Abdel Haleem or Taisirul Quran) and, for duas, the hadith source given in the data.', 'অনুবাদের নাম (সহীহ ইন্টারন্যাশনাল, আবদেল হালিম বা তাইসীরুল কুরআন) এবং দোয়ার ক্ষেত্রে হাদিসের উৎস উল্লেখ করুন।')}</li>
          <li>{L('Bangla uccharon is an auto-generated pronunciation guide; recite from the Arabic.', 'বাংলা উচ্চারণ স্বয়ংক্রিয়ভাবে তৈরি নির্দেশিকা; তিলাওয়াত আরবি থেকে করুন।')}</li>
        </ul>
      </section>

      <section aria-labelledby="src-h" className="mt-12 rounded-3xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
        <h2 id="src-h" className="font-display mb-2 text-lg font-semibold text-foreground">{L('Sources & licence', 'উৎস ও লাইসেন্স')}</h2>
        <p>{L('Quran text and translations come from the Quran.com (Quran Foundation) API; tafsir is fetched from it on demand. The code is open source on GitHub. Please respect the translators’ rights when redistributing large parts of a translation.', 'কুরআনের পাঠ ও অনুবাদ Quran.com (Quran Foundation) API থেকে নেওয়া; তাফসীর প্রয়োজনমতো সেখান থেকে আনা হয়। কোড GitHub-এ ওপেন সোর্স।')}{' '}
          <a href={site.github} className="font-medium text-primary hover:underline" rel="noopener">GitHub</a> · <Link href={h('/about')} className="font-medium text-primary hover:underline">{L('About & credits', 'পরিচিতি ও কৃতজ্ঞতা')}</Link> · <a href={absoluteUrl('/openapi.json')} className="font-medium text-primary hover:underline">openapi.json</a>
        </p>
      </section>
    </div>
  )
}
