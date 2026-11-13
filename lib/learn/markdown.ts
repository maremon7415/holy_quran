import 'server-only'
/**
 * Markdown alternates for the /learn guides (`/learn/salah.md`, `/bn/learn/tajweed/izhar.md`, …) and the MCP tool `get_learn_guide`.
 * Built from the same data modules as the pages (data/learn/*); Quran text comes from the corpus.
 */
import type { MdDoc } from '@/lib/api/markdown'
import { absoluteUrl, site } from '@/lib/site'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { pick, bnNum } from '@/lib/i18n/t'
import { refLabelL } from '@/lib/i18n/quran'
import { surahHref } from '@/lib/quran/chapters'
import { getUccharon, getVersesByRefs, parseRef } from '@/lib/quran/data'
import { learnGuides, guideBySlug, hubMeta, learnPaths } from '@/data/learn/guides'
import { tajweedBySlug, tajweedGroups, tajweedRules } from '@/data/learn/tajweed'
import { tajweedExampleGroups, tajweedText } from '@/lib/learn/tajweed'
import { kalimas } from '@/data/learn/kalima'
import { wuduBreakers, wuduSteps } from '@/data/learn/wudu'
import { beginnerSurahs, prayerRows, rakahKindLabel, recitationById, salahMistakes, salahSteps } from '@/data/learn/salah'
import { arabicLetters, letterForms, makhrajGroups } from '@/data/learn/alphabet'
import { learnHadithById } from '@/data/learn/hadith-sources'
import { hadithUrl } from '@/lib/hadith/url'
import { duaBySlug } from '@/data/content/duas'
import { chapters } from '@/lib/quran/chapters'

const SCHOLAR = {
  en: 'This guide follows the widely practised Hanafi method used in Bangladesh and notes where other schools differ, without saying that any is wrong. Please consult a qualified local scholar and learn recitation from a teacher.',
  bn: 'এই লেখা বাংলাদেশে প্রচলিত হানাফী পদ্ধতি অনুসরণ করেছে এবং অন্য মাযহাবের পার্থক্য উল্লেখ করেছে, কোনোটিকে ভুল না বলে। অনুগ্রহ করে স্থানীয় যোগ্য আলেমের পরামর্শ নিন এবং উস্তাদের কাছ থেকে তিলাওয়াত শিখুন।',
}

const cite = (title: string, url: string) => `Cite: ${title}. ${site.name}. ${url}`

async function quranBlock(ref: string, locale: Locale): Promise<string> {
  const p = parseRef(ref)
  if (!p) return ''
  const vs = await getVersesByRefs([ref])
  const ucc = await getUccharon(p.surah)
  const bn = locale === 'bn'
  return vs.map((v) => [`> ${v.ar}`, bn ? `> ${ucc[v.n - 1] ?? ''}` : '', `> ${bn ? v.bn : v.en}`, `> — Quran ${v.k} (${refLabelL(locale, v.k)}): ${absoluteUrl(localeHref(locale, surahHref(v.surah, v.n)))}`].filter(Boolean).join('\n')).join('\n>\n')
}

const hadithLine = (id: string, locale: Locale) => { const h = learnHadithById(id); return h ? `[${h.ref}](${absoluteUrl(hadithUrl(h.book, h.number, locale))})` : '' }

