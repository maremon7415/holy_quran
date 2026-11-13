import 'server-only'
// Data access for the open hadith corpus (github.com/fawazahmed0/hadith-api, served by jsDelivr).
// Texts are NOT stored in the repo; they are fetched on demand and cached for 30 days by the Next.js data cache.

export const HADITH_CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1'
const FALLBACK_CDN = 'https://raw.githubusercontent.com/fawazahmed0/hadith-api/1'
export const REVALIDATE = 2592000 // 30 days

export class HadithFetchError extends Error {
  constructor(public path: string, message?: string) {
    super(message ?? `Could not load hadith data (${path})`)
    this.name = 'HadithFetchError'
  }
}

export interface ApiHadith {
  hadithnumber: number
  arabicnumber?: number | string | null
  text: string
  grades: { name: string; grade: string }[]
  reference: { book: number; hadith: number }
}
export interface ApiSection { metadata: { name: string; section?: Record<string, string> }; hadiths: ApiHadith[] }

interface Opts { /** Next data-cache lifetime in seconds; `false` = do not use the data cache (very large editions). */ revalidate?: number | false; timeoutMs?: number }

async function tryUrl(url: string, o: Opts): Promise<unknown | null> {
  try {
    const init: RequestInit & { next?: { revalidate: number } } = { signal: AbortSignal.timeout(o.timeoutMs ?? 12000), headers: { accept: 'application/json' } }
    if (o.revalidate === false) init.cache = 'no-store'
    else init.next = { revalidate: o.revalidate ?? REVALIDATE }
    const res = await fetch(url, init)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/**
 * Fetch `{path}.min.json` from jsDelivr, falling back to `{path}.json` (the API README recommends this),
 * then to the raw GitHub copy. Throws HadithFetchError when every attempt fails.
 */
export async function fetchApi<T>(path: string, o: Opts = {}): Promise<T> {
  const urls = [`${HADITH_CDN}/${path}.min.json`, `${HADITH_CDN}/${path}.json`, `${FALLBACK_CDN}/${path}.json`]
  for (const u of urls) {
    const data = await tryUrl(u, o)
    if (data) return data as T
  }
  throw new HadithFetchError(path)
}
