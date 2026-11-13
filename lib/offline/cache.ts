'use client'
/** Client-side helpers around Cache Storage / storage estimate. Cache names mirror public/sw.js. */
export const AUDIO_CACHE = 'noor-audio-v1'
export const CHANNEL = 'noor-offline'
/** Average size of a stored /surah page + its share of JS/CSS, measured on the production build (see report) — only used for the pre-download estimate. */
export const EST_PAGES_MB = 40
/** Approx. size of the whole Quran as 128 kbps chapter mp3s. */
export const EST_AUDIO_ALL_MB = 360

export const hasCacheApi = () => typeof caches !== 'undefined'

/** Find the current versioned cache ('pages' | 'dl' | 'assets' | 'api'), highest version wins. */
export async function findCache(kind: 'pages' | 'dl' | 'assets' | 'api'): Promise<Cache | null> {
  if (!hasCacheApi()) return null
  try {
    const keys = (await caches.keys()).filter((k) => new RegExp(`^noor-v2[A-Za-z0-9]*-${kind}$`).test(k))
    return keys[0] ? await caches.open(keys[0]) : null
  } catch {
    return null
  }
}

/** Pathnames of every page stored by the offline download (and browsed pages). */
export async function cachedPagePaths(): Promise<Set<string>> {
  const out = new Set<string>()
  for (const kind of ['dl', 'pages'] as const) {
    const c = await findCache(kind)
    if (!c) continue
    for (const r of await c.keys()) out.add(new URL(r.url).pathname)
  }
  return out
}

export async function deleteDownloadedPages() {
  if (!hasCacheApi()) return
  for (const k of await caches.keys()) if (/^noor-v2[A-Za-z0-9]*-(dl|pages)$/.test(k)) await caches.delete(k)
}

export async function storageEstimate(): Promise<{ usage: number; quota: number } | null> {
  try {
    const e = await navigator.storage?.estimate?.()
    return e ? { usage: e.usage ?? 0, quota: e.quota ?? 0 } : null
  } catch {
    return null
  }
}
export async function isPersisted() {
  try { return (await navigator.storage?.persisted?.()) ?? false } catch { return false }
}
export async function requestPersist() {
  try { return (await navigator.storage?.persist?.()) ?? false } catch { return false }
}

export function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(0)} KB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(n < 10 * 1024 ** 2 ? 1 : 0)} MB`
  return `${(n / 1024 ** 3).toFixed(2)} GB`
}
