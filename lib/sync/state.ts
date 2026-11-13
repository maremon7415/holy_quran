'use client'
import { create } from 'zustand'
import type { DeviceInfo } from './types'
import type { PauseReason } from './meta'

export type SyncStatus = 'disabled' | 'checking' | 'signed-out' | 'paused' | 'idle' | 'syncing' | 'synced' | 'offline' | 'error'

export interface AccountUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface SyncUiState {
  /** null until /api/auth/status answered */
  enabled: boolean | null
  google: boolean
  user: AccountUser | null
  status: SyncStatus
  lastSyncedAt: string | null
  error: string | null
  devices: DeviceInfo[]
  deviceId: string | null
  /** why sync is paused ('remote-reset' = the cloud copy was deleted on another device) */
  pauseReason: PauseReason | null
  patch: (p: Partial<Omit<SyncUiState, 'patch'>>) => void
}

/** Ephemeral (not persisted) client state for the account + sync UI. */
export const useSyncState = create<SyncUiState>((set) => ({
  enabled: null,
  google: false,
  user: null,
  status: 'checking',
  lastSyncedAt: null,
  error: null,
  devices: [],
  deviceId: null,
  pauseReason: null,
  patch: (p) => set(p),
}))
