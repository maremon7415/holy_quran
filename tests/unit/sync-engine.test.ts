import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { handleDelete, handleGet, handlePut } from '@/lib/sync/handlers'
import { memoryRepo } from '@/lib/sync/repo'
import { hashData } from '@/lib/sync/merge'

/**
 * Client sync engine against an in-memory server. Each "device" is a fresh module graph (engine + real zustand stores)
 * with its own localStorage; `on(device, fn)` points the globals at that device before running `fn`.
 * Timers are faked (the 2.5 s debounce never fires on its own; syncs are triggered explicitly) and the clock is
 * advanced by hand so edit times are distinct.
 */

class MemStorage {
  private m = new Map<string, string>()
  get length() {
    return this.m.size
  }
  key(i: number) {
    return [...this.m.keys()][i] ?? null
  }
  getItem(k: string) {
    return this.m.has(k) ? this.m.get(k)! : null
  }
  setItem(k: string, v: string) {
    this.m.set(k, String(v))
  }
  removeItem(k: string) {
    this.m.delete(k)
  }
  clear() {
    this.m.clear()
  }
}

const USER = { id: 'u1', email: 'a@example.com', name: 'A' }
/** the account the fake server serves */
let serverUser = USER.id
let repo = memoryRepo()
type Call = { method: string; body?: any; device?: string; status?: number }
let calls: Call[] = []
/** runs before the server handles a request; may return a Response to short-circuit */
let beforeHandle: ((c: Call) => Promise<void> | void) | null = null

async function serverFetch(_url: string, init?: RequestInit) {
  const method = init?.method ?? 'GET'
  const body = init?.body ? JSON.parse(String(init.body)) : undefined
  const call: Call = { method, body, device: body?.device?.id }
  calls.push(call)
  if (beforeHandle) await beforeHandle(call)
  const r = method === 'GET' ? await handleGet(repo, serverUser) : method === 'PUT' ? await handlePut(repo, serverUser, String(init!.body)) : await handleDelete(repo, serverUser)
  call.status = r.status
  return new Response(JSON.stringify(r.body), { status: r.status, headers: { 'Content-Type': 'application/json' } })
}

interface Device {
  name: string
  storage: MemStorage
  engine: typeof import('@/lib/sync/engine')
  state: typeof import('@/lib/sync/state').useSyncState
  app: typeof import('@/lib/store').useAppStore
  hifz: typeof import('@/lib/stores/hifz').useHifz
  journey: typeof import('@/lib/stores/journey').useJourney
  prayer: typeof import('@/lib/stores/prayer').usePrayerPrefs
  meta(): any
}

const noop = () => {}
function useGlobals(storage: MemStorage) {
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('window', { localStorage: storage, addEventListener: noop, removeEventListener: noop, location: { origin: 'http://localhost' } })
  vi.stubGlobal('document', { visibilityState: 'visible', addEventListener: noop, removeEventListener: noop })
  vi.stubGlobal('navigator', { onLine: true, userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/130' })
  vi.stubGlobal('fetch', serverFetch)
}

/** `storage` given = the same device after a page reload. */
async function makeDevice(name: string, storage = new MemStorage()): Promise<Device> {
  useGlobals(storage)
  vi.resetModules()
  const engine = await import('@/lib/sync/engine')
  const { useSyncState } = await import('@/lib/sync/state')
  const { useAppStore } = await import('@/lib/store')
  const { useHifz } = await import('@/lib/stores/hifz')
  const { useJourney } = await import('@/lib/stores/journey')
  const { usePrayerPrefs } = await import('@/lib/stores/prayer')
  return {
    name, storage, engine, state: useSyncState, app: useAppStore, hifz: useHifz, journey: useJourney, prayer: usePrayerPrefs,
    meta: () => JSON.parse(storage.getItem('nq-sync-meta') ?? 'null'),
  }
}

async function on<T>(d: Device, fn: () => T | Promise<T>): Promise<T> {
  useGlobals(d.storage)
  const out = await fn()
  await d.engine._idle()
  return out
}
const signIn = (d: Device) => on(d, () => d.engine.start(USER))
const sync = (d: Device) => on(d, () => d.engine.sync('test'))
const tick = (ms = 60_000) => vi.setSystemTime(Date.now() + ms)
const ayahs = (d: Device) => d.app.getState().importantAyahs.map((a) => `${a.surahNumber}:${a.ayahNumber}`).sort()
const remote = (key: string) => repo.dump().get(USER.id)?.stores[key]?.data as any
const puts = () => calls.filter((c) => c.method === 'PUT')

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] })
  vi.setSystemTime(new Date('2026-03-01T10:00:00Z'))
  repo = memoryRepo()
  serverUser = USER.id
  calls = []
  beforeHandle = null
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

