'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { REMINDER_KEYS, type ReminderKey } from '@/lib/prayer/times'

export type ReminderSound = 'azan' | 'chime' | 'silent'
export interface ReminderCfg {
  on: boolean
  /** minutes before the prayer time (0/5/10/15/30) */
  before: number
  sound: ReminderSound
}
export const BEFORE_OPTIONS = [0, 5, 10, 15, 30] as const

const defaultReminders = (): Record<ReminderKey, ReminderCfg> =>
  Object.fromEntries(REMINDER_KEYS.map((k) => [k, { on: false, before: k === 'tahajjud' || k === 'sunrise' ? 0 : 10, sound: 'chime' as ReminderSound }])) as Record<ReminderKey, ReminderCfg>

interface PrayerPrefs {
  madhab: 'shafi' | 'hanafi'
  setMadhab: (m: 'shafi' | 'hanafi') => void
  /** IANA timezone of the chosen location (null = device) */
  tz: string | null
  setTz: (tz: string | null) => void
  reminders: Record<ReminderKey, ReminderCfg>
  setReminder: (k: ReminderKey, patch: Partial<ReminderCfg>) => void
  /** apply one patch to every reminder */
  setAllReminders: (patch: Partial<ReminderCfg>) => void
}

export const usePrayerPrefs = create<PrayerPrefs>()(
  persist(
    (set) => ({
      madhab: 'hanafi',
      setMadhab: (madhab) => set({ madhab }),
      tz: null,
      setTz: (tz) => set({ tz }),
      reminders: defaultReminders(),
      setReminder: (k, patch) => set((s) => ({ reminders: { ...s.reminders, [k]: { ...s.reminders[k], ...patch } } })),
      setAllReminders: (patch) => set((s) => ({ reminders: Object.fromEntries(REMINDER_KEYS.map((k) => [k, { ...s.reminders[k], ...patch }])) as Record<ReminderKey, ReminderCfg> })),
    }),
    {
      name: 'noor-prayer-prefs',
      // fill in any reminder keys missing from older persisted state
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PrayerPrefs>
        return { ...current, ...p, reminders: { ...current.reminders, ...(p.reminders ?? {}) } }
      },
    },
  ),
)
