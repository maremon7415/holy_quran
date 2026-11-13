'use client'
import { chapters, surahHref, juzHref } from '@/lib/quran/chapters'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { CHANNEL, markDownloadedLocales } from './cache'

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

/** Pages of one language: English `/x` (also used by the Arabic UI) or the Bangla twins `/bn/x`. `/offline` has no twin and is shared. */
export const allPagePaths = (withJuz: boolean, locale: Locale = 'en') =>
  [
    '/quran',
    '/offline',
    ...chapters.map((c) => surahHref(c.id)),
    ...(withJuz ? Array.from({ length: 30 }, (_, i) => juzHref(i + 1)) : []),
  ].map((p) => localeHref(locale, p))

/** Pages for several languages, de-duplicated (`/offline` once). */
export const allPagePathsFor = (withJuz: boolean, locales: Locale[]) => [...new Set(locales.flatMap((l) => allPagePaths(withJuz, l)))]

async function worker() {
  if (!('serviceWorker' in navigator)) return null
  const reg = await navigator.serviceWorker.getRegistration()
  return reg?.active ?? null
}
export const canDownloadPages = async () => !!(await worker())

/** Ask the service worker to fetch + cache pages (and the JS/CSS they reference). Resumable: already-cached pages are skipped. */
export async function startPagesDownload(opts: { withJuz: boolean; force?: boolean; locales?: Locale[] }) {
  const sw = await worker()
  if (!sw) throw new Error('no-sw')
  const locales = opts.locales?.length ? opts.locales : (['en'] as Locale[])
  const jobId = Math.random().toString(36).slice(2)
  markDownloadedLocales(locales)
  sw.postMessage({ type: 'noor:dl-start', jobId, urls: allPagePathsFor(opts.withJuz, locales), force: !!opts.force })
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