/** A has bookmarks/favourites/duas/cards/khatams and syncs first; B signs in and pulls everything. */
async function twoSyncedDevices() {
  const A = await makeDevice('A')
  await on(A, () => {
    const s = A.app.getState()
    s.addImportantAyah({ surahNumber: 2, ayahNumber: 255, tags: [] })
    s.addImportantAyah({ surahNumber: 1, ayahNumber: 1, tags: [] })
    s.toggleFavoriteSurah(36)
    s.toggleFavoriteSurah(67)
    s.toggleDuaBookmark('dua-1')
    s.toggleDuaBookmark('dua-2')
    A.hifz.getState().grade(['112:1', '112:2'], 4 as any)
    A.journey.getState().create({ kind: 'days', days: 30 })
  })
  await signIn(A)
  tick()
  const B = await makeDevice('B')
  await signIn(B)
  expect(ayahs(B)).toEqual(['1:1', '2:255'])
  tick()
  return { A, B }
}

describe('sync engine — deletions survive concurrent edits (tombstones)', () => {
  it('A deletes 2:255 + pushes; B reads a verse; B syncs → bookmark stays deleted everywhere', async () => {
    const { A, B } = await twoSyncedDevices()
    await on(A, () => A.app.getState().removeImportantAyah(2, 255))
    await sync(A)
    tick()
    await on(B, () => B.app.getState().markAyahAsRead(1, 2))
    await sync(B)
    expect(ayahs(B)).toEqual(['1:1'])
    expect(B.app.getState().readVerses.some((v) => v.surahNumber === 1 && v.ayahNumber === 2)).toBe(true)
    expect(remote('quran-store').importantAyahs.map((a: any) => `${a.surahNumber}:${a.ayahNumber}`)).toEqual(['1:1'])
    tick()
    await sync(A)
    expect(ayahs(A)).toEqual(['1:1'])
    expect(A.app.getState().readVerses.some((v) => v.surahNumber === 1 && v.ayahNumber === 2)).toBe(true)
  })

  it('favourite surah and bookmarked dua stay deleted', async () => {
    const { A, B } = await twoSyncedDevices()
    await on(A, () => {
      A.app.getState().toggleFavoriteSurah(36)
      A.app.getState().toggleDuaBookmark('dua-1')
    })
    await sync(A)
    tick()
    await on(B, () => B.app.getState().setDailyGoal(20))
    await sync(B)
    expect(B.app.getState().favoriteSurahs).toEqual([67])
    expect(B.app.getState().bookmarkedDuas).toEqual(['dua-2'])
    expect(B.app.getState().dailyGoal).toBe(20)
  })

  it('hifz card (removeCard) stays deleted while B reviews another card', async () => {
    const { A, B } = await twoSyncedDevices()
    await on(A, () => A.hifz.getState().removeCard('112:1'))
    await sync(A)
    tick()
    await on(B, () => B.hifz.getState().grade(['112:3'], 4 as any))
    await sync(B)
    expect(Object.keys(B.hifz.getState().cards).sort()).toEqual(['112:2', '112:3'])
    await sync(A)
    expect(Object.keys(A.hifz.getState().cards).sort()).toEqual(['112:2', '112:3'])
  })

  it('khatam plan (remove) stays deleted while B creates another one', async () => {
    const { A, B } = await twoSyncedDevices()
    const first = A.journey.getState().khatams[0].id
    await on(A, () => A.journey.getState().remove(first))
    await sync(A)
    tick()
    await on(B, () => B.journey.getState().create({ kind: 'days', days: 10 }))
    await sync(B)
    const ids = B.journey.getState().khatams.map((k) => k.id)
    expect(ids).not.toContain(first)
    expect(ids).toHaveLength(1)
  })

  it('sign-out → sign-in (merge base forgotten) does not resurrect', async () => {
    const { A, B } = await twoSyncedDevices()
    await on(B, () => B.engine.stop())
    expect(B.meta().version).toBe(0)
    await on(A, () => {
      A.app.getState().removeImportantAyah(2, 255)
      A.app.getState().toggleFavoriteSurah(36)
    })
    await sync(A)
    tick()
    await on(B, () => B.app.getState().markAyahAsRead(3, 1)) // edits while signed out
    await signIn(B)
    expect(ayahs(B)).toEqual(['1:1'])
    expect(B.app.getState().favoriteSurahs).toEqual([67])
    expect(remote('quran-store').favoriteSurahs).toEqual([67])
  })

  it('re-adding after a delete wins when it is newer', async () => {
    const { A, B } = await twoSyncedDevices()
    await on(A, () => A.app.getState().removeImportantAyah(2, 255))
    await sync(A)
    await sync(B)
    expect(ayahs(B)).toEqual(['1:1'])
    tick()
    // B re-adds while A concurrently changes something else → union path
    await on(B, () => B.app.getState().addImportantAyah({ surahNumber: 2, ayahNumber: 255, tags: ['again'] }))
    await on(A, () => A.app.getState().markAyahAsRead(1, 3))
    await sync(A)
    tick()
    await sync(B)
    expect(ayahs(B)).toEqual(['1:1', '2:255'])
    await sync(A)
    expect(ayahs(A)).toEqual(['1:1', '2:255'])
    expect(A.app.getState().importantAyahs.find((a) => a.ayahNumber === 255)!.tags).toEqual(['again'])
  })
})

