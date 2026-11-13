import 'server-only'
// URLs for the hadith sitemaps: index, collections, books and every servable hadith (numbers within the index ranges,
// skipping gaps and blank entries). Chunked; `app/sitemap.ts` serves chunk i as one sitemap file per locale.
import { COLLECTIONS } from './collections'
import { allIndexes } from './data'
import { featured } from './featured'

export const HADITH_SITEMAP_CHUNK = 5000
export interface HadithSitemapUrl { path: string; priority: number }

let cached: HadithSitemapUrl[] | null = null
export function hadithSitemapUrls(): HadithSitemapUrl[] {
  if (cached) return cached
  const fav = new Set(featured.map((f) => `${f.c}/${f.n}`))
  const out: HadithSitemapUrl[] = [{ path: '/hadith', priority: 0.9 }]
  for (const c of COLLECTIONS) out.push({ path: `/hadith/${c.slug}`, priority: 0.8 })
  for (const { slug, index } of allIndexes()) for (const b of index.books) out.push({ path: `/hadith/${slug}/book/${b[0]}`, priority: 0.6 })
  for (const { slug, index } of allIndexes()) {
    const dead = new Set(index.dead)
    const nums = index.map ? Object.keys(index.map).map(Number).sort((a, b) => a - b) : Array.from({ length: index.last - index.first + 1 }, (_, i) => index.first + i)
    for (const n of nums) if (!dead.has(n)) out.push({ path: `/hadith/${slug}/${n}`, priority: fav.has(`${slug}/${n}`) ? 0.7 : 0.5 })
  }
  return (cached = out)
}
export const HADITH_SITEMAP_FILES = () => Math.ceil(hadithSitemapUrls().length / HADITH_SITEMAP_CHUNK)
export const hadithSitemapChunk = (i: number) => hadithSitemapUrls().slice(i * HADITH_SITEMAP_CHUNK, (i + 1) * HADITH_SITEMAP_CHUNK)
