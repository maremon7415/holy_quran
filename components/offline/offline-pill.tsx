'use client'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { WifiOff } from 'lucide-react'
import { useTx } from '@/lib/lang'

/** Small floating pill shown while navigator.onLine is false. */
export function OfflinePill() {
  const t = useTx()
  const [offline, setOffline] = useState(false)
  useEffect(() => {
    const up = () => setOffline(!navigator.onLine)
    up()
    window.addEventListener('online', up)
    window.addEventListener('offline', up)
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', up) }
  }, [])
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center lg:bottom-6">
    <AnimatePresence>
      {offline && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="glass inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-foreground shadow-lg"
        >
          <WifiOff className="size-4 text-gold" />
          {t({ en: 'Offline — saved content only', bn: 'অফলাইন — শুধু সংরক্ষিত কনটেন্ট' })}
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  )
}