describe('sync engine — bookkeeping', () => {
  it('records the merge base after a sync and only pushes what changed', async () => {
    const A = await makeDevice('A')
    await on(A, () => A.app.getState().toggleFavoriteSurah(1))
    await signIn(A)
    const m = A.meta()
    expect(m.version).toBe(1)
    expect(m.epoch).toBe(0)
    expect(m.userId).toBe(USER.id)
    expect(m.stores['quran-store'].syncedHash).toBe(hashData(remote('quran-store')))
    expect(A.state.getState().status).toBe('synced')
    // nothing changed → GET only, no PUT
    calls = []
    await sync(A)
    expect(calls.map((c) => c.method)).toEqual(['GET'])
    // one store changed → only that store is sent
    tick()
    await on(A, () => A.app.getState().toggleFavoriteSurah(2))
    calls = []
    await sync(A)
    expect(puts()).toHaveLength(1)
    expect(Object.keys(puts()[0].body.stores)).toEqual(['quran-store'])
    expect(puts()[0].body).toMatchObject({ version: 1, epoch: 0 })
  })

  it('adopts a remote-only change without pushing it back', async () => {
    const A = await makeDevice('A')
    await signIn(A)
    const B = await makeDevice('B')
    await signIn(B)
    tick()
    await on(A, () => A.app.getState().toggleFavoriteSurah(5))
    await sync(A)
    calls = []
    await sync(B)
    expect(B.app.getState().favoriteSurahs).toEqual([5])
    expect(puts()).toHaveLength(0)
  })

  it('409: re-merges against the newer copy and retries', async () => {
    const A = await makeDevice('A')
    await signIn(A)
    tick()
    await on(A, () => A.app.getState().toggleFavoriteSurah(7))
    // another device sneaks in a write right before A's PUT
    let injected = false
    beforeHandle = async (c) => {
      if (c.method !== 'PUT' || injected) return
      injected = true
      const cur = (await repo.get(USER.id))!
      const qs = cur.stores['quran-store'] as any
      await repo.put(USER.id, cur.version, { 'quran-store': { updatedAt: new Date().toISOString(), data: { ...qs.data, favoriteSurahs: [9] } } }, { id: 'dev-other', name: 'Other' }, cur.epoch)
    }
    calls = []
    await sync(A)
    expect(puts().map((c) => c.status)).toEqual([409, 200])
    expect([...A.app.getState().favoriteSurahs].sort()).toEqual([7, 9])
    expect([...remote('quran-store').favoriteSurahs].sort()).toEqual([7, 9])
    expect(A.state.getState().status).toBe('synced')
    expect(A.meta().version).toBe(repo.dump().get(USER.id)!.version)
  })

  it('gives up after 4 conflicts and schedules a retry instead of looping', async () => {
    const A = await makeDevice('A')
    await signIn(A)
    tick()
    await on(A, () => A.app.getState().toggleFavoriteSurah(7))
    beforeHandle = async (c) => {
      if (c.method !== 'PUT') return
      const cur = (await repo.get(USER.id))!
      await repo.put(USER.id, cur.version, { 'noor-reader': { updatedAt: new Date().toISOString(), data: { n: Math.random() } } }, undefined, cur.epoch)
    }
    calls = []
    await sync(A)
    expect(puts()).toHaveLength(4)
    expect(A.state.getState().status).toBe('error')
    beforeHandle = null
    await on(A, () => vi.advanceTimersByTime(15_000)) // the scheduled retry
    expect(A.state.getState().status).toBe('synced')
  })

  it('stop(): forgets the merge base but keeps tombstones; sync() is then a no-op', async () => {
    const { A } = await twoSyncedDevices()
    await on(A, () => A.app.getState().removeImportantAyah(2, 255))
    await on(A, () => A.engine.stop())
    const m = A.meta()
    expect(m.version).toBe(0)
    expect(m.userId).toBeUndefined()
    expect(m.lastUserId).toBe(USER.id)
    expect(m.stores['quran-store'].syncedHash).toBeUndefined()
    expect(A.state.getState().status).toBe('signed-out')
    calls = []
    await sync(A)
    expect(calls).toHaveLength(0)
    // the deletion made while signed out is still known (observed at the next sign-in)
    await signIn(A)
    expect(A.meta().stores['quran-store'].clock.del['importantAyahs/2:255']).toBeTruthy()
    expect(remote('quran-store').importantAyahs).toHaveLength(1)
  })

  it('a store changed while no engine was watching (backup restore + reload) is not tombstoned', async () => {
    const { A } = await twoSyncedDevices()
    // Settings → restore an older backup without 2:255, then the page reloads
    const raw = JSON.parse(A.storage.getItem('quran-store')!)
    raw.state.importantAyahs = raw.state.importantAyahs.filter((a: any) => a.ayahNumber !== 255)
    A.storage.setItem('quran-store', JSON.stringify(raw))
    const A2 = await makeDevice('A', A.storage)
    await on(A2, () => A2.engine.track())
    expect(A2.meta().stores['quran-store'].clock?.del ?? {}).toEqual({})
    expect(A2.meta().stores['quran-store'].ids).not.toContain('importantAyahs/2:255')
  })

  it('a different account on the same device does not inherit the previous account\'s tombstones', async () => {
    const { A } = await twoSyncedDevices()
    await on(A, () => A.app.getState().toggleFavoriteSurah(36))
    await sync(A)
    expect(A.meta().stores['quran-store'].clock.del['favoriteSurahs/36']).toBeTruthy()
    await on(A, () => A.engine.stop())
    serverUser = 'u2'
    await on(A, () => A.engine.start({ id: 'u2' }))
    expect(A.meta().stores['quran-store'].clock?.del ?? {}).toEqual({})
    expect(repo.dump().get('u2')!.stores['quran-store'].data).not.toHaveProperty('_clock')
    // …and the same account signing in again keeps them (tested above in "sign-out → sign-in")
  })
})

