import type { Chapter } from '@/lib/quran/types'
import type { Locale } from '@/lib/i18n/routes'
import { lt } from '@/lib/i18n/lt'
import { bnNum } from '@/lib/i18n/t'

/** "Key facts" definition list for surah pages — answer-first facts for search/AI snippets. Server-rendered. */
export function SurahKeyFacts({ chapter: c, juzFrom, juzTo, locale = 'en' }: { chapter: Chapter; juzFrom: number; juzTo: number; locale?: Locale }) {
  const bn = locale === 'bn'
  const n = (x: number) => (bn ? bnNum(x) : String(x))
  const range = (a: number, b: number) => (a === b ? n(a) : `${n(a)}–${n(b)}`)
  const makki = c.revelationPlace === 'makkah'
  const facts: [React.ReactNode, React.ReactNode][] = [
    [lt(locale, { en: 'Name meaning', bn: 'নামের অর্থ', ar: 'معنى الاسم' }), <>{bn && c.nameBn ? <>{c.nameBn} <span lang="en" className="text-muted-foreground">({c.meaning})</span></> : <span lang="en">{c.meaning}</span>}</>],
    [lt(locale, { en: 'Surah number', bn: 'সূরা নম্বর', ar: 'رقم السورة' }), n(c.id)],
    [lt(locale, { en: 'Revelation', bn: 'অবতীর্ণ', ar: 'النزول' }), makki ? lt(locale, { en: 'Meccan (Makkah)', bn: 'মাক্কী (মক্কা)', ar: 'مكية' }) : lt(locale, { en: 'Medinan (Madinah)', bn: 'মাদানী (মদিনা)', ar: 'مدنية' })],
    [lt(locale, { en: 'Revelation order', bn: 'অবতরণের ক্রম', ar: 'ترتيب النزول' }), n(c.revelationOrder)],
    [lt(locale, { en: 'Ayahs', bn: 'আয়াত সংখ্যা', ar: 'عدد الآيات' }), n(c.versesCount)],
    [lt(locale, { en: 'Juz (para)', bn: 'পারা', ar: 'الجزء' }), range(juzFrom, juzTo)],
    [lt(locale, { en: 'Mushaf pages', bn: 'মুসহাফের পৃষ্ঠা', ar: 'صفحات المصحف' }), range(c.pages[0], c.pages[1] ?? c.pages[0])],
  ]
  return (
    <section aria-labelledby="key-facts-h" className="hide-in-mushaf mt-4 rounded-3xl border border-border bg-card px-5 py-4 sm:px-6">
      <h2 id="key-facts-h" className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{lt(locale, { en: 'Key facts', bn: 'মূল তথ্য', ar: 'حقائق أساسية' })}</h2>
      <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
        {facts.map(([k, v], i) => (
          <div key={i} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
