'use client'
import { chapters, surahHref, juzHref } from '@/lib/quran/chapters'
import { CHANNEL } from './cache'

export interface PagesProgress {
  type: 'progress'
  jobId: string
  phase: 'pages' | 'assets'
  state: 'running' | 'done' | 'cancelled' | 'error' | 'busy'
  done: number
  total: number
  bytes: number
  failed: number
  current?: string
  /** true for the automatic post-deploy refresh */
  refresh?: boolean
}

export const allPagePaths = (withJuz: boolean) => [
  '/quran',
  '/offline',
  ...chapters.map((c) => surahHref(c.id)),
  ...(withJuz ? Array.from({ length: 30 }, (_, i) => juzHref(i + 1)) : []),
]

async function worker() {
  if (!('serviceWorker' in navigator)) return null
  const reg = await navigator.serviceWorker.getRegistration()
  return reg?.active ?? null
}
export const canDownloadPages = async () => !!(await worker())

/** Ask the service worker to fetch + cache pages (and the JS/CSS they reference). Resumable: already-cached pages are skipped. */
export async function startPagesDownload(opts: { withJuz: boolean; force?: boolean }) {
  const sw = await worker()
  if (!sw) throw new Error('no-sw')
  const jobId = Math.random().toString(36).slice(2)
  sw.postMessage({ type: 'noor:dl-start', jobId, urls: allPagePaths(opts.withJuz), force: !!opts.force })
  return jobId
}
export async function cancelPagesDownload() {
  ;(await worker())?.postMessage({ type: 'noor:dl-cancel' })
}

export function subscribeProgress(cb: (p: PagesProgress) => void) {
  if (typeof BroadcastChannel === 'undefined') return () => {}
  const bc = new BroadcastChannel(CHANNEL)
  bc.onmessage = (e) => { if (e.data?.type === 'progress') cb(e.data as PagesProgress) }
  return () => bc.close()
}
