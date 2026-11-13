import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { AskClient } from '@/components/ask/ask-client'
import { buildMeta } from '@/lib/content/seo'
import { lt } from '@/lib/i18n/lt'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { absoluteUrl, site } from '@/lib/site'

/* ───────────── /ask — Ask the Quran (meaning-based search) ───────────── */

const copy = {
  en: {
    title: 'Ask the Quran — Find verses by meaning | কুরআনে প্রশ্ন করুন',
    description: 'Ask a question in English, Bangla or Arabic — “what does Allah say about patience in hardship?” — and find the most relevant Quran verses by meaning, even when no keyword matches. Arabic text with English and Bangla translation.',
    keywords: ['ask the Quran', 'Quran semantic search', 'find Quran verses by meaning', 'what does the Quran say about', 'Quran verse finder', 'কুরআনে প্রশ্ন', 'কুরআনে আয়াত খুঁজুন'],
  },
  bn: {
    title: 'কুরআনে প্রশ্ন করুন — অর্থ অনুযায়ী আয়াত খুঁজুন | Ask the Quran',
    description: 'বাংলা, ইংরেজি বা আরবিতে প্রশ্ন লিখুন — যেমন “বাবা-মায়ের সাথে আচরণ নিয়ে কুরআনে কী আছে?” — আর শব্দ না মিললেও অর্থের ভিত্তিতে সবচেয়ে প্রাসঙ্গিক আয়াতগুলো পান। আরবি, বাংলা অনুবাদ ও উচ্চারণসহ।',
    keywords: ['কুরআনে প্রশ্ন করুন', 'অর্থ অনুযায়ী আয়াত', 'কুরআনে কী আছে', 'কুরআনের আয়াত খুঁজুন', 'ask the Quran'],
  },
}

export const askMeta = (locale: Locale, q?: string): Metadata =>
  // result URLs (?q=) are personal searches: keep them out of the index, canonical stays /ask
  buildMeta({ ...copy[locale], path: '/ask', locale, noindex: !!q })

export function AskPage({ locale, q = '' }: { locale: Locale; q?: string }) {
  return (
    <div className={pageShell}>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'WebApplication', name: locale === 'bn' ? 'কুরআনে প্রশ্ন করুন' : 'Ask the Quran',
        url: absoluteUrl(localeHref(locale, '/ask')), applicationCategory: 'ReferenceApplication', operatingSystem: 'Any', inLanguage: ['en', 'bn', 'ar'],
        description: copy[locale].description, isAccessibleForFree: true, publisher: { '@type': 'Organization', name: site.name, url: site.url },
        potentialAction: { '@type': 'SearchAction', target: `${absoluteUrl(localeHref(locale, '/ask'))}?q={question}`, 'query-input': 'required name=question' },
      }} />
      <Breadcrumbs locale={locale} items={[{ name: locale === 'bn' ? 'কুরআনে প্রশ্ন' : 'Ask the Quran', ar: 'اسأل القرآن', href: '/ask' }]} className="mb-4" />
      <PageHero
        eyebrow={lt(locale, { en: 'Search by meaning', bn: 'অর্থ অনুযায়ী অনুসন্ধান', ar: 'بحث بالمعنى' })}
        icon="sparkle"
        title={lt(locale, { en: 'Ask the Quran', bn: 'কুরআনে প্রশ্ন করুন', ar: 'اسأل القرآن' })}
        subtitle={lt(locale, {
          en: 'Type a question or a feeling in your own words. We find the verses closest in meaning — even when they share no keywords — with Arabic, translation and a link to read each one in context.',
          bn: 'নিজের ভাষায় একটি প্রশ্ন বা অনুভূতি লিখুন। শব্দ না মিললেও অর্থে সবচেয়ে কাছের আয়াতগুলো খুঁজে দেব — আরবি, অনুবাদ ও প্রসঙ্গসহ পড়ার লিংকসহ।',
          ar: 'اكتب سؤالًا أو شعورًا بكلماتك. نجد لك أقرب الآيات معنى — حتى لو لم تشترك في الكلمات — مع النص العربي والترجمة ورابط لقراءتها في سياقها.',
        })}
      />
      <AskClient initialQuery={q} />
      <section className="mt-10 grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
        <div className="card-soft rounded-3xl p-5">
          <h2 className="font-display mb-1 text-base font-semibold text-foreground">{lt(locale, { en: 'How it works', bn: 'কীভাবে কাজ করে', ar: 'كيف يعمل' })}</h2>
          <p>{lt(locale, { en: 'Every ayah’s English and Bangla translation was turned into a meaning vector with an open multilingual model. Your question is compared with all 6,236 of them.', bn: 'প্রতিটি আয়াতের ইংরেজি ও বাংলা অনুবাদকে একটি উন্মুক্ত বহুভাষিক মডেল দিয়ে অর্থ-ভেক্টরে রূপান্তর করা হয়েছে। আপনার প্রশ্ন ৬,২৩৬টি আয়াতের সঙ্গেই মেলানো হয়।', ar: 'حُوِّلت ترجمة كل آية الإنجليزية والبنغالية إلى متجه معنى بنموذج مفتوح متعدد اللغات، ويُقارَن سؤالك بجميع الآيات الـ6236.' })}</p>
        </div>
        <div className="card-soft rounded-3xl p-5">
          <h2 className="font-display mb-1 text-base font-semibold text-foreground">{lt(locale, { en: 'Nothing is generated', bn: 'কিছুই বানানো নয়', ar: 'لا شيء مُولَّد' })}</h2>
          <p>{lt(locale, { en: 'Results are the verses themselves with their reference. “Why this matched” shows shared words or the topic that links them — always read verses in context and with tafsir.', bn: 'ফলাফলে কেবল আয়াত ও তার রেফারেন্স থাকে। “কেন মিলেছে” অংশে মিল থাকা শব্দ বা বিষয় দেখানো হয় — আয়াত সবসময় প্রসঙ্গ ও তাফসীরসহ পড়ুন।', ar: 'النتائج هي الآيات نفسها مع مراجعها. يبيّن «سبب المطابقة» الكلمات المشتركة أو الموضوع — اقرأ الآيات دائمًا في سياقها ومع التفسير.' })}</p>
        </div>
        <div className="card-soft rounded-3xl p-5">
          <h2 className="font-display mb-1 text-base font-semibold text-foreground">{lt(locale, { en: 'Private by design', bn: 'গোপনীয়তা রক্ষা', ar: 'خصوصية' })}</h2>
          <p>{lt(locale, { en: 'Questions are not stored. Turn on on-device smart search to keep even the question on your phone or computer.', bn: 'প্রশ্ন সংরক্ষণ করা হয় না। প্রশ্নটিও নিজের ফোন বা কম্পিউটারে রাখতে ডিভাইসে স্মার্ট অনুসন্ধান চালু করুন।', ar: 'لا تُحفظ الأسئلة. فعّل البحث الذكي على جهازك ليبقى سؤالك على هاتفك أو حاسوبك.' })}</p>
        </div>
      </section>
    </div>
  )
}
