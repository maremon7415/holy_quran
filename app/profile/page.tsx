'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Flame,
  Languages,
  Settings,
  Star,
  Target,
  UserRound,
} from 'lucide-react'
import Navbar from '@/components/navbar'
import Sidebar from '@/components/sidebar'
import ShortcutPanel from '@/components/shortcut-panel'
import BackButton from '@/components/back-button'
import { useAppStore } from '@/lib/store'
import { useSession } from 'next-auth/react'
import { useI18n } from '@/lib/i18n'

export default function ProfilePage() {
  const { data: session } = useSession()
  const { t, locale } = useI18n()
  const { theme, setTheme } = useTheme()
  const {
    language,
    setLanguage,
    ayahFontSize,
    setAyahFontSize,
    translationFontSize,
    setTranslationFontSize,
    readingStats,
    favoriteSurahs,
    importantAyahs,
    readingProgress,
  } = useAppStore()

  const completedCount = Object.values(readingProgress).filter((progress) => progress.completed).length

  const statCards = [
    { label: t('verses_read'), value: readingStats.totalVersesRead.toLocaleString(locale), icon: BookOpen },
    { label: t('surahs_completed'), value: readingStats.totalSurahsRead.toLocaleString(locale), icon: Target },
    { label: t('current_streak'), value: `${readingStats.currentStreak.toLocaleString(locale)} ${t('days_word')}`, icon: Flame },
    { label: t('view_favorites'), value: favoriteSurahs.length.toLocaleString(locale), icon: Star },
    { label: t('important_ayahs'), value: importantAyahs.length.toLocaleString(locale), icon: BookOpen },
    { label: t('completed_tracked'), value: completedCount.toLocaleString(locale), icon: Target },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <ShortcutPanel />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <BackButton className="mb-4" />
        
        <motion.section
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-2xl border border-primary/20 p-6 md:p-8"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                <UserRound className="w-8 h-8 text-primary" />
                {t('profile')}
              </h1>
              <p className="text-muted-foreground mt-2">
                {session?.user?.name || 'Guest Reader'} · {session?.user?.email || 'Not signed in'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/recent"
                className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-sm"
              >
                {t('recent')}
              </Link>
              <Link
                href="/saved"
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm"
              >
                {t('saved')}
              </Link>
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <card.icon className="w-5 h-5 text-primary mb-3" />
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </motion.div>
          ))}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            {t('reading_settings')}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Languages className="w-4 h-4 text-primary" />
                {t('default_language')}
              </p>
              <div className="flex gap-2">
                {(['en', 'ar', 'bn'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-2 rounded-lg text-sm uppercase font-semibold ${
                      language === lang
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">{t('theme')}</p>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTheme(mode)}
                    className={`px-3 py-2 rounded-lg text-sm capitalize ${
                      theme === mode
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">{t('ayah_font_size')} ({ayahFontSize}px)</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setAyahFontSize(Math.max(18, ayahFontSize - 2))}
                  className="px-3 py-2 rounded-lg bg-muted text-sm"
                >
                  A-
                </button>
                <button
                  onClick={() => setAyahFontSize(Math.min(64, ayahFontSize + 2))}
                  className="px-3 py-2 rounded-lg bg-muted text-sm"
                >
                  A+
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">{t('translation_text_size')} ({translationFontSize}px)</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setTranslationFontSize(Math.max(12, translationFontSize - 2))}
                  className="px-3 py-2 rounded-lg bg-muted text-sm"
                >
                  A-
                </button>
                <button
                  onClick={() => setTranslationFontSize(Math.min(32, translationFontSize + 2))}
                  className="px-3 py-2 rounded-lg bg-muted text-sm"
                >
                  A+
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  )
}
