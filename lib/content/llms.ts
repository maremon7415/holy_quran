import 'server-only'
import { surahHref } from '@/lib/quran/chapters'
import { getChapters } from '@/lib/quran/data'
import { topics } from '@/data/content/topics'
import { duas, duaCategories } from '@/data/content/duas'
import { asmaUlHusna } from '@/data/content/asma-ul-husna'
import { absoluteUrl, site } from '@/lib/site'
import { clip } from './seo'
import { localeHref } from '@/lib/i18n/routes'

const u = absoluteUrl
/** Bangla twin URL (falls back to the English URL until a /bn page exists). */
const ub = (p: string) => absoluteUrl(localeHref('bn', p))

export function llmsTxt() {
  return `# ${site.name}

> ${site.description}

${site.name} (নূর কুরআন) is a free, ad-free, open-source website for reading, listening to, understanding and memorising the Quran in Arabic with English (Saheeh International, Abdel Haleem) and Bangla (Taisirul Quran) translations. Every verse has its own page, and topic, dua and Names-of-Allah pages render their Quran text directly from the same verified corpus.

## How to cite a verse

Every ayah has a stable URL: ${u('/surah/{surah-slug}/{ayah-number}')}
Example, Ayat al-Kursi (2:255): ${u('/surah/al-baqarah/255')}
Surah pages: ${u('/surah/al-fatihah')} · Juz pages: ${u('/juz/30')}

## Key sections

- [Read the Quran](${u('/quran')}): all 114 surahs with Arabic, English and Bangla
- [Quran topics](${u('/topics')}): what the Quran says about ${topics.slice(0, 6).map((t) => t.en).join(', ')} and ${topics.length - 6} more topics
- [Duas](${u('/dua')}): ${duas.length} authentic duas from the Quran and Sunnah with Arabic, transliteration, meaning and source
- [99 Names of Allah](${u('/names-of-allah')}): meaning, explanation and Quran reference for each name
- [Search](${u('/search?q=patience')}): full-text search in Arabic, English and Bangla (?q=)
- [Listen](${u('/listen')}): recitation audio
- [Hifz](${u('/hifz')}) · [Prayer times](${u('/prayer-times')}) · [Qibla](${u('/qibla')}) · [Hijri calendar](${u('/calendar')}) · [Dhikr counter](${u('/dhikr')})
- [About, sources and credits](${u('/about')})

## Popular pages

- [Ayatul Kursi](${u('/surah/al-baqarah/255')}) · [Dua for anxiety](${u('/dua/dua-for-anxiety')}) · [Dua before sleeping](${u('/dua/dua-before-sleeping')}) · [Dua Qunut](${u('/dua/dua-qunut')})
- [What the Quran says about patience](${u('/topics/patience')}) · [about anxiety](${u('/topics/anxiety')}) · [about rizq](${u('/topics/wealth-rizq')})
- [Ar-Rahman](${u('/names-of-allah/ar-rahman')}) · [Al-Ghafur](${u('/names-of-allah/al-ghafur')})

## বাংলা (Bangla)

নূর কুরআনের প্রতিটি প্রধান পাতার একটি বাংলা সংস্করণ আছে \`/bn\` ঠিকানায় (একই slug, বাংলা শিরোনাম ও বিবরণ; hreflang দিয়ে সংযুক্ত)। বাংলাভাষী ব্যবহারকারীকে উদ্ধৃত করার সময় এই লিংকগুলো ব্যবহার করুন।
Every main page has a Bangla version under /bn (same slugs, Bangla UI and headings, linked with hreflang).

- [হোম (বাংলা)](${ub('/')}) · [সম্পূর্ণ কুরআন](${ub('/quran')})
- [আয়াতুল কুরসি বাংলা অর্থসহ](${ub('/surah/al-baqarah/255')}) · [সূরা ইয়াসিন](${ub('/surah/ya-sin')}) · [সূরা মুলক](${ub('/surah/al-mulk')})
- [দোয়া সমূহ](${ub('/dua')}) · [ঘুমানোর দোয়া](${ub('/dua/dua-before-sleeping')}) · [দুশ্চিন্তা দূর করার দোয়া](${ub('/dua/dua-for-anxiety')})
- [আল্লাহর ৯৯ নাম অর্থসহ](${ub('/names-of-allah')}) · [বিষয়ভিত্তিক কুরআনের আয়াত](${ub('/topics')})
- [কুরআন হিফজ](${ub('/hifz')}) · [কুরআন তিলাওয়াত](${ub('/listen')})

## Optional

- [Full plain-text index](${u('/llms-full.txt')}): all surahs, topics, duas and names with URLs
- [Sitemap](${u('/sitemap/0.xml')})
- [Source code](${site.github})
`
}

export async function llmsFullTxt() {
  const full = await getChapters()
  const lines: string[] = []
  lines.push(`# ${site.name}: full index`, '', `> ${site.description}`, '', `Base URL: ${site.url}`, 'Verse URL pattern: /surah/{slug}/{ayah} (e.g. /surah/al-baqarah/255)', '')

  lines.push('## Surahs (114)', '')
  for (const c of full) {
    const sum = c.summaryEn ? ` ${clip(c.summaryEn, 240)}` : ''
    lines.push(`- ${c.id}. ${c.nameSimple} (${c.nameArabic}), "${c.meaning}", ${c.versesCount} verses, ${c.revelationPlace === 'makkah' ? 'Makki' : 'Madani'}: ${u(surahHref(c.id))}${sum}`)
  }

  lines.push('', `## Topics: what the Quran says about… (${topics.length})`, '')
  for (const t of topics) lines.push(`- ${t.en} (${t.bn}), verses ${t.refs.join(', ')}: ${u(`/topics/${t.slug}`)}`)

  lines.push('', `## Duas (${duas.length})`, '')
  for (const cat of duaCategories) {
    const items = duas.filter((d) => d.cat === cat.id)
    if (!items.length) continue
    lines.push(`### ${cat.title.en}`)
    for (const d of items) lines.push(`- ${d.title.en} (${d.title.bn}), source: ${d.source}: ${u(`/dua/${d.slug}`)}`)
    lines.push('')
  }

  lines.push(`## 99 Names of Allah`, '')
  for (const n of asmaUlHusna) lines.push(`- ${n.n}. ${n.tl} (${n.ar}), ${n.en} / ${n.bn}: ${u(`/names-of-allah/${n.slug}`)}`)
  lines.push('')
  return lines.join('\n')
}
