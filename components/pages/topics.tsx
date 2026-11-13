import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { CiteThis } from '@/components/seo/cite-this'
import { topicQuickAnswer } from '@/lib/content/answers'
import { absoluteUrl } from '@/lib/site'
import { AyahCard } from '@/components/content/ayah-card'
import { Faq } from '@/components/content/faq'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { Reveal } from '@/components/content/reveal'
import { ShareButton } from '@/components/content/copy-button'
import { MoodPicker, type Mood } from '@/components/content/mood-picker'
import { UiIcon } from '@/components/ui-icon'
import { Labelled } from '@/lib/i18n/labelled'
import { topics, topicBySlug, topicCategories } from '@/data/content/topics'
import { duaBySlug } from '@/data/content/duas'
import { getVersesByRefs } from '@/lib/quran/data'
import { readerHref } from '@/lib/quran/chapters'
import { topicVerses } from '@/lib/content/resolve'
import { articleLd, buildMeta, clip, collectionLd } from '@/lib/content/seo'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { bnNum } from '@/lib/i18n/t'
import { refLabelL, refLabelFor } from '@/lib/i18n/quran'
import { T, NotAr } from '@/lib/i18n/text'
import { RefLabel } from '@/lib/i18n/surah-name'
import { Source } from '@/lib/i18n/source'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/* ───────────────────────────── /topics ───────────────────────────── */

const indexCopy = {
  en: {
    title: 'What Does the Quran Say About…? Verses by Topic & Feeling | কুরআনে বিষয়ভিত্তিক আয়াত',
    description: 'Explore what the Quran says about anxiety, patience, rizq, parents, forgiveness, death and 30+ more topics, with Arabic, English and Bangla translation for every verse. কুরআনের আয়াত বিষয়ভিত্তিক।',
    keywords: ['what does the Quran say about', 'Quran verses about anxiety', 'Quran verses about patience', 'Quran topics', 'কুরআনের আয়াত বিষয়', 'ধৈর্য নিয়ে কুরআনের আয়াত'],
  },
  bn: {
    title: 'বিষয়ভিত্তিক কুরআনের আয়াত: দুশ্চিন্তা, ধৈর্য, রিজিক, বাবা-মা ও আরও | বাংলা অর্থসহ',
    description: 'দুশ্চিন্তা, ধৈর্য, রিজিক, বাবা-মা, ক্ষমা, মৃত্যু সহ ৩০টিরও বেশি বিষয়ে কুরআন কী বলে জানুন। প্রতিটি আয়াত আরবি, বাংলা ও ইংরেজি অনুবাদসহ।',
    keywords: ['বিষয়ভিত্তিক কুরআনের আয়াত', 'কুরআনের আয়াত বাংলা অর্থসহ', 'দুশ্চিন্তা দূর করার আয়াত', 'ধৈর্য নিয়ে কুরআনের আয়াত', 'রিজিক নিয়ে আয়াত', 'কুরআন কী বলে'],
  },
}

export const topicsIndexMeta = (locale: Locale): Metadata => buildMeta({ ...indexCopy[locale], path: '/topics', locale, ogImage: locale === 'bn' ? '/bn/opengraph-image' : undefined })