function tajweedRuleMd(slug: string, locale: Locale) {
  const r = tajweedBySlug(slug)
  if (!r) return null
  const L = (v: { en: string; bn: string }) => pick(locale, v)
  const path = `/learn/tajweed/${r.slug}`
  const url = absoluteUrl(localeHref(locale, path))
  return (async () => {
    const out: string[] = [`# ${L(r.name)} (${r.ar})`, '', L(r.summary), '', '## Definition', '', L(r.definition), '']
    if (r.letters) out.push(`**Letters:** ${r.letters.ar.join(' ')}. ${L(r.letters.note)}`, '')
    out.push('## How to pronounce', '', ...r.how.map((s, i) => `${i + 1}. ${L(s)}`), '', '## Examples from the Quran', '')
    const groups = tajweedExampleGroups(r.slug)
    const verses = await getVersesByRefs(groups.flatMap((g) => g.examples.map((e) => e.ref)))
    const byKey = new Map(verses.map((v) => [v.k, v]))
    for (const g of groups) {
      if (groups.length > 1 && r.groups?.[g.id]) out.push(`### ${L(r.groups[g.id])}`, '')
      for (const ex of g.examples) {
        const v = byKey.get(ex.ref)
        if (!v) continue
        const [s, a] = ex.ref.split(':').map(Number)
        out.push(`- ${tajweedText(ex.html)} (${refLabelL(locale, ex.ref)}): ${locale === 'bn' ? v.bn : v.en} — ${absoluteUrl(localeHref(locale, surahHref(s, a)))}`)
      }
      out.push('')
    }
    out.push('## Common mistakes', '', ...r.mistakes.map((m) => `- ${L(m)}`), '', '## FAQ', '')
    for (const f of r.faqs) out.push(`**${L(f.q)}** ${L(f.a)}`, '')
    out.push(`## Related`, '', ...r.related.map((s) => { const x = tajweedBySlug(s); return x ? `- [${L(x.name)}](${absoluteUrl(localeHref(locale, `/learn/tajweed/${s}`))})` : '' }), '', cite(L(r.name), url), '', `Canonical: ${url}`)
    return { body: out.join('\n'), canonical: url } satisfies MdDoc
  })()
}

function tajweedIndexMd(locale: Locale): MdDoc {
  const url = absoluteUrl(localeHref(locale, '/learn/tajweed'))
  const g = guideBySlug('tajweed')!
  const out = [`# ${pick(locale, g.name)}`, '', g.meta[locale].description, '']
  for (const [id, grp] of Object.entries(tajweedGroups)) {
    out.push(`## ${pick(locale, grp.title)}`, '')
    for (const r of tajweedRules.filter((x) => x.group === id)) out.push(`- [${pick(locale, r.name)}](${absoluteUrl(localeHref(locale, `/learn/tajweed/${r.slug}`))}) (markdown: ${absoluteUrl(localeHref(locale, `/learn/tajweed/${r.slug}`))}.md): ${pick(locale, r.summary)}`)
    out.push('')
  }
  out.push(cite(pick(locale, g.name), url), '', `Canonical: ${url}`)
  return { body: out.join('\n'), canonical: url }
}

async function kalimaMd(locale: Locale): Promise<MdDoc> {
  const url = absoluteUrl(localeHref(locale, '/learn/kalima'))
  const g = guideBySlug('kalima')!
  const L = (v: { en: string; bn: string }) => pick(locale, v)
  const out = [`# ${locale === 'bn' ? '৬ কালেমা বাংলা উচ্চারণ সহ' : 'The Six Kalimas'}`, '', locale === 'bn' ? 'ছয় কালেমা হিসেবে সাজানো ও নম্বর দেওয়া উপমহাদেশের একটি শিক্ষাগত রীতি; বাক্যগুলো কুরআন ও হাদিস থেকে নেওয়া। যেখানে সূত্র যাচাই করা যায়নি সেখানে “প্রচলিত পাঠ” লেখা হয়েছে।' : 'Grouping and numbering the phrases as six kalimas is a teaching convention in South Asia; the phrases themselves come from the Quran and hadith. Where no source could be verified the wording is labelled "commonly taught".', '']
  for (const k of kalimas) {
    out.push(`## ${k.n}. ${L(k.name)} (${k.name.ar}): ${L(k.nameMeaning)}`, '', k.ar, '', `- Bangla pronunciation: ${k.bn}`, `- Transliteration: ${k.tl}`, `- Meaning: ${L(k.meaning)}`, `- Source: ${L(k.note)}${k.commonlyTaught ? ' (commonly taught form)' : ''}`)
    for (const id of k.hadith ?? []) out.push(`- Hadith: ${hadithLine(id, locale)}`)
    for (const s of k.dua ?? []) { const d = duaBySlug(s); if (d) out.push(`- Dua page: [${d.title.en}](${absoluteUrl(localeHref(locale, `/dua/${s}`))})`) }
    for (const ref of k.quran ?? []) out.push('', await quranBlock(ref, locale))
    out.push('')
  }
  out.push(cite(g.meta[locale].title.split('|')[0].trim(), url), '', `Canonical: ${url}`)
  return { body: out.join('\n'), canonical: url }
}

