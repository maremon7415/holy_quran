#!/usr/bin/env node
/**
 * Submit sitemap URLs to IndexNow (Bing → ChatGPT search & Copilot, Yandex, Seznam, Naver …).
 *
 *   INDEXNOW_KEY=… SITE_URL=https://example.com node scripts/indexnow.mjs [mode] [--dry-run] [--limit N]
 *
 * Modes (IndexNow is for CHANGED URLs; resubmitting ~79k unchanged URLs on every push gets a site throttled):
 *   --changed-from <sha>  only the URLs affected by `git diff <sha>..HEAD` (see `selectorsForChanges`): content under
 *                         data/content, data/hadith, data/learn, data/places, data/quran, lib/events, app/** → their
 *                         URL sets; other site code → the core pages; tests/docs/CI only → nothing. Unknown/invalid
 *                         <sha> → the core pages. At most MAX_CHANGED URLs (shallowest paths first).
 *   --core                the core pages (sitemap 0: home, sections, surahs, juz, topics, duas, names) + their /bn twins.
 *   --all                 every sitemap URL (manual runs only).
 *   (no mode)             same as --core.
 *
 * - Reads SITE_URL/sitemap.xml (sitemap index) → every child sitemap → every <loc>.
 * - Checks that SITE_URL/{key}.txt serves the key first (IndexNow rejects submissions otherwise).
 * - POSTs JSON batches of ≤ 10,000 URLs to https://api.indexnow.org/indexnow (override: INDEXNOW_ENDPOINT).
 *   200/202 = accepted; 429 = throttled → logged, remaining batches skipped, exit 0 (retrying only makes it worse).
 * - Exits 0 with a notice when INDEXNOW_KEY or SITE_URL is unset, so CI can run it unconditionally.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const flag = (n) => args.includes(n)
const opt = (n) => { const i = args.indexOf(n); return i === -1 ? undefined : args[i + 1] }

const KEY = process.env.INDEXNOW_KEY?.trim()
const SITE = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/$/, '')
const ENDPOINT = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow'
const BATCH = 10_000
/** Upper bound for a --changed-from submission (one IndexNow batch). */
export const MAX_CHANGED = 10_000
const DRY = flag('--dry-run')
const LIMIT = opt('--limit') ? Number(opt('--limit')) : Infinity
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')

export function chunk(list, size = BATCH) {
  const out = []
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
  return out
}
export const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'))

/* ───────────────────────── changed files → URLs ───────────────────────── */