const moodDefs: { id: string; icon: string; label: { en: string; bn: string; ar?: string }; slug: string; refIndex?: number }[] = [
  { id: 'anxious', icon: 'heart', label: { en: 'Anxious', bn: 'দুশ্চিন্তিত', ar: 'قلق' }, slug: 'anxiety' },
  { id: 'sad', icon: 'moon', label: { en: 'Sad', bn: 'মন খারাপ', ar: 'حزين' }, slug: 'grief-sadness', refIndex: 1 },
  { id: 'lonely', icon: 'lantern', label: { en: 'Lonely', bn: 'একাকী', ar: 'وحيد' }, slug: 'loneliness' },
  { id: 'angry', icon: 'focus', label: { en: 'Angry', bn: 'রাগান্বিত', ar: 'غاضب' }, slug: 'anger' },
  { id: 'hopeless', icon: 'sun', label: { en: 'Hopeless', bn: 'হতাশ', ar: 'يائس' }, slug: 'hopelessness' },
  { id: 'afraid', icon: 'kaaba', label: { en: 'Afraid', bn: 'ভীত', ar: 'خائف' }, slug: 'fear' },
  { id: 'guilty', icon: 'hands', label: { en: 'Guilty', bn: 'অনুতপ্ত', ar: 'نادم' }, slug: 'guilt-forgiveness', refIndex: 2 },
  { id: 'grateful', icon: 'sparkle', label: { en: 'Grateful', bn: 'কৃতজ্ঞ', ar: 'شاكر' }, slug: 'gratitude' },
  { id: 'content', icon: 'crescent', label: { en: 'At peace', bn: 'প্রশান্ত', ar: 'مطمئن' }, slug: 'contentment' },
]

