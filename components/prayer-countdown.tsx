'use client'

import { useEffect, useState } from 'react'
import { PrayerTimes } from 'adhan'
import { intervalToDuration } from 'date-fns'
import { useI18n } from '@/lib/i18n'

interface PrayerCountdownProps {
  prayerTimes: PrayerTimes
}

export default function PrayerCountdown({ prayerTimes }: PrayerCountdownProps) {
  const [now, setNow] = useState(new Date())
  const { t } = useI18n()

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const nextPrayer = prayerTimes.nextPrayer()
  const nextPrayerTime = prayerTimes.timeForPrayer(nextPrayer)

  // If nextPrayer is 'none' (after Isha), we should technically calculate tomorrow's Fajr.
  // For simplicity here, we state "Completed for today" unless we pass tomorrow's times.
  // We'll calculate a generic 'time left' to midnight + tomorrow's fajr otherwise, but let's keep it simple first.
  const targetTime = nextPrayerTime

  if (!nextPrayer || nextPrayer === 'none' || !targetTime) {
    return (
      <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 text-center">
        <h3 className="text-xl font-semibold text-foreground mb-1">
          {t('prayers_completed', { defaultValue: 'All prayers completed for today' })}
        </h3>
      </div>
    )
  }

  const duration = intervalToDuration({ start: now, end: targetTime })

  // Capitalize prayer name
  const prayerName = nextPrayer.charAt(0).toUpperCase() + nextPrayer.slice(1)

  return (
    <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-primary/20 relative overflow-hidden text-center shadow-lg">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10">
        <p className="text-muted-foreground font-medium mb-2 upppercase tracking-wider text-sm">
          {t('next_prayer', { defaultValue: 'Next Prayer' })}
        </p>
        <h3 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
          {prayerName}
        </h3>
        
        <div className="flex justify-center items-center gap-4 text-4xl md:text-5xl font-bold font-mono text-primary">
          <div className="flex flex-col items-center">
            <span className="bg-background rounded-xl p-3 shadow-md min-w-[3rem] md:min-w-[4rem]">
              {String(duration.hours || 0).padStart(2, '0')}
            </span>
            <span className="text-xs text-muted-foreground mt-2 font-sans">{t('hours', { defaultValue: 'Hours' })}</span>
          </div>
          <span className="text-foreground pb-6">:</span>
          <div className="flex flex-col items-center">
            <span className="bg-background rounded-xl p-3 shadow-md min-w-[3rem] md:min-w-[4rem]">
              {String(duration.minutes || 0).padStart(2, '0')}
            </span>
            <span className="text-xs text-muted-foreground mt-2 font-sans">{t('minutes', { defaultValue: 'Minutes' })}</span>
          </div>
          <span className="text-foreground pb-6">:</span>
          <div className="flex flex-col items-center">
            <span className="bg-background rounded-xl p-3 shadow-md min-w-[3rem] md:min-w-[4rem]">
              {String(duration.seconds || 0).padStart(2, '0')}
            </span>
            <span className="text-xs text-muted-foreground mt-2 font-sans">{t('seconds', { defaultValue: 'Seconds' })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
