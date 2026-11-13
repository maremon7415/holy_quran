import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'
import { chapters, surahHref, juzHref } from '@/lib/quran/chapters'
import { topics } from '@/data/content/topics'
import { duas } from '@/data/content/duas'
import { asmaUlHusna } from '@/data/content/asma-ul-husna'

const CHUNK = 5000
const TOTAL_AYAH = chapters.reduce((a, c) => a + c.versesCount, 0) // 6236
export const AYAH_SITEMAPS = Math.ceil(TOTAL_AYAH / CHUNK)

/** id 0 = pages, surahs, juz, topics, duas, names. ids 1.. = individual ayah pages in chunks of 5,000. */
export async function generateSitemaps() {
  return Array.from({ length: 1 + AYAH_SITEMAPS }, (_, id) => ({ id }))
}

const now = new Date()
type Entry = MetadataRoute.Sitemap[number]
const e = (path: string, priority: number, changeFrequency: Entry['changeFrequency']): Entry => ({ url: absoluteUrl(path), lastModified: now, changeFrequency, priority })

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id)
  if (id === 0) {
    return [
      e('/', 1, 'weekly'),
      e('/quran', 0.95, 'weekly'),
      e('/topics', 0.9, 'weekly'),
      e('/dua', 0.9, 'weekly'),
      e('/names-of-allah', 0.9, 'monthly'),
      e('/listen', 0.8, 'monthly'),
      e('/hifz', 0.7, 'monthly'),
      e('/journey', 0.6, 'monthly'),
      e('/prayer-times', 0.7, 'daily'),
      e('/qibla', 0.6, 'yearly'),
      e('/calendar', 0.6, 'monthly'),
      e('/dhikr', 0.6, 'yearly'),
      e('/about', 0.4, 'yearly'),
      ...chapters.map((c) => e(surahHref(c.id), 0.85, 'monthly')),
      ...Array.from({ length: 30 }, (_, i) => e(juzHref(i + 1), 0.7, 'monthly')),
      ...topics.map((t) => e(`/topics/${t.slug}`, 0.8, 'monthly')),
      ...duas.map((d) => e(`/dua/${d.slug}`, 0.75, 'monthly')),
      ...asmaUlHusna.map((n) => e(`/names-of-allah/${n.slug}`, 0.7, 'monthly')),
    ]
  }
  const all: [number, number][] = []
  for (const c of chapters) for (let a = 1; a <= c.versesCount; a++) all.push([c.id, a])
  return all.slice((id - 1) * CHUNK, id * CHUNK).map(([s, a]) => e(surahHref(s, a), 0.5, 'yearly'))
}
