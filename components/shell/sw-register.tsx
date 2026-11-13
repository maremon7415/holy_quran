'use client'
import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { useTx } from '@/lib/lang'

// Headless runtimes are lazy-loaded so adhan etc. stay out of the initial bundle.
const PrayerReminderRuntime = dynamic(() => import('@/components/prayer/reminder-runtime').then((m) => m.PrayerReminderRuntime), { ssr: false })
const OfflinePill = dynamic(() => import('@/components/offline/offline-pill').then((m) => m.OfflinePill), { ssr: false })

export function ServiceWorkerRegister() {
  const t = useTx()
  const tRef = useRef(t)
  tRef.current = t
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const onMsg = (e: MessageEvent) => { if (e.data?.type === 'noor:navigate' && typeof e.data.url === 'string') location.assign(e.data.url) }
    navigator.serviceWorker.addEventListener('message', onMsg)
    // A new build's SW waits (it never skipWaiting()s by itself) so open tabs keep a consistent set of chunks; offer a reload instead.
    let reloading = false
    const onController = () => { if (reloading) location.reload() }
    navigator.serviceWorker.addEventListener('controllerchange', onController)
    const promptUpdate = (w: ServiceWorker) => {
      const tt = tRef.current
      toast(tt({ en: 'Update available', bn: 'আপডেট পাওয়া যাচ্ছে', ar: 'يتوفر تحديث' }), {
        id: 'noor-sw-update',
        duration: Infinity,
        action: {
          label: tt({ en: 'Reload', bn: 'রিলোড', ar: 'إعادة التحميل' }),
          onClick: () => { reloading = true; w.postMessage({ type: 'noor:skip-waiting' }) },
        },
      })
    }
    const watch = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting && navigator.serviceWorker.controller) promptUpdate(reg.waiting)
      reg.addEventListener('updatefound', () => {
        const w = reg.installing
        w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) promptUpdate(w) })
      })
    }
    // after a deploy the SW lazily refreshes downloaded pages on visit; this only asks it to consider a throttled, connection-gated background refresh
    const refresh = () => { if (navigator.onLine) void navigator.serviceWorker.getRegistration().then((r) => r?.active?.postMessage({ type: 'noor:refresh-downloads' })) }
    navigator.serviceWorker.addEventListener('controllerchange', refresh)
    const rid = setTimeout(refresh, 6000)
    void navigator.serviceWorker.getRegistration().then((r) => { if (r) watch(r) }).catch(() => {})
    let id: ReturnType<typeof setTimeout> | undefined
    if (process.env.NODE_ENV === 'production') {
      const v = encodeURIComponent(process.env.NEXT_PUBLIC_BUILD_ID ?? 'dev')
      id = setTimeout(() => navigator.serviceWorker.register(`/sw.js?v=${v}`).then(watch).catch(() => {}), 2500)
    }
    return () => { clearTimeout(id); clearTimeout(rid); navigator.serviceWorker.removeEventListener('controllerchange', refresh); navigator.serviceWorker.removeEventListener('controllerchange', onController); navigator.serviceWorker.removeEventListener('message', onMsg) }
  }, [])
  return (
    <>
      <PrayerReminderRuntime />
      <OfflinePill />
    </>
  )
}
