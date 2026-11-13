import 'server-only'
/** Markdown alternates for the Islamic-events pages: /events.md, /events/eid-al-adha.md, /events/eid-al-adha/2027.md (and /bn/…). */
import { absoluteUrl, site } from '@/lib/site'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { citations } from '@/lib/content/cite'
import { bnNum } from '@/lib/i18n/t'
import { surahHref } from '@/lib/quran/chapters'
import { EVENT_SLUGS, futureOccurrences, isEventSlug, nextOccurrence, occurrencesInYear, upcomingTimeline, validEventYear, type EventOccurrence, type EventSlug } from './calendar'
import { BN_SHORT, EVENTS } from './content'
import { EVENT_HADITH } from './hadith-refs'
import { hijriText, occDates } from './format'
import { eventPath, SIGHTING_NOTE, today } from './service'

interface MdDoc { body: string; canonical: string }

const NOTE_BN = 'সৌদি তারিখ উম্মুল কুরা ক্যালেন্ডার অনুযায়ী। বাংলাদেশ ও দক্ষিণ এশিয়ায় চাঁদ দেখার ভিত্তিতে তারিখ প্রায়ই একদিন পরে হয়; “বাংলাদেশ (সম্ভাব্য)” কলাম = সৌদি তারিখ + ১ দিন, এটি আনুমানিক, সরকারি ঘোষণা নয়।'

const footer = (canonical: string, title: string, locale: Locale) =>
  ['', '---', '', `${locale === 'bn' ? '**উদ্ধৃতি / Cite:**' : '**Cite:**'} ${citations({ title, url: canonical, note: 'Umm al-Qura; Bangladesh expected' }).plain}`, '', `Canonical: ${canonical}`, '', `Source: ${site.name} (${site.url}). Machine-readable: ${absoluteUrl('/api/v1/events')} · MCP tool get_islamic_event: ${absoluteUrl('/api/mcp')}`, ''].join('\n')

function rows(os: EventOccurrence[], l: 'en' | 'bn') {
  return os.map((o) => {
    const d = occDates(o, l)
    return `| ${hijriText(o, l)} | ${d.saudi} | ${d.bangladesh} |`
  })
}
const head = (l: 'en' | 'bn') => l === 'bn'
  ? ['| হিজরি তারিখ | সৌদি আরব (উম্মুল কুরা) | বাংলাদেশ (সম্ভাব্য, সাধারণত +১ দিন) |', '| --- | --- | --- |']
  : ['| Hijri date | Saudi Arabia (Umm al-Qura) | Bangladesh (expected, usually +1 day) |', '| --- | --- | --- |']

