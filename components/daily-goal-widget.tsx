'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Trophy, Settings2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import Link from 'next/link'

export default function DailyGoalWidget() {
  const { readingStats } = useAppStore()
  const { t } = useI18n()
  const [dailyGoal, setDailyGoal] = useState(20)
  const [showSettings, setShowSettings] = useState(false)
  const [todaysProgress, setTodaysProgress] = useState(0)

  // Load daily goal from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('daily-reading-goal')
    if (saved) {
      setDailyGoal(Number(saved))
    }
  }, [])

  // Calculate today's progress
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA')
    const todayEntry = readingStats.readingHistory.find((h) => h.date === today)
    setTodaysProgress(todayEntry?.versesRead || 0)
  }, [readingStats])

  const saveGoal = (value: number) => {
    setDailyGoal(value)
    localStorage.setItem('daily-reading-goal', String(value))
  }

  const progress = Math.min(100, (todaysProgress / dailyGoal) * 100)
  const isComplete = todaysProgress >= dailyGoal

  return (
    <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              {t('daily_reading_goal', { defaultValue: 'Daily Goal' })}
            </h3>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
            title={t('set_daily_goal', { defaultValue: 'Set daily goal' })}
          >
            <Settings2 className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {showSettings ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                {t('verses_per_day', { defaultValue: 'verses/day' })}: {dailyGoal}
              </label>
              <Slider
                value={[dailyGoal]}
                onValueChange={(v) => saveGoal(v[0])}
                min={5}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5</span>
                <span>100</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(false)}
              className="w-full"
            >
              {t('done', { defaultValue: 'Done' })}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2 mb-3">
              <span className={`text-3xl font-bold ${isComplete ? 'text-green-500' : 'text-foreground'}`}>
                {todaysProgress}
              </span>
              <span className="text-sm text-muted-foreground">
                / {dailyGoal} {t('verses', { defaultValue: 'verses' })}
              </span>
              {isComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-2"
                >
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </motion.div>
              )}
            </div>

            <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-y-0 left-0 rounded-full ${
                  isComplete ? 'bg-green-500' : 'bg-primary'
                }`}
              />
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {isComplete
                ? t('goal_reached', { defaultValue: 'Goal Reached!' })
                : t('goal_progress', { defaultValue: 'Keep reading to reach your goal' })}
            </p>

            <Link
              href="/saved"
              className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
            >
              {t('view_progress', { defaultValue: 'View Progress' })}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
