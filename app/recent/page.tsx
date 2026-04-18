'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Clock3, RotateCcw } from 'lucide-react'
import Navbar from '@/components/navbar'
import Sidebar from '@/components/sidebar'
import ShortcutPanel from '@/components/shortcut-panel'
import { useAppStore } from '@/lib/store'
import { getAllSurahs, Surah } from '@/lib/api'
import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/lib/i18n'

export default function RecentPage() {
  const { recentlyViewed, readingProgress } = useAppStore()
  const [surahs, setSurahs] = useState<Record<number, Surah>>({})
  const { t, locale } = useI18n()

  useEffect(() => {
    const load = async () => {
      const data = await getAllSurahs()
      const map: Record<number, Surah> = {}
      data.forEach((surah) => {
        map[surah.number] = surah
      })
      setSurahs(map)
    }
    load()
  }, [])

  const recentItems = useMemo(
    () =>
      [...recentlyViewed].sort(
        (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)
      ),
    [recentlyViewed]
  )

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <ShortcutPanel />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Clock3 className="w-8 h-8 text-primary" />
              {t('recent_readings')}
            </h1>
          <p className="text-muted-foreground">
            {t('resume_where_left_off')}
          </p>
        </motion.div>

        {recentItems.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-muted/20">
            <RotateCcw className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-lg font-medium mb-1">{t('no_recent_readings')}</p>
            <p className="text-muted-foreground mb-5">{t('start_reading_quran')}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground"
            >
              <BookOpen className="w-4 h-4" />
              {t('all_surahs')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentItems.map((item, index) => {
              const surahMeta = surahs[item.surahNumber]
              const progress = readingProgress[item.surahNumber]
              const totalAyahs = progress?.totalAyahs ?? surahMeta?.numberOfAyahs ?? 0
              const progressPercent =
                totalAyahs > 0
                  ? Math.min(100, Math.round(((progress?.versesRead || 0) / totalAyahs) * 100))
                  : 0

              return (
                <motion.div
                  key={`${item.surahNumber}-${item.timestamp}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="bg-card border border-border rounded-2xl p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold text-foreground">
                        {item.surahNumber}. {item.surahName}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('last_read_ayah')} {item.lastAyahRead} •{' '}
                        {new Date(item.timestamp).toLocaleString(locale)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {t('progress_label')}: {progress?.versesRead || 0}
                        {totalAyahs ? `/${totalAyahs}` : ''} ({progressPercent}%)
                      </p>
                    </div>
                    <Link
                      href={`/surah/${item.surahNumber}#ayah-${item.lastAyahRead}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      {t('continue_reading')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
