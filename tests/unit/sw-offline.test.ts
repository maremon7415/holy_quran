import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

/** Evaluate public/sw.js in a sandbox with a minimal fake Cache Storage / fetch and return its listeners + helpers. */
function loadSw(opts: { cached?: Record<string, string>; online?: boolean; connection?: any; build?: string } = {}) {
  const src = fs.readFileSync(path.resolve(__dirname, '../../public/sw.js'), 'utf8')
  const origin = 'https://noor.test'
  const listeners: Record<string, (e: any) => void> = {}
  const store = new Map<string, Map<string, string>>()
  const put = (cache: string, url: string, body: string) => { if (!store.has(cache)) store.set(cache, new Map()); store.get(cache)!.set(new URL(url, origin).href, body) }
  for (const [u, b] of Object.entries(opts.cached ?? {})) put('noor-downloads-v1', u, b)
  const res = (b: string) => new Response(b, { status: 200 })
  const cachesApi = {
    match: async (r: any) => { const u = new URL(typeof r === 'string' ? r : r.url, origin).href; for (const m of store.values()) if (m.has(u)) return res(m.get(u)!); return undefined },
    open: async (name: string) => ({
      match: async (r: any) => { const u = new URL(typeof r === 'string' ? r : r.url, origin).href; const b = store.get(name)?.get(u); return b === undefined ? undefined : res(b) },
      put: async (r: any, resp: Response) => put(name, typeof r === 'string' ? r : r.url, await resp.text()),
      add: async () => {}, keys: async () => [...(store.get(name)?.keys() ?? [])].map((url) => ({ url })), delete: async () => true,
    }),
    keys: async () => [...store.keys()],
    delete: async (k: string) => store.delete(k),
  }
  const fetched: string[] = []
  const sandbox: any = {
    self: { location: { href: `${origin}/sw.js?v=${opts.build ?? 'abc'}`, origin }, addEventListener: (t: string, fn: any) => { listeners[t] = fn }, navigator: { onLine: opts.online ?? false, connection: opts.connection }, skipWaiting: () => {}, clients: { claim: async () => {}, matchAll: async () => [] } },
    caches: cachesApi, URL, Request, Response, Headers, setTimeout, clearTimeout, Promise, console,
    fetch: async (r: any) => { fetched.push(typeof r === 'string' ? r : r.url); throw new Error('offline') },
    indexedDB: {},
  }
  vm.createContext(sandbox)
  vm.runInContext(src + '\n;this.__t = { twinPath, dataOk };', sandbox)
  const navigate = async (pathname: string) => {
    let out: Promise<Response> | undefined
    const e = { request: new Request(origin + pathname, { headers: { accept: 'text/html' } }), respondWith: (p: Promise<Response>) => { out = p }, waitUntil: () => {} }
    Object.defineProperty(e.request, 'mode', { value: 'navigate' })
    listeners.fetch(e)
    const r = await out!
    return r.text()
  }
  return { navigate, helpers: sandbox.__t, fetched }
}

describe('service worker: /bn <-> / twin fallback', () => {
  it('twinPath maps both directions', () => {
    const { helpers } = loadSw()
    expect(helpers.twinPath('/bn/surah/al-baqarah')).toBe('/surah/al-baqarah')
    expect(helpers.twinPath('/surah/al-baqarah')).toBe('/bn/surah/al-baqarah')
    expect(helpers.twinPath('/bn')).toBe('/')
    expect(helpers.twinPath('/')).toBe('/bn')
  })

  it('offline: /bn/surah/x serves the downloaded English twin when the Bangla page is not cached', async () => {
    const sw = loadSw({ cached: { '/surah/al-fatihah': 'EN-PAGE', '/offline': 'OFFLINE' } })
    expect(await sw.navigate('/bn/surah/al-fatihah')).toBe('EN-PAGE')
  })

  it('offline: /surah/x serves the downloaded Bangla twin when only /bn/surah/x is cached', async () => {
    const sw = loadSw({ cached: { '/bn/surah/al-fatihah': 'BN-PAGE', '/offline': 'OFFLINE' } })
    expect(await sw.navigate('/surah/al-fatihah')).toBe('BN-PAGE')
  })

  it('prefers the exact page over the twin, and the offline page when neither is cached', async () => {
    const both = loadSw({ cached: { '/surah/al-fatihah': 'EN', '/bn/surah/al-fatihah': 'BN', '/offline': 'OFFLINE' } })
    expect(await both.navigate('/bn/surah/al-fatihah')).toBe('BN')
    const none = loadSw({ cached: { '/offline': 'OFFLINE' } })
    expect(await none.navigate('/bn/surah/yasin')).toBe('OFFLINE')
  })
})

describe('service worker: metered-connection gate', () => {
  it.each([
    [undefined, true],
    [{ effectiveType: '4g' }, true],
    [{ effectiveType: '4g', saveData: false }, true],
    [{ effectiveType: '4g', saveData: true }, false],
    [{ effectiveType: '3g' }, false],
    [{ effectiveType: '2g' }, false],
    [{ effectiveType: 'slow-2g' }, false],
  ])('connection %j -> background refresh allowed: %s', (connection, ok) => {
    expect(loadSw({ connection }).helpers.dataOk()).toBe(ok)
  })
})
