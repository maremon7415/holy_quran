import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { Faq } from '@/components/content/faq'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { Reveal } from '@/components/content/reveal'
import { CopyButton, ShareButton } from '@/components/content/copy-button'
import { DuaBookmark } from '@/components/content/dua-bookmark'
import { DuaLibrary } from '@/components/content/dua-library'
import { UiIcon } from '@/components/ui-icon'
import { duas, duaBySlug, duaCategories } from '@/data/content/duas'
import { topics } from '@/data/content/topics'
import { resolveAllDuas, resolveDua } from '@/lib/content/resolve'
import { articleLd, buildMeta, clip, collectionLd, howToLd, shortTitle } from '@/lib/content/seo'
import { chapters, readerHref } from '@/lib/quran/chapters'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { bnNum } from '@/lib/i18n/t'
import { refLabelL } from '@/lib/i18n/quran'

/* ───────────────────────────── /dua ───────────────────────────── */

const indexCopy = {
  en: {
    title: 'Daily Duas from the Quran & Sunnah: Arabic, Meaning & Bangla | দোয়া সমূহ',
    description: 'Authentic duas with Arabic, transliteration and English & Bangla meaning: morning and evening, sleep, travel, anxiety, rizq, forgiveness, the Rabbana duas of the Quran and more. প্রামাণ্য দোয়া, অর্থসহ।',
    keywords: ['dua', 'duas', 'dua for anxiety', 'morning evening adhkar', 'Rabbana duas', 'daily duas', 'দোয়া', 'রিজিক বৃদ্ধির দোয়া', 'সকাল সন্ধ্যার দোয়া', 'ঘুমের দোয়া'],
  },
  bn: {
    title: 'দৈনন্দিন দোয়া: আরবি, বাংলা উচ্চারণ ও অর্থসহ | কুরআন ও হাদিসের দোয়া',
    description: 'ঘুমানোর দোয়া, সকাল-সন্ধ্যার দোয়া, সফরের দোয়া, দুশ্চিন্তা দূর করার দোয়া, রিজিকের দোয়া, ক্ষমা প্রার্থনা ও কুরআনের রাব্বানা দোয়া — আরবি, উচ্চারণ, বাংলা অর্থ ও উৎসসহ।',
    keywords: ['দোয়া', 'দোয়া বাংলা অর্থসহ', 'ঘুমানোর দোয়া', 'সকাল সন্ধ্যার দোয়া', 'রিজিক বৃদ্ধির দোয়া', 'দুশ্চিন্তা দূর করার দোয়া', 'রাব্বানা দোয়া', 'দোয়া কুনুত', 'আয়াতুল কুরসি'],
  },
}

export const duaIndexMeta = (locale: Locale): Metadata => buildMeta({ ...indexCopy[locale], path: '/dua', locale, ogImage: locale === 'bn' ? '/opengraph-image' : undefined })

