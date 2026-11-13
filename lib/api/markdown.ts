import 'server-only'
/**
 * Plain markdown alternates for LLMs (`/surah/al-baqarah/255.md`, `/topics/patience.md`, …).
 * Each document: title, Arabic, translations, pronunciation, short tafsir excerpt (ayah),
 * a citation and the canonical link. Bangla (`/bn/….md`) puts Bangla first.
 */
import { chapters, juzHref, surahHref, surahNamesBn, toBanglaDigits } from '@/lib/quran/chapters'
import { getUccharon, getVerses, getJuzVerses } from '@/lib/quran/data'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { absoluteUrl, site } from '@/lib/site'
import { refLabelL } from '@/lib/i18n/quran'
import { bnNum } from '@/lib/i18n/t'
import { ayahCitation } from '@/lib/content/cite'
import { hadithMd } from '@/lib/hadith/markdown'
import { eventsMd } from '@/lib/events/markdown'
import { learnMd } from '@/lib/learn/markdown'
import { ayahTafsirSummary, getDua, getName, getSurah, getTopic, getJuz } from './corpus'

export interface MdDoc { body: string; canonical: string }

const footer = (canonical: string, cite: string, locale: Locale) =>
  [
    '',
    '---',
    '',
    locale === 'bn' ? `**উদ্ধৃতি / Cite:** ${cite}` : `**Cite:** ${cite}`,
    '',
    `Canonical: ${canonical}`,
    '',
    `Source: ${site.name} (${site.url}). Quran text and translations via the Quran.com (Quran Foundation) API. Machine-readable API: ${absoluteUrl('/openapi.json')} · MCP: ${absoluteUrl('/api/mcp')}`,
    '',
  ].join('\n')

const quote = (s: string) => s.split('\n').map((l) => `> ${l}`).join('\n')

/** Parse a markdown path (without `.md`, without `/md` prefix): `/bn/surah/al-baqarah/255` → doc. */
export async function markdownFor(pathname: string): Promise<MdDoc | null> {
  const parts = pathname.split('/').filter(Boolean)
  const locale: Locale = parts[0] === 'bn' ? 'bn' : 'en'
  if (locale === 'bn') parts.shift()
  const [kind, a, b, ...rest] = parts
  if (rest.length) return null
  if (kind === 'events') return eventsMd(a, b, locale)
  if (kind === 'learn') return learnMd(a, b, locale)
  if (kind === 'hadith' && a && b) return hadithMd(a, b, locale)
  if (kind === 'surah' && a && b) return ayahMd(a, b, locale)
  if (kind === 'surah' && a && !b) return surahMd(a, locale)
  if (b) return null
  if (kind === 'juz' && a) return juzMd(a, locale)
  if (kind === 'topics' && a) return topicMd(a, locale)
  if (kind === 'dua' && a) return duaMd(a, locale)
  if (kind === 'names-of-allah' && a) return nameMd(a, locale)
  return null
}

const surahId = (slug: string) => {
  const i = chapters.findIndex((c) => c.slug === slug)
  return i === -1 ? null : i + 1
}

