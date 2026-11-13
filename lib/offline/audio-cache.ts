'use client'
/** Offline recitation store: whole-chapter mp3s in Cache Storage (`noor-audio-v1`) keyed by the audio URL, plus the chapter timing JSON
 *  (keyed by its api.qurancdn.com URL) so word-sync works offline. An index in localStorage tracks (reciter, surah) → url + bytes. */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AUDIO_CACHE, hasCacheApi } from './cache'

export const metaUrl = (reciterId: number, surah: number) => `https://api.qurancdn.com/api/qdc/audio/reciters/${reciterId}/audio_files?chapter=${surah}&segments=true`

interface Entry { url: string; bytes: number; at: number }
interface AudioIndex {
  entries: Record<string, Entry>
  put: (rid: number, surah: number, e: Entry) => void
  drop: (rid: number, surah: number) => void
  replace: (entries: Record<string, Entry>) => void
}
export const useAudioIndex = create<AudioIndex>()(
  persist(
    (set) => ({
      entries: {},
      put: (rid, s, e) => set((st) => ({ entries: { ...st.entries, [`${rid}:${s}`]: e } })),
      drop: (rid, s) => set((st) => { const n = { ...st.entries }; delete n[`${rid}:${s}`]; return { entries: n } }),
      replace: (entries) => set({ entries }),
    }),
    { name: 'noor-audio-index' },
  ),
)
export const audioKey = (rid: number, surah: number) => `${rid}:${surah}`

/** Drop index entries whose files were evicted / cleared by the browser. */
export async function verifyAudioIndex() {
  if (!hasCacheApi()) return
  try {
    const c = await caches.open(AUDIO_CACHE)
    const { entries, replace } = useAudioIndex.getState()
    const next: typeof entries = {}
    let changed = false
    for (const [k, v] of Object.entries(entries)) {
      if (await c.match(v.url)) next[k] = v
      else changed = true
    }
    if (changed) replace(next)
  } catch {}
}

export async function hasOfflineAudio(url: string) {
  if (!hasCacheApi()) return false
  try { return !!(await (await caches.open(AUDIO_CACHE)).match(url)) } catch { return false }
}

/** Object URL for a downloaded chapter file (supports seeking), or null if not downloaded. Caller must revoke it. */
export async function getOfflineAudioObjectUrl(url: string): Promise<string | null> {
  if (!hasCacheApi()) return null
  try {
    const hit = await (await caches.open(AUDIO_CACHE)).match(url)
    if (!hit) return null
    const blob = await hit.blob()
    return blob.size > 1024 ? URL.createObjectURL(new Blob([blob], { type: blob.type || 'audio/mpeg' })) : null
  } catch {
    return null
  }
}

/** Cached chapter timing JSON (as the raw Response JSON) — used when the network is unavailable. */
export async function getOfflineChapterJson(reciterId: number, surah: number): Promise<unknown | null> {
  if (!hasCacheApi()) return null
  try {
    const hit = await (await caches.open(AUDIO_CACHE)).match(metaUrl(reciterId, surah))
    return hit ? await hit.json() : null
  } catch {
    return null
  }
}

export interface DownloadHandle { cancel: () => void; promise: Promise<'done' | 'cancelled'> }

/** Download one chapter (timings JSON + mp3) into the audio cache with byte progress. */
export function downloadSurahAudio(reciterId: number, surah: number, onProgress?: (loaded: number, total: number) => void): DownloadHandle {
  const ctl = new AbortController()
  const promise = (async () => {
    const { fetchChapterAudio } = await import('@/lib/audio/api')
    const cache = await caches.open(AUDIO_CACHE)
    const mu = metaUrl(reciterId, surah)
    let ch
    try { ch = await fetchChapterAudio(reciterId, surah) } catch { throw new Error('meta') }
    // timings JSON
    if (!(await cache.match(mu))) {
      const r = await fetch(mu, { signal: ctl.signal })
      if (r.ok) await cache.put(mu, r)
    }
    const existing = await cache.match(ch.url)
    if (existing) {
      const b = (await existing.clone().blob()).size
      if (b > 1024) { useAudioIndex.getState().put(reciterId, surah, { url: ch.url, bytes: b, at: Date.now() }); return 'done' as const }
    }
    const res = await fetch(ch.url, { signal: ctl.signal, mode: 'cors' })
    if (!res.ok || !res.body) throw new Error(`audio ${res.status}`)
    const total = Number(res.headers.get('content-length')) || 0
    let loaded = 0
    const counter = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, c) { loaded += chunk.byteLength; onProgress?.(loaded, total); c.enqueue(chunk) },
    })
    const body = res.body.pipeThrough(counter)
    const headers = new Headers({ 'content-type': res.headers.get('content-type') || 'audio/mpeg' })
    if (total) headers.set('content-length', String(total))
    try {
      await cache.put(ch.url, new Response(body, { status: 200, headers }))
    } catch (e) {
      await cache.delete(ch.url).catch(() => {})
      if (ctl.signal.aborted) return 'cancelled' as const
      throw e
    }
    if (ctl.signal.aborted) { await cache.delete(ch.url).catch(() => {}); return 'cancelled' as const }
    useAudioIndex.getState().put(reciterId, surah, { url: ch.url, bytes: loaded, at: Date.now() })
    return 'done' as const
  })().catch((e) => {
    if (ctl.signal.aborted) return 'cancelled' as const
    throw e
  })
  return { cancel: () => ctl.abort(), promise }
}

export async function deleteSurahAudio(reciterId: number, surah: number) {
  const k = audioKey(reciterId, surah)
  const e = useAudioIndex.getState().entries[k]
  try {
    const c = await caches.open(AUDIO_CACHE)
    if (e) await c.delete(e.url)
    await c.delete(metaUrl(reciterId, surah))
  } catch {}
  useAudioIndex.getState().drop(reciterId, surah)
}

export async function deleteAllAudio(reciterId?: number) {
  const { entries } = useAudioIndex.getState()
  if (reciterId === undefined) {
    try { await caches.delete(AUDIO_CACHE) } catch {}
    useAudioIndex.getState().replace({})
    return
  }
  for (const k of Object.keys(entries)) if (k.startsWith(`${reciterId}:`)) await deleteSurahAudio(reciterId, Number(k.split(':')[1]))
}