const section = (seg) => new RegExp(`^/${seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:/|$)`)
const PLACES = [section('prayer-times'), section('ramadan'), section('hijri-date'), section('zakat-calculator')]
/** Files that never change a page (tests, docs, CI, tooling). */
const NO_URLS = [/^tests\//, /^docs\//, /^\.github\//, /^scripts\//, /^README/i, /\.md$/, /^\.(?:gitignore|editorconfig|prettier|eslint)/, /^playwright\.config/, /^vitest\.config/, /^tsconfig\.tsbuildinfo$/, /^test-results\//, /^data\/content\/types\.ts$/, /^data\/learn\/types\.ts$/]
/** App route segments that are not pages. */
const APP_NON_PAGES = new Set(['api', 'md'])

/**
 * Pure mapping from changed repository files to what to submit:
 *  - `patterns`: path regexes (matched against the URL path without the /bn prefix, so both twins are submitted);
 *  - `paths`: exact paths (also without /bn);
 *  - `core`: true when some site code changed that has no narrower URL set → submit the core pages.
 * `opts.surahSlug(n)` maps a surah number to its slug (data/quran/surah/N.json); `opts.hadithPaths(file)` returns the
 * hadith paths changed by a data/hadith file (index diff), or null when unknown (→ the /hadith hubs).
 */
export function selectorsForChanges(files, opts = {}) {
  const patterns = []
  const paths = new Set()
  let core = false
  const add = (re) => { if (!patterns.some((p) => p.source === re.source)) patterns.push(re) }
  for (const raw of files) {
    const f = raw.trim().replace(/^\.\//, '')
    if (!f || NO_URLS.some((re) => re.test(f))) continue
    let m
    if (f === 'data/content/topics.ts') add(section('topics'))
    else if (f === 'data/content/duas.ts') add(section('dua'))
    else if (f === 'data/content/asma-ul-husna.ts') add(section('names-of-allah'))
    else if (f === 'data/content/ar.ts') { add(section('topics')); add(section('dua')); add(section('names-of-allah')) }
    else if (f.startsWith('data/content/')) core = true
    else if (f.startsWith('data/hadith/')) {
      const hp = opts.hadithPaths?.(f)
      if (hp) for (const p of hp) paths.add(p)
      else { add(/^\/hadith$/); add(/^\/hadith\/[^/]+$/) }
    } else if (f.startsWith('data/learn/') || f.startsWith('lib/learn/')) add(section('learn'))
    else if (f.startsWith('data/places/') || f.startsWith('lib/places/')) PLACES.forEach(add)
    else if (f.startsWith('lib/events/')) add(section('events'))
    else if ((m = f.match(/^data\/quran\/(?:surah|info|uccharon)\/(\d+)\.json$/)) && opts.surahSlug?.(Number(m[1]))) add(section(`surah/${opts.surahSlug(Number(m[1]))}`))
    else if (f.startsWith('app/')) {
      // app/<seg>/… and app/bn/<seg>/… → that section; root files (layout, globals.css, page.tsx, sitemap…) → core
      const parts = f.split('/').slice(1)
      if (parts[0] === 'bn') parts.shift()
      const seg = parts.length > 1 ? parts[0] : null
      if (!seg) core = true
      else if (APP_NON_PAGES.has(seg) || seg.startsWith('_')) continue
      else if (seg.startsWith('(')) core = true // route groups (auth pages are not in the sitemap; be safe)
      else if (/\.xml$/.test(seg) || seg === 'sitemap') core = true
      else add(section(seg))
    } else core = true // components, hooks, lib, public, config, package.json …
  }
  return { patterns, paths: [...paths], core }
}

const stripBn = (p) => (p === '/bn' ? '/' : p.startsWith('/bn/') ? p.slice(3) : p)
const depth = (p) => p.split('/').filter(Boolean).length

/**
 * Picks the URLs to submit from every sitemap URL (`all`, in sitemap order) for the selectors; `coreUrls` = sitemap 0.
 * Bounded by `max`, keeping the shallowest paths (hubs before leaves) when a change touches a huge section.
 */
export function selectUrls(all, sel, coreUrls = [], max = MAX_CHANGED) {
  const corePaths = new Set(coreUrls.map((u) => stripBn(new URL(u).pathname)))
  const exact = new Set(sel.paths)
  const out = []
  const seen = new Set()
  for (const u of all) {
    const p = stripBn(new URL(u).pathname)
    if (exact.has(p)) seen.add(p)
    if (exact.has(p) || sel.patterns.some((re) => re.test(p)) || (sel.core && corePaths.has(p))) out.push(u)
  }
  // exact paths that are no longer in the sitemaps (e.g. a hadith now blank → 404) are submitted too, so engines recrawl them
  const origin = all.length ? new URL(all[0]).origin : null
  if (origin) for (const p of exact) if (!seen.has(p)) out.push(`${origin}${p}`, `${origin}/bn${p}`)
  if (out.length <= max) return out
  return out.map((u, i) => ({ u, i, d: depth(stripBn(new URL(u).pathname)) })).sort((a, b) => a.d - b.d || a.i - b.i).slice(0, max).sort((a, b) => a.i - b.i).map((x) => x.u)
}

/**
 * Hadith paths whose content changed between two versions of data/hadith/index.json: numbers that became servable
 * or blank (dead list / range changes), books whose row changed, and the hubs of every touched collection.
 */
export function hadithIndexChanges(oldIx, newIx) {
  const out = new Set()
  const cols = new Set([...Object.keys(oldIx?.collections ?? {}), ...Object.keys(newIx?.collections ?? {})])
  for (const c of cols) {
    const a = oldIx?.collections?.[c], b = newIx?.collections?.[c]
    if (JSON.stringify(a) === JSON.stringify(b)) continue
    out.add('/hadith').add(`/hadith/${c}`)
    if (!a || !b) continue
    const deadA = new Set(a.dead ?? []), deadB = new Set(b.dead ?? [])
    for (const n of deadA) if (!deadB.has(n)) out.add(`/hadith/${c}/${n}`)
    for (const n of deadB) if (!deadA.has(n)) out.add(`/hadith/${c}/${n}`)
    for (let n = Math.min(a.first, b.first); n <= Math.max(a.last, b.last); n++) if ((n >= a.first && n <= a.last) !== (n >= b.first && n <= b.last)) out.add(`/hadith/${c}/${n}`)
    const rowsA = new Map((a.books ?? []).map((r) => [r[0], JSON.stringify(r)]))
    for (const r of b.books ?? []) if (rowsA.get(r[0]) !== JSON.stringify(r)) out.add(`/hadith/${c}/book/${r[0]}`)
  }
  return [...out]
}

function git(...a) {
  return execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 })
}