export async function DuaIndexPage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const all = await resolveAllDuas()
  const items = all.map((d) => ({ slug: d.slug, cat: d.cat, title: d.title, ar: d.ar, tl: d.tl, meaning: d.meaning, source: d.source, keywords: d.keywords }))
  const popular = ['dua-for-anxiety', 'ayatul-kursi', 'dua-before-sleeping', 'dua-for-rizq-halal', 'dua-qunut', 'rabbana-atina-fid-dunya-hasanah']
  return (
    <div className={pageShell}>
      <JsonLd data={collectionLd({
        name: bn ? 'কুরআন ও সুন্নাহর দোয়া' : 'Duas from the Quran and Sunnah', description: indexCopy[locale].description, path: h('/dua'), inLanguage: bn ? 'bn' : undefined,
        items: all.map((d) => ({ name: bn ? d.title.bn : d.title.en, href: h(`/dua/${d.slug}`) })),
      })} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'দোয়া' : 'Duas', href: '/dua' }]} className="mb-4" />
      {bn ? (
        <PageHero
          eyebrow="দোয়া · Duas"
          icon="dua"
          arabic="ٱدْعُونِىٓ أَسْتَجِبْ لَكُمْ"
          title="কুরআন ও সুন্নাহর দোয়া"
          subtitle={`${bnNum(all.length)}টি প্রামাণ্য দোয়া — আরবি, উচ্চারণ এবং বাংলা ও ইংরেজি অর্থসহ। প্রতিটি দোয়ার উৎস উল্লেখ করা আছে; কুরআনের দোয়াগুলো সরাসরি কুরআনের পাঠ থেকে দেখানো হয়েছে।`}
        />
      ) : (
        <PageHero
          eyebrow="Duas · দোয়া"
          icon="dua"
          arabic="ٱدْعُونِىٓ أَسْتَجِبْ لَكُمْ"
          title="Duas from the Quran & Sunnah"
          subtitle={`${all.length} authentic supplications with Arabic, transliteration and meaning in English and Bangla. Every dua cites its source; Quranic duas are shown straight from the Quran text. প্রতিটি দোয়ার উৎস উল্লেখ করা আছে।`}
        />
      )}
      <div className="mt-6">
        <DuaLibrary duas={items} cats={duaCategories.map((c) => ({ id: c.id, title: c.title, icon: c.icon }))} />
      </div>
      <section className="mt-14 rounded-3xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground">
        {bn ? (
          <>
            <h2 className="font-display mb-2 text-lg font-semibold text-foreground">এই দোয়াগুলো সম্পর্কে</h2>
            <p>প্রতিটি দোয়ার সঙ্গে কুরআনের আয়াত বা হাদিসের গ্রন্থের (যেমন সহিহ বুখারি বা সহিহ মুসলিম) উৎস দেওয়া আছে। হাদিস নম্বর থাকলে তা ওই গ্রন্থের প্রচলিত নম্বর অনুযায়ী। পাঠের নিয়ম ও বিধান জানতে যোগ্য আলেমের পরামর্শ নিন।</p>
          </>
        ) : (
          <>
            <h2 className="font-display mb-2 text-lg font-semibold text-foreground">About these duas</h2>
            <p>Duas are listed with the Quran verse or hadith collection they come from, such as Sahih al-Bukhari or Sahih Muslim. Where a hadith number is shown it points to the standard numbering of that collection. For rulings on how and when to recite, please consult a qualified scholar.</p>
            <p lang="bn" className="font-bangla mt-2">প্রতিটি দোয়ার সঙ্গে কুরআনের আয়াত বা হাদিসের গ্রন্থের উৎস দেওয়া আছে। পাঠের নিয়ম ও বিধান জানতে যোগ্য আলেমের পরামর্শ নিন।</p>
          </>
        )}
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <span className="font-semibold text-foreground">{bn ? 'জনপ্রিয়:' : 'Popular:'}</span>
          {popular.map((s) => { const d = all.find((x) => x.slug === s)!; return <Link key={s} href={h(`/dua/${s}`)} className="text-primary hover:underline">{shortTitle(bn ? d.title.bn : d.title.en)}</Link> })}
        </p>
      </section>
    </div>
  )
}

/* ───────────────────────────── /dua/[slug] ───────────────────────────── */

export type SlugProps = { params: Promise<{ slug: string }> }
export const duaParams = () => duas.map((d) => ({ slug: d.slug }))

