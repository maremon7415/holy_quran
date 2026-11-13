/* Noor Quran service worker — offline reading, offline downloads, prayer reminders.
 *
 * Caches (versioned by VERSION = noor-v2 + the build id passed as /sw.js?v=<id>; every deploy therefore gets a new SW and
 * activate wipes all older noor-* caches except noor-audio-v1, so stale HTML can never reference deleted chunks):
 *   {V}-core    precache (/, /quran, /offline) — never trimmed
 *   {V}-pages   pages you visited (network-first, 3s timeout, bounded)
 *   noor-downloads-v1 / noor-downloads-assets-v1  pages + assets stored by "Download the whole Quran" (UNversioned, never trimmed, refreshed in the background after a deploy)
 *   {V}-assets  _next/static, icons, fonts (cache-first, bounded)
 *   {V}-api     api.quran.com / api.qurancdn.com JSON (stale-while-revalidate, bounded)
 *   noor-audio-v1   recitation mp3s saved by the page (NOT versioned — survives deploys; only the page writes to it)
 *
 * Messages (page -> SW): noor:dl-start {jobId, urls, force?} · noor:dl-cancel · noor:prayer-check
 * Progress (SW -> page): BroadcastChannel "noor-offline" {type:'progress', jobId, phase, state, done, total, bytes, failed, current}
 * Prayer reminders: the page mirrors the next 7 days of reminders into IndexedDB (db noor-offline, store kv, key prayer-schedule);
 * on `periodicsync` ("prayer-check") the SW shows the ones that are due. */
const BUILD = ((new URL(self.location.href)).searchParams.get('v') || 'dev').replace(/[^A-Za-z0-9]/g, '').slice(0, 16) || 'dev'
const VERSION = `noor-v2${BUILD}`
const CORE = `${VERSION}-core`
const PAGES = `${VERSION}-pages`
// Offline-download caches are NOT versioned: they survive deploys and are refreshed in the background (refreshDownloads).
const DL = 'noor-downloads-v1' // downloaded page HTML
const DLA = 'noor-downloads-assets-v1' // every _next asset those pages reference (kept self-consistent with DL)
const ASSETS = `${VERSION}-assets`
const API = `${VERSION}-api`
const AUDIO = 'noor-audio-v1'
const PRECACHE = ['/', '/quran', '/offline', '/manifest.json', '/brand/logo.svg']
const NAV_TIMEOUT = 3000
const KEEP = new Set([CORE, PAGES, DL, DLA, ASSETS, API, AUDIO])

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CORE)
      .then((c) => Promise.allSettled(PRECACHE.map((u) => c.add(u).catch(() => {}))))
      .then(() => warmCore())
      .then(() => self.skipWaiting()),
  )
})

/** Cache the JS/CSS/fonts the precached /offline page needs so the fallback page itself renders offline. */
async function warmCore() {
  try {
    const core = await caches.open(CORE)
    const hit = await core.match('/offline')
    if (!hit) return
    const assets = await caches.open(ASSETS)
    await Promise.allSettled([...pageAssetUrls(await hit.text())].map(async (u) => {
      if (await assets.match(u)) return
      const res = await fetch(u)
      if (cacheable(res)) await assets.put(u, res)
    }))
  } catch (_) {}
}

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('noor-') && !KEEP.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

