'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/navbar'
import Sidebar from '@/components/sidebar'
import SurahCard from '@/components/surah-card'
import HeroDashboard from '@/components/hero-dashboard'
import SurahSlider from '@/components/surah-slider'
import ShortcutPanel from '@/components/shortcut-panel'
import LoadingSpinner from '@/components/loading-spinner'
import { getAllSurahs, Surah } from '@/lib/api'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

export default function Home() {
  const mobileInitialCount = 10
  const incrementCount = 12
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(incrementCount)
  const { t } = useI18n()

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const data = await getAllSurahs()
        setSurahs(data)
      } catch (error) {
        console.error('Failed to fetch surahs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSurahs()
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')

    const syncViewport = () => {
      setVisibleCount(mediaQuery.matches ? mobileInitialCount : incrementCount)
    }

    syncViewport()
    mediaQuery.addEventListener('change', syncViewport)

    return () => mediaQuery.removeEventListener('change', syncViewport)
  }, [])

  const displayedSurahs = surahs.slice(0, visibleCount)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <ShortcutPanel />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Dashboard with Stats & Quick Access */}
        <HeroDashboard />

        {/* All Surahs Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">{t('all_surahs')}</h2>
            <span className="text-muted-foreground">{surahs.length} {t('chapters')}</span>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedSurahs.map((surah, index) => (
                  <SurahCard key={surah.number} surah={surah} index={index} />
                ))}
              </div>

              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {t('showing_surahs', { count: displayedSurahs.length, total: surahs.length })}
                </p>
                {visibleCount < surahs.length && (
                  <button
                    onClick={() =>
                      setVisibleCount((current) => Math.min(current + incrementCount, surahs.length))
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-6 py-3 text-sm font-semibold text-primary shadow-sm hover:bg-primary/14 hover:-translate-y-0.5 transition-all"
                  >
                    {t('show_more_count', { count: incrementCount })}
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.section>

        {/* Featured Carousel Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <SurahSlider />
        </motion.section>
      </div>
    </main>
  )
}
