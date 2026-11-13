'use client'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'

// Headless runtimes are lazy-loaded so adhan etc. stay out of the initial bundle.
const PrayerReminderRuntime = dynamic(() => import('@/components/prayer/reminder-runtime').then((m) => m.PrayerReminderRuntime), { ssr: false })
const OfflinePill = dynamic(() => import('@/components/offline/offline-pill').then((m) => m.OfflinePill), { ssr: false })

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const onMsg = (e: MessageEvent) => { if (e.data?.type === 'noor:navigate' && typeof e.data.url === 'string') location.assign(e.data.url) }
    navigator.serviceWorker.addEventListener('message', onMsg)
    // after a deploy the new SW refreshes the downloaded Quran in the background (SW dedupes per build)
    const refresh = () => { if (navigator.onLine) void navigator.serviceWorker.getRegistration().then((r) => r?.active?.postMessage({ type: 'noor:refresh-downloads' })) }
    navigator.serviceWorker.addEventListener('controllerchange', refresh)
    const rid = setTimeout(refresh, 6000)
    let id: ReturnType<typeof setTimeout> | undefined
    if (process.env.NODE_ENV === 'production') {
      const v = encodeURIComponent(process.env.NEXT_PUBLIC_BUILD_ID ?? 'dev')
      id = setTimeout(() => navigator.serviceWorker.register(`/sw.js?v=${v}`).catch(() => {}), 2500)
    }
    return () => { clearTimeout(id); clearTimeout(rid); navigator.serviceWorker.removeEventListener('controllerchange', refresh); navigator.serviceWorker.removeEventListener('message', onMsg) }
  }, [])
  return (
    <>
      <PrayerReminderRuntime />
      <OfflinePill />
    </>
  )
}
