/**
 * Extension point for MCP tools that live outside the Quran corpus (e.g. the hadith library).
 *
 * To add hadith tools, implement `HadithProvider` on top of `lib/hadith/*` and set it in
 * `lib/mcp/providers.ts` (`hadithProvider`). `registerHadithTools` then exposes `search_hadith`
 * and `get_hadith` with the same conventions as the Quran tools: read-only, JSON text output,
 * every item carrying the canonical https `url` on this site and a `citation` string.
 */
export interface HadithItem {
  /** e.g. "bukhari:6306" */
  id: string
  collection: string
  /** Number as printed in the collection, e.g. "6306" */
  number: string
  arabic?: string
  english?: string
  bangla?: string
  grade?: string
  narrator?: string
  /** Canonical absolute URL of the hadith page on this site */
  url: string
  /** Ready-made citation string ("Sahih al-Bukhari 6306 — Noor Quran, https://…") */
  citation: string
  [extra: string]: unknown
}

export interface HadithProvider {
  /** Look up one hadith by reference, e.g. "bukhari 6306", "Sahih Muslim 2723", "muslim:2723". */
  getHadith(reference: string): Promise<HadithItem | null>
  /** Full-text search. `collection` narrows to one collection id. */
  searchHadith(query: string, opts?: { collection?: string; limit?: number; lang?: 'en' | 'bn' | 'ar' }): Promise<{ total: number; results: HadithItem[]; /** collections that could not be searched (partial results) */ failed?: string[] }>
  /** Collection ids accepted by `searchHadith({ collection })`. */
  collections?(): Promise<{ id: string; name: string; url?: string }[]> | { id: string; name: string; url?: string }[]
}