const trim = async (name, max) => {
  const c = await caches.open(name)
  const keys = await c.keys()
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => c.delete(k)))
}
/** Only ever cache complete, same-origin-readable 200s: never opaque, opaqueredirect, redirected or error responses. */
const cacheable = (res) => {
  if (!res || !res.ok || res.status !== 200 || res.type === 'opaque' || res.type === 'opaqueredirect' || res.redirected) return false
  const cc = (res.headers.get('cache-control') || '').toLowerCase()
  return !/no-store|private/.test(cc) && !res.headers.has('set-cookie')
}
/** Account / auth pages and API routes are never cached (they are per-user). */
const PRIVATE = /^\/(login|register|account|auth|profile\/account|api)(\/|$)/

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  if (url.hostname === 'api.quran.com' || url.hostname === 'api.qurancdn.com') {
    e.respondWith(
      caches.open(API).then(async (c) => {
        const hit = await c.match(req)
        const net = fetch(req)
          .then((res) => { if (cacheable(res)) { c.put(req, res.clone()); trim(API, 600) } return res })
          .catch((err) => { if (hit) return hit; throw err })
        return hit || net
      }),
    )
    return
  }
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return
  if (req.headers.has('range')) return

  if (url.pathname.startsWith('/_next/static') || /\.(png|svg|woff2?|ttf|ico|webp|jpg)$/.test(url.pathname)) {
    e.respondWith(
      caches.open(ASSETS).then(async (c) => {
        const hit = (await c.match(req)) || (await (await caches.open(DLA)).match(req))
        if (hit) return hit
        const res = await fetch(req)
        if (cacheable(res)) { c.put(req, res.clone()); trim(ASSETS, 1500) }
        return res
      }),
    )
    return
  }

  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    e.respondWith(navigate(req, url))
  }
})

/** Network-first with a short timeout: a flaky connection falls back to the cached copy instead of hanging. */
async function navigate(req, url) {
  if (PRIVATE.test(url.pathname)) return fetch(req).catch(async () => (await caches.match('/offline')) || Response.error())
  const network = fetch(req).then((res) => {
    if (cacheable(res)) {
      const copy = res.clone()
      caches.open(PAGES).then((c) => c.put(req, copy).then(() => trim(PAGES, 300)))
    }
    return res
  })
  network.catch(() => {})
  let timer
  const timeout = new Promise((r) => { timer = setTimeout(() => r(null), NAV_TIMEOUT) })
  try {
    const first = await Promise.race([network, timeout])
    clearTimeout(timer)
    if (first) return first
  } catch {
    clearTimeout(timer)
  }
  const cached = (await caches.match(req)) || (await caches.match(url.pathname)) || (await caches.match(url.origin + url.pathname))
  if (cached) return cached
  // nothing cached: if we only timed out, keep waiting for the network; otherwise show the offline page
  try { return await network } catch { /* offline */ }
  return (await caches.match('/offline')) || Response.error()
}

/* ------------------------------------------------------------------ messages */
let job = { running: false, cancel: false }
const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('noor-offline') : null
const post = (m) => { try { bc && bc.postMessage(m) } catch (_) {} }

self.addEventListener('message', (e) => {
  const d = e.data || {}
  if (d.type === 'noor:dl-start') e.waitUntil(runDownload(d))
  else if (d.type === 'noor:dl-cancel') job.cancel = true
  else if (d.type === 'noor:refresh-downloads') e.waitUntil(refreshDownloads())
  else if (d.type === 'noor:prayer-check') e.waitUntil(checkPrayers(true))
  else if (d.type === 'noor:ping') post({ type: 'pong', running: job.running })
})

/** After a deploy: re-fetch every downloaded page + newly referenced chunks (throttled), then prune unreferenced assets. Once per build. */
async function refreshDownloads() {
  if (job.running) return
  try {
    const last = await idbRun('kv', 'readonly', (s) => s.get('downloads-build')).catch(() => undefined)
    if (last === BUILD) return
    const dl = await caches.open(DL)
    const urls = (await dl.keys()).map((r) => { const u = new URL(r.url); return u.pathname + u.search })
    if (!urls.length) { await idbRun('kv', 'readwrite', (s) => s.put(BUILD, 'downloads-build')).catch(() => {}); return }
    await runDownload({ jobId: 'refresh-' + BUILD, urls, force: true, refresh: true })
    // only mark done if it finished cleanly (the job reports via BroadcastChannel; check by re-running cheaply next time otherwise)
    if (!job.cancel && lastRefreshOk) await idbRun('kv', 'readwrite', (s) => s.put(BUILD, 'downloads-build')).catch(() => {})
  } catch (_) {}
}
let lastRefreshOk = false