export async function ayahMd(slug: string, ayah: string, locale: Locale): Promise<MdDoc | null> {
  const id = surahId(slug)
  if (!id || !/^\d{1,3}$/.test(ayah)) return null
  const n = +ayah
  const c = chapters[id - 1]
  if (n < 1 || n > c.versesCount) return null
  const [verses, bt] = await Promise.all([getVerses(id), getUccharon(id)])
  const v = verses[n - 1]
  const key = `${id}:${n}`
  const canonical = absoluteUrl(localeHref(locale, surahHref(id, n)))
  const taf = await ayahTafsirSummary(key, locale)
  const bn = locale === 'bn'
  const title = bn ? `সূরা ${surahNamesBn[id - 1]} ${toBanglaDigits(n)} আয়াত (${bnNum(key)})` : `Quran ${key} — Surah ${c.nameSimple}, Ayah ${n}`
  const tr = [
    ['English — Saheeh International', v.en],
    ['English — M.A.S. Abdel Haleem', v.enH],
    ['বাংলা — তাইসীরুল কুরআন (Bangla — Taisirul Quran)', v.bn],
  ]
  if (bn) tr.unshift(tr.pop()!)
  const lines = [
    `# ${title}`,
    '',
    bn ? `সূরা ${surahNamesBn[id - 1]} (${c.nameArabic}) · ${c.revelationPlace === 'makkah' ? 'মাক্কী' : 'মাদানী'} · পারা ${bnNum(v.j)} · পৃষ্ঠা ${bnNum(v.p)}` : `Surah ${c.nameSimple} (${c.nameArabic}, “${c.meaning}”) · ${c.revelationPlace === 'makkah' ? 'Meccan' : 'Medinan'} · Juz ${v.j} · Page ${v.p}${v.s ? ' · Sajdah ayah' : ''}`,
    '',
    bn ? '## আরবি' : '## Arabic',
    '',
    quote(v.ar),
    '',
    bn ? '## অনুবাদ' : '## Translations',
    '',
    ...tr.flatMap(([h, t]) => [`**${h}:**`, '', quote(t), '']),
    bn ? '## উচ্চারণ' : '## Pronunciation',
    '',
    ...(bt[n - 1] ? [`- ${bn ? 'বাংলা উচ্চারণ (স্বয়ংক্রিয়ভাবে তৈরি নির্দেশিকা)' : 'Bangla uccharon (auto-generated guide)'}: ${bt[n - 1]}`] : []),
    `- ${bn ? 'ইংরেজি প্রতিবর্ণীকরণ' : 'Transliteration'}: ${v.tl}`,
    '',
    ...(taf ? [bn ? '## তাফসীর (সংক্ষেপ)' : '## Tafsir excerpt', '', quote(taf.summary), '', `— ${taf.source}`, ''] : []),
    bn ? '## আরও' : '## More',
    '',
    `- ${bn ? 'পূর্ণ সূরা' : 'Full surah'}: ${absoluteUrl(localeHref(locale, surahHref(id)))}`,
    ...(n > 1 ? [`- ${bn ? 'আগের আয়াত' : 'Previous ayah'}: ${absoluteUrl(localeHref(locale, surahHref(id, n - 1)))}`] : []),
    ...(n < c.versesCount ? [`- ${bn ? 'পরের আয়াত' : 'Next ayah'}: ${absoluteUrl(localeHref(locale, surahHref(id, n + 1)))}`] : []),
    '',
  ]
  return { body: lines.join('\n') + footer(canonical, ayahCitation(key, c.nameSimple, canonical), locale), canonical }
}

export async function surahMd(slug: string, locale: Locale): Promise<MdDoc | null> {
  const id = surahId(slug)
  if (!id) return null
  const [s, verses, bt] = await Promise.all([getSurah(id), getVerses(id), getUccharon(id)])
  if (!s) return null
  const bn = locale === 'bn'
  const canonical = absoluteUrl(localeHref(locale, surahHref(id)))
  const lines = [
    `# ${bn ? `সূরা ${s.nameBangla} (${s.nameArabic})` : `Surah ${s.name} (${s.nameArabic}) — ${s.meaning}`}`,
    '',
    bn ? '## মূল তথ্য' : '## Key facts',
    '',
    `- ${bn ? 'সূরা নম্বর' : 'Surah number'}: ${id}`,
    `- ${bn ? 'নামের অর্থ' : 'Name meaning'}: ${s.meaning}${s.meaningBangla ? ` (${s.meaningBangla})` : ''}`,
    `- ${bn ? 'অবতীর্ণ' : 'Revelation'}: ${s.revelationPlace === 'makkah' ? (bn ? 'মাক্কী (মক্কা)' : 'Meccan (Makkah)') : bn ? 'মাদানী (মদিনা)' : 'Medinan (Madinah)'}, ${bn ? 'অবতরণের ক্রম' : 'revelation order'} ${s.revelationOrder}`,
    `- ${bn ? 'আয়াত' : 'Ayahs'}: ${s.versesCount}`,
    `- Juz: ${s.juz.from === s.juz.to ? s.juz.from : `${s.juz.from}–${s.juz.to}`} · ${bn ? 'পৃষ্ঠা' : 'Pages'}: ${s.pages.from === s.pages.to ? s.pages.from : `${s.pages.from}–${s.pages.to}`} (Madani mushaf)`,
    '',
    ...(bn ? (s.summaryBangla ? ['## সারসংক্ষেপ', '', s.summaryBangla, ''] : []) : s.summary ? ['## Summary', '', s.summary, ''] : []),
    bn ? '## আয়াতসমূহ' : '## Ayahs',
    '',
    ...verses.flatMap((v, i) => [
      `### ${bn ? bnNum(v.k) : v.k}`,
      '',
      quote(v.ar),
      '',
      ...(bn ? [`- বাংলা: ${v.bn}`, ...(bt[i] ? [`- উচ্চারণ: ${bt[i]}`] : []), `- English: ${v.en}`] : [`- Saheeh International: ${v.en}`, `- Bangla: ${v.bn}`, `- Transliteration: ${v.tl}`]),
      `- ${absoluteUrl(localeHref(locale, surahHref(id, v.n)))}`,
      '',
    ]),
  ]
  return { body: lines.join('\n') + footer(canonical, s.citation.replace(s.url, canonical), locale), canonical }
}

