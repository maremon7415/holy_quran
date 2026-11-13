import 'server-only'
// Compact metadata (data/hadith/index.json, built by scripts/build-hadith-index.mjs) + number validation.
import raw from '@/data/hadith/index.json'
import { COLLECTION_SLUGS, collectionMeta, type CollectionSlug } from './collections'

export type BookRow = [n: number, name: string, first: number, last: number, count: number]
export interface CollectionIndex {
  first: number; last: number; count: number
  langs: { ar: number; en: number; bn: number }
  books: BookRow[]
  /** Numbers whose text is blank in every language of the corpus: not served. */
  dead: number[]
  /** number → [start, count, start, count …] runs of corpus `hadithnumber` (Muslim only). */
  map?: Record<string, number[]>
  grades?: { by: string; sahih: number; hasan: number; daif: number; other: number; ungraded: number }
}
interface IndexFile { v: number; source: string; generated: string; collections: Record<string, CollectionIndex> }
const index = raw as unknown as IndexFile

export const indexMeta = { source: index.source, generated: index.generated }
export const collectionIndex = (slug: CollectionSlug): CollectionIndex => index.collections[slug]
export const allIndexes = () => COLLECTION_SLUGS.map((s) => ({ slug: s, meta: collectionMeta(s)!, index: index.collections[s] }))

const deadSets = new Map<string, Set<number>>()
const deadOf = (slug: CollectionSlug) => deadSets.get(slug) ?? (deadSets.set(slug, new Set(index.collections[slug].dead)), deadSets.get(slug)!)
const sortedNums = new Map<string, number[]>()
function numbersOf(slug: CollectionSlug): number[] | null {
  const c = index.collections[slug]
  if (!c.map) return null
  let a = sortedNums.get(slug)
  if (!a) { a = Object.keys(c.map).map(Number).filter((n) => !deadOf(slug).has(n)).sort((x, y) => x - y); sortedNums.set(slug, a) }
  return a
}

/** True when the hadith number exists in the corpus and has text (i.e. the page can be served). */
export function isServable(slug: CollectionSlug, n: number): boolean {
  const c = index.collections[slug]
  if (!c || !Number.isInteger(n) || n < c.first || n > c.last || deadOf(slug).has(n)) return false
  return c.map ? Object.prototype.hasOwnProperty.call(c.map, String(n)) : true
}

/** Previous / next servable number (skips gaps in Muslim and blank entries elsewhere). */
export function neighbours(slug: CollectionSlug, n: number): { prev: number | null; next: number | null } {
  const c = index.collections[slug]
  const nums = numbersOf(slug)
  if (nums) {
    // binary search
    let lo = 0, hi = nums.length
    while (lo < hi) { const mid = (lo + hi) >> 1; if (nums[mid] < n) lo = mid + 1; else hi = mid }
    return { prev: lo > 0 ? nums[lo - 1] : null, next: nums[lo] === n ? nums[lo + 1] ?? null : nums[lo] ?? null }
  }
  let prev: number | null = n - 1
  while (prev !== null && prev >= c.first && !isServable(slug, prev)) prev--
  if (prev !== null && prev < c.first) prev = null
  let next: number | null = n + 1
  while (next !== null && next <= c.last && !isServable(slug, next)) next++
  if (next !== null && next > c.last) next = null
  return { prev, next }
}

/** Corpus `hadithnumber`s that make up a URL number (Muslim: runs from the map; others: n itself plus n.2 sub-entries are returned by the API with n). */
export function corpusNumbers(slug: CollectionSlug, n: number): number[] {
  const c = index.collections[slug]
  if (!c.map) return [n]
  const runs = c.map[String(n)] ?? []
  const out: number[] = []
  for (let i = 0; i < runs.length; i += 2) for (let k = 0; k < runs[i + 1]; k++) out.push(runs[i] + k)
  return out
}

export const bookRow = (slug: CollectionSlug, n: number): BookRow | undefined => index.collections[slug].books.find((b) => b[0] === n)

/** Servable numbers in a book, ascending (non-sparse collections only; Muslim derives them from the section data). */
export function bookNumbers(slug: CollectionSlug, n: number): number[] | null {
  const b = bookRow(slug, n)
  if (!b) return []
  const nums = numbersOf(slug)
  if (nums) return null
  const out: number[] = []
  for (let k = b[2]; k <= b[3]; k++) if (isServable(slug, k)) out.push(k)
  return out
}
