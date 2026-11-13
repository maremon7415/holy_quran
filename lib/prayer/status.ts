'use client'
import { create } from 'zustand'
import type { ReminderItem } from './reminders'

export type PeriodicState = 'unknown' | 'active' | 'unsupported' | 'blocked' | 'off'
interface Status {
  permission: NotificationPermission | 'unsupported'
  swReady: boolean
  periodic: PeriodicState
  standalone: boolean
  ios: boolean
  next: ReminderItem | null
  scheduled: number
  set: (p: Partial<Omit<Status, 'set'>>) => void
}
/** Live (non-persisted) reminder runtime status, written by PrayerReminderRuntime and read by the Reminders card. */
export const useReminderStatus = create<Status>((set) => ({
  permission: 'default',
  swReady: false,
  periodic: 'unknown',
  standalone: false,
  ios: false,
  next: null,
  scheduled: 0,
  set: (p) => set(p),
}))