export async function juzMd(nStr: string, locale: Locale): Promise<MdDoc | null> {
  if (!/^\d{1,2}$/.test(nStr)) return null
  const n = +nStr
  const j = n >= 1 && n <= 30 ? await getJuz(n) : null
  if (!j) return null
  const bn = locale === 'bn'
  const verses = await getJuzVerses(n)
  const canonical = absoluteUrl(localeHref(locale, juzHref(n)))
  const lines = [
    `# ${bn ? `পারা ${bnNum(n)}` : `Juz ${n} of the Quran`}`,
    '',
    `${bn ? 'অন্তর্ভুক্ত' : 'Contains'}: ${j.ranges.map((r) => `${bn ? surahNamesBn[r.surah - 1] : r.name} ${r.surah}:${r.ayahs}`).join('; ')} · ${j.count} ${bn ? 'আয়াত' : 'ayahs'}`,
    '',
    ...verses.flatMap((v) => [`### ${v.k}`, '', quote(v.ar), '', ...(bn ? [`- বাংলা: ${v.bn}`, `- English: ${v.en}`] : [`- Saheeh International: ${v.en}`, `- Bangla: ${v.bn}`]), `- ${absoluteUrl(localeHref(locale, surahHref(v.surah, v.n)))}`, '']),
  ]
  return { body: lines.join('\n') + footer(canonical, `${bn ? `পারা ${bnNum(n)}` : `Juz ${n}`} — ${site.name}, ${canonical}`, locale), canonical }
}

export async function topicMd(slug: string, locale: Locale): Promise<MdDoc | null> {
  const t = await getTopic(slug, locale)
  if (!t || t.slug !== slug) return null
  const bn = locale === 'bn'
  const canonical = absoluteUrl(localeHref(locale, `/topics/${slug}`))
  const lines = [
    `# ${bn ? t.title.bn : t.title.en}`,
    '',
    bn ? '## সংক্ষিপ্ত উত্তর' : '## Quick answer',
    '',
    t.quickAnswer,
    '',
    bn ? '## ভূমিকা' : '## Introduction',
    '',
    bn ? t.intro.bn : t.intro.en,
    '',
    bn ? '## আয়াতসমূহ' : '## Verses',
    '',
    ...t.verses.flatMap((v) => [`### ${refLabelL(locale, v.key)}`, '', quote(v.arabic), '', ...(bn ? [`- বাংলা: ${v.bangla}`, `- English: ${v.saheeh}`] : [`- Saheeh International: ${v.saheeh}`, `- Bangla: ${v.bangla}`]), `- ${absoluteUrl(localeHref(locale, new URL(v.url).pathname))}`, '']),
    bn ? '## ভাবুন' : '## Reflect',
    '',
    bn ? t.reflect.bn : t.reflect.en,
    '',
    ...(t.relatedDuas.length ? [bn ? '## সংশ্লিষ্ট দোয়া' : '## Related duas', '', ...t.relatedDuas.map((d) => `- [${bn ? d.title.bn : d.title.en}](${absoluteUrl(localeHref(locale, `/dua/${d.slug}`))}) — ${d.source}`), ''] : []),
  ]
  return { body: lines.join('\n') + footer(canonical, t.citation.replace(t.url, canonical), locale), canonical }
}