export async function duaMeta(locale: Locale, { params }: SlugProps): Promise<Metadata> {
  const { slug } = await params
  const d = duaBySlug(slug)
  if (!d) return {}
  const r = await resolveDua(d)
  const path = `/dua/${d.slug}`
  if (locale === 'bn') {
    return buildMeta({
      title: `${d.title.bn} | আরবি, বাংলা উচ্চারণ ও অর্থ`,
      description: clip(`${r.meaning.bn} — ${d.source}। আরবি দোয়া, বাংলা উচ্চারণ, অর্থ ও কখন পড়বেন।`, 165),
      path, locale, type: 'article', ogImage: `${path}/opengraph-image`,
      keywords: [d.title.bn, `${shortTitle(d.title.bn)} বাংলা অর্থসহ`, `${shortTitle(d.title.bn)} উচ্চারণ`, ...(d.keywords ?? []).filter((k) => /[ঀ-৿]/.test(k)), 'দোয়া', 'দোয়া বাংলা'],
    })
  }
  return buildMeta({
    title: `${d.title.en} | Arabic, Meaning & Source | ${d.title.bn}`,
    description: clip(`${r.meaning.en} — ${d.source}. Arabic text, transliteration and Bangla meaning. ${r.meaning.bn}`, 165),
    path, type: 'article',
    keywords: [d.title.en, d.title.bn, ...(d.keywords ?? []), 'dua', 'দোয়া', 'dua meaning', 'dua in Arabic'],
  })
}

