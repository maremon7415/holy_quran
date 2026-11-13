import Link from 'next/link'
import type { Metadata } from 'next'
import { UiIcon } from '@/components/ui-icon'
import { GuideFrame } from '@/components/learn/frame'
import { Reveal } from '@/components/content/reveal'
import { collectionLd, buildMeta } from '@/lib/content/seo'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { lt } from '@/lib/i18n/lt'
import { bnNum } from '@/lib/i18n/t'
import { getVersesByRefs } from '@/lib/quran/data'
import { learnGuides, guideBySlug, hubMeta, type GuideSlug } from '@/data/learn/guides'
import { pick } from '@/lib/i18n/t'

/** Metadata for a guide page (en or bn); every learn page has a markdown twin. */
export function guideMeta(slug: GuideSlug, locale: Locale): Metadata {
  const g = guideBySlug(slug)!
  return buildMeta({ ...g.meta[locale], path: g.path, locale, type: 'article', markdown: true })
}
export const learnHubMeta = (locale: Locale): Metadata => buildMeta({ ...hubMeta[locale], path: '/learn', locale, markdown: true })

export async function LearnHubPage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const [read] = await getVersesByRefs(['96:1'])
  const faqs = bn
    ? [
        { q: 'নামাজ শিক্ষা কীভাবে শুরু করব?', a: 'প্রথমে ওযু শিখুন, তারপর সূরা ফাতিহা ও কয়েকটি ছোট সূরা মুখস্থ করুন এবং “নামাজ শিক্ষা” পাতার ধাপগুলো অনুসরণ করে অনুশীলন করুন। কোনো উস্তাদের কাছ থেকে উচ্চারণ শুনে নেওয়া সবচেয়ে ভালো।' },
        { q: 'কালেমা কয়টি?', a: 'বাংলাদেশসহ উপমহাদেশে ছয়টি কালেমা শেখানো হয়: তাইয়্যিবা, শাহাদাত, তামজীদ, তাওহীদ, ইস্তিগফার ও রদ্দে কুফর। ছয়টি আলাদা কালেমার এই ক্রম একটি শিক্ষাগত রীতি; বাক্যগুলো কুরআন ও হাদিস থেকে নেওয়া।' },
        { q: 'তাজবীদ কী এবং এর প্রধান নিয়মগুলো কী?', a: 'তাজবীদ হলো প্রতিটি হরফকে তার মাখরাজ ও বৈশিষ্ট্যসহ সঠিকভাবে উচ্চারণ করে কুরআন পড়ার বিদ্যা। প্রধান নিয়ম: নুন সাকিন ও তানবীন (ইযহার, ইদগাম, ইকলাব, ইখফা), মীম সাকিন, কলকলা, গুন্নাহ, মাদ্দ, লাম শামসিয়্যাহ ও ওয়াকফ।' },
        { q: 'অজু করার নিয়ম কী?', a: 'নিয়ত ও বিসমিল্লাহ বলে দুই হাত, কুলি, নাক, মুখ, কনুইসহ দুই হাত, মাথা মাসেহ ও টাখনুসহ দুই পা ধুতে হয়। কুরআনের ৫:৬ আয়াত অনুযায়ী ফরজ চারটি।' },
        { q: 'আরবি বর্ণমালা কীভাবে শিখব?', a: 'প্রথমে ২৮টি হরফের নাম ও আকৃতি চিনুন, তারপর শুরু/মাঝ/শেষের রূপ এবং মাখরাজ অনুশীলন করুন। আরবি বর্ণমালার পাতায় কুইজ ও কুরআনের উদাহরণ শব্দ আছে।' },
      ]
    : [
        { q: 'How do I start learning salah?', a: 'Learn wudu first, memorise Surah al-Fatiha and a few short surahs, then follow the steps on the salah page and practise them. It is best to have a teacher listen to your recitation.' },
        { q: 'How many kalimas are there?', a: 'In South Asia six kalimas are taught: Tayyibah, Shahadah, Tamjeed, Tawheed, Astaghfar and Radd-e-Kufr. Grouping them as six separate kalimas is a teaching convention; the phrases themselves come from the Quran and hadith.' },
        { q: 'What is tajweed and what are its main rules?', a: 'Tajweed is the science of reciting the Quran with every letter pronounced from its proper articulation point and with its proper qualities. The main rules are noon sakinah and tanween (izhar, idgham, iqlab, ikhfa), meem sakinah, qalqalah, ghunnah, madd, lam shamsiyyah and waqf.' },
        { q: 'How do I perform wudu?', a: 'Make the intention and say Bismillah, wash the hands, rinse the mouth, clean the nose, wash the face, wash the arms to the elbows, wipe the head and ears, and wash the feet to the ankles. According to Quran 5:6 four acts are obligatory.' },
        { q: 'How do I learn the Arabic alphabet for the Quran?', a: 'Start with the 28 letter names and shapes, then practise their initial, medial and final forms and where each is pronounced (makhraj). The alphabet page has a quiz and an example Quran word for every letter.' },
      ]
  const path = [
    { slug: 'arabic-alphabet' as const, n: 1 },
    { slug: 'tajweed' as const, n: 2 },
    { slug: 'wudu' as const, n: 3 },
    { slug: 'salah' as const, n: 4 },
    { slug: 'kalima' as const, n: 5 },
  ]
  return (
    <GuideFrame
      locale={locale}
      path="/learn"
      crumbs={[{ name: bn ? 'শিক্ষা' : 'Learn', ar: 'تعلّم', href: '/learn' }]}
      headline={hubMeta[locale].title}
      description={hubMeta[locale].description}
      keywords={hubMeta[locale].keywords}
      hero={{
        eyebrow: lt(locale, { en: 'Learn', bn: 'শিক্ষা', ar: 'تعلّم' }), icon: 'read', arabic: read?.ar,
        title: lt(locale, { en: 'Learn the basics of Islam, step by step', bn: 'ইসলামের মৌলিক বিষয় শিখুন, ধাপে ধাপে', ar: 'تعلّم أساسيات الإسلام خطوة بخطوة' }),
        subtitle: lt(locale, {
          en: 'Clear, free guides for beginners: how to pray, how to make wudu, tajweed with real Quran examples, the six kalimas and the Arabic alphabet. Quran text always comes from the verified corpus.',
          bn: 'নতুনদের জন্য সহজ ও বিনামূল্যের গাইড: নামাজ পড়ার নিয়ম, অজু করার নিয়ম, কুরআনের আসল উদাহরণসহ তাজবীদ, ৬ কালেমা ও আরবি বর্ণমালা। কুরআনের পাঠ সবসময় যাচাইকৃত কর্পাস থেকে নেওয়া।',
          ar: 'أدلة مجانية وواضحة للمبتدئين: كيف تصلي، وكيف تتوضأ، والتجويد بأمثلة حقيقية من القرآن، والكلمات الست، والحروف العربية.',
        }),
      }}
      ld={[collectionLd({ name: hubMeta[locale].title, description: hubMeta[locale].description, path: h('/learn'), inLanguage: bn ? 'bn' : undefined, items: learnGuides.map((g) => ({ name: pick(locale, g.name), href: h(g.path) })) })]}
      faqs={faqs}
      scholar
    >
      <ul className="mt-8 grid gap-4 sm:grid-cols-2" aria-label={bn ? 'শিক্ষা-গাইড' : 'Learning guides'}>
        {learnGuides.map((g, i) => (
          <li key={g.slug}>
            <Reveal delay={Math.min(i * 0.05, 0.2)} className="h-full">
              <Link href={h(g.path)} data-learn-card={g.slug} className="card-soft lift group relative flex h-full flex-col overflow-hidden rounded-3xl p-5 sm:p-6">
                <div aria-hidden className="bg-pattern pointer-events-none absolute -end-10 -top-10 size-40 rounded-full [mask-image:radial-gradient(circle,#000,transparent_70%)]" />
                <div className="relative flex items-start justify-between gap-3">
                  <span className="grid size-14 place-items-center rounded-2xl bg-accent"><UiIcon name={g.icon} size={34} /></span>
                  <span className="rounded-full bg-gold-soft px-3 py-1 text-[11px] font-semibold text-gold">{bn ? g.count.bn : lt(locale, { en: g.count.en, bn: g.count.bn })}</span>
                </div>
                <h2 className="font-display relative mt-4 text-xl font-semibold tracking-tight group-hover:text-primary">{lt(locale, g.name)}</h2>
                <p className="relative mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{lt(locale, g.blurb)}</p>
                <span className="relative mt-4 text-sm font-semibold text-primary">{lt(locale, { en: 'Start learning', bn: 'শেখা শুরু করুন', ar: 'ابدأ التعلّم' })} <span className="inline-block rtl:rotate-180">→</span></span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>

      <section aria-labelledby="path-h" className="mt-12">
        <h2 id="path-h" className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{lt(locale, { en: 'A simple learning path', bn: 'শেখার সহজ ধারা', ar: 'مسار تعلّم مبسّط' })}</h2>
        <ol className="mt-5 grid gap-3 sm:grid-cols-5">
          {path.map(({ slug, n }) => {
            const g = guideBySlug(slug)!
            return (
              <li key={slug} className="rounded-2xl border border-border bg-card p-4">
                <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{bn ? bnNum(n) : n}</span>
                <Link href={h(g.path)} className="mt-3 block text-sm font-semibold hover:text-primary">{lt(locale, g.name)}</Link>
              </li>
            )
          })}
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">
          {lt(locale, { en: 'Then continue with', bn: 'এরপর দেখুন', ar: 'ثم تابع مع' })}{' '}
          <Link href={h('/prayer-times')} className="font-semibold text-primary hover:underline">{lt(locale, { en: 'prayer times', bn: 'নামাজের সময়', ar: 'مواقيت الصلاة' })}</Link>,{' '}
          <Link href={h('/dua')} className="font-semibold text-primary hover:underline">{lt(locale, { en: 'duas', bn: 'দোয়া', ar: 'الأدعية' })}</Link>{' '}
          {lt(locale, { en: 'and', bn: 'ও', ar: 'و' })}{' '}
          <Link href={h('/juz/30')} className="font-semibold text-primary hover:underline">{lt(locale, { en: 'Juz Amma', bn: 'আমপারা', ar: 'جزء عمّ' })}</Link>.
        </p>
      </section>
    </GuideFrame>
  )
}
