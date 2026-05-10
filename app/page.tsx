'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
import { useAppStore } from '@/lib/store'
import { BookOpen, Headphones, Calendar, Compass, Hand, CircleDot, Bookmark, Settings, ArrowRight, Sparkles, Trophy, Target, Flame } from 'lucide-react'

export default function Home() {
  const mobileInitialCount = 10
  const incrementCount = 12
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(incrementCount)
  const { t } = useI18n()
  const { readingStats, dailyGoal } = useAppStore()

  const today = new Date().toLocaleDateString('en-CA')
  const todayEntry = readingStats.readingHistory.find(h => h.date === today)
  const todayVersesRead = todayEntry?.versesRead || 0

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

  const featureCards = [
    { icon: BookOpen, label: 'Read Quran', href: '/quran?surah=1', color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-500/10' },
    { icon: Headphones, label: 'Listen & Recite', href: '/quran?surah=1', color: 'from-blue-500 to-indigo-600', bgColor: 'bg-blue-500/10' },
    { icon: Calendar, label: 'Islamic Calendar', href: '/calendar', color: 'from-purple-500 to-violet-600', bgColor: 'bg-purple-500/10' },
    { icon: Compass, label: 'Qibla Direction', href: '/qibla', color: 'from-rose-500 to-orange-600', bgColor: 'bg-rose-500/10' },
    { icon: Hand, label: 'Daily Duas', href: '/dua', color: 'from-amber-500 to-yellow-600', bgColor: 'bg-amber-500/10' },
    { icon: CircleDot, label: 'Dhikr Counter', href: '/dhikr', color: 'from-cyan-500 to-sky-600', bgColor: 'bg-cyan-500/10' },
    { icon: Bookmark, label: 'Saved Verses', href: '/saved', color: 'from-pink-500 to-rose-600', bgColor: 'bg-pink-500/10' },
    { icon: Settings, label: 'Settings', href: '/profile', color: 'from-slate-500 to-zinc-600', bgColor: 'bg-slate-500/10' },
  ]

  const todayProgress = Math.min(100, todayVersesRead / dailyGoal * 100)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <ShortcutPanel />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Dashboard with Stats & Quick Access */}
        <HeroDashboard />

        {/* Daily Goal Progress Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8"
        >
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Daily Reading Goal</h3>
                  <p className="text-sm text-muted-foreground">
                    {readingStats.todayVersesRead || 0} of {dailyGoal} verses today
                  </p>
                </div>
              </div>
              
              <div className="flex-1 w-full md:max-w-xs">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-primary">{Math.round(todayProgress)}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${todayProgress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                  />
                </div>
              </div>

              <Link 
                href="/quran?surah=1" 
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
              >
                Continue Reading
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Quick Access Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Quick Access</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {featureCards.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + index * 0.03 }}
              >
                <Link
                  href={feature.href}
                  className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground text-center group-hover:text-foreground transition-colors">
                    {feature.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Stats Cards Row */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-xs text-muted-foreground">Total Verses</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{readingStats.totalVersesRead.toLocaleString()}</p>
          </div>
          
          <div className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-xs text-muted-foreground">Current Streak</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{readingStats.currentStreak} days</p>
          </div>
          
          <div className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xs text-muted-foreground">Best Streak</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{readingStats.longestStreak} days</p>
          </div>
          
          <div className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-xs text-muted-foreground">Surahs Read</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{readingStats.totalSurahsRead}</p>
          </div>
        </motion.section>

        {/* All Surahs Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">{t('all_surahs')}</h2>
            <Link href="/quran" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayedSurahs.map((surah, index) => (
                <SurahCard key={surah.number} surah={surah} index={index} />
              ))}
            </div>
          )}
          
          {visibleCount < surahs.length && (
            <div className="mt-6 text-center">
              <button
                onClick={() =>
                  setVisibleCount((current) => Math.min(current + incrementCount, surahs.length))
                }
                className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-6 py-3 text-sm font-semibold text-primary shadow-sm hover:bg-primary/14 hover:-translate-y-0.5 transition-all"
              >
                Load More ({visibleCount}/{surahs.length})
              </button>
            </div>
          )}
        </motion.section>

        {/* Featured Carousel Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16"
        >
          <SurahSlider />
        </motion.section>
      </div>
    </main>
  )
}