const cssUrls = (text, base) => {
  const out = []
  const re = /url\(\s*['"]?([^'")\s]+)['"]?\s*\)/g
  let m
  while ((m = re.exec(text))) {
    try { const u = new URL(m[1], base); if (u.origin === self.location.origin && u.pathname.startsWith('/_next/static/')) out.push(u.pathname + u.search) } catch (_) {}
  }
  return out
}
const pageAssetUrls = (text) => {
  // <script src="/_next/static/…"> and the RSC flight payload, which lists lazy chunks as "static/chunks/….js" (no /_next/ prefix)
  const out = new Set()
  const re = /(?:\/_next\/)?static\/(?:chunks|media|css)\/[^"'\s<>\\)]+?\.(?:js|css|woff2?)/g
  let m
  while ((m = re.exec(text))) out.add(m[0].startsWith('/') ? m[0] : '/_next/' + m[0])
  return out
}
const cleanHeaders = (h) => {
  const o = new Headers(h)
  o.delete('content-encoding'); o.delete('content-length'); o.delete('transfer-encoding')
  return o
}
async function fetchRetry(req, tries = 3) {
  let err
  for (let i = 0; i < tries; i++) {
    try { return await fetch(req) } catch (e) { err = e; if (job.cancel) break; await new Promise((r) => setTimeout(r, 400 * (i + 1))) }
  }
  throw err
}

async function runDownload({ jobId, urls, force, refresh }) {
  if (job.running) { post({ type: 'progress', refresh: !!refresh, jobId, phase: 'pages', state: 'busy', done: 0, total: urls.length, bytes: 0, failed: 0 }); return }
  job = { running: true, cancel: false }
  const dl = await caches.open(DL)
  const assets = await caches.open(DLA)
  let bytes = 0
  let done = 0
  let failed = 0
  const total = urls.length
  const assetSet = new Set()
  const report = (phase, state, extra = {}) => post({ type: 'progress', refresh: !!refresh, jobId, phase, state, done, total: phase === 'pages' ? total : assetSet.size, bytes, failed, ...extra })
  report('pages', 'running')
  try {
    let i = 0
    const worker = async () => {
      while (!job.cancel) {
        const u = urls[i++]
        if (!u) return
        try {
          const req = new Request(u, { credentials: 'same-origin' })
          let text
          const hit = !force && (await dl.match(req))
          if (hit) {
            text = await hit.text()
          } else {
            const res = await fetchRetry(req)
            if (!cacheable(res)) throw new Error('bad response ' + res.status)
            const blob = await res.blob()
            bytes += blob.size
            await dl.put(req, new Response(blob, { status: 200, statusText: 'OK', headers: cleanHeaders(res.headers) }))
            text = await blob.text()
          }
          for (const a of pageAssetUrls(text)) assetSet.add(a)
        } catch (_) {
          failed++
        }
        done++
        report('pages', 'running', { current: u })
        if (refresh) await new Promise((r) => setTimeout(r, 150))
      }
    }
    await Promise.all(refresh ? [worker(), worker()] : [worker(), worker(), worker()])
    if (job.cancel) { report('pages', 'cancelled'); return }

    // phase 2: the JS/CSS/font files those pages reference (cache-first at runtime, so this just warms the cache)
    done = 0
    failed = 0
    const queue = [...assetSet]
    let q = 0
    let active = 0
    const aworker = async () => {
      while (!job.cancel) {
        const u = queue[q]
        if (u === undefined) {
          if (active === 0) return // nothing queued and nobody can add more
          await new Promise((r) => setTimeout(r, 25))
          continue
        }
        q++
        active++
        try {
          const req = new Request(u)
          let res = await assets.match(req)
          let blob
          if (res) {
            blob = await res.blob()
          } else {
            const net = await fetchRetry(req)
            if (!cacheable(net)) throw new Error('bad')
            const h = cleanHeaders(net.headers)
            blob = await net.blob()
            bytes += blob.size
            await assets.put(req, new Response(blob, { status: 200, headers: h }))
          }
          // follow references: CSS -> fonts/images; JS -> lazily loaded chunks ("static/chunks/xxx.js")
          if (/\.(css|js)(\?|$)/.test(u)) {
            const text = await blob.text()
            const more = /\.css(\?|$)/.test(u) ? cssUrls(text, self.location.origin + u) : [...pageAssetUrls(text)]
            for (const f of more) if (!assetSet.has(f)) { queue.push(f); assetSet.add(f) }
          }
        } catch (_) {
          failed++
        }
        active--
        done++
        if (done % 4 === 0) report('assets', 'running')
      }
    }
    await Promise.all([aworker(), aworker(), aworker()])
    if (refresh && !job.cancel && failed === 0 && assetSet.size) {
      // drop chunks no downloaded page references any more (assetSet is the full closure: pages -> js/css -> lazy chunks/fonts)
      for (const k of await assets.keys()) {
        const u = new URL(k.url)
        if (!assetSet.has(u.pathname + u.search)) await assets.delete(k)
      }
    }
    lastRefreshOk = !job.cancel && failed === 0
    report('assets', job.cancel ? 'cancelled' : 'done')
  } catch (e) {
    report('pages', 'error', { message: String(e && e.message) })
  } finally {
    job.running = false
  }
}

/* ------------------------------------------------------------------ prayer reminders */
const idb = () => new Promise((resolve, reject) => {
  const r = indexedDB.open('noor-offline', 1)
  r.onupgradeneeded = () => { const db = r.result; if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv'); if (!db.objectStoreNames.contains('fired')) db.createObjectStore('fired') }
  r.onsuccess = () => resolve(r.result)
  r.onerror = () => reject(r.error)
})
const idbRun = async (store, mode, fn) => {
  const db = await idb()
  try {
    return await new Promise((resolve, reject) => {
      const t = db.transaction(store, mode)
      const req = fn(t.objectStore(store))
      t.oncomplete = () => resolve(req.result)
      t.onerror = () => reject(t.error)
    })
  } finally { db.close() }
}

async function checkPrayers(force) {
  let sched
  try { sched = await idbRun('kv', 'readonly', (s) => s.get('prayer-schedule')) } catch (_) { return 0 }
  if (!sched || !Array.isArray(sched.items) || !sched.items.length) return 0
  if (!force) {
    // an open, visible page fires its own timers (with sound) — avoid double notifications
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    if (wins.some((c) => c.visibilityState === 'visible')) return 0
  }
  const now = Date.now()
  const lang = sched.lang === 'bn' ? 'bn' : 'en'
  let n = 0
  for (const it of sched.items) {
    if (it.fireAt > now || it.fireAt < now - 20 * 60 * 1000) continue
    let seen
    try { seen = await idbRun('fired', 'readonly', (s) => s.get(it.id)) } catch (_) { seen = undefined }
    if (seen !== undefined) continue
    try { await idbRun('fired', 'readwrite', (s) => s.put(now, it.id)) } catch (_) {}
    const t = (it.text && (it.text[lang] || it.text.en)) || ['Prayer reminder', '']
    await self.registration.showNotification(t[0], {
      body: t[1],
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: it.id,
      lang,
      silent: it.sound === 'silent',
      data: { url: '/prayer-times', quranUrl: '/quran' },
      actions: [
        { action: 'open', title: lang === 'bn' ? 'কুরআন খুলুন' : 'Open Quran' },
        { action: 'dismiss', title: lang === 'bn' ? 'বন্ধ করুন' : 'Dismiss' },
      ],
    })
    n++
  }
  return n
}

self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'prayer-check') e.waitUntil(checkPrayers(false))
})

self.addEventListener('notificationclick', (e) => {
  const n = e.notification
  n.close()
  if (e.action === 'dismiss') return
  const data = n.data || {}
  const target = e.action === 'open' ? data.quranUrl || '/quran' : data.url || '/prayer-times'
  e.waitUntil(
    (async () => {
      const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const c of list) {
        if (new URL(c.url).origin !== self.location.origin) continue
        try { await c.focus() } catch (_) {}
        try { if ('navigate' in c) { await c.navigate(target); return } } catch (_) {}
        c.postMessage({ type: 'noor:navigate', url: target })
        return
      }
      await self.clients.openWindow(target)
    })(),
  )
})
