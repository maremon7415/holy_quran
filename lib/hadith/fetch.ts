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

interface Opts {
  /** Next data-cache lifetime in seconds; `false` = do not use the data cache (very large editions). */
  revalidate?: number | false
  timeoutMs?: number
  /** Extra rounds over the URL list after a transient failure (default: 2 during `next build`, 1 at runtime). */
  retries?: number
}

type Attempt = { ok: true; data: unknown } | { ok: false; transient: boolean }

async function tryUrl(url: string, o: Opts): Promise<Attempt> {
  try {
    const init: RequestInit & { next?: { revalidate: number } } = { signal: AbortSignal.timeout(o.timeoutMs ?? 12000), headers: { accept: 'application/json' } }
    if (o.revalidate === false) init.cache = 'no-store'
    else init.next = { revalidate: o.revalidate ?? REVALIDATE }
    const res = await fetch(url, init)
    // 404/410 = the file does not exist (not worth retrying); 408/429/5xx = transient
    if (!res.ok) return { ok: false, transient: res.status === 408 || res.status === 429 || res.status >= 500 }
    const data = await res.json()
    return data ? { ok: true, data } : { ok: false, transient: true }
  } catch {
    return { ok: false, transient: true } // network error, timeout, truncated JSON
  }
}

const isBuild = () => process.env.NEXT_PHASE === 'phase-production-build'
/** Backoff between rounds (ms); overridable in tests. */
export const retryDelay = { base: 400 }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Fetch `{path}.min.json` from jsDelivr, falling back to `{path}.json` (the API README recommends this),
 * then to the raw GitHub copy. When every URL fails with a transient error (network, timeout, 429, 5xx) the whole
 * list is retried with exponential backoff (so a briefly flaky CDN does not fail a prerender during `next build`).
 * Throws HadithFetchError when every attempt fails.
 */
export async function fetchApi<T>(path: string, o: Opts = {}): Promise<T> {
  const urls = [`${HADITH_CDN}/${path}.min.json`, `${HADITH_CDN}/${path}.json`, `${FALLBACK_CDN}/${path}.json`]
  const retries = o.retries ?? (isBuild() ? 2 : 1)
  for (let round = 0; round <= retries; round++) {
    if (round > 0) await sleep(retryDelay.base * 3 ** (round - 1))
    let transient = false
    for (const u of urls) {
      const r = await tryUrl(u, o)
      if (r.ok) return r.data as T
      transient ||= r.transient
    }
    if (!transient) break // every copy answered "not found": retrying will not help
  }
  throw new HadithFetchError(path)
}