export async function eventsMd(slugRaw: string | undefined, yearRaw: string | undefined, locale: Locale): Promise<MdDoc | null> {
  const bn = locale === 'bn'
  const l = bn ? 'bn' : 'en'
  const t = today()
  const note = bn ? NOTE_BN : SIGHTING_NOTE
  if (!slugRaw) {
    const canonical = absoluteUrl(localeHref(locale, '/events'))
    const items = upcomingTimeline(t, 12)
    const lines = [
      `# ${bn ? 'ইসলামি দিবস — আগামী ১২ মাসের তারিখ' : 'Islamic events: dates for the next 12 months'}`, '', `> ${note}`, '',
      bn ? '| দিবস | হিজরি তারিখ | সৌদি আরব (উম্মুল কুরা) | বাংলাদেশ (সম্ভাব্য, সাধারণত +১ দিন) |' : '| Event | Hijri date | Saudi Arabia (Umm al-Qura) | Bangladesh (expected, usually +1 day) |',
      '| --- | --- | --- | --- |',
      ...items.map((o) => { const d = occDates(o, l); return `| [${bn ? BN_SHORT[o.slug] : EVENTS[o.slug].name.en} ${bn ? bnNum(o.primary.saudi.y) : o.primary.saudi.y}](${absoluteUrl(localeHref(locale, eventPath(o.slug, o.primary.saudi.y)))}) | ${hijriText(o, l)} | ${d.saudi} | ${d.bangladesh} |` }),
      '', bn ? '## প্রতিটি দিবসের গাইড' : '## Guides', '',
      ...EVENT_SLUGS.map((s) => `- [${bn ? EVENTS[s].name.bn : EVENTS[s].name.en}](${absoluteUrl(localeHref(locale, eventPath(s)))}) — ${EVENTS[s].summary[l]}`), '',
    ]
    return { body: lines.join('\n') + footer(canonical, bn ? 'ইসলামি দিবসের তারিখ' : 'Islamic events calendar', locale), canonical }
  }
  if (!isEventSlug(slugRaw)) return null
  const slug: EventSlug = slugRaw
  const c = EVENTS[slug]
  let occs: EventOccurrence[]
  let year: number | null = null
  if (yearRaw) {
    if (!/^\d{4}$/.test(yearRaw) || !validEventYear(+yearRaw, t.y)) return null
    year = +yearRaw
    occs = occurrencesInYear(slug, year)
  } else {
    const o = nextOccurrence(slug, t)
    occs = occurrencesInYear(slug, o.primary.saudi.y)
  }
  const y = year ?? occs[0].primary.saudi.y
  const canonical = absoluteUrl(localeHref(locale, eventPath(slug, year)))
  const first = occs.find((o) => +new Date(Date.UTC(o.bdEnd.y, o.bdEnd.m - 1, o.bdEnd.d)) >= Date.UTC(t.y, t.m - 1, t.d)) ?? occs[0]
  const d = occDates(first, l)
  const name = bn ? BN_SHORT[slug] : c.name.en
  const Y = bn ? bnNum(y) : y
  const future = futureOccurrences(slug, t)
  const lines = [
    `# ${name} ${Y}${bn ? ' কবে?' : ': date in Saudi Arabia & Bangladesh'}`, '',
    bn ? `**${name} ${Y}:** সৌদি আরবে ${d.saudi} (${hijriText(first, 'bn')}); বাংলাদেশে সম্ভাব্য ${d.bangladesh}।` : `**${name} ${Y}:** ${d.saudi} in Saudi Arabia (${hijriText(first, 'en')}, Umm al-Qura); expected ${d.bangladesh} in Bangladesh.`, '',
    `> ${note}`, '',
    bn ? `## ${c.name.bn} কী?` : `## What is ${c.name.en}?`, '', c.summary[l], '', ...c.what.map((p) => `${p[l]}\n`),
    bn ? `## ${Y} সালের তারিখ` : `## Dates in ${Y}`, '', ...head(l), ...rows(occs, l), '',
    ...([bn ? (slug === 'white-days' ? '## আগামী আইয়ামে বীজ' : '## আগামী বছরগুলো') : (slug === 'white-days' ? '## Upcoming white days' : '## Next years'), '', ...head(l), ...rows(future, l), '']),
    bn ? '## কুরআনে' : '## In the Quran', '', ...c.quran.map((q) => `- Quran ${q.ref}: ${q.why[l]} — ${absoluteUrl(localeHref(locale, surahHref(+q.ref.split(':')[0], +q.ref.split(':')[1].split('-')[0])))}`),
    '', bn ? '## হাদিসে' : '## In the hadith', '', ...c.hadith.map((id) => { const h = EVENT_HADITH[id]; return `- ${h[l]} — ${absoluteUrl(localeHref(locale, `/hadith/${h.c}/${h.n}`))}` }), '',
    bn ? '## সংশ্লিষ্ট' : '## Related', '', ...c.related.map((r) => `- [${r.label[l]}](${absoluteUrl(localeHref(locale, r.href))})`), '',
  ]
  return { body: lines.join('\n') + footer(canonical, `${name} ${y}`, locale), canonical }
}