export async function TopicsIndexPage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const moods: Mood[] = []
  for (const m of moodDefs) {
    const t = topicBySlug(m.slug)!
    const ref = t.refs[m.refIndex ?? 0]
    const [v] = await getVersesByRefs([ref])
    const dua = t.duas.map((s) => duaBySlug(s)).find(Boolean)
    moods.push({
      id: m.id, icon: m.icon, label: m.label, topicSlug: t.slug, topicTitle: { en: t.en, bn: t.bn, ar: t.ar },
      ayah: { ref: refLabelL(locale, `${v.surah}:${v.n}`), refAr: refLabelFor('ar', `${v.surah}:${v.n}`), ar: v.ar, en: v.en, bn: v.bn, href: readerHref(v.surah, v.n) },
      duaSlug: dua?.slug, duaTitle: dua?.title,
    })
  }
  return (
    <div className={pageShell}>
      <JsonLd data={collectionLd({
        name: bn ? 'বিষয়ভিত্তিক কুরআনের আয়াত' : 'Quran topics', description: indexCopy[locale].description, path: h('/topics'), inLanguage: bn ? 'bn' : undefined,
        items: topics.map((t) => ({ name: bn ? `${t.bn} সম্পর্কে কুরআন কী বলে` : `What the Quran says about ${t.en}`, href: h(`/topics/${t.slug}`) })),
      })} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'বিষয়ভিত্তিক' : 'Topics', href: '/topics' }]} className="mb-4" />
      {bn ? (
        <PageHero
          eyebrow="বিষয়ভিত্তিক কুরআন"
          icon="topics"
          title={<>কুরআন কী বলে?<span className="mt-1 block text-lg font-medium text-muted-foreground sm:text-2xl">জীবনের প্রশ্নে কুরআনের আয়াত</span></>}
          subtitle={`${bnNum(topics.length)}টি বিষয়, প্রতিটিতে বাছাই করা আয়াত আরবি, বাংলা ও ইংরেজি অনুবাদসহ। অনুভূতি, চরিত্র, পরিবার, ঈমান বা সমাজ অনুযায়ী খুঁজুন।`}
        />
      ) : (
        <PageHero
          eyebrow={<T en="Quran by topic" ar="القرآن حسب الموضوع" />}
          icon="topics"
          title={<><T en="What does the Quran say about…" ar="ماذا يقول القرآن عن…" /><NotAr><span className="mt-1 block text-lg font-medium text-muted-foreground sm:text-2xl">কুরআন কী বলে?</span></NotAr></>}
          subtitle={<T en={`${topics.length} topics, each with carefully chosen verses in Arabic, English and Bangla. Browse by feeling, character, family, faith or society.`} ar={`${topics.length} موضوعًا، لكل منها آيات مختارة بعناية بالعربية مع ترجمات. تصفّح حسب الشعور أو الخلق أو الأسرة أو الإيمان أو المجتمع.`} />}
        />
      )}
      <div className="mt-8"><MoodPicker moods={moods} /></div>

      {topicCategories.map((cat) => {
        const items = topics.filter((t) => t.cat === cat.id)
        return (
          <section key={cat.id} id={cat.id} aria-labelledby={`${cat.id}-h`} className="mt-12 scroll-mt-24">
            <Reveal>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-accent"><UiIcon name={cat.icon} size={26} /></span>
                <div>
                  {bn ? (
                    <>
                      <h2 id={`${cat.id}-h`} className="font-display text-2xl font-semibold">{cat.title.bn}</h2>
                      <p className="text-sm text-muted-foreground">{cat.blurb.bn}</p>
                    </>
                  ) : (
                    <>
                      <h2 id={`${cat.id}-h`} className="font-display text-2xl font-semibold"><T en={cat.title.en} ar={cat.title.ar} /> <NotAr><span className="font-bangla text-lg font-medium text-muted-foreground">· {cat.title.bn}</span></NotAr></h2>
                      <p className="text-sm text-muted-foreground"><T en={cat.blurb.en} ar={cat.blurb.ar} /><NotAr> · {cat.blurb.bn}</NotAr></p>
                    </>
                  )}
                </div>
              </div>
            </Reveal>
            <ul className="grid gap-3 sm:grid-cols-2">
              {items.map((t, i) => (
                <li key={t.slug}>
                  <Reveal delay={Math.min(i * 0.04, 0.2)} className="h-full">
                    <Link href={h(`/topics/${t.slug}`)} className="card-soft lift group flex h-full flex-col rounded-3xl p-5">
                      {bn ? (
                        <>
                          <span className="font-display text-lg font-semibold leading-snug group-hover:text-primary">{t.bn}</span>
                          <span className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{t.introBn}</span>
                          <span className="mt-auto pt-4 text-xs font-semibold text-primary">{bnNum(t.refs.length)}টি আয়াত <span className="inline-block rtl:rotate-180">→</span></span>
                        </>
                      ) : (
                        <>
                          <span className="font-display text-lg font-semibold capitalize leading-snug group-hover:text-primary"><T en={t.en} ar={t.ar} /></span>
                          <NotAr><span className="font-bangla text-sm text-gold">{t.bn}</span></NotAr>
                          <span className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{t.introEn}</span>
                          <span className="mt-auto pt-4 text-xs font-semibold text-primary"><T en={`${t.refs.length} verses`} ar={`${t.refs.length} آية`} /> <span className="inline-block rtl:rotate-180">→</span></span>
                        </>
                      )}
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

/* ───────────────────────────── /topics/[slug] ───────────────────────────── */

export type SlugProps = { params: Promise<{ slug: string }> }
export const topicParams = () => topics.map((t) => ({ slug: t.slug }))

export async function topicMeta(locale: Locale, { params }: SlugProps): Promise<Metadata> {
  const { slug } = await params
  const t = topicBySlug(slug)
  if (!t) return {}
  const path = `/topics/${t.slug}`
  if (locale === 'bn') {
    return buildMeta({
      title: `${t.bn} সম্পর্কে কুরআন কী বলে? ${bnNum(t.refs.length)}টি আয়াত বাংলা অর্থসহ`,
      description: clip(`${t.introBn} আয়াতগুলো আরবি, বাংলা ও ইংরেজি অনুবাদসহ পড়ুন।`, 165),
      path, locale, type: 'article', markdown: true, ogImage: `${localeHref(locale, path)}/opengraph-image`,
      keywords: [`${t.bn} নিয়ে কুরআনের আয়াত`, `${t.bn} সম্পর্কে কুরআন`, `${t.bn} ইসলাম`, `${t.bn} আয়াত বাংলা অর্থসহ`, ...t.keywords.filter((k) => /[ঀ-৿]/.test(k))],
    })
  }
  return buildMeta({
    title: `What Does the Quran Say About ${cap(t.en)}? ${t.bn} | ${t.refs.length} Verses`,
    description: clip(`${t.introEn} Read the verses in Arabic with English and Bangla translation. ${t.bn} সম্পর্কে কুরআনের আয়াত।`, 165),
    path, type: 'article', markdown: true,
    keywords: [`Quran verses about ${t.en}`, `what does the Quran say about ${t.en}`, `${t.en} in Islam`, `${t.bn} কুরআনের আয়াত`, `${t.bn} নিয়ে কুরআন`, ...t.keywords],
  })
}

export async function TopicPage({ locale, params }: SlugProps & { locale: Locale }) {
  const { slug } = await params
  const t = topicBySlug(slug)
  if (!t) notFound()
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const ref = (r: string) => refLabelL(locale, r)
  const verses = await topicVerses(t)
  const cat = topicCategories.find((c) => c.id === t.cat)!
  const idx = topics.findIndex((x) => x.slug === t.slug)
  const prev = topics[(idx - 1 + topics.length) % topics.length]
  const next = topics[(idx + 1) % topics.length]
  const related = t.related.map((s) => topicBySlug(s)).filter((x) => !!x)
  const relDuas = t.duas.map((s) => duaBySlug(s)).filter((x) => !!x)

  // Quote the shortest of the first three verses in FAQ answers (always from the corpus).
  const quote = [...verses.slice(0, 3)].sort((a, b) => a.en.length - b.en.length)[0]
  const path = `/topics/${t.slug}`
  const qRef = `${quote.surah}:${quote.n}`
  const faqs = bn
    ? [
        { q: `কুরআনে ${t.bn} সম্পর্কে কী বলা হয়েছে?`, a: `${t.introBn} যেমন, ${ref(qRef)}: “${quote.bn}”` },
        { q: `কুরআনের কোন কোন আয়াতে ${t.bn} প্রসঙ্গ এসেছে?`, a: `গুরুত্বপূর্ণ আয়াতগুলো হলো: ${t.refs.map(ref).join(', ')}।` },
        ...(relDuas.length ? [{ q: `${t.bn} বিষয়ে কোনো দোয়া আছে কি?`, a: `হ্যাঁ। এ বিষয়ে প্রামাণ্য দোয়ার মধ্যে রয়েছে ${relDuas.map((d) => `“${d!.title.bn}” (${d!.source})`).join('; ')}।` }] : []),
      ]
    : [
        { q: `What does the Quran say about ${t.en}?`, a: `${t.introEn} For example, ${ref(qRef)}: “${quote.en}”` },
        { q: `কুরআনে ${t.bn} সম্পর্কে কী বলা হয়েছে?`, a: `${t.introBn} যেমন, ${ref(qRef)}: “${quote.bn}”` },
        { q: `Which verses of the Quran mention ${t.en}?`, a: `Key verses include ${t.refs.map(ref).join(', ')}.` },
        ...(relDuas.length ? [{ q: `Is there a dua related to ${t.en}?`, a: `Yes. Authentic duas on this theme include ${relDuas.map((d) => `“${d!.title.en}” (${d!.source})`).join('; ')}.` }] : []),
      ]

  const headline = bn ? `${t.bn} সম্পর্কে কুরআন কী বলে?` : `What does the Quran say about ${t.en}?`
  const quick = topicQuickAnswer(locale, t, verses)
  return (
    <div className={pageShell}>
      <JsonLd data={{ ...articleLd({ headline, description: bn ? t.introBn : t.introEn, path: h(path), image: `${h(path)}/opengraph-image`, about: bn ? t.bn : t.en, inLanguage: bn ? 'bn' : undefined, keywords: bn ? [t.bn, t.en, ...t.keywords] : [t.en, t.bn, ...t.keywords] }), abstract: quick, citation: t.refs.map((r) => `Quran ${r}`) }} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'বিষয়ভিত্তিক' : 'Topics', ar: 'المواضيع', href: '/topics' }, { name: bn ? t.bn : cap(t.en), ar: t.ar, href: path }]} className="mb-4" />

      {bn ? (
        <PageHero
          eyebrow={cat.title.bn}
          icon={cat.icon}
          title={<>{t.bn} সম্পর্কে কুরআন কী বলে?</>}
          subtitle={t.introBn}
        >
          <p lang="en" className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{t.introEn}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <ShareButton title={headline} path={h(path)} />
            <span className="rounded-full bg-card/80 px-3 py-2 text-xs font-semibold text-muted-foreground">{bnNum(verses.length)}টি আয়াত · {bnNum(t.refs.length)}টি অংশ</span>
          </div>
        </PageHero>
      ) : (
        <PageHero
          eyebrow={<><T en={cat.title.en} ar={cat.title.ar} /><NotAr> · {cat.title.bn}</NotAr></>}
          icon={cat.icon}
          title={<><T en={`What does the Quran say about ${t.en}?`} ar={`ماذا يقول القرآن عن ${t.ar}؟`} /> <NotAr><span className="font-bangla mt-2 block text-xl font-medium text-gold sm:text-3xl">({t.bn})</span></NotAr></>}
          subtitle={t.introEn}
        >
          <p lang="bn" className="font-bangla mt-3 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{t.introBn}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <ShareButton title={headline} path={path} />
            <span className="rounded-full bg-card/80 px-3 py-2 text-xs font-semibold text-muted-foreground"><T en={`${verses.length} verses · ${t.refs.length} passages`} ar={`${verses.length} آية · ${t.refs.length} مقطعًا`} /></span>
          </div>
        </PageHero>
      )}

      <section id="quick-answer" aria-labelledby="quick-h" className="mt-6 rounded-3xl border border-primary/25 bg-accent/50 p-5 sm:p-6">
        <h2 id="quick-h" className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{bn ? 'সংক্ষিপ্ত উত্তর' : <T en="Quick answer" ar="إجابة مختصرة" />}</h2>
        <p lang={bn ? 'bn' : 'en'} className={`mt-2 text-[15px] leading-relaxed sm:text-base ${bn ? 'font-bangla' : ''}`}>{quick}</p>
      </section>

      <Labelled as="nav" label={{ en: 'Verses on this page', bn: 'এই পাতার আয়াত', ar: 'آيات هذه الصفحة' }} className="mt-6 flex flex-wrap gap-2">
        {t.refs.map((r) => {
          const [s, a] = r.split(':'); const first = a.split('-')[0]
          return <a key={r} href={`#ayah-${s}-${first}`} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary">{bn ? ref(r) : <RefLabel r={r} />}</a>
        })}
      </Labelled>

      <Labelled as="section" label={{ en: 'Verses', bn: 'আয়াতসমূহ', ar: 'الآيات' }} className="mt-6 space-y-4">
        {verses.map((v, i) => <AyahCard key={v.k} verse={v} index={i} locale={locale} />)}
      </Labelled>

      <Reveal className="mt-10">
        <section aria-labelledby="reflect-h" className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gold-soft/40 p-6 sm:p-8">
          <div aria-hidden className="bg-pattern pointer-events-none absolute -end-8 -top-8 size-40 rounded-full" />
          <h2 id="reflect-h" className="font-display relative flex items-center gap-2 text-xl font-semibold"><UiIcon name="sparkle" size={22} /> {bn ? 'ভাবুন' : <><T en="Reflect" ar="تأمّل" /><NotAr> · ভাবুন</NotAr></>}</h2>
          {bn ? (
            <>
              <p lang="bn" className="relative mt-3 text-[15px] leading-relaxed">{t.reflect.bn}</p>
              <p lang="en" className="relative mt-2 text-[15px] leading-relaxed text-muted-foreground">{t.reflect.en}</p>
            </>
          ) : (
            <>
              <p className="relative mt-3 text-[15px] leading-relaxed">{t.reflect.en}</p>
              <p lang="bn" className="font-bangla relative mt-2 text-[15px] leading-relaxed text-muted-foreground">{t.reflect.bn}</p>
            </>
          )}
        </section>
      </Reveal>

      {relDuas.length > 0 && (
        <section aria-labelledby="duas-h" className="mt-12">
          <h2 id="duas-h" className="font-display mb-4 text-2xl font-semibold">{bn ? 'সংশ্লিষ্ট দোয়া' : <><T en="Related duas" ar="أدعية ذات صلة" /> <NotAr><span className="font-bangla text-lg font-medium text-muted-foreground">· সংশ্লিষ্ট দোয়া</span></NotAr></>}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {relDuas.map((d, i) => (
              <li key={d!.slug}><Reveal delay={i * 0.05} className="h-full">
                <Link href={h(`/dua/${d!.slug}`)} className="card-soft lift flex h-full items-start gap-3 rounded-3xl p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent"><UiIcon name="dua" size={22} /></span>
                  <span>
                    <span className="block text-[15px] font-semibold leading-snug">{bn ? d!.title.bn : <T en={d!.title.en} ar={d!.title.ar} />}</span>
                    {bn ? null : <NotAr><span className="block text-sm text-gold font-bangla">{d!.title.bn}</span></NotAr>}
                    <span className="mt-1 block text-xs text-muted-foreground">{bn ? <Source s={d!.source} bn /> : <Source s={d!.source} />}</span>
                  </span>
                </Link>
              </Reveal></li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="rel-h" className="mt-12">
          <h2 id="rel-h" className="font-display mb-4 text-2xl font-semibold">{bn ? 'সম্পর্কিত বিষয়' : <><T en="Related topics" ar="مواضيع ذات صلة" /> <NotAr><span className="font-bangla text-lg font-medium text-muted-foreground">· সম্পর্কিত বিষয়</span></NotAr></>}</h2>
          <div className="flex flex-wrap gap-2.5">
            {related.map((r) => (
              <Link key={r!.slug} href={h(`/topics/${r!.slug}`)} className="lift rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-accent">
                {bn ? <>{r!.bn}</> : <><span className="capitalize"><T en={r!.en} ar={r!.ar} /></span> <NotAr><span className="font-bangla text-gold">· {r!.bn}</span></NotAr></>}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Faq faqs={faqs} locale={bn ? 'bn' : undefined} />

      <CiteThis locale={locale} title={headline} note={bn ? 'Quran verses with Taisirul Quran Bangla translation' : 'Quran verses with Saheeh International translation'} url={absoluteUrl(h(path))} />

      <Labelled as="nav" label={{ en: 'Previous and next topic', bn: 'আগের ও পরের বিষয়', ar: 'الموضوع السابق والتالي' }} className="mt-12 grid gap-3 sm:grid-cols-2">
        <Link href={h(`/topics/${prev.slug}`)} className="card-soft lift rounded-3xl p-4 text-sm"><span className="text-xs text-muted-foreground"><span className="inline-block rtl:rotate-180">←</span> {bn ? 'আগের বিষয়' : <T en="Previous topic" ar="الموضوع السابق" />}</span><span className="mt-1 block font-semibold capitalize">{bn ? prev.bn : <T en={prev.en} ar={prev.ar} />}</span></Link>
        <Link href={h(`/topics/${next.slug}`)} className="card-soft lift rounded-3xl p-4 text-end text-sm"><span className="text-xs text-muted-foreground">{bn ? 'পরের বিষয়' : <T en="Next topic" ar="الموضوع التالي" />} <span className="inline-block rtl:rotate-180">→</span></span><span className="mt-1 block font-semibold capitalize">{bn ? next.bn : <T en={next.en} ar={next.ar} />}</span></Link>
      </Labelled>
    </div>
  )
}
