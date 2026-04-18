'use client'

import Link from 'next/link'
import { ArrowUpRight, Star } from 'lucide-react'
import { Surah } from '@/lib/api'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'

interface SurahCardProps {
  surah: Surah
  index: number
}

export default function SurahCard({ surah, index }: SurahCardProps) {
  const { data: session } = useSession()
  const { favoriteSurahs, toggleFavoriteSurah, arabicFont } = useAppStore()
  const { t } = useI18n()
  const isFavorite = favoriteSurahs.includes(surah.number)
  const revelationLabel = surah.revelationType === 'Meccan' ? t('meccan') : t('medinan')

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!session) {
      alert(t('login_required_favorites'))
      return
    }
    toggleFavoriteSurah(surah.number)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className="h-full"
    >
      <Link href={`/surah/${surah.number}`}>
        <div className="group relative h-full overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-4 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.2)] transition-all duration-400 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_24px_56px_-32px_rgba(36,81,61,0.25)] dark:border-primary/12 dark:bg-[linear-gradient(145deg,rgba(36,81,61,0.08),rgba(255,255,255,0.02))] dark:shadow-[0_20px_60px_-35px_rgba(36,81,61,0.55)] dark:hover:shadow-[0_28px_70px_-30px_rgba(36,81,61,0.45)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(36,81,61,0.08),transparent_34%),linear-gradient(180deg,rgba(36,81,61,0.03),transparent_45%)] opacity-100 transition-opacity duration-500 dark:bg-[radial-gradient(circle_at_top_right,rgba(36,81,61,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(36,81,61,0.12),transparent_30%)] dark:opacity-90 dark:group-hover:opacity-100" />
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-primary/8 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/14 transition-all duration-500 dark:bg-primary/10 dark:group-hover:bg-primary/20" />

          <button
            onClick={handleToggleFavorite}
            className={`absolute right-3 top-3 z-20 rounded-full border p-2 backdrop-blur-md transition-all duration-300 ${
              isFavorite
                ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30 hover:bg-yellow-600'
                : 'border-slate-200 bg-white/90 text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10 dark:border-white/10 dark:bg-background/60'
            }`}
            title={isFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-4 flex items-start gap-3 pr-12">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/18 bg-[linear-gradient(180deg,rgba(36,81,61,0.12),rgba(36,81,61,0.06))] shadow-inner shadow-primary/10 dark:bg-primary/10">
                <span className="text-lg font-bold text-primary">{surah.number}</span>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-bold text-slate-900 transition-colors group-hover:text-primary dark:text-foreground">
                  {surah.englishName}
                </h3>
                <p className="truncate text-sm text-slate-600 dark:text-muted-foreground">
                  {surah.englishNameTranslation}
                </p>
              </div>

              <div className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:border-primary/15 dark:bg-background/50 md:flex">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-auto rounded-[20px] border border-slate-200 bg-slate-50/90 p-3.5 backdrop-blur-sm dark:border-white/5 dark:bg-background/45">
              <div className={`mb-3 text-right text-xl font-medium tracking-wide text-slate-900 dark:text-foreground/85 ${arabicFont}`}>
                {surah.name}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-primary/12 bg-primary/6 px-2.5 py-1 font-semibold uppercase tracking-[0.18em] text-primary">
                  {surah.numberOfAyahs} {t('verses')}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-primary/12 dark:bg-primary/6 dark:text-primary">
                  {revelationLabel}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-sm dark:border-primary/10">
              <span className="font-medium text-slate-600 transition-colors group-hover:text-primary dark:text-muted-foreground dark:group-hover:text-primary/85">
                {t('read_now')}
              </span>
              <span className="text-primary transition-transform duration-300 group-hover:translate-x-1">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