/** Changed files since `sha` (null when the range cannot be resolved, e.g. a zero sha or a shallow clone). */
function changedFiles(sha) {
  if (!/^[0-9a-f]{7,40}$/i.test(sha ?? '') || /^0+$/.test(sha)) return null
  try { return git('diff', '--name-only', `${sha}..HEAD`).split('\n').filter(Boolean) } catch { return null }
}

function selectorOpts(sha) {
  let chapters = []
  try { chapters = JSON.parse(fs.readFileSync(path.join(root, 'data/quran/chapters.json'), 'utf8')) } catch { /* no slugs */ }
  return {
    surahSlug: (n) => chapters.find((c) => c.id === n)?.slug,
    hadithPaths: (f) => {
      if (f !== 'data/hadith/index.json') return null
      try { return hadithIndexChanges(JSON.parse(git('show', `${sha}:${f}`)), JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'))) } catch { return null }
    },
  }
}

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'noor-indexnow/1.0' } })
  if (!r.ok) throw new Error(`GET ${url} → ${r.status}`)
  return r.text()
}

/** 200 OK / 202 Accepted (key validation pending) = accepted; 429 = throttled (not a failure); other 4xx/5xx = error. */
export function submissionOutcome(status) {
  if (status === 429) return 'throttled'
  if (status >= 200 && status < 300) return status === 202 ? 'accepted (pending key validation)' : 'accepted'
  return 'error'
}

async function main() {
  if (!KEY || !SITE) {
    console.log(`IndexNow: skipped (${!KEY ? 'INDEXNOW_KEY' : 'SITE_URL'} not set).`)
    return
  }
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(KEY)) throw new Error('INDEXNOW_KEY must be 8–128 chars of a-z, A-Z, 0-9, "-"')
  const host = new URL(SITE).host
  const keyLocation = `${SITE}/${KEY}.txt`

  const served = (await get(keyLocation).catch((e) => `ERR ${e.message}`)).trim()
  if (served !== KEY) {
    if (DRY) console.warn(`warning: ${keyLocation} does not serve the key yet (${served.slice(0, 60)})`)
    else throw new Error(`${keyLocation} must return the key (got: ${served.slice(0, 80)}). Set INDEXNOW_KEY on the deployment too.`)
  }

  const index = await get(`${SITE}/sitemap.xml`)
  const maps = locs(index)
  const urls = new Set()
  let coreUrls = []
  for (const m of maps.length ? maps : [`${SITE}/sitemap.xml`]) {
    const list = locs(await get(m)).filter((u) => new URL(u).host === host)
    if (/\/sitemap\/0\.xml$/.test(m) || !maps.length) coreUrls = list
    for (const u of list) urls.add(u)
  }
  const all = [...urls]
  let mode, picked
  if (flag('--all')) { mode = 'all'; picked = all }
  else if (opt('--changed-from') !== undefined) {
    const sha = opt('--changed-from')
    const files = changedFiles(sha)
    if (!files) { mode = `changed-from ${sha}: range unavailable → core pages`; picked = selectUrls(all, { patterns: [], paths: [], core: true }, coreUrls) }
    else {
      const sel = selectorsForChanges(files, selectorOpts(sha))
      mode = `changed-from ${sha.slice(0, 12)}: ${files.length} file(s) → ${sel.patterns.length} section(s), ${sel.paths.length} path(s)${sel.core ? ', core pages' : ''}`
      picked = selectUrls(all, sel, coreUrls)
    }
  } else { mode = 'core pages'; picked = selectUrls(all, { patterns: [], paths: [], core: true }, coreUrls) }
  const list = picked.slice(0, LIMIT)
  const batches = chunk(list)
  console.log(`IndexNow (${mode}): ${list.length} of ${all.length} URLs from ${maps.length} sitemaps → ${batches.length} batch(es) → ${ENDPOINT}${DRY ? ' (dry run)' : ''}`)
  if (DRY) { for (const u of list.slice(0, 50)) console.log(`  ${u}`); return }
  if (!list.length) { console.log('IndexNow: nothing to submit.'); return }

  for (const [i, urlList] of batches.entries()) {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key: KEY, keyLocation, urlList }),
    })
    const outcome = submissionOutcome(r.status)
    console.log(`  batch ${i + 1}/${batches.length}: ${urlList.length} URLs → HTTP ${r.status} (${outcome})`)
    if (outcome === 'throttled') {
      console.warn(`::warning::IndexNow answered 429 (too many requests); skipping the remaining ${batches.length - i - 1} batch(es). Not an error: try again later.`)
      return
    }
    if (outcome === 'error') throw new Error(`IndexNow rejected batch ${i + 1}: ${r.status} ${await r.text().catch(() => '')}`)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(`IndexNow failed: ${e.message}`); process.exit(1) })
}
