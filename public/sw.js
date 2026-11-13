/* Noor Quran service worker — offline reading.
 * - Pages: network-first, falls back to cache (every surah you open is readable offline).
 * - Static assets (_next/static, icons, fonts): cache-first.
 * - Quran.com API JSON (word-by-word, tafsir, timings): stale-while-revalidate.
 * Audio is never cached here (too large). */
const VERSION = 'noor-v1'
const PAGES = `${VERSION}-pages`
const ASSETS = `${VERSION}-assets`
const API = `${VERSION}-api`
const PRECACHE = ['/', '/quran', '/offline', '/manifest.json', '/brand/logo.svg']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(PAGES).then((c) => c.addAll(PRECACHE).catch(() => {})).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  )
})

const trim = async (name, max) => {
  const c = await caches.open(name)
  const keys = await c.keys()
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => c.delete(k)))
}

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  if (url.hostname === 'api.quran.com' || url.hostname === 'api.qurancdn.com') {
    e.respondWith(
      caches.open(API).then(async (c) => {
        const hit = await c.match(req)
        const net = fetch(req).then((res) => { if (res.ok) { c.put(req, res.clone()); trim(API, 400) } return res }).catch(() => hit)
        return hit || net
      })
    )
    return
  }
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  if (url.pathname.startsWith('/_next/static') || /\.(png|svg|woff2?|ttf|ico|webp|jpg)$/.test(url.pathname)) {
    e.respondWith(
      caches.open(ASSETS).then(async (c) => {
        const hit = await c.match(req)
        if (hit) return hit
        const res = await fetch(req)
        if (res.ok) c.put(req, res.clone())
        return res
      })
    )
    return
  }

  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(req)
        .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(PAGES).then((c) => { c.put(req, copy); trim(PAGES, 250) }) } return res })
        .catch(async () => (await caches.match(req)) || (await caches.match('/offline')) || Response.error())
    )
  }
})
