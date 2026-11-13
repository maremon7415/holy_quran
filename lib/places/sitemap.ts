import { absoluteUrl } from '@/lib/site'
import { localeHref } from '@/lib/i18n/routes'
import { cities } from './cities'
import { monthKey } from './export'
import { currentOrNextRamadan, ramadanPath, ramadansInGregorianYear } from './hijri'
import { cityToday, zonedYmd } from './times'
import { EVENT_SLUGS, eventYears } from '@/lib/events/calendar'

const esc = (s: string) => s.replace(/&/g, '&amp;')

interface Entry { path: string; changefreq: string; priority: number }

/** Every city / Ramadan / Hijri / Zakat URL (English paths; each is emitted with its /bn twin). Monthly timetables only for the current and next month. */
export function placeEntries(now = Date.now()): Entry[] {
  const out: Entry[] = [
    { path: '/hijri-date', changefreq: 'daily', priority: 0.8 },
    { path: '/zakat-calculator', changefreq: 'monthly', priority: 0.8 },
  ]
  // Islamic events: hub, evergreen page per event, year pages (current year −1 … +4)
  out.push({ path: '/events', changefreq: 'daily', priority: 0.9 })
  const cy = zonedYmd(now, 'Asia/Dhaka').y
  for (const s of EVENT_SLUGS) {
    out.push({ path: `/events/${s}`, changefreq: 'weekly', priority: 0.85 })
    for (const y of eventYears(cy)) out.push({ path: `/events/${s}/${y}`, changefreq: y >= cy ? 'weekly' : 'yearly', priority: y === cy || y === cy + 1 ? 0.8 : 0.6 })
  }
  // Ramadan: the running / next one, plus both Ramadans (and the chooser) of a Gregorian year that holds two
  const today = zonedYmd(now, 'Asia/Dhaka')
  const t0 = Date.UTC(today.y, today.m - 1, today.d)
  const cur = currentOrNextRamadan(today).range
  const siblings = ramadansInGregorianYear(cur.start.y)
  const rams = siblings.length > 1 ? siblings.filter((r) => Date.UTC(r.end.y, r.end.m - 1, r.end.d) >= t0) : [cur]
  if (siblings.length > 1) out.push({ path: `/ramadan/${cur.start.y}`, changefreq: 'weekly', priority: 0.8 })
  for (const r of rams) out.push({ path: ramadanPath(r), changefreq: 'weekly', priority: 0.8 })
  for (const c of cities) {
    const bd = c.country === 'BD'
    out.push({ path: `/prayer-times/${c.slug}`, changefreq: 'daily', priority: c.division || !bd ? 0.8 : 0.7 })
    const t = cityToday(c, now)
    const next = t.m === 12 ? { y: t.y + 1, m: 1 } : { y: t.y, m: t.m + 1 }
    out.push({ path: `/prayer-times/${c.slug}/${monthKey(t.y, t.m)}`, changefreq: 'weekly', priority: 0.5 })
    out.push({ path: `/prayer-times/${c.slug}/${monthKey(next.y, next.m)}`, changefreq: 'weekly', priority: 0.5 })
    for (const r of rams) out.push({ path: `${ramadanPath(r)}/${c.slug}`, changefreq: 'weekly', priority: c.division || !bd ? 0.7 : 0.6 })
  }
  return out
}

export function placesSitemapXml(now = Date.now()): string {
  const lastmod = new Date(now).toISOString()
  const url = (path: string, e: Entry, loc: 'en' | 'bn') => {
    const en = absoluteUrl(path), bn = absoluteUrl(localeHref('bn', path))
    return `  <url>
    <loc>${esc(loc === 'bn' ? bn : en)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${esc(en)}"/>
    <xhtml:link rel="alternate" hreflang="bn" href="${esc(bn)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(en)}"/>
  </url>`
  }
  const entries = placeEntries(now)
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.flatMap((e) => [url(e.path, e, 'en'), url(e.path, e, 'bn')]).join('\n')}
</urlset>
`
}