describe('sync engine — "Delete my cloud data"', () => {
  it('deleteCloud() clears the server copy, pauses this device and keeps local data', async () => {
    const { A } = await twoSyncedDevices()
    await on(A, () => A.engine.deleteCloud())
    expect(repo.dump().get(USER.id)).toMatchObject({ stores: {}, epoch: 1 })
    expect(A.state.getState()).toMatchObject({ status: 'paused', pauseReason: 'user' })
    expect(A.meta()).toMatchObject({ paused: true, epoch: 1, version: 0 })
    expect(ayahs(A)).toEqual(['1:1', '2:255'])
    calls = []
    await sync(A)
    expect(calls).toHaveLength(0)
  })

  it('another device does not re-upload: it pauses with a notice until sync is turned back on', async () => {
    const { A, B } = await twoSyncedDevices()
    await on(A, () => A.engine.deleteCloud())
    tick()
    await on(B, () => B.app.getState().toggleFavoriteSurah(1))
    calls = []
    await sync(B)
    expect(puts()).toHaveLength(0)
    expect(repo.dump().get(USER.id)!.stores).toEqual({})
    expect(B.state.getState()).toMatchObject({ status: 'paused', pauseReason: 'remote-reset' })
    expect(B.meta()).toMatchObject({ paused: true, pauseReason: 'remote-reset', epoch: 1, version: 0 })
    // the notice survives a reload (start() reads the persisted reason)
    await on(B, () => B.engine.start(USER))
    expect(B.state.getState().pauseReason).toBe('remote-reset')
    // user turns sync back on → this device's data is uploaded under the new epoch
    await on(B, () => B.engine.resume())
    expect(B.state.getState().status).toBe('synced')
    expect(remote('quran-store').favoriteSurahs).toContain(1)
    expect(repo.dump().get(USER.id)!.epoch).toBe(1)
  })

  it('a delete that lands while another device is mid-sync (409 epoch_mismatch) pauses it instead of retrying with version 0', async () => {
    const { A, B } = await twoSyncedDevices()
    await on(B, () => B.app.getState().toggleFavoriteSurah(2))
    beforeHandle = async (c) => {
      if (c.method === 'PUT' && c.device === B.meta().deviceId) {
        beforeHandle = null
        await handleDelete(repo, USER.id) // A deletes the cloud copy between B's GET and PUT
      }
    }
    calls = []
    await sync(B)
    expect(puts().map((c) => c.status)).toEqual([409])
    expect(repo.dump().get(USER.id)!.stores).toEqual({})
    expect(B.state.getState().pauseReason).toBe('remote-reset')
    void A
  })

  it('deleteCloud() during an in-flight sync: the in-flight sync does not push the data back', async () => {
    const { A } = await twoSyncedDevices()
    await on(A, () => A.app.getState().toggleFavoriteSurah(3))
    let release!: () => void
    const gate = new Promise<void>((r) => (release = r))
    beforeHandle = async (c) => {
      if (c.method === 'GET') {
        beforeHandle = null
        await gate
      }
    }
    calls = []
    useGlobals(A.storage)
    const p = A.engine.sync('test') // stuck on GET
    await Promise.resolve()
    await A.engine.deleteCloud() // DELETE goes through while the sync waits
    release()
    await p
    await A.engine._idle()
    expect(repo.dump().get(USER.id)!.stores).toEqual({})
    expect(puts()).toHaveLength(0)
    expect(A.state.getState()).toMatchObject({ status: 'paused', pauseReason: 'user' })
  })
})

