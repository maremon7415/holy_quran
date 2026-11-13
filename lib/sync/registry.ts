'use client'
import type { StoreApi } from 'zustand'
import { useAppStore } from '@/lib/store'
import { useReader } from '@/lib/stores/reader'
import { useHifz } from '@/lib/stores/hifz'
import { useJourney } from '@/lib/stores/journey'
import { useDhikr } from '@/lib/stores/dhikr'
import { usePrayerPrefs } from '@/lib/stores/prayer'
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
  { key: 'noor-prayer-prefs', store: usePrayerPrefs as unknown as StoreApi<Record<string, unknown>>, exclude: [] },
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
