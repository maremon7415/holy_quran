import './learn.css'
import Link from 'next/link'
import { PlayAyah } from './play-ayah'
import { getVersesByRefs } from '@/lib/quran/data'
import { chapters, readerHref, surahHref } from '@/lib/quran/chapters'
import { refLabelL } from '@/lib/i18n/quran'
import { RefLabel } from '@/lib/i18n/surah-name'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { lt } from '@/lib/i18n/lt'
import { T } from '@/lib/i18n/text'
import { tajweedBySlug } from '@/data/learn/tajweed'
import { sanitizeTajweed, tajweedClassLabels, tajweedColors, tajweedExampleGroups } from '@/lib/learn/tajweed'

const SIGN = /^[\u06D6-\u06DC]\s*/
/** Group heading; a leading waqf sign (a combining mark) is shown on a dotted circle in an Arabic span so it renders as a glyph. */
function GroupHeading({ raw, locale }: { raw: { en: string; bn: string; ar?: string }; locale: Locale }) {
  const sign = raw.en.match(SIGN)?.[0].trim()
  return (
    <h3 className="font-display mb-3 flex items-center gap-2 text-lg font-semibold">
      {sign && <span lang="ar" dir="rtl" aria-hidden className="font-arabic grid size-9 place-items-center rounded-xl bg-accent text-2xl leading-none text-gold">{'\u25CC' + sign}</span>}
      <span>{lt(locale, { en: raw.en.replace(SIGN, ''), bn: raw.bn.replace(SIGN, '') })}</span>
    </h3>
  )
}

/** Colour chip for a tajweed class (dot + name). */
export function ClassChip({ cls, locale }: { cls: string; locale: Locale }) {
  const l = tajweedClassLabels[cls]
  if (!l) return null
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
      <span aria-hidden className="size-2.5 rounded-full" style={{ background: tajweedColors[cls] }} />
      {lt(locale, l)}
    </span>
  )
}

/** Quran examples for a tajweed rule: coloured ayah text (from Quran.com tajweed markup, checked against the corpus), audio and links. */
export async function TajweedExamples({ slug, locale }: { slug: string; locale: Locale }) {
  const rule = tajweedBySlug(slug)
  const groups = tajweedExampleGroups(slug)
  if (!rule || !groups.length) return null
  const bn = locale === 'bn'
  const verses = await getVersesByRefs(groups.flatMap((g) => g.examples.map((e) => e.ref)))
  const byKey = new Map(verses.map((v) => [v.k, v]))
  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <div key={g.id} data-example-group={g.id}>
          {groups.length > 1 && rule.groups?.[g.id] && <GroupHeading raw={rule.groups[g.id]} locale={locale} />}
          <div className="grid gap-4 md:grid-cols-2">
            {g.examples.map((ex) => {
              const v = byKey.get(ex.ref)
              if (!v) return null
              const [s, a] = ex.ref.split(':').map(Number)
              const c = chapters[s - 1]
              return (
                <article key={ex.ref} data-tajweed-example={ex.ref} className="card-soft flex flex-col rounded-3xl p-4 sm:p-5">
                  <header className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <PlayAyah surah={s} from={a} />
                      <Link href={localeHref(locale, surahHref(s, a))} className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition hover:bg-primary hover:text-primary-foreground">
                        <span className="font-arabic text-sm leading-none">{c.nameArabic}</span>
                        {bn ? refLabelL(locale, ex.ref) : <RefLabel r={ex.ref} />}
                      </Link>
                    </div>
                    <Link href={localeHref(locale, readerHref(s, a))} className="text-xs font-medium text-muted-foreground transition hover:text-primary">
                      {lt(locale, { en: 'Open ayah', bn: 'আয়াত খুলুন', ar: 'افتح الآية' })}
                    </Link>
                  </header>
                  <div className="tajweed-on">
                    <p lang="ar" dir="rtl" className="quran-text text-right text-[length:var(--quran-size,30px)] leading-[2.4]" dangerouslySetInnerHTML={{ __html: sanitizeTajweed(ex.html) }} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">{ex.classes.map((k) => <ClassChip key={k} cls={k} locale={locale} />)}</div>
                  <p lang={bn ? 'bn' : 'en'} data-tr={bn ? 'bn' : 'en'} className={`mt-3 border-t border-border/60 pt-3 text-sm leading-relaxed text-muted-foreground ${bn ? 'font-bangla' : ''}`}>{bn ? v.bn : <T en={v.en} bn={v.bn} />}</p>
                </article>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