describe('sync engine — device-specific fields', () => {
  it('noor-prayer-prefs never carries the timezone (it belongs to the unsynced location)', async () => {
    const A = await makeDevice('A')
    await on(A, () => {
      A.prayer.getState().setTz('Asia/Dhaka')
      A.prayer.getState().setMadhab('shafi')
    })
    await signIn(A)
    const data = remote('noor-prayer-prefs')
    expect(data).toBeTruthy()
    expect(data.madhab).toBe('shafi')
    expect('tz' in data).toBe(false)

    const B = await makeDevice('B')
    await on(B, () => B.prayer.getState().setTz('Europe/London'))
    // a legacy payload that still contains tz must not overwrite this device's timezone
    const cur = repo.dump().get(USER.id)!
    cur.stores['noor-prayer-prefs'] = { updatedAt: new Date(Date.now() + 1000).toISOString(), data: { ...data, tz: 'Asia/Dhaka' } }
    await signIn(B)
    expect(B.prayer.getState().madhab).toBe('shafi')
    expect(B.prayer.getState().tz).toBe('Europe/London')
  })

  it('registry excludes tz from the noor-prayer-prefs payload', async () => {
    const A = await makeDevice('A')
    const { SYNCED_STORES, pickData } = await import('@/lib/sync/registry')
    A.prayer.getState().setTz('Asia/Karachi')
    const entry = SYNCED_STORES.find((s) => s.key === 'noor-prayer-prefs')!
    expect(pickData(entry)).not.toHaveProperty('tz')
  })
})