export async function DuaPage({ locale, params }: SlugProps & { locale: Locale }) {
  const { slug } = await params
  const d0 = duaBySlug(slug)
  if (!d0) notFound()
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const d = await resolveDua(d0)
  const cat = duaCategories.find((c) => c.id === d.cat)!
  const path = `/dua/${d.slug}`
  const related = (d.related ?? []).map((s) => duaBySlug(s)).filter((x) => !!x)
  const relTopics = topics.filter((t) => t.duas.includes(d.slug))
  const copyText = bn
    ? `${d.ar}\n\n${d.tl}\n\n${d.meaning.bn}\n\n${d.meaning.en}\n\n— ${d.source}`
    : `${d.ar}\n\n${d.tl}\n\n${d.meaning.en}\n\n${d.meaning.bn}\n\n— ${d.source}`

  const faqs = bn
    ? [
        { q: `${shortTitle(d.title.bn)} এর অর্থ কী?`, a: d.meaning.bn },
        { q: 'এই দোয়াটি কখন পড়তে হয়?', a: d.when.bn + (d.count ? ` পড়ার সংখ্যা: ${d.count}।` : '') },
        { q: 'এই দোয়ার উৎস কী?', a: `${d.source}।` },
        { q: `What is the meaning of ${shortTitle(d.title.en)}?`, a: d.meaning.en },
      ]
    : [
        { q: `What is the meaning of ${shortTitle(d.title.en)}?`, a: d.meaning.en },
        { q: `${shortTitle(d.title.bn)} এর অর্থ কী?`, a: d.meaning.bn },
        { q: 'When should I recite this dua?', a: d.when.en + (d.count ? ` Number of times: ${d.count}.` : '') },
        { q: 'What is the source of this dua?', a: `${d.source}.` },
      ]
  const steps = bn
    ? [
        { name: 'সঠিক সময় বেছে নিন', text: d.when.bn },
        { name: 'দোয়াটি পড়ুন', text: `${d.tl}${d.count ? ` (${d.count})` : ''}` },
        { name: 'অর্থ নিয়ে ভাবুন', text: d.meaning.bn },
      ]
    : [
        { name: 'Choose the right moment', text: d.when.en },
        { name: 'Recite the dua', text: `${d.tl}${d.count ? ` (${d.count})` : ''}` },
        { name: 'Reflect on the meaning', text: d.meaning.en },
      ]

  const meaningEn = (
    <div key="en" data-tr="en">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gold">{bn ? 'ইংরেজি অর্থ' : 'Meaning'}</h2>
      <p lang="en" className={bn ? 'mt-1 text-base leading-relaxed text-muted-foreground' : 'mt-1 text-lg leading-relaxed'}>{d.meaning.en}</p>
    </div>
  )
  const meaningBn = (
    <div key="bn" data-tr="bn">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gold">{bn ? 'বাংলা অর্থ' : 'অর্থ'}</h2>
      <p lang="bn" className="font-bangla mt-1 text-lg leading-relaxed">{d.meaning.bn}</p>
    </div>
  )

  return (
    <div className={pageShell}>
      <JsonLd data={[
        articleLd({ headline: bn ? d.title.bn : d.title.en, description: bn ? d.meaning.bn : d.meaning.en, path: h(path), image: `${path}/opengraph-image`, about: bn ? 'দোয়া' : 'Dua', inLanguage: bn ? 'bn' : undefined, keywords: [...(d.keywords ?? [])] }),
        howToLd({ name: bn ? `যেভাবে পড়বেন: ${d.title.bn}` : `How to recite: ${d.title.en}`, description: bn ? `কখন ও কীভাবে এই দোয়া পড়বেন। ${d.source}।` : `When and how to make this dua. ${d.source}.`, path: h(path), steps, inLanguage: bn ? 'bn' : undefined }),
      ]} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'দোয়া' : 'Duas', href: '/dua' }, { name: bn ? cat.title.bn : cat.title.en, href: `/dua#${cat.id}` }, { name: shortTitle(bn ? d.title.bn : d.title.en), href: path }]} className="mb-4" />

      {bn ? (
        <PageHero eyebrow={`${cat.title.bn} · ${cat.title.en}`} icon={cat.icon} title={d.title.bn} subtitle={undefined}>
          <p lang="en" className="mt-2 text-lg font-medium text-gold sm:text-xl">{d.title.en}</p>
        </PageHero>
      ) : (
        <PageHero eyebrow={`${cat.title.en} · ${cat.title.bn}`} icon={cat.icon} title={d.title.en} subtitle={undefined}>
          <p lang="bn" className="font-bangla mt-2 text-xl font-medium text-gold sm:text-2xl">{d.title.bn}</p>
        </PageHero>
      )}

      <Reveal className="mt-6">
        <article className="card-soft relative overflow-hidden rounded-[2rem] p-6 sm:p-10">
          <div aria-hidden className="bg-pattern pointer-events-none absolute -start-12 -top-12 size-56 rounded-full [mask-image:radial-gradient(circle,#000,transparent_70%)]" />
          <p lang="ar" dir="rtl" className="quran-text relative text-center text-[clamp(1.75rem,5.5vw,3rem)] leading-[2.2]">{d.ar}</p>
          <div className="relative mx-auto mt-6 max-w-2xl space-y-5 text-center">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gold">{bn ? 'উচ্চারণ (ইংরেজি হরফে)' : 'Transliteration'}</h2>
              <p lang="en" className="mt-1 text-[15px] italic leading-relaxed text-muted-foreground">{d.tl}</p>
            </div>
            {bn ? [meaningBn, meaningEn] : [meaningEn, meaningBn]}
          </div>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-2">
            <CopyButton text={copyText} label={{ en: 'Copy dua', bn: 'দোয়া কপি', ar: 'نسخ الدعاء' }} />
            <ShareButton title={bn ? d.title.bn : d.title.en} text={bn ? d.meaning.bn : d.meaning.en} path={h(path)} />
            <DuaBookmark slug={d.slug} variant="pill" />
          </div>
        </article>
      </Reveal>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Reveal><section className="card-soft h-full rounded-3xl p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><UiIcon name="info" size={18} /> {bn ? 'উৎস' : 'Source · উৎস'}</h2>
          <p className="mt-2 text-[15px] font-medium">{d.source}</p>
          {d.verses && (
            <p className="mt-2 flex flex-wrap gap-2 text-xs">
              {d.refs!.map((r) => { const [s, a] = r.split(':'); const first = +a.split('-')[0]; return (
                <Link key={r} href={h(readerHref(+s, first))} className="rounded-full bg-accent px-3 py-1.5 font-semibold text-accent-foreground hover:bg-primary hover:text-primary-foreground">
                  <span className="font-arabic">{chapters[+s - 1].nameArabic}</span> {refLabelL(locale, r)} · {bn ? 'প্রসঙ্গসহ পড়ুন' : 'Read in context'}
                </Link>) })}
            </p>
          )}
        </section></Reveal>
        <Reveal delay={0.05}><section className="card-soft h-full rounded-3xl p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><UiIcon name="clock" size={18} /> {bn ? 'কখন পড়বেন' : 'When to recite · কখন পড়বেন'}</h2>
          {bn ? (
            <>
              <p lang="bn" className="mt-2 text-[15px] leading-relaxed">{d.when.bn}</p>
              <p lang="en" className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{d.when.en}</p>
              {d.count && <p className="mt-2 text-xs font-semibold text-gold">পড়ার সংখ্যা: {d.count}</p>}
            </>
          ) : (
            <>
              <p className="mt-2 text-[15px] leading-relaxed">{d.when.en}</p>
              <p lang="bn" className="font-bangla mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{d.when.bn}</p>
              {d.count && <p className="mt-2 text-xs font-semibold text-gold">Repeat: {d.count}</p>}
            </>
          )}
        </section></Reveal>
      </div>

      {d.virtue && (
        <Reveal className="mt-4"><section className="rounded-3xl border border-gold/30 bg-gold-soft/40 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><UiIcon name="sparkle" size={18} /> {bn ? 'ফজিলত' : 'Virtue · ফজিলত'}</h2>
          {bn ? (
            <>
              <p lang="bn" className="mt-2 text-[15px] leading-relaxed">{d.virtue.bn}</p>
              <p lang="en" className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{d.virtue.en}</p>
            </>
          ) : (
            <>
              <p className="mt-2 text-[15px] leading-relaxed">{d.virtue.en}</p>
              <p lang="bn" className="font-bangla mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{d.virtue.bn}</p>
            </>
          )}
        </section></Reveal>
      )}

      {related.length > 0 && (
        <section aria-labelledby="rel-h" className="mt-12">
          <h2 id="rel-h" className="font-display mb-4 text-2xl font-semibold">{bn ? 'সম্পর্কিত দোয়া' : <>Related duas <span className="font-bangla text-lg font-medium text-muted-foreground">· সম্পর্কিত দোয়া</span></>}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {related.map((r, i) => (
              <li key={r!.slug}><Reveal delay={i * 0.05} className="h-full">
                <Link href={h(`/dua/${r!.slug}`)} className="card-soft lift block h-full rounded-3xl p-4">
                  <span className="block text-[15px] font-semibold leading-snug">{bn ? r!.title.bn : r!.title.en}</span>
                  <span className={`block text-sm text-gold ${bn ? '' : 'font-bangla'}`}>{bn ? r!.title.en : r!.title.bn}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{r!.source}</span>
                </Link>
              </Reveal></li>
            ))}
          </ul>
        </section>
      )}

      {relTopics.length > 0 && (
        <section className="mt-10" aria-labelledby="topics-h">
          <h2 id="topics-h" className="font-display mb-3 text-xl font-semibold">{bn ? 'এ বিষয়ে কুরআন কী বলে…' : 'What the Quran says about…'}</h2>
          <div className="flex flex-wrap gap-2.5">
            {relTopics.map((t) => (
              <Link key={t.slug} href={h(`/topics/${t.slug}`)} className="lift rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-accent">
                {bn ? <>{t.bn} <span className="capitalize text-gold">· {t.en}</span></> : <><span className="capitalize">{t.en}</span> <span className="font-bangla text-gold">· {t.bn}</span></>}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Faq faqs={faqs} locale={bn ? 'bn' : undefined} />
      <p className="mt-8 text-center text-xs text-muted-foreground"><Link href={h('/dua')} className="font-semibold text-primary hover:underline"><span className="inline-block rtl:rotate-180">←</span> {bn ? 'সব দোয়া' : 'All duas · সব দোয়া'}</Link></p>
    </div>
  )
}