async function wuduMd(locale: Locale): Promise<MdDoc> {
  const url = absoluteUrl(localeHref(locale, '/learn/wudu'))
  const bn = locale === 'bn'
  const L = (v: { en: string; bn: string }) => pick(locale, v)
  const dua = duaBySlug('dua-after-wudu')!
  const out = [`# ${bn ? 'অজু (ওযু) করার নিয়ম' : 'How to perform wudu (ablution)'}`, '', guideBySlug('wudu')!.meta[locale].description, '', `> ${SCHOLAR[locale]}`, '', '## In the Quran (5:6)', '', await quranBlock('5:6', locale), '', '## Steps', '']
  wuduSteps.forEach((s, i) => out.push(`${i + 1}. **${L(s.title)}** (${s.kind === 'fard' ? (bn ? 'ফরজ' : 'fard') : bn ? 'সুন্নত' : 'sunnah'}${s.times ? `, ${bn ? bnNum(s.times) : s.times}×` : ''}): ${L(s.body)}${s.tip ? ` _${L(s.tip)}_` : ''}`))
  out.push('', '## What breaks wudu', '', ...wuduBreakers.map((b) => `- ${b.agreed ? '' : '(scholars differ) '}${L(b.text)}`), '', '## Dua after wudu', '', dua.ar!, '', `${dua.tl}`, '', `${bn ? dua.meaning!.bn : dua.meaning!.en} (${dua.source}): ${absoluteUrl(localeHref(locale, '/dua/dua-after-wudu'))}`, '', `Hadith: ${hadithLine('bukhari-135', locale)}, ${hadithLine('bukhari-159', locale)}`, '', cite(bn ? 'অজু করার নিয়ম' : 'How to perform wudu', url), '', `Canonical: ${url}`)
  return { body: out.join('\n'), canonical: url }
}

async function salahMd(locale: Locale): Promise<MdDoc> {
  const url = absoluteUrl(localeHref(locale, '/learn/salah'))
  const bn = locale === 'bn'
  const L = (v: { en: string; bn: string }) => pick(locale, v)
  const out = [`# ${bn ? 'নামাজ শিক্ষা: নামাজ পড়ার নিয়ম' : 'How to pray salah, step by step'}`, '', guideBySlug('salah')!.meta[locale].description, '', `> ${SCHOLAR[locale]}`, '', '## Rak‘ahs (Hanafi)', '', '| Prayer | Sunnah before | Fard | Sunnah after | Witr |', '| --- | --- | --- | --- | --- |']
  const cell = (c?: { n: number; kind: keyof typeof rakahKindLabel }) => (c ? `${c.n} ${L(rakahKindLabel[c.kind])}` : '-')
  for (const r of prayerRows) out.push(`| ${L(r.name)} | ${cell(r.before)} | ${cell(r.fard)} | ${cell(r.after)} | ${cell(r.witr)} |`)
  out.push('', '## Steps', '')
  for (const [i, s] of salahSteps.entries()) {
    out.push(`### ${i + 1}. ${L(s.title)}`, '', L(s.body), '')
    for (const id of s.recite ?? []) {
      const r = recitationById(id)!
      out.push(`- **${L(r.title)}**${r.times ? ` (${L(r.times)})` : ''}: ${r.ar}`, `  - Bangla pronunciation: ${r.bn}`, `  - Transliteration: ${r.tl}`, `  - Meaning: ${L(r.meaning)}`, ...(r.hadith ?? []).map((h) => `  - Source: ${hadithLine(h, locale)}`), ...(r.dua ? [`  - Dua page: ${absoluteUrl(localeHref(locale, `/dua/${r.dua}`))}`] : []))
    }
    for (const ref of s.quran ?? []) out.push('', await quranBlock(ref, locale))
    if (s.note) out.push('', `_Where scholars differ: ${L(s.note)}_`)
    out.push('')
  }
  out.push('## Common mistakes', '', ...salahMistakes.map((m) => `- **${L(m.title)}**: ${L(m.body)}`), '', '## Short surahs for beginners', '', ...beginnerSurahs.map((id) => `- [${chapters[id - 1].nameSimple}](${absoluteUrl(localeHref(locale, surahHref(id)))})`), '', cite(bn ? 'নামাজ শিক্ষা' : 'How to pray salah', url), '', `Canonical: ${url}`)
  return { body: out.join('\n'), canonical: url }
}

