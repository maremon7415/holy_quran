'use client'
/** Show a prayer notification, preferably through the service worker registration (works while the tab is in the background,
 *  supports action buttons and `notificationclick`). Falls back to the Notification constructor (e.g. dev without a SW). */
export interface NotifyInput {
  title: string
  body: string
  tag: string
  silent?: boolean
  lang: 'en' | 'bn' | 'ar'
  test?: boolean
}

export const isNotificationSupported = () => typeof window !== 'undefined' && 'Notification' in window

export async function showPrayerNotification(n: NotifyInput): Promise<'sw' | 'page' | 'denied' | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported'
  if (Notification.permission !== 'granted') return 'denied'
  const opts: NotificationOptions & { actions?: { action: string; title: string }[]; renotify?: boolean } = {
    body: n.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: n.tag,
    lang: n.lang,
    silent: n.silent,
    data: { url: '/prayer-times', quranUrl: '/quran', test: !!n.test },
    actions: [
      { action: 'open', title: n.lang === 'bn' ? 'কুরআন খুলুন' : n.lang === 'ar' ? 'افتح القرآن' : 'Open Quran' },
      { action: 'dismiss', title: n.lang === 'bn' ? 'বন্ধ করুন' : n.lang === 'ar' ? 'إغلاق' : 'Dismiss' },
    ],
  }
  try {
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined
    if (reg?.active) {
      await reg.showNotification(n.title, opts)
      return 'sw'
    }
  } catch {}
  try {
    const { actions: _a, ...rest } = opts
    void _a
    const x = new Notification(n.title, rest)
    x.onclick = () => { window.focus(); x.close() }
    return 'page'
  } catch {
    return 'unsupported'
  }
}
