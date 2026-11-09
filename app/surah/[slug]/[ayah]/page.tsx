import '../../../reader.css'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react'
import { chapters, readerHref, resolveChapterId, surahHref, surahNamesBn, toArabicDigits, toBanglaDigits } from '@/lib/quran/chapters'
import { getChapter, getVerses } from '@/lib/quran/data'
import type { Verse } from '@/lib/quran/types'
import { absoluteUrl, site } from '@/lib/site'
import { curatedAyahKeys, getFamousAyah } from '@/lib/reader/famous'
import { getTafsirForAyah, getWordsForAyah } from '@/lib/reader/server-api'
import { breadcrumbLd, publisherLd, quranBookLd } from '@/lib/reader/seo'
import { tokenizeArabic } from '@/lib/reader/words'
import { JsonLd } from '@/components/seo/json-ld'
import { UiIcon } from '@/components/ui-icon'
import { AyahActions } from '@/components/reader/ayah-actions'
import { Breadcrumbs, Chip } from '@/components/reader/surah-header'
import { Disclosure, PlayButton } from '@/components/reader/client-bits'
import { ReaderChrome } from '@/components/reader/reader-chrome'

type Props = { params: Promise<{ slug: string; ayah: string }> }

export const dynamicParams = true
export const revalidate = 604800

export function generateStaticParams() {
  return curatedAyahKeys.map((k) => {
    const [s, a] = k.split(':').map(Number)
    return { slug: chapters[s - 1].slug, ayah: String(a) }
  })
}

function parse(slug: string, ayah: string) {
  const id = resolveChapterId(slug)
  const n = /^\d{1,3}$/.test(ayah) ? Number(ayah) : NaN
  if (!id || !n || n < 1 || n > chapters[id - 1].versesCount) return null
  return { id, n, canonical: chapters[id - 1].slug }
}

function titleFor(id: number, n: number) {
  const c = chapters[id - 1]
  const key = `${id}:${n}`
  const f = getFamousAyah(key)
  const nick = f && !f.en.startsWith('Surah ') ? ` (${f.en})` : ''
  return { c, key, f, title: `Surah ${c.nameSimple} ${key}${nick} — Arabic, Meaning in English & Bangla` }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, ayah } = await params
  const p = parse(slug, ayah)
  if (!p) return { title: 'Ayah not found' }
  const { c, key, title } = titleFor(p.id, p.n)
  const v = (await getVerses(p.id))[p.n - 1]
  const description = `${c.nameSimple} ${key}: “${v.en.length > 150 ? v.en.slice(0, 147).replace(/\s+\S*$/, '') + '…' : v.en}” Read the Arabic text, transliteration, Bangla & English translation, word-by-word meaning and tafsir.`
  const url = surahHref(p.id, p.n)
  return {
    title: { absolute: `${title} | সূরা ${surahNamesBn[p.id - 1]} আয়াত ${toBanglaDigits(p.n)}` },
    description,
    alternates: { canonical: url },
    openGraph: { type: 'article', title, description, url, siteName: site.name, locale: 'en_US', alternateLocale: ['bn_BD', 'ar_SA'] },
    twitter: { card: 'summary_large_image', title, description },
  }
}

function MiniAyah({ v, surah, dir }: { v: Verse; surah: number; dir: 'prev' | 'next' }) {
  return (
    <Link href={surahHref(surah, v.n)} className="card-soft lift group block p-5">
      <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        <span className="flex items-center gap-1.5">{dir === 'prev' ? <ArrowLeft className="size-3.5" /> : null}{dir === 'prev' ? 'Previous ayah' : 'Next ayah'}{dir === 'next' ? <ArrowRight className="size-3.5" /> : null}</span>
        <span className="tabular-nums">{v.k}</span>
      </span>
      <p className="quran-text mt-3 line-clamp-2 text-right text-2xl leading-[2]" lang="ar" dir="rtl">{v.ar}</p>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{v.en}</p>
    </Link>
  )
}

