'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Flame, BookOpen, Calendar, Target } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function StatsCard() {
  const { readingStats } = useAppStore()
  const { t, locale } = useI18n()
  const { totalVersesRead, totalSurahsRead, currentStreak, longestStreak } = readingStats

  const stats = [
    {
      label: t('verses_read'),
      value: totalVersesRead.toLocaleString(locale),
      icon: BookOpen,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      label: t('surahs_completed'),
      value: totalSurahsRead.toLocaleString(locale),
      icon: Target,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      label: t('current_streak'),
      value: `${currentStreak.toLocaleString(locale)} ${t('days_word')}`,
      icon: Flame,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    {
      label: t('best_streak'),
      value: `${longestStreak.toLocaleString(locale)} ${t('days_word')}`,
      icon: Calendar,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">
            {stat.value}
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
