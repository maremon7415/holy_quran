import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GuideFrame } from '@/components/learn/frame'
import { Section } from '@/components/learn/ui'
import { TajweedExamples, ClassChip } from '@/components/learn/tajweed-examples'
import { TajweedLegend } from '@/components/reader/tajweed-legend'
import { buildMeta, clip, collectionLd, howToLd } from '@/lib/content/seo'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { lt } from '@/lib/i18n/lt'
import { pick, bnNum } from '@/lib/i18n/t'
import { guideMeta } from './learn'
import { tajweedBySlug, tajweedGroups, tajweedRules, type TajweedGroup } from '@/data/learn/tajweed'
import { tajweedColors } from '@/lib/learn/tajweed'
import { getVersesByRefs } from '@/lib/quran/data'

const tajweedQ = (bn: boolean) => bn
  ? [
      { q: 'তাজবীদের নিয়ম কয়টি ও কী কী?', a: 'প্রধান নিয়মগুলো: নুন সাকিন ও তানবীনের চারটি নিয়ম (ইযহার, ইদগাম, ইকলাব, ইখফা), মীম সাকিনের তিনটি নিয়ম, কলকলা, গুন্নাহ, মাদ্দের প্রকার (স্বাভাবিক, মুত্তাসিল, মুনফাসিল, লাযিম, আরিদ), লাম শামসিয়্যাহ ও ক্বামারিয়্যাহ, হামযাতুল ওয়াসল, তাফখীম-তারকীক এবং ওয়াকফ।' },
      { q: 'কুরআন পড়তে কি তাজবীদ জানা জরুরি?', a: 'আলেমগণ সাধারণত বলেন, অর্থ বদলে দেয় এমন স্পষ্ট ভুল (লাহনে জালী) এড়িয়ে চলা আবশ্যক, আর সূক্ষ্ম নিয়মগুলো আয়ত্ত করা অত্যন্ত উত্তম। বিস্তারিত বিধান ও অনুশীলনের জন্য যোগ্য উস্তাদের কাছে শিখুন।' },
      { q: 'কুরআনের রঙিন তাজবীদ কীভাবে পড়ব?', a: 'প্রতিটি রং একটি নিয়ম বোঝায়: যেমন কমলা গুন্নাহ, বেগুনি ইখফা, লাল কলকলা, নীলের বিভিন্ন ছায়া মাদ্দ এবং ধূসর নিঃশব্দ হরফ। রিডারে “তাজবীদ” চালু করলে একই রং কুরআনের পাঠে দেখা যায়।' },
    ]
  : [
      { q: 'How many tajweed rules are there and what are they?', a: 'The main rules are: the four rules of noon sakinah and tanween (izhar, idgham, iqlab, ikhfa), the three rules of meem sakinah, qalqalah, ghunnah, the kinds of madd (natural, connected, separated, necessary and ‘arid), lam shamsiyyah and qamariyyah, hamzatul wasl, tafkheem and tarqeeq, and waqf.' },
      { q: 'Is tajweed required to read the Quran?', a: 'Scholars generally teach that avoiding clear mispronunciations that change the meaning (lahn jali) is required, while mastering the finer rules is highly encouraged. Learn the details and practise with a qualified teacher.' },
      { q: 'How do I read the coloured tajweed text?', a: 'Each colour marks a rule: for example orange is ghunnah, purple is ikhfa, red is qalqalah, shades of blue are madd and grey marks a silent letter. Turn on “Tajweed” in the reader to see the same colours on the Quran text.' },
    ]

const order: TajweedGroup[] = ['noon', 'meem', 'sound', 'madd', 'letters', 'stopping']