function alphabetMd(locale: Locale): MdDoc {
  const url = absoluteUrl(localeHref(locale, '/learn/arabic-alphabet'))
  const bn = locale === 'bn'
  const out = [`# ${bn ? 'আরবি বর্ণমালা' : 'The Arabic alphabet'}`, '', guideBySlug('arabic-alphabet')!.meta[locale].description, '', '| # | Letter | Name | Isolated / initial / medial / final | Makhraj |', '| --- | --- | --- | --- | --- |']
  arabicLetters.forEach((l, i) => { const f = letterForms(l); out.push(`| ${i + 1} | ${l.ar} | ${pick(locale, l.name)} (${l.name.ar}) | ${f.isolated} ${f.initial} ${f.medial} ${f.final} | ${pick(locale, makhrajGroups[l.group])}: ${pick(locale, l.makhraj)} |`) })
  out.push('', cite(bn ? 'আরবি বর্ণমালা' : 'The Arabic alphabet', url), '', `Canonical: ${url}`)
  return { body: out.join('\n'), canonical: url }
}

function hubMd(locale: Locale): MdDoc {
  const url = absoluteUrl(localeHref(locale, '/learn'))
  const out = [`# ${hubMeta[locale].title.split('|')[0].trim()}`, '', hubMeta[locale].description, '', ...learnGuides.map((g) => `- [${pick(locale, g.name)}](${absoluteUrl(localeHref(locale, g.path))}) (markdown: ${absoluteUrl(localeHref(locale, g.path))}.md): ${pick(locale, g.blurb)}`), '', cite('Learn', url), '', `Canonical: ${url}`]
  return { body: out.join('\n'), canonical: url }
}

/** Markdown for `/learn`, `/learn/{guide}` and `/learn/tajweed/{rule}` (null when the path is not a learn page). */
export async function learnMd(a: string | undefined, b: string | undefined, locale: Locale): Promise<MdDoc | null> {
  if (!a) return hubMd(locale)
  if (a === 'tajweed') return b ? tajweedRuleMd(b, locale) : tajweedIndexMd(locale)
  if (b) return null
  if (a === 'kalima') return kalimaMd(locale)
  if (a === 'wudu') return wuduMd(locale)
  if (a === 'salah') return salahMd(locale)
  if (a === 'arabic-alphabet') return alphabetMd(locale)
  return null
}

/** Resolve a free-text topic ("six kalimas", "how to pray", "tajweed/izhar", "madd") to a learn path. */
export function resolveLearnTopic(topic: string): string | null {
  const q = topic.trim().toLowerCase().replace(/^https?:\/\/[^/]+/, '').replace(/^\/(bn\/)?/, '').replace(/\.md$/, '').replace(/^learn\/?/, '')
  if (!q) return '/learn'
  const direct = learnPaths().find((p) => p === `/learn/${q}`)
  if (direct) return direct
  const rule = tajweedRules.find((r) => r.slug === q.replace(/^tajweed\//, '') || r.slug.replace(/-/g, ' ') === q || pick('en', r.name).toLowerCase().split(' (')[0] === q || r.name.bn.split(' (')[0] === q)
  if (rule) return `/learn/tajweed/${rule.slug}`
  const g = learnGuides.find((x) => x.slug === q || x.aliases.some((al) => al.toLowerCase() === q))
  if (g) return g.path
  const fuzzy = learnGuides.find((x) => x.aliases.some((al) => q.includes(al.toLowerCase()) || al.toLowerCase().includes(q)))
  if (fuzzy) return fuzzy.path
  const r2 = tajweedRules.find((r) => q.includes(r.slug.replace(/-/g, ' ')) || r.name.en.toLowerCase().split(' (')[0].includes(q))
  return r2 ? `/learn/tajweed/${r2.slug}` : null
}
