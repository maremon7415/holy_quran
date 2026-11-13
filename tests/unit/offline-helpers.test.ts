import { describe, it, expect, afterEach, vi } from 'vitest'
import { fmtBytes, findCache, cachedPagePaths, deleteDownloadedPages, hasCacheApi, AUDIO_CACHE, CHANNEL } from '@/lib/offline/cache'
import { allPagePaths } from '@/lib/offline/pages'
import { audioKey, metaUrl } from '@/lib/offline/audio-cache'
import { chapters } from '@/lib/quran/chapters'

/** Minimal in-memory CacheStorage. */
function fakeCaches(store: Record<string, string[]>) {
  const deleted: string[] = []
  return {
    deleted,
    keys: async () => Object.keys(store),
    delete: async (k: string) => { deleted.push(k); delete store[k]; return true },
    open: async (k: string) => ({ keys: async () => (store[k] ?? []).map((u) => ({ url: u })) }),
  }
}

afterEach(() => vi.unstubAllGlobals())

describe('fmtBytes', () => {
  it('scales units and precision', () => {
    expect(fmtBytes(0)).toBe('0 B')
    expect(fmtBytes(1023)).toBe('1023 B')
    expect(fmtBytes(1024)).toBe('1 KB')
    expect(fmtBytes(72 * 1024)).toBe('72 KB')
    expect(fmtBytes(5.5 * 1024 ** 2)).toBe('5.5 MB')
    expect(fmtBytes(250 * 1024 ** 2)).toBe('250 MB')
    expect(fmtBytes(3 * 1024 ** 3)).toBe('3.00 GB')
  })
})

describe('allPagePaths', () => {
  it('lists /quran, /offline and the 114 surah pages (plus 30 juz on request)', () => {
    const base = allPagePaths(false)
    expect(base.slice(0, 2)).toEqual(['/quran', '/offline'])
    expect(base).toHaveLength(2 + 114)
    expect(base).toContain('/surah/al-fatihah')
    expect(base).toContain(`/surah/${chapters[113].slug}`)
    const all = allPagePaths(true)
    expect(all).toHaveLength(2 + 114 + 30)
    expect(all).toContain('/juz/1')
    expect(all).toContain('/juz/30')
    expect(new Set(all).size).toBe(all.length)
  })
})

describe('audio cache keys / urls', () => {
  it('builds stable identifiers', () => {
    expect(audioKey(7, 36)).toBe('7:36')
    expect(metaUrl(7, 36)).toContain('/reciters/7/')
    expect(metaUrl(7, 36)).toContain('chapter=36')
    expect(AUDIO_CACHE).toBe('noor-audio-v1')
    expect(CHANNEL).toBe('noor-offline')
  })
})

describe('Cache Storage helpers', () => {
  it('report that the Cache API is missing and degrade gracefully', async () => {
    vi.stubGlobal('caches', undefined)
    expect(hasCacheApi()).toBe(false)
    expect(await findCache('pages')).toBeNull()
    expect((await cachedPagePaths()).size).toBe(0)
    await expect(deleteDownloadedPages()).resolves.toBeUndefined()
  })

  it('findCache returns the versioned cache of the requested kind and ignores others', async () => {
    const c = fakeCaches({ 'noor-v2abc-pages': [], 'noor-v2abc-assets': [], 'noor-v1-pages': [], 'other-pages': [] })
    vi.stubGlobal('caches', c)
    expect(await findCache('pages')).not.toBeNull()
    expect(await findCache('api')).toBeNull()
  })

  it('cachedPagePaths merges the stable downloads cache with the current pages cache (pathnames only)', async () => {
    vi.stubGlobal('caches', fakeCaches({
      'noor-downloads-v1': ['https://noor.test/surah/al-fatihah?x=1', 'https://noor.test/quran'],
      'noor-v2abc-pages': ['https://noor.test/juz/30', 'https://noor.test/quran'],
      'noor-v2abc-assets': ['https://noor.test/_next/static/a.js'],
    }))
    expect([...(await cachedPagePaths())].sort()).toEqual(['/juz/30', '/quran', '/surah/al-fatihah'])
  })

  it('deleteDownloadedPages removes page caches but keeps audio and unrelated caches', async () => {
    const c = fakeCaches({ 'noor-v2abc-pages': [], 'noor-downloads-v1': [], 'noor-downloads-assets-v1': [], 'noor-audio-v1': [], 'noor-v2abc-assets': [] })
    vi.stubGlobal('caches', c)
    await deleteDownloadedPages()
    expect(c.deleted.sort()).toEqual(['noor-downloads-assets-v1', 'noor-downloads-v1', 'noor-v2abc-pages'])
  })

  it('swallows Cache API failures', async () => {
    vi.stubGlobal('caches', { keys: async () => { throw new Error('boom') }, open: async () => { throw new Error('boom') } })
    expect(await findCache('pages')).toBeNull()
  })
})