export async function TajweedIndexPage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const [tartil] = await getVersesByRefs(['73:4'])
  const meta = guideMeta('tajweed', locale)
  const title = String((meta.title as { absolute: string }).absolute)
  const description = String(meta.description)
  return (
    <GuideFrame
      locale={locale}
      path="/learn/tajweed"
      crumbs={[{ name: bn ? 'শিক্ষা' : 'Learn', ar: 'تعلّم', href: '/learn' }, { name: bn ? 'তাজবীদ শিক্ষা' : 'Tajweed', ar: 'التجويد', href: '/learn/tajweed' }]}
      headline={title}
      description={description}
      keywords={meta.keywords as string[]}
      hero={{
        eyebrow: lt(locale, { en: 'Tajweed', bn: 'তাজবীদ', ar: 'التجويد' }), icon: 'tajweed', arabic: tartil?.ar,
        title: lt(locale, { en: 'Tajweed rules, explained with real Quran examples', bn: 'তাজবীদের নিয়ম, কুরআনের আসল উদাহরণসহ', ar: 'أحكام التجويد بأمثلة حقيقية من القرآن' }),
        subtitle: lt(locale, {
          en: `${tajweedRules.length} rules with definitions, letters, how to pronounce them and coloured examples taken straight from the Quran, each with audio.`,
          bn: `${bnNum(tajweedRules.length)}টি নিয়ম: সংজ্ঞা, হরফ, উচ্চারণের পদ্ধতি এবং সরাসরি কুরআন থেকে নেওয়া রঙিন উদাহরণ, প্রতিটিতে অডিওসহ।`,
          ar: `${tajweedRules.length} حكمًا مع التعريف والحروف وطريقة النطق وأمثلة ملوّنة من القرآن مع الصوت.`,
        }),
      }}
      ld={[collectionLd({ name: title, description, path: h('/learn/tajweed'), inLanguage: bn ? 'bn' : undefined, items: tajweedRules.map((r) => ({ name: pick(locale, r.name), href: h(`/learn/tajweed/${r.slug}`) })) })]}
      faqs={tajweedQ(bn)}
      toc={order.map((g) => ({ id: g, label: tajweedGroups[g].title }))}
    >
      <section aria-labelledby="legend-h" className="mt-8 rounded-3xl border border-border bg-card p-5 sm:p-6">
        <h2 id="legend-h" className="font-display text-xl font-semibold">{lt(locale, { en: 'What the colours mean', bn: 'রংগুলোর অর্থ', ar: 'معاني الألوان' })}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{lt(locale, { en: 'The same colours are used in the reader when Tajweed is turned on.', bn: 'রিডারে তাজবীদ চালু করলে একই রং ব্যবহার হয়।', ar: 'تُستخدم الألوان نفسها في القارئ عند تفعيل التجويد.' })}</p>
        <TajweedLegend className="mt-3" />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(['izhar', 'qamariyyah', 'tafkheem', 'tarqeeq', 'waqf'] as const).map((k) => <ClassChip key={k} cls={k} locale={locale} />)}
        </div>
      </section>

      {order.map((g) => {
        const rules = tajweedRules.filter((r) => r.group === g)
        return (
          <Section key={g} id={g} title={lt(locale, tajweedGroups[g].title)} intro={lt(locale, tajweedGroups[g].blurb)}>
            <ul className="grid gap-4 sm:grid-cols-2">
              {rules.map((r) => (
                <li key={r.slug}>
                  <Link href={h(`/learn/tajweed/${r.slug}`)} data-tajweed-rule={r.slug} className="card-soft lift group flex h-full flex-col rounded-3xl p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span aria-hidden className="size-3 rounded-full" style={{ background: tajweedColors[r.cls] }} />
                      <span lang="ar" dir="rtl" className="font-arabic text-2xl leading-none text-gold">{r.ar}</span>
                    </div>
                    <h3 className="font-display mt-3 text-lg font-semibold group-hover:text-primary">{lt(locale, r.name)}</h3>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{lt(locale, { en: clip(r.summary.en, 150), bn: r.summary.bn })}</p>
                    <span className="mt-3 text-sm font-semibold text-primary">{lt(locale, { en: 'Rule & examples', bn: 'নিয়ম ও উদাহরণ', ar: 'الحكم والأمثلة' })} <span className="inline-block rtl:rotate-180">→</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )
      })}
    </GuideFrame>
  )
}

/* ───────────── /learn/tajweed/[rule] ───────────── */
export type RuleProps = { params: Promise<{ rule: string }> }
export const tajweedRuleParams = () => tajweedRules.map((r) => ({ rule: r.slug }))

export async function tajweedRuleMeta(locale: Locale, { params }: RuleProps): Promise<Metadata> {
  const { rule } = await params
  const r = tajweedBySlug(rule)
  if (!r) return {}
  const bn = locale === 'bn'
  return buildMeta({
    title: bn ? `${r.name.bn.split(' (')[0]}: তাজবীদের নিয়ম, হরফ ও কুরআনের উদাহরণ` : `${r.name.en.split(' (')[0]}: Tajweed Rule, Letters & Quran Examples | ${r.name.bn.split(' (')[0]}`,
    description: clip(bn ? `${r.summary.bn} কুরআন থেকে রঙিন উদাহরণ ও অডিওসহ।` : `${r.summary.en} With coloured Quran examples and audio.`, 165),
    path: `/learn/tajweed/${r.slug}`, locale, type: 'article', markdown: true,
    keywords: bn ? [r.name.bn.split(' (')[0], `${r.name.bn.split(' (')[0]} এর নিয়ম`, 'তাজবীদ শিক্ষা', 'তাজবীদের নিয়ম'] : [r.name.en.split(' (')[0], `${r.name.en.split(' (')[0]} tajweed`, `${r.name.en.split(' (')[0]} rules with examples`, 'tajweed rules', r.name.bn.split(' (')[0]],
  })
}

export async function TajweedRulePage({ locale, params }: RuleProps & { locale: Locale }) {
  const { rule } = await params
  const r = tajweedBySlug(rule)
  if (!r) notFound()
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const path = `/learn/tajweed/${r.slug}`
  const i = tajweedRules.findIndex((x) => x.slug === r.slug)
  const prev = tajweedRules[i - 1], next = tajweedRules[i + 1]
  const related = r.related.map((s) => tajweedBySlug(s)).filter((x): x is NonNullable<typeof x> => !!x)
  const nameShort = pick(locale, r.name).split(' (')[0]
  const faqs = [
    { q: bn ? `${nameShort} কী?` : `What is ${nameShort}?`, a: pick(locale, r.summary) },
    ...r.faqs.map((f) => ({ q: pick(locale, f.q), a: pick(locale, f.a) })),
  ]
  const meta = await tajweedRuleMeta(locale, { params })
  const title = String((meta.title as { absolute: string }).absolute)
  const description = String(meta.description)
  return (
    <GuideFrame
      locale={locale}
      path={path}
      crumbs={[
        { name: bn ? 'শিক্ষা' : 'Learn', ar: 'تعلّم', href: '/learn' },
        { name: bn ? 'তাজবীদ শিক্ষা' : 'Tajweed', ar: 'التجويد', href: '/learn/tajweed' },
        { name: nameShort, ar: r.name.ar, href: path },
      ]}
      headline={title}
      description={description}
      keywords={meta.keywords as string[]}
      hero={{
        eyebrow: lt(locale, tajweedGroups[r.group].title), icon: 'tajweed', arabic: r.ar,
        title: lt(locale, r.name), subtitle: lt(locale, r.summary),
      }}
      ld={[howToLd({ name: bn ? `${nameShort} কীভাবে পড়বেন` : `How to apply ${nameShort}`, description: pick(locale, r.summary), path: h(path), inLanguage: bn ? 'bn' : undefined, steps: r.how.map((s, n) => ({ name: bn ? `ধাপ ${bnNum(n + 1)}` : `Step ${n + 1}`, text: pick(locale, s) })) })]}
      faqs={faqs}
      citeNote={bn ? 'তাজবীদ' : 'Tajweed'}
      toc={[
        { id: 'definition', label: { en: 'Definition', bn: 'সংজ্ঞা', ar: 'التعريف' } },
        { id: 'pronounce', label: { en: 'How to pronounce', bn: 'উচ্চারণ', ar: 'كيفية النطق' } },
        { id: 'examples', label: { en: 'Quran examples', bn: 'কুরআনের উদাহরণ', ar: 'أمثلة من القرآن' } },
        { id: 'mistakes', label: { en: 'Common mistakes', bn: 'সাধারণ ভুল', ar: 'أخطاء شائعة' } },
        { id: 'related', label: { en: 'Related rules', bn: 'সম্পর্কিত নিয়ম', ar: 'أحكام ذات صلة' } },
      ]}
    >
      <Section id="definition" title={lt(locale, { en: 'Definition', bn: 'সংজ্ঞা', ar: 'التعريف' })}>
        <p className="max-w-3xl text-[17px] leading-relaxed">{lt(locale, r.definition)}</p>
        {r.letters && (
          <div className="mt-5 rounded-3xl border border-border bg-card p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{lt(locale, { en: 'Letters', bn: 'হরফ', ar: 'الحروف' })}</p>
            <ul className="mt-3 flex flex-wrap gap-2" lang="ar" dir="rtl">
              {r.letters.ar.map((l) => <li key={l} className="font-arabic grid min-w-12 place-items-center rounded-2xl bg-accent px-3 py-2 text-3xl leading-[1.6] text-arabic">{l}</li>)}
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">{lt(locale, r.letters.note)}</p>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ClassChip cls={r.cls} locale={locale} />
        </div>
      </Section>

      <Section id="pronounce" title={lt(locale, { en: 'How to pronounce it', bn: 'কীভাবে উচ্চারণ করবেন', ar: 'كيفية النطق' })}>
        <ol className="space-y-3">
          {r.how.map((s, n) => (
            <li key={n} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{bn ? bnNum(n + 1) : n + 1}</span>
              <p className="text-[15px] leading-relaxed">{lt(locale, s)}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="examples" title={lt(locale, { en: 'Examples from the Quran', bn: 'কুরআন থেকে উদাহরণ', ar: 'أمثلة من القرآن' })} intro={lt(locale, { en: 'Only the letters that follow this rule are coloured. Press play to hear the ayah, or open it for the full page.', bn: 'শুধু এই নিয়মের হরফগুলো রঙিন। আয়াতটি শুনতে প্লে চাপুন, বা সম্পূর্ণ পাতার জন্য আয়াত খুলুন।', ar: 'تُلوَّن فقط الحروف الخاضعة لهذا الحكم. اضغط تشغيل لسماع الآية.' })}>
        <TajweedExamples slug={r.slug} locale={locale} />
      </Section>

      <Section id="mistakes" title={lt(locale, { en: 'Common mistakes', bn: 'সাধারণ ভুল', ar: 'أخطاء شائعة' })}>
        <ul className="space-y-2 text-[15px] leading-relaxed">
          {r.mistakes.map((m, n) => <li key={n} className="flex gap-2"><span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" />{lt(locale, m)}</li>)}
        </ul>
      </Section>

      <Section id="related" title={lt(locale, { en: 'Related rules', bn: 'সম্পর্কিত নিয়ম', ar: 'أحكام ذات صلة' })}>
        <ul className="grid gap-3 sm:grid-cols-3">
          {related.map((x) => (
            <li key={x.slug}><Link href={h(`/learn/tajweed/${x.slug}`)} className="card-soft lift block rounded-2xl p-4 text-sm font-semibold hover:text-primary">{lt(locale, x.name)}</Link></li>
          ))}
        </ul>
        <nav aria-label={bn ? 'পূর্ববর্তী ও পরবর্তী নিয়ম' : 'Previous and next rule'} className="mt-5 flex items-center justify-between gap-3 text-sm">
          {prev ? <Link href={h(`/learn/tajweed/${prev.slug}`)} rel="prev" className="font-semibold text-primary hover:underline"><span className="inline-block rtl:rotate-180">←</span> {pick(locale, prev.name).split(' (')[0]}</Link> : <span />}
          {next ? <Link href={h(`/learn/tajweed/${next.slug}`)} rel="next" className="font-semibold text-primary hover:underline">{pick(locale, next.name).split(' (')[0]} <span className="inline-block rtl:rotate-180">→</span></Link> : <span />}
        </nav>
      </Section>
    </GuideFrame>
  )
}
