'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Compass, ArrowRight, MapPin } from 'lucide-react'
import { useGeolocation } from '@/hooks/use-geolocation'
import { useI18n } from '@/lib/i18n'
import { motion } from 'framer-motion'

export default function QiblaWidget() {
  const { latitude, longitude, city } = useGeolocation()
  const { t } = useI18n()
  const [qiblaData, setQiblaData] = useState<{ angle: number; distance: number } | null>(null)

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      // Calculate Qibla Angle
      const KAABA_LAT = 21.4225 * Math.PI / 180
      const KAABA_LNG = 39.8262 * Math.PI / 180
      const currentLat = latitude * Math.PI / 180
      const currentLng = longitude * Math.PI / 180
      
      const dLng = KAABA_LNG - currentLng
      const y = Math.sin(dLng)
      const x = Math.cos(currentLat) * Math.tan(KAABA_LAT) - Math.sin(currentLat) * Math.cos(dLng)
      const angle = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360

      // Calculate Distance (Haversine)
      const R = 6371 // Earth radius in km
      const dLat = KAABA_LAT - currentLat
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(currentLat) * Math.cos(KAABA_LAT) * 
                Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      setQiblaData({ angle, distance })
    }
  }, [latitude, longitude])

  return (
    <Link href="/qibla">
      <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-primary/30 transition-all hover:shadow-lg h-full">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary group-hover:rotate-45 transition-transform duration-500" />
              {t('qibla_finder', { defaultValue: 'Qibla Finder' })}
            </h3>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground">
                {qiblaData ? Math.round(qiblaData.angle) : '--'}°
              </span>
              <span className="text-xs uppercase tracking-widest text-primary font-black">N</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {city || 'Determining...'}
            </p>
          </div>
          
          <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/60">{t('distance', { defaultValue: 'Distance' })}</span>
              <span className="text-xs font-bold text-foreground">
                {qiblaData ? `${Math.round(qiblaData.distance).toLocaleString()} km` : '-- km'}
              </span>
            </div>
            <motion.div
               animate={{ scale: [1, 1.1, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl"
            >
              🕋
            </motion.div>
          </div>
        </div>
      </div>
    </Link>
  )
}
