import 'server-only'
import { surahHref } from '@/lib/quran/chapters'
import { getChapters } from '@/lib/quran/data'
import { topics } from '@/data/content/topics'
import { duas, duaCategories } from '@/data/content/duas'
import { asmaUlHusna } from '@/data/content/asma-ul-husna'
import { absoluteUrl, site } from '@/lib/site'
import { clip } from './seo'
import { localeHref } from '@/lib/i18n/routes'
import { getCollections } from '@/lib/hadith/hadith'
import { featured } from '@/lib/hadith/featured'
import { collectionMeta } from '@/lib/hadith/collections'
import { learnGuides } from '@/data/learn/guides'
import { tajweedRules } from '@/data/learn/tajweed'

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

## How to cite a hadith

Every hadith has a stable URL: ${u('/hadith/{collection}/{number}')} with collections bukhari, muslim, abudawud, tirmidhi, nasai, ibnmajah, malik, nawawi40, qudsi40.
Numbers are the commonly cited ones (as on sunnah.com); for Sahih Muslim they are the Muhammad Fu'ad 'Abd al-Baqi numbers (e.g. Sahih Muslim 2564). Narrations sharing a number appear together (2564a, 2564b…).
Examples: Sahih al-Bukhari 1 (actions by intentions): ${u('/hadith/bukhari/1')} · Sahih Muslim 2564: ${u('/hadith/muslim/2564')}
Each hadith page has Arabic, English and Bangla text, narrator, grades (Sahih/Hasan/Da'if by named scholars; Bukhari and Muslim are authentic by consensus), the in-book reference and a ready-made citation. Bangla pages: ${ub('/hadith/bukhari/1')}
Short links redirect to the canonical page: ${u('/2:255')} · ${u('/2/255')} · ${u('/2.255')}
Every ayah, surah, juz, topic, dua and Name page has a "Cite this" block (plain, APA, MLA, Markdown) with its canonical URL.

## For AI agents

- [MCP server](${u('/mcp')}): Model Context Protocol endpoint ${u('/api/mcp')} (Streamable HTTP, no auth) with tools ask_quran, search_quran, get_ayah, get_surah, get_tafsir, find_dua, get_topic_verses, get_name_of_allah, get_islamic_event, get_learn_guide, search, fetch. Every result includes the canonical URL and a citation.
- [JSON API](${u('/developers')}): ${u('/api/v1/ayah/2:255')}, ${u('/api/v1/surah/al-mulk')}, ${u('/api/v1/search?q=mercy')}, ${u('/api/v1/duas')}, ${u('/api/v1/topics/patience')}, ${u('/api/v1/names')} (CORS, keyless)
- [OpenAPI 3.1 description](${u('/openapi.json')})

## Markdown versions

Append \`.md\` to any ayah, surah, juz, topic, dua or Names page for clean markdown (title, Arabic, translations, pronunciation, tafsir excerpt, citation, canonical link). Bangla: prefix \`/bn\`. Pages advertise it with \`<link rel="alternate" type="text/markdown">\`.

- [Ayat al-Kursi 2:255 (markdown)](${u('/surah/al-baqarah/255.md')})
- [Surah Al-Mulk (markdown)](${u('/surah/al-mulk.md')})
- [Juz 30 (markdown)](${u('/juz/30.md')})
- [What the Quran says about patience (markdown)](${u('/topics/patience.md')})
- [Dua for anxiety (markdown)](${u('/dua/dua-for-anxiety.md')})
- [Ar-Rahman (markdown)](${u('/names-of-allah/ar-rahman.md')})
- [আয়াতুল কুরসি বাংলা (markdown)](${ub('/surah/al-baqarah/255')}.md)

## Key sections

- [Read the Quran](${u('/quran')}): all 114 surahs with Arabic, English and Bangla
- [Quran topics](${u('/topics')}): what the Quran says about ${topics.slice(0, 6).map((t) => t.en).join(', ')} and ${topics.length - 6} more topics
- [Duas](${u('/dua')}): ${duas.length} authentic duas from the Quran and Sunnah with Arabic, transliteration, meaning and source
- [Hadith library](${u('/hadith')}): Sahih al-Bukhari, Sahih Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah, Muwatta Malik, Nawawi's Forty and Hadith Qudsi in Arabic, English and Bangla, with search (${u('/hadith/search?q=patience')})
- [99 Names of Allah](${u('/names-of-allah')}): meaning, explanation and Quran reference for each name
- [Search](${u('/search?q=patience')}): full-text search in Arabic, English and Bangla (?q=)
- [Ask the Quran](${u('/ask')}): meaning-based (semantic) search — ask a question in English, Bangla or Arabic and get the most relevant ayahs even without shared keywords; JSON: ${u('/api/v1/ask?q=patience%20in%20hardship')}; MCP tool \`ask_quran\`
- [Listen](${u('/listen')}): recitation audio
- [Prayer times by city](${u('/prayer-times')}): today's Fajr, Dhuhr, Asr, Maghrib, Isha, sehri and iftar, 30-day and monthly timetables for all 64 districts of Bangladesh and ~85 world cities, e.g. [Dhaka](${u('/prayer-times/dhaka')}), [Chattogram](${u('/prayer-times/chattogram')}), [London](${u('/prayer-times/london')}), [Makkah](${u('/prayer-times/makkah')}); [Ramadan sehri & iftar timetable](${u('/ramadan')}); [Today's Hijri date & converter](${u('/hijri-date')}); [Zakat calculator](${u('/zakat-calculator')})
- [Islamic events](${u('/events')}): dates of Ramadan, Laylatul Qadr, Eid al-Fitr, Day of Arafah, Eid al-Adha, Islamic New Year, Ashura and the white days for Saudi Arabia (Umm al-Qura) and Bangladesh (expected, usually +1 day), e.g. [Eid ul Adha](${u('/events/eid-al-adha')}), [Laylatul Qadr](${u('/events/laylatul-qadr')}), [Ramadan start](${u('/events/ramadan-start')}); year pages like ${u('/events/eid-al-adha/2027')}; JSON: ${u('/api/v1/events')}; MCP tool \`get_islamic_event\`
- [Learn](${u('/learn')}): step-by-step guides with markdown versions: [How to pray salah](${u('/learn/salah')}) (rak‘ah table, every recitation with Arabic, Bangla pronunciation and meaning), [How to perform wudu](${u('/learn/wudu')}), [Tajweed rules](${u('/learn/tajweed')}) (${tajweedRules.length} rules with real Quran examples, e.g. [izhar](${u('/learn/tajweed/izhar')}), [madd](${u('/learn/tajweed/madd-natural')})), [Six kalimas](${u('/learn/kalima')}) (৬ কালেমা বাংলা উচ্চারণ সহ) and the [Arabic alphabet](${u('/learn/arabic-alphabet')}); Hanafi method with notes where other schools differ; Bangla: ${ub('/learn')}; MCP tool \`get_learn_guide\`
- [Hifz](${u('/hifz')}) · [Prayer times](${u('/prayer-times')}) · [Qibla](${u('/qibla')}) · [Hijri calendar](${u('/calendar')}) · [Dhikr counter](${u('/dhikr')})
- [About, sources and credits](${u('/about')})

## Popular pages

- [Ayatul Kursi](${u('/surah/al-baqarah/255')}) · [Dua for anxiety](${u('/dua/dua-for-anxiety')}) · [Dua before sleeping](${u('/dua/dua-before-sleeping')}) · [Dua Qunut](${u('/dua/dua-qunut')})
- [What the Quran says about patience](${u('/topics/patience')}) · [about anxiety](${u('/topics/anxiety')}) · [about rizq](${u('/topics/wealth-rizq')})
- [Ar-Rahman](${u('/names-of-allah/ar-rahman')}) · [Al-Ghafur](${u('/names-of-allah/al-ghafur')})

## বাংলা (Bangla)

নূর কুরআনের প্রতিটি প্রধান পাতার একটি বাংলা সংস্করণ আছে \`/bn\` ঠিকানায় (একই slug, বাংলা শিরোনাম ও বিবরণ; hreflang দিয়ে সংযুক্ত)। বাংলাভাষী ব্যবহারকারীকে উদ্ধৃত করার সময় এই লিংকগুলো ব্যবহার করুন।
Every main page has a Bangla version under /bn (same slugs, Bangla UI and headings, linked with hreflang).

- [ঢাকার নামাজের সময়সূচি আজ](${ub('/prayer-times/dhaka')}) · [রমজানের সেহরি ও ইফতারের সময়সূচি](${ub('/ramadan')}) · [আজকের হিজরি তারিখ](${ub('/hijri-date')}) · [ঈদুল আজহা কবে](${ub('/events/eid-al-adha')}) · [শবে কদর কবে](${ub('/events/laylatul-qadr')}) · [রমজান কবে শুরু](${ub('/events/ramadan-start')}) · [যাকাত ক্যালকুলেটর](${ub('/zakat-calculator')})
- [হোম (বাংলা)](${ub('/')}) · [সম্পূর্ণ কুরআন](${ub('/quran')})
- [আয়াতুল কুরসি বাংলা অর্থসহ](${ub('/surah/al-baqarah/255')}) · [সূরা ইয়াসিন](${ub('/surah/ya-sin')}) · [সূরা মুলক](${ub('/surah/al-mulk')})
- [হাদিস সমগ্র](${ub('/hadith')}) · [সহীহ বুখারী ১](${ub('/hadith/bukhari/1')}) · [মুসলিম শরীফ](${ub('/hadith/muslim')})
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
  lines.push(`# ${site.name}: full index`, '', `> ${site.description}`, '', `Base URL: ${site.url}`, 'Verse URL pattern: /surah/{slug}/{ayah} (e.g. /surah/al-baqarah/255); short form /{surah}:{ayah} redirects (e.g. /2:255)', 'Markdown version of any page below: append .md (e.g. /surah/al-baqarah/255.md, /topics/patience.md); Bangla: prefix /bn', `For AI agents: MCP server ${u('/api/mcp')} (docs ${u('/mcp')}), JSON API ${u('/developers')} (OpenAPI ${u('/openapi.json')})`, '')

  lines.push('## Surahs (114)', '')
  for (const c of full) {
    const sum = c.summaryEn ? ` ${clip(c.summaryEn, 240)}` : ''
    lines.push(`- ${c.id}. ${c.nameSimple} (${c.nameArabic}), "${c.meaning}", ${c.versesCount} verses, ${c.revelationPlace === 'makkah' ? 'Makki' : 'Madani'}: ${u(surahHref(c.id))} (markdown: ${u(surahHref(c.id))}.md)${sum}`)
  }

  lines.push('', `## Topics: what the Quran says about… (${topics.length})`, '')
  for (const t of topics) lines.push(`- ${t.en} (${t.bn}), verses ${t.refs.join(', ')}: ${u(`/topics/${t.slug}`)} (markdown: ${u(`/topics/${t.slug}.md`)})`)

  lines.push('', `## Duas (${duas.length})`, '')
  for (const cat of duaCategories) {
    const items = duas.filter((d) => d.cat === cat.id)
    if (!items.length) continue
    lines.push(`### ${cat.title.en}`)
    for (const d of items) lines.push(`- ${d.title.en} (${d.title.bn}), source: ${d.source}: ${u(`/dua/${d.slug}`)} (markdown: ${u(`/dua/${d.slug}.md`)})`)
    lines.push('')
  }

  lines.push('', `## Hadith collections (${getCollections().length})`, '', 'Hadith URL pattern: /hadith/{collection}/{number} (e.g. /hadith/bukhari/1); book pages: /hadith/{collection}/book/{n}. Muslim numbers are Abd al-Baqi numbers.', '')
  for (const c of getCollections()) lines.push(`- ${c.name.en} (${c.name.ar}), ${c.count} hadiths, ${c.books} books: ${u(`/hadith/${c.slug}`)}`)
  lines.push('', '### Famous hadiths', '')
  for (const f of featured.filter((x, i, a) => a.findIndex((y) => y.c === x.c && y.n === x.n) === i)) lines.push(`- ${collectionMeta(f.c)!.cite} ${f.n}: ${f.en}: ${u(`/hadith/${f.c}/${f.n}`)}`)
  lines.push('')

  lines.push(`## 99 Names of Allah`, '')
  for (const n of asmaUlHusna) lines.push(`- ${n.n}. ${n.tl} (${n.ar}), ${n.en} / ${n.bn}: ${u(`/names-of-allah/${n.slug}`)} (markdown: ${u(`/names-of-allah/${n.slug}.md`)})`)
  lines.push('', '## Juz (30)', '')
  for (let j = 1; j <= 30; j++) lines.push(`- Juz ${j}: ${u(`/juz/${j}`)} (markdown: ${u(`/juz/${j}.md`)})`)
  lines.push('', `## Learn (${learnGuides.length} guides, ${tajweedRules.length} tajweed rules)`, '')
  for (const g of learnGuides) lines.push(`- ${g.name.en} (${g.name.bn}): ${u(g.path)} (markdown: ${u(g.path)}.md): ${g.blurb.en}`)
  for (const r of tajweedRules) lines.push(`- Tajweed: ${r.name.en} (${r.name.bn}): ${u(`/learn/tajweed/${r.slug}`)} (markdown: ${u(`/learn/tajweed/${r.slug}`)}.md)`)
  lines.push('', '## Developers & AI agents', '', `- MCP server: ${u('/api/mcp')} — docs ${u('/mcp')}`, `- JSON API: ${u('/developers')} — OpenAPI ${u('/openapi.json')}`, '')
  return lines.join('\n')
}
