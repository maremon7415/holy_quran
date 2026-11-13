'use client'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { usePrayerPrefs } from '@/lib/stores/prayer'
import { useLang } from '@/lib/lang'
import { REMINDER_KEYS } from '@/lib/prayer/times'
import { buildReminders, type ReminderItem, type StoredSchedule } from '@/lib/prayer/reminders'
import { showPrayerNotification, isNotificationSupported } from '@/lib/prayer/notify'
import { playReminderSound, primeAudioOnGesture } from '@/lib/prayer/sound'
import { useReminderStatus } from '@/lib/prayer/status'
import { firedAdd, firedHas, firedPrune, kvSet } from '@/lib/offline/idb'

const GRACE = 10 * 60_000
const REBUILD_EVERY = 6 * 3_600_000

/** Headless: keeps exact timers for the next reminder while the app is open (any tab), mirrors the 7-day schedule to IndexedDB for the
 *  service worker's Periodic Background Sync, and publishes live status for the Reminders card. Mounted once from ServiceWorkerRegister. */
export function PrayerReminderRuntime() {
  const lat = useAppStore((s) => s.location.latitude)
  const lon = useAppStore((s) => s.location.longitude)
  const city = useAppStore((s) => s.location.city)
  const method = useAppStore((s) => s.prayerMethod)
  const madhab = usePrayerPrefs((s) => s.madhab)
  const tz = usePrayerPrefs((s) => s.tz)
  const reminders = usePrayerPrefs((s) => s.reminders)
  const lang = useLang() === 'bn' ? 'bn' : 'en'
  const set = useReminderStatus((s) => s.set)

  // environment + permission
  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const standalone = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true
    const read = () => set({ permission: isNotificationSupported() ? Notification.permission : 'unsupported', ios, standalone })
    read()
    const un = primeAudioOnGesture()
    document.addEventListener('visibilitychange', read)
    window.addEventListener('focus', read)
    return () => { un(); document.removeEventListener('visibilitychange', read); window.removeEventListener('focus', read) }
  }, [set])

  useEffect(() => {
    const anyOn = REMINDER_KEYS.some((k) => reminders[k].on)
    const hasLoc = lat !== null && lon !== null
    let timer: ReturnType<typeof setTimeout> | undefined
    let items: ReminderItem[] = []
    let builtAt = 0
    let builtDay = ''
    const local = new Set<string>()
    let alive = true

    const regP = 'serviceWorker' in navigator ? navigator.serviceWorker.getRegistration() : Promise.resolve(undefined)

    const syncPeriodic = async (want: boolean) => {
      const reg = await regP.catch(() => undefined)
      set({ swReady: !!reg?.active })
      const ps = (reg as (ServiceWorkerRegistration & { periodicSync?: { register: (t: string, o: { minInterval: number }) => Promise<void>; unregister: (t: string) => Promise<void> } }) | undefined)?.periodicSync
      if (!reg || !ps) return set({ periodic: reg ? 'unsupported' : 'unknown' })
      try {
        if (want && isNotificationSupported() && Notification.permission === 'granted') {
          await ps.register('prayer-check', { minInterval: 15 * 60 * 1000 })
          set({ periodic: 'active' })
        } else {
          await ps.unregister('prayer-check').catch(() => {})
          set({ periodic: want ? 'blocked' : 'off' })
        }
      } catch {
        set({ periodic: 'blocked' })
      }
    }

    const dayKey = () => new Intl.DateTimeFormat('en-CA', { timeZone: tz ?? undefined }).format(Date.now())

    const rebuild = () => {
      items = buildReminders({ lat: lat!, lon: lon!, method, madhab, tz, reminders, city, days: 7 })
      builtAt = Date.now()
      builtDay = dayKey()
      const stored: StoredSchedule = { generatedAt: builtAt, lang, city, items }
      void kvSet('prayer-schedule', stored)
    }

    const fire = async (it: ReminderItem) => {
      if (local.has(it.id)) return
      local.add(it.id)
      if (await firedHas(it.id)) return
      await firedAdd(it.id)
      const [title, body] = it.text[lang]
      void showPrayerNotification({ title, body, tag: it.id, silent: it.sound === 'silent', lang })
      if (document.visibilityState === 'visible') {
        void playReminderSound(it.sound)
        toast(title, { description: body, duration: 12000 })
      }
    }

    const arm = () => {
      if (!alive) return
      clearTimeout(timer)
      const now = Date.now()
      if (!builtAt || dayKey() !== builtDay || now - builtAt > REBUILD_EVERY) rebuild()
      for (const it of items) if (it.fireAt <= now && it.fireAt > now - GRACE) void fire(it)
      const next = items.find((i) => i.fireAt > now && !local.has(i.id)) ?? null
      set({ next, scheduled: items.length })
      // cap the delay so clock / DST / timezone changes self-correct
      const delay = next ? Math.min(next.fireAt - now + 50, 30 * 60_000) : 30 * 60_000
      timer = setTimeout(arm, Math.max(delay, 500))
    }

    if (!hasLoc || !anyOn) {
      set({ next: null, scheduled: 0 })
      void kvSet('prayer-schedule', { generatedAt: Date.now(), lang, city, items: [] } satisfies StoredSchedule)
      void syncPeriodic(false)
      return
    }
    void firedPrune()
    arm()
    void syncPeriodic(true)
    const onVis = () => { if (document.visibilityState === 'visible') arm() }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('focus', onVis)
    return () => {
      alive = false
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('focus', onVis)
    }
  }, [lat, lon, city, method, madhab, tz, reminders, lang, set])

  return null
}
