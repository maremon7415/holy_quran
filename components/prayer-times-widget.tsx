'use client'

import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { useGeolocation } from '@/hooks/use-geolocation'
import { getPrayerTimes, PrayerTimeConfig } from '@/lib/prayer-api'
import { useAppStore } from '@/lib/store'
import PrayerCountdown from './prayer-countdown'
import { useI18n } from '@/lib/i18n'

export default function PrayerTimesWidget() {
  const { latitude, longitude, city, loading } = useGeolocation()
  const { prayerMethod } = useAppStore()
  const { t } = useI18n()

  const prayerTimesObj = latitude && longitude 
    ? getPrayerTimes({ latitude, longitude, method: prayerMethod as PrayerTimeConfig['method'] })
    : null

  return (
    <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          {t('prayer_times', { defaultValue: 'Prayer Times' })}
        </h3>
        <Link href="/prayer-times" className="text-sm text-primary hover:underline flex items-center gap-1">
          {t('view_all', { defaultValue: 'View All' })} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[160px]">
        {loading ? (
          <div className="animate-pulse flex flex-col items-center gap-4">
            <MapPin className="w-8 h-8 text-muted-foreground opacity-20" />
            <div className="h-4 w-24 bg-muted rounded"></div>
          </div>
        ) : !prayerTimesObj ? (
          <div className="text-center text-sm text-muted-foreground">
            Please enable location to view prayer times.
          </div>
        ) : (
          <div className="w-full transform scale-90 origin-top">
            <PrayerCountdown prayerTimes={prayerTimesObj} />
          </div>
        )}
      </div>
      
      {city && !loading && (
        <div className="mt-2 text-xs text-center text-muted-foreground font-medium flex items-center justify-center gap-1">
          <MapPin className="w-3 h-3" /> {city}
        </div>
      )}
    </div>
  )
}