export default async function AyahPage({ params }: Props) {
  const { slug, ayah } = await params
  const p = parse(slug, ayah)
  if (!p) notFound()
  if (decodeURIComponent(slug) !== p.canonical || String(p.n) !== ayah) permanentRedirect(surahHref(p.id, p.n))

  const [chapter, verses, words, tafsirs] = await Promise.all([getChapter(p.id), getVerses(p.id), getWordsForAyah(`${p.id}:${p.n}`), getTafsirForAyah(`${p.id}:${p.n}`)])
  if (!chapter) notFound()
  const v = verses[p.n - 1]
  const prev = verses[p.n - 2]
  const next = verses[p.n]
  const { c, key, f, title } = titleFor(p.id, p.n)
  const bnName = surahNamesBn[p.id - 1]
  const url = absoluteUrl(surahHref(p.id, p.n))
  const tokens = tokenizeArabic(v.ar)
  const makki = c.revelationPlace === 'makkah'

  const faqs = [
    { q: `What is the meaning of Surah ${c.nameSimple} ${key}?`, a: `Surah ${c.nameSimple} ayah ${p.n} (${key}) means: “${v.en}” (Saheeh International). Abdel Haleem translates it as: “${v.enH}”` },
    { q: `What does ${key} say in Bangla? (সূরা ${bnName} আয়াত ${toBanglaDigits(p.n)} এর বাংলা অর্থ কী?)`, a: `সূরা ${bnName} ${toBanglaDigits(p.id)}:${toBanglaDigits(p.n)} এর বাংলা অর্থ: “${v.bn}” (তাইসীরুল কুরআন)` },
    { q: `How do you pronounce Quran ${key} (transliteration)?`, a: `The transliteration of ${c.nameSimple} ${key} is: “${v.tl}”. The Arabic text is: ${v.ar}` },
    ...(f && !f.en.startsWith('Surah ') ? [{ q: `Which ayah is ${f.en}?`, a: `${f.en}${f.ar ? ` (${f.ar})` : ''} is ayah ${p.n} of Surah ${c.nameSimple} (${key}) in the Quran${f.aka?.length ? `, also known as ${f.aka.join(', ')}` : ''}. In Bangla it is known as ${f.bn}.` }] : []),
    { q: `Where is ${key} in the Quran?`, a: `Ayah ${key} is verse ${p.n} of Surah ${c.nameSimple} (${c.meaning}), surah ${p.id} of the Quran — a ${makki ? 'Meccan' : 'Medinan'} surah with ${c.versesCount} ayahs. It is in Juz (Para) ${v.j}, on page ${v.p} of the Madani mushaf.` },
  ]

  const chapterRef = { '@type': 'Chapter', name: `Surah ${c.nameSimple}`, url: absoluteUrl(surahHref(p.id)), position: p.id, isPartOf: quranBookLd() }
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Quotation',
      '@id': `${url}#ayah`,
      name: `Quran ${key}${f && !f.en.startsWith('Surah ') ? ` — ${f.en}` : ''}`,
      headline: title,
      text: v.ar,
      inLanguage: 'ar',
      url,
      isPartOf: chapterRef,
      publisher: publisherLd(),
      workTranslation: [
        { '@type': 'CreativeWork', name: 'Saheeh International', inLanguage: 'en', text: v.en },
        { '@type': 'CreativeWork', name: 'M.A.S. Abdel Haleem', inLanguage: 'en', text: v.enH },
        { '@type': 'CreativeWork', name: 'Taisirul Quran', inLanguage: 'bn', text: v.bn },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
    },
    breadcrumbLd([
      { name: 'Home', path: '/' },
      { name: 'Quran', path: '/quran' },
      { name: `Surah ${c.nameSimple}`, path: surahHref(p.id) },
      { name: `Ayah ${p.n}`, path: surahHref(p.id, p.n) },
    ]),
  ]

  return (
    <div className="mx-auto max-w-[860px] px-3 pb-36 pt-3 sm:px-6 sm:pt-6 lg:pb-20">
      <JsonLd data={ld} />

      <article data-ayah={key} data-j={v.j} data-p={v.p} className="ayah force-tr relative overflow-hidden rounded-[2rem] border bg-card px-5 pb-8 pt-6 sm:rounded-[2.5rem] sm:px-10 sm:pt-8">
        <div className="bg-pattern pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]" />
        <div className="relative">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Quran', href: '/quran' }, { name: `Surah ${c.nameSimple}`, href: surahHref(p.id) }, { name: `Ayah ${p.n}` }]} />
          <div className="text-center">
            {f && !f.en.startsWith('Surah ') && (
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-gold-soft px-3.5 py-1.5 text-xs font-bold text-gold">
                <UiIcon name="sparkle" size={16} /> {f.en} <span className="font-bangla font-semibold">· {f.bn}</span>
              </p>
            )}
            <h1 className="font-display text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2.4rem]">
              Surah {c.nameSimple} Ayah {p.n} <span className="text-muted-foreground">({key})</span>
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              <span className="font-arabic text-base" lang="ar">سُورَةُ {c.nameArabic} · {toArabicDigits(p.n)}</span>
              <span className="mx-2 text-muted-foreground/40">•</span>
              <span className="font-bangla" lang="bn">সূরা {bnName}, আয়াত {toBanglaDigits(p.n)}</span>
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Chip icon={makki ? 'kaaba' : 'mosque'}>{makki ? 'Meccan' : 'Medinan'}</Chip>
              <Chip icon="juz">Juz {v.j}</Chip>
              <Chip icon="read">Page {v.p}</Chip>
              {v.s === 1 && <Chip icon="prayer">Sajdah ۩</Chip>}
            </div>
          </div>

          <div className="ayah-head mt-6 flex items-center justify-between gap-3">
            <PlayButton surah={p.id} from={p.n} label={{ en: 'Listen', bn: 'শুনুন' }} />
            <AyahActions k={key} surah={p.id} ayah={p.n} />
          </div>

          <div className="ayah-ar mt-6">
            <p className="quran-text ar-plain text-center text-[length:calc(var(--quran-size,34px)*1.15)] leading-[2.3]" lang="ar" dir="rtl">
              {tokens.map((t, i) => (t.pos ? <span key={i} className="w" data-w={t.pos}>{t.text}{t.waqf && <>{'\u00a0'}<span className="waqf">{t.waqf}</span></>}{i === tokens.length - 1 ? '\u00a0' : ' '}</span> : <span key={i} className="waqf">{t.text} </span>))}
              <span className={p.n >= 100 ? 'ayah-marker ayah-marker-3' : 'ayah-marker'}>{toArabicDigits(p.n)}</span>
            </p>
            <div className="tj-slot" data-slot-tj={key} />
            <div className="wbw-slot" data-slot-wbw={key} />
          </div>

          <p data-tr="tl" className="mt-5 text-center text-[length:var(--trans-size,17px)] italic leading-relaxed text-muted-foreground">{v.tl}</p>
        </div>
      </article>

      {/* Translations */}
      <section aria-labelledby="translations" className="force-tr mt-8">
        <h2 id="translations" className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold"><UiIcon name="language" size={26} /> Meaning of {key} in English & Bangla</h2>
        <div className="grid gap-3">
          <figure data-tr="en" data-ed="sahih" className="card-soft p-5 sm:p-6">
            <figcaption className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">English · Saheeh International</figcaption>
            <blockquote className="text-[length:var(--trans-size,17px)] leading-[1.8]">{v.en}</blockquote>
          </figure>
          <figure data-tr="en" data-ed="haleem" className="card-soft p-5 sm:p-6">
            <figcaption className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">English · M.A.S. Abdel Haleem</figcaption>
            <blockquote className="text-[length:var(--trans-size,17px)] leading-[1.8]">{v.enH}</blockquote>
          </figure>
          <figure data-tr="bn" lang="bn" className="card-soft p-5 sm:p-6">
            <figcaption className="mb-2 font-bangla text-xs font-bold text-primary">বাংলা অনুবাদ · তাইসীরুল কুরআন</figcaption>
            <blockquote className="font-bangla text-[length:calc(var(--trans-size,17px)*1.05)] leading-[1.9]">{v.bn}</blockquote>
          </figure>
        </div>
      </section>

      {/* Word by word */}
      {words.length > 0 && (
        <section aria-labelledby="wbw" className="mt-10">
          <h2 id="wbw" className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold"><UiIcon name="word" size={26} /> Word by word</h2>
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4" dir="rtl">
            {words.map((w) => (
              <li key={w.position} className="card-soft relative flex flex-col items-center px-3 pb-3 pt-2 text-center">
                <span className="absolute left-2.5 top-2 text-[10px] font-bold tabular-nums text-muted-foreground/70" dir="ltr">{w.position}</span>
                <span className="font-arabic text-[1.7rem] leading-[1.9] text-arabic" lang="ar">{w.ar}</span>
                {w.tl && <span className="text-xs italic text-muted-foreground" dir="ltr">{w.tl}</span>}
                <span className="mt-1.5 text-sm font-semibold leading-snug" dir="ltr">{w.en}</span>
                {w.bn && <span className="mt-0.5 font-bangla text-sm leading-snug text-foreground/75" lang="bn" dir="ltr">{w.bn}</span>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Tafsir */}
      {tafsirs.length > 0 && (
        <section aria-labelledby="tafsir" className="mt-10">
          <h2 id="tafsir" className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold"><UiIcon name="tafsir" size={26} /> Tafsir of {c.nameSimple} {key}</h2>
          <div className="grid gap-3">
            {tafsirs.map((t) => (
              <div key={t.id} className="card-soft p-5 sm:p-6">
                <p className={`mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-primary ${t.lang === 'bn' ? 'font-bangla normal-case tracking-normal text-xs' : ''}`}>
                  {t.name}{t.covers.length > 1 ? ` · ${t.covers[0]}–${t.covers[t.covers.length - 1].split(':')[1]}` : ''}
                </p>
                <Disclosure preview label={t.lang === 'bn' ? { en: 'Read full tafsir', bn: 'সম্পূর্ণ তাফসীর পড়ুন' } : { en: 'Read full tafsir', bn: 'সম্পূর্ণ তাফসীর পড়ুন' }}>
                  <div className={`reader-prose ${t.lang === 'bn' ? 'font-bangla' : ''}`} lang={t.lang} dangerouslySetInnerHTML={{ __html: t.html }} />
                </Disclosure>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Context */}
      <section aria-labelledby="context" className="mt-10">
        <h2 id="context" className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold"><UiIcon name="read" size={26} /> Context</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {prev ? <MiniAyah v={prev} surah={p.id} dir="prev" /> : <div className="hidden sm:block" />}
          {next && <MiniAyah v={next} surah={p.id} dir="next" />}
        </div>
        <Link href={readerHref(p.id, p.n)} className="mt-4 flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_12px_28px_-12px_var(--primary)] transition hover:-translate-y-0.5 active:scale-[0.98]">
          <BookOpen className="size-4" /> Read full Surah {c.nameSimple} <span className="font-bangla opacity-80">· সম্পূর্ণ সূরা পড়ুন</span>
        </Link>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="mt-12">
        <h2 id="faq" className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold"><UiIcon name="info" size={26} /> Frequently asked questions</h2>
        <div className="divide-y rounded-3xl border bg-card">
          {faqs.map((x, i) => (
            <details key={i} className="group px-5 py-4 sm:px-6" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                <span className={/[ঀ-৿]/.test(x.q) ? 'font-bangla' : ''}>{x.q}</span>
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <p className={`mt-3 text-[15px] leading-relaxed text-foreground/85 ${/[ঀ-৿]/.test(x.a) ? 'font-bangla' : ''}`}>{x.a}</p>
            </details>
          ))}
        </div>
      </section>

      <nav aria-label="Ayah navigation" className="mt-10 flex items-center justify-between gap-3 text-sm font-semibold">
        {prev ? <Link href={surahHref(p.id, prev.n)} className="flex items-center gap-1.5 rounded-full border bg-card px-4 py-2.5 transition hover:border-primary/40"><ArrowLeft className="size-4" /> {prev.k}</Link> : <span />}
        <Link href={surahHref(p.id)} className="text-muted-foreground transition hover:text-primary">Surah {c.nameSimple}</Link>
        {next ? <Link href={surahHref(p.id, next.n)} className="flex items-center gap-1.5 rounded-full border bg-card px-4 py-2.5 transition hover:border-primary/40">{next.k} <ArrowRight className="size-4" /></Link> : <span />}
      </nav>

      <ReaderChrome minimal surah={p.id} chapterIds={[p.id]} title={c.nameSimple} titleAr={c.nameArabic} />
    </div>
  )
}
