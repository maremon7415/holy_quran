import Link from 'next/link'
import { Scale } from 'lucide-react'
import type { ReactNode } from 'react'
import { UiIcon } from '@/components/ui-icon'
import { PlayAyah } from './play-ayah'
import { getUccharon, getVersesByRefs, parseRef } from '@/lib/quran/data'
import { chapters, readerHref, surahHref, toArabicDigits } from '@/lib/quran/chapters'
import { refLabelL } from '@/lib/i18n/quran'
import { RefLabel } from '@/lib/i18n/surah-name'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { lt } from '@/lib/i18n/lt'
import { T, NotAr } from '@/lib/i18n/text'
import { hadithUrl } from '@/lib/hadith/url'
import { learnHadithById } from '@/data/learn/hadith-sources'
import { duaBySlug } from '@/data/content/duas'
import type { L } from '@/data/learn/types'
import type { Recitation } from '@/data/learn/salah'

export const sectionH2 = 'font-display text-2xl font-semibold tracking-tight sm:text-3xl'

/** Section wrapper with a heading (id doubles as the anchor). */
export function Section({ id, title, intro, children, className = '' }: { id: string; title: ReactNode; intro?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={`mt-12 scroll-mt-24 ${className}`}>
      <h2 id={`${id}-h`} className={sectionH2}>{title}</h2>
      {intro && <p className="mt-2 max-w-3xl text-pretty text-[15px] leading-relaxed text-muted-foreground">{intro}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

/** "Where scholars differ": neutral note about differences between the madhhabs. */
export function FiqhNote({ locale, children, title }: { locale: Locale; children: ReactNode; title?: L }) {
  return (
    <aside data-fiqh-note className="mt-4 rounded-2xl border border-gold/30 bg-gold-soft/40 p-4 text-sm leading-relaxed">
      <p className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
        <Scale className="size-3.5" aria-hidden /> {lt(locale, title ?? { en: 'Where scholars differ', bn: 'যেখানে আলেমদের মতভেদ আছে', ar: 'مواضع الاختلاف بين العلماء' })}
      </p>
      <div className="text-foreground/85">{children}</div>
    </aside>
  )
}

/** Standard note: Hanafi presentation + consult a local scholar. */
export function ScholarNote({ locale }: { locale: Locale }) {
  return (
    <aside data-scholar-note className="mt-8 flex gap-3 rounded-3xl border border-border bg-card p-4 sm:p-5">
      <UiIcon name="info" size={22} className="mt-0.5 shrink-0" />
      <p className="text-sm leading-relaxed text-muted-foreground">
        {lt(locale, {
          en: 'This guide follows the widely practised Hanafi method used in Bangladesh and notes where other schools differ, without saying that any is wrong. Rulings can depend on your circumstances: please consult a qualified local scholar and learn recitation from a teacher.',
          bn: 'এই লেখা বাংলাদেশে প্রচলিত হানাফী পদ্ধতি অনুসরণ করেছে এবং অন্য মাযহাবের পার্থক্য উল্লেখ করেছে, কোনোটিকে ভুল না বলে। বিধান পরিস্থিতিভেদে বদলাতে পারে: অনুগ্রহ করে স্থানীয় যোগ্য আলেমের পরামর্শ নিন এবং উস্তাদের কাছ থেকে তিলাওয়াত শিখুন।',
          ar: 'يعرض هذا الدليل الطريقة الحنفية الشائعة في بنغلاديش ويشير إلى مواضع اختلاف المذاهب الأخرى دون تخطئة أحد. وقد تختلف الأحكام بحسب الحال، فيُرجى الرجوع إلى عالم مؤهَّل وتعلّم القراءة على يد معلّم.',
        })}
      </p>
    </aside>
  )
}

/** Link to a verified hadith page in the hadith library, labelled with its reference. */
export function HadithRef({ id, locale }: { id: string; locale: Locale }) {
  const h = learnHadithById(id)
  if (!h) return null
  return <Link href={hadithUrl(h.book, h.number, locale)} className="text-primary hover:underline">{h.ref}</Link>
}

export function SourceLine({ hadith, dua, locale }: { hadith?: string[]; dua?: string; locale: Locale }) {
  if (!hadith?.length && !dua) return null
  const d = dua ? duaBySlug(dua) : null
  return (
    <p className="mt-2 text-xs text-muted-foreground">
      {lt(locale, { en: 'Source', bn: 'উৎস', ar: 'المصدر' })}:{' '}
      {hadith?.map((id, i) => <span key={id}>{i > 0 && ', '}<HadithRef id={id} locale={locale} /></span>)}
      {d && <>{hadith?.length ? ' · ' : ''}<Link href={localeHref(locale, `/dua/${d.slug}`)} className="text-primary hover:underline">{lt(locale, { en: 'dua page', bn: 'দোয়ার পাতা', ar: 'صفحة الدعاء' })}</Link></>}
    </p>
  )
}

/** One recitation: Arabic, Bangla pronunciation, transliteration and meaning. */
export function RecitationCard({ r, locale }: { r: Recitation; locale: Locale }) {
  const bn = locale === 'bn'
  return (
    <article data-recitation={r.id} className="card-soft rounded-3xl p-4 sm:p-6">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="font-display text-lg font-semibold">{lt(locale, r.title)}</h4>
        {r.times && <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">{lt(locale, r.times)}</span>}
      </header>
      <p lang="ar" dir="rtl" className="font-arabic text-[length:var(--quran-size,28px)] leading-[2.1] text-arabic">{r.ar}</p>
      <dl className="mt-3 space-y-2 text-[15px] leading-relaxed">
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{lt(locale, { en: 'Bangla pronunciation', bn: 'বাংলা উচ্চারণ', ar: 'النطق بالبنغالية' })}</dt>
          <dd lang="bn" className="font-bangla">{r.bn}</dd>
        </div>
        <NotAr>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{lt(locale, { en: 'Transliteration', bn: 'ইংরেজি ট্রান্সলিটারেশন', ar: 'النطق اللاتيني' })}</dt>
            <dd lang="en" className="italic text-muted-foreground">{r.tl}</dd>
          </div>
        </NotAr>
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{lt(locale, { en: 'Meaning', bn: 'অর্থ', ar: 'المعنى' })}</dt>
          <dd lang={bn ? 'bn' : undefined} className={bn ? 'font-bangla' : ''}>{lt(locale, r.meaning)}</dd>
        </div>
      </dl>
      {r.commonlyRecited && <p className="mt-2 text-xs text-muted-foreground">{lt(locale, { en: 'Commonly recited wording; no single source is cited for it on this page.', bn: 'প্রচলিত পাঠ; এই পাতায় এর জন্য একক কোনো সূত্র উল্লেখ করা হয়নি।', ar: 'صيغة شائعة ولا يُنسب لها مصدر واحد في هذه الصفحة.' })}</p>}
      <SourceLine hadith={r.hadith} dua={r.dua} locale={locale} />
    </article>
  )
}

/** Quran passage rendered from the corpus (Arabic, Bangla uccharon, meaning) with play + links. */
export async function QuranPassage({ refs, locale }: { refs: string[]; locale: Locale }) {
  const bn = locale === 'bn'
  const blocks = await Promise.all(refs.map(async (ref) => {
    const p = parseRef(ref)
    if (!p) return null
    const verses = await getVersesByRefs([ref])
    const ucc = await getUccharon(p.surah)
    return { ref, p, verses, ucc }
  }))
  return (
    <div className="space-y-4">
      {blocks.filter(Boolean).map((b) => {
        const { ref, p, verses, ucc } = b!
        const c = chapters[p.surah - 1]
        return (
          <article key={ref} data-quran-passage={ref} className="card-soft rounded-3xl p-4 sm:p-6">
            <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <PlayAyah surah={p.surah} from={p.from} to={p.to} />
                <Link href={localeHref(locale, surahHref(p.surah, p.from === p.to ? p.from : undefined))} className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition hover:bg-primary hover:text-primary-foreground">
                  <span className="font-arabic text-sm leading-none">{c.nameArabic}</span>
                  {bn ? refLabelL(locale, ref) : <RefLabel r={ref} />}
                </Link>
              </div>
              <Link href={localeHref(locale, readerHref(p.surah, p.from))} className="text-xs font-medium text-muted-foreground transition hover:text-primary">
                {bn ? 'প্রসঙ্গসহ পড়ুন' : <T en="Read in context" ar="اقرأ في سياقها" />}
              </Link>
            </header>
            {verses.map((v) => (
              <div key={v.k} className="border-t border-border/60 py-3 first:border-t-0 first:pt-0 last:pb-0">
                <p lang="ar" dir="rtl" className="quran-text text-right text-[length:var(--quran-size,30px)] leading-[2.2]">{v.ar} <span className="ayah-marker">{toArabicDigits(v.n)}</span></p>
                {ucc[v.n - 1] && <p lang="bn" data-tr="bt" className="font-bangla mt-1 text-[15px] leading-relaxed text-foreground/85">{ucc[v.n - 1]}</p>}
                <p lang={bn ? 'bn' : 'en'} data-tr={bn ? 'bn' : 'en'} className={`mt-1 text-sm leading-relaxed text-muted-foreground ${bn ? 'font-bangla' : ''}`}>{bn ? v.bn : <T en={v.en} bn={v.bn} />}</p>
              </div>
            ))}
          </article>
        )
      })}
    </div>
  )
}
