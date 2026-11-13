#!/usr/bin/env node
/**
 * Submit every sitemap URL to IndexNow (Bing → ChatGPT search & Copilot, Yandex, Seznam, Naver …).
 *
 *   INDEXNOW_KEY=… SITE_URL=https://example.com node scripts/indexnow.mjs [--dry-run] [--limit N]
 *
 * - Reads SITE_URL/sitemap.xml (sitemap index) → every child sitemap → every <loc>.
 * - Checks that SITE_URL/{key}.txt serves the key first (IndexNow rejects submissions otherwise).
 * - POSTs JSON batches of ≤ 10,000 URLs to https://api.indexnow.org/indexnow (override: INDEXNOW_ENDPOINT).
 * - Exits 0 with a notice when INDEXNOW_KEY or SITE_URL is unset, so CI can run it unconditionally.
 */
const args = process.argv.slice(2)
const flag = (n) => args.includes(n)
const opt = (n) => { const i = args.indexOf(n); return i === -1 ? undefined : args[i + 1] }

const KEY = process.env.INDEXNOW_KEY?.trim()
const SITE = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/$/, '')
const ENDPOINT = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow'
const BATCH = 10_000
const DRY = flag('--dry-run')
const LIMIT = opt('--limit') ? Number(opt('--limit')) : Infinity

export function chunk(list, size = BATCH) {
  const out = []
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
  return out
}
export const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'))

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'noor-indexnow/1.0' } })
  if (!r.ok) throw new Error(`GET ${url} → ${r.status}`)
  return r.text()
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
  for (const m of maps.length ? maps : [`${SITE}/sitemap.xml`]) {
    for (const u of locs(await get(m))) if (new URL(u).host === host) urls.add(u)
  }
  const list = [...urls].slice(0, LIMIT)
  const batches = chunk(list)
  console.log(`IndexNow: ${list.length} URLs from ${maps.length} sitemaps → ${batches.length} batch(es) → ${ENDPOINT}${DRY ? ' (dry run)' : ''}`)
  if (DRY) return

  for (const [i, urlList] of batches.entries()) {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key: KEY, keyLocation, urlList }),
    })
    // 200 OK / 202 Accepted (key validation pending) are both success
    console.log(`  batch ${i + 1}/${batches.length}: ${urlList.length} URLs → HTTP ${r.status}`)
    if (r.status >= 400) throw new Error(`IndexNow rejected batch ${i + 1}: ${r.status} ${await r.text().catch(() => '')}`)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(`IndexNow failed: ${e.message}`); process.exit(1) })
}
