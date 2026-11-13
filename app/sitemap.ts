import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'
import { chapters, surahHref, juzHref } from '@/lib/quran/chapters'
import { topics } from '@/data/content/topics'
import { duas } from '@/data/content/duas'
import { asmaUlHusna } from '@/data/content/asma-ul-husna'
import { hasBnTwin, localeHref, type Locale } from '@/lib/i18n/routes'
import { HADITH_SITEMAP_FILES, hadithSitemapChunk } from '@/lib/hadith/sitemap'

const CHUNK = 5000 // well under the 50,000-URL sitemap limit
const TOTAL_AYAH = chapters.reduce((a, c) => a + c.versesCount, 0) // 6236
export const AYAH_SITEMAPS = Math.ceil(TOTAL_AYAH / CHUNK)
/** Bangla ayah pages exist once /bn/surah/[slug]/[ayah] is live. */
const BN_AYAHS = hasBnTwin('/surah/al-fatihah/1')

/**
 * Sitemap ids (A = AYAH_SITEMAPS):
 *   0            English pages (home, sections, surahs, juz, topics, duas, names)
 *   1 … A        English ayah pages, 5,000 per file
 *   A+1          Bangla (/bn) twins of the core pages
 *   A+2 … 2A+1   Bangla ayah pages (once /bn ayah pages exist)
 *   then H files of English hadith URLs (index, collections, books, every hadith; 5,000 per file) followed by the same H files for /bn
 * Every URL that has a twin carries hreflang alternates (en, bn, x-default).
 */
const QURAN_SITEMAPS = 2 + AYAH_SITEMAPS * (BN_AYAHS ? 2 : 1)
const HADITH_FILES = HADITH_SITEMAP_FILES()
export const SITEMAP_COUNT = QURAN_SITEMAPS + HADITH_FILES * 2

export async function generateSitemaps() {
  return Array.from({ length: SITEMAP_COUNT }, (_, id) => ({ id }))
}

const now = new Date()
type Entry = MetadataRoute.Sitemap[number]

function e(path: string, priority: number, changeFrequency: Entry['changeFrequency'], locale: Locale = 'en'): Entry {
  const twin = hasBnTwin(path)
  return {
    url: absoluteUrl(localeHref(locale, path)),
    lastModified: now,
    changeFrequency,
    priority,
    ...(twin ? { alternates: { languages: { en: absoluteUrl(path), bn: absoluteUrl(localeHref('bn', path)), 'x-default': absoluteUrl(path) } } } : {}),
  }
}

function corePages(): [string, number, Entry['changeFrequency']][] {
  return [
    ['/', 1, 'weekly'],
    ['/quran', 0.95, 'weekly'],
    ['/topics', 0.9, 'weekly'],
    ['/dua', 0.9, 'weekly'],
    ['/names-of-allah', 0.9, 'monthly'],
    ['/listen', 0.8, 'monthly'],
    ['/hifz', 0.7, 'monthly'],
    ['/journey', 0.6, 'monthly'],
    ['/prayer-times', 0.7, 'daily'],
    ['/qibla', 0.6, 'yearly'],
    ['/calendar', 0.6, 'monthly'],
    ['/dhikr', 0.6, 'yearly'],
    ['/about', 0.4, 'yearly'],
    ['/developers', 0.5, 'monthly'],
    ['/mcp', 0.5, 'monthly'],
    ...chapters.map((c) => [surahHref(c.id), 0.85, 'monthly'] as const),
    ...Array.from({ length: 30 }, (_, i) => [juzHref(i + 1), 0.7, 'monthly'] as const),
    ...topics.map((t) => [`/topics/${t.slug}`, 0.8, 'monthly'] as const),
    ...duas.map((d) => [`/dua/${d.slug}`, 0.75, 'monthly'] as const),
    ...asmaUlHusna.map((n) => [`/names-of-allah/${n.slug}`, 0.7, 'monthly'] as const),
  ] as [string, number, Entry['changeFrequency']][]
}

function ayahPaths(chunk: number) {
  const all: [number, number][] = []
  for (const c of chapters) for (let a = 1; a <= c.versesCount; a++) all.push([c.id, a])
  return all.slice(chunk * CHUNK, (chunk + 1) * CHUNK).map(([s, a]) => surahHref(s, a))
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id)
  if (id >= QURAN_SITEMAPS) {
    const k = id - QURAN_SITEMAPS
    const locale: Locale = k >= HADITH_FILES ? 'bn' : 'en'
    return hadithSitemapChunk(k % HADITH_FILES).map((u) => e(u.path, u.priority, 'yearly', locale))
  }
  if (id === 0) return corePages().map(([p, pr, f]) => e(p, pr, f))
  if (id <= AYAH_SITEMAPS) return ayahPaths(id - 1).map((p) => e(p, 0.5, 'yearly'))
  if (id === AYAH_SITEMAPS + 1) return corePages().filter(([p]) => hasBnTwin(p)).map(([p, pr, f]) => e(p, pr, f, 'bn'))
  return ayahPaths(id - AYAH_SITEMAPS - 2).map((p) => e(p, 0.5, 'yearly', 'bn'))
}
