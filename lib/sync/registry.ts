'use client'
import type { StoreApi } from 'zustand'
import { useAppStore } from '@/lib/store'
import { useReader } from '@/lib/stores/reader'
import { useHifz } from '@/lib/stores/hifz'
import { useJourney } from '@/lib/stores/journey'
import { useDhikr } from '@/lib/stores/dhikr'
import { usePrayerPrefs } from '@/lib/stores/prayer'
import { usePlayerPrefs } from '@/lib/audio/prefs'
import type { SyncKey } from './types'

/** Which zustand stores take part in sync, and which fields of them stay on the device. */
export interface SyncedStore {
  key: SyncKey
  store: StoreApi<Record<string, unknown>>
  /** state fields that are device-specific / ephemeral and never leave the device */
  exclude: string[]
}

export const SYNCED_STORES: SyncedStore[] = [
  { key: 'quran-store', store: useAppStore as unknown as StoreApi<Record<string, unknown>>, exclude: ['ui', 'audioState', 'location'] },
  { key: 'noor-reader', store: useReader as unknown as StoreApi<Record<string, unknown>>, exclude: [] },
  { key: 'noor-hifz', store: useHifz as unknown as StoreApi<Record<string, unknown>>, exclude: [] },
  { key: 'noor-journey', store: useJourney as unknown as StoreApi<Record<string, unknown>>, exclude: [] },
  { key: 'noor-dhikr', store: useDhikr as unknown as StoreApi<Record<string, unknown>>, exclude: [] },
  // `tz` belongs to the device's location (quran-store `location`, which never syncs): syncing it alone would show
  // another device's timezone next to this device's coordinates, i.e. wrong prayer times.
  { key: 'noor-prayer-prefs', store: usePrayerPrefs as unknown as StoreApi<Record<string, unknown>>, exclude: ['tz'] },
  { key: 'noor-player', store: usePlayerPrefs as unknown as StoreApi<Record<string, unknown>>, exclude: [] },
]

/** JSON-safe snapshot of a store's data (no functions, no excluded fields). */
export function pickData(s: SyncedStore): Record<string, unknown> {
  const state = s.store.getState()
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(state)) {
    if (typeof v === 'function' || s.exclude.includes(k)) continue
    out[k] = v
  }
  return JSON.parse(JSON.stringify(out))
}

/** Remove device-only fields from data that came from the cloud (older clients may still have sent them). */
export function withoutExcluded(s: SyncedStore, data: Record<string, unknown>): Record<string, unknown> {
  if (!s.exclude.length) return data
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data)) if (!s.exclude.includes(k)) out[k] = v
  return out
}