export async function duaMd(slug: string, locale: Locale): Promise<MdDoc | null> {
  const d = await getDua(slug)
  if (!d) return null
  const bn = locale === 'bn'
  const canonical = absoluteUrl(localeHref(locale, `/dua/${slug}`))
  const lines = [
    `# ${bn ? d.title.bn : d.title.en}`,
    '',
    `${bn ? 'উৎস' : 'Source'}: ${d.source}`,
    '',
    bn ? '## আরবি' : '## Arabic',
    '',
    quote(d.arabic),
    '',
    `${bn ? 'উচ্চারণ (ইংরেজি হরফে)' : 'Transliteration'}: ${d.transliteration}`,
    '',
    bn ? '## অর্থ' : '## Meaning',
    '',
    ...(bn ? [`- বাংলা: ${d.meaning.bn}`, `- English: ${d.meaning.en}`] : [`- English: ${d.meaning.en}`, `- Bangla: ${d.meaning.bn}`]),
    '',
    bn ? '## কখন পড়বেন' : '## When to recite',
    '',
    bn ? d.when.bn : d.when.en,
    ...(d.count ? ['', `${bn ? 'সংখ্যা' : 'Count'}: ${d.count}`] : []),
    '',
    ...(d.virtue ? [bn ? '## ফজিলত' : '## Virtue', '', bn ? d.virtue.bn : d.virtue.en, ''] : []),
  ]
  return { body: lines.join('\n') + footer(canonical, d.citation.replace(d.url, canonical), locale), canonical }
}

export async function nameMd(slug: string, locale: Locale): Promise<MdDoc | null> {
  const n = await getName(slug)
  if (!n || n.slug !== slug) return null
  const bn = locale === 'bn'
  const canonical = absoluteUrl(localeHref(locale, `/names-of-allah/${slug}`))
  const lines = [
    `# ${bn ? `${n.transliterationBangla} (${n.arabic}) — আল্লাহর ${bnNum(n.number)} নম্বর নাম` : `${n.transliteration} (${n.arabic}) — Name ${n.number} of the 99 Names of Allah`}`,
    '',
    `- ${bn ? 'অর্থ' : 'Meaning'}: ${bn ? `${n.meaning.bn} (${n.meaning.en})` : `${n.meaning.en} (${n.meaning.bn})`}`,
    `- ${bn ? 'ব্যাখ্যা' : 'Explanation'}: ${bn ? n.explanation.bn : n.explanation.en}`,
    '',
    bn ? `## কুরআনে (${refLabelL('bn', n.quranRef.key)})` : `## In the Quran (${refLabelL('en', n.quranRef.key)})`,
    '',
    ...(n.quranRef.attributeOnly ? [bn ? 'এই আয়াতে নামটির গুণ প্রকাশ পেয়েছে।' : 'This verse shows the attribute behind the name.', ''] : []),
    quote(n.quranRef.arabic ?? ''),
    '',
    ...(bn ? [`- বাংলা: ${n.quranRef.bangla}`, `- English: ${n.quranRef.saheeh}`] : [`- Saheeh International: ${n.quranRef.saheeh}`, `- Bangla: ${n.quranRef.bangla}`]),
    `- ${absoluteUrl(localeHref(locale, new URL(n.quranRef.url).pathname))}`,
    '',
  ]
  return { body: lines.join('\n') + footer(canonical, n.citation.replace(n.url, canonical), locale), canonical }
}
