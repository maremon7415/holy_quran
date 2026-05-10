'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Star, Sparkles, Clock } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import StatsCard from '@/components/stats-card'
import QuickAccessGrid from '@/components/quick-access-grid'
import PrayerTimesWidget from '@/components/prayer-times-widget'
import DuaOfTheDay from '@/components/dua-of-the-day'
import DhikrWidget from '@/components/dhikr-widget'
import QiblaWidget from '@/components/qibla-widget'
import DailyGoalWidget from '@/components/daily-goal-widget'
import { getAllSurahs, Surah } from '@/lib/api'
import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'

export default function HeroDashboard() {
  const { favoriteSurahs, recentlyViewed, readingStats, readingProgress } = useAppStore()
  const [surahs, setSurahs] = useState<Record<number, Surah>>({})
  const { t, locale } = useI18n()

  useEffect(() => {
    const load = async () => {
      const data = await getAllSurahs()
      const map: Record<number, Surah> = {}
      data.forEach(s => { map[s.number] = s })
      setSurahs(map)
    }
    load()
  }, [])

  const favSurahs = favoriteSurahs.slice(0, 3).map(n => surahs[n]).filter(Boolean)
  const recentSurahs = recentlyViewed.slice(0, 3)
  const lastViewed = recentlyViewed[0]
  const lastProgress = lastViewed ? readingProgress[lastViewed.surahNumber] : null
  const lastSurah = lastViewed ? surahs[lastViewed.surahNumber] : null

  return (
    <div className="space-y-12">
      {/* Main Hero Banner */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-primary/10 to-background border border-primary/10 p-6 sm:p-8 md:p-12"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              {t('welcome_back')}
            </h2>
          </div>

          <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl">
            {t('hero_summary', {
              verses: readingStats.totalVersesRead.toLocaleString(locale),
              streak: readingStats.currentStreak.toLocaleString(locale),
            })}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/quran?surah=1"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
            >
              <span>{t('start_reading')}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/saved"
              className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-all border border-border"
            >
              <Star className="w-5 h-5" />
              <span>{t('view_favorites')}</span>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Continue Reading Banner */}
      {lastViewed && lastSurah && lastProgress && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/15 p-5"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">{t('continue_reading')}</p>
              <h3 className="text-lg font-bold text-foreground">{lastSurah.englishName}</h3>
              <p className="text-sm text-muted-foreground font-arabic" dir="rtl">{lastSurah.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('verse')} {lastViewed.lastAyahRead} {t('of')} {lastSurah.numberOfAyahs} • {Math.round((lastProgress.versesRead / (lastSurah.numberOfAyahs || 1)) * 100)}% complete
              </p>
              <div className="w-48 h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(100, (lastProgress.versesRead / (lastSurah.numberOfAyahs || 1)) * 100)}%` }}
                />
              </div>
            </div>
            <Link
              href={`/quran?surah=${lastViewed.surahNumber}#quran-ayah-${lastViewed.lastAyahRead}`}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg"
            >
              {t('resume_reading')}
            </Link>
          </div>
        </motion.section>
      )}

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <StatsCard />
      </motion.section>

      {/* Islamic Daily Features */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
      <PrayerTimesWidget />
      <DuaOfTheDay />
      <DhikrWidget />
      <QiblaWidget />
      <DailyGoalWidget />
    </motion.section>

      {/* Quick Access & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Access */}
        <motion.section
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <QuickAccessGrid />
        </motion.section>

        {/* Recent Readings */}
        <motion.section
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {t('recent_readings')}
            </h3>
            <Link href="/recent" className="text-sm text-primary hover:underline">
              {t('view_all')}
            </Link>
          </div>

          {recentSurahs.length > 0 ? (
            <div className="space-y-3">
              {recentSurahs.map((item, idx) => (
                <Link
                  key={`${item.surahNumber}-${idx}`}
                  href={`/quran?surah=${item.surahNumber}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-primary/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                      {item.surahNumber}
                    </span>
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {item.surahName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>{t('no_recent_readings')}</p>
              <Link href="/" className="text-primary text-sm hover:underline mt-2 inline-block">
                {t('start_reading_quran')}
              </Link>
            </div>
          )}
        </motion.section>
      </div>

      {/* Favorite Surahs */}
      {favSurahs.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              {t('favorite_surahs')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {favSurahs.map((surah, idx) => (
              <Link
                key={surah!.number}
                href={`/quran?surah=${surah!.number}`}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/5 via-background to-background border-2 border-yellow-500/20 hover:border-yellow-500/40 transition-all p-6"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-yellow-500/10 transition-all" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-primary">{surah!.number}</span>
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-1">
                    {surah!.englishName}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {surah!.englishNameTranslation} • {surah!.numberOfAyahs} {t('verses')}
                  </p>
                  <p className="text-lg font-arabic text-foreground/80 mt-3 text-right">
                    {surah!.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  )
}
