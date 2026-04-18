'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star, X } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { getAllSurahs } from '@/lib/api'
import { useEffect, useState } from 'react'
import { Surah } from '@/lib/api'
import { useI18n } from '@/lib/i18n'

export default function QuickAccessGrid() {
  const { quickAccessSurahs, toggleQuickAccessSurah, favoriteSurahs, toggleFavoriteSurah } = useAppStore()
  const [surahs, setSurahs] = useState<Record<number, Surah>>({})
  const { t } = useI18n()

  useEffect(() => {
    const loadSurahs = async () => {
      const data = await getAllSurahs()
      const map: Record<number, Surah> = {}
      data.forEach(s => { map[s.number] = s })
      setSurahs(map)
    }
    loadSurahs()
  }, [])

  const isFavorite = (num: number) => favoriteSurahs.includes(num)
  const isQuickAccess = (num: number) => quickAccessSurahs.includes(num)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="text-primary">⚡</span> {t('quick_access')}
        </h3>
        <span className="text-xs text-muted-foreground">{t('hover_to_manage')}</span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-10 gap-3">
        {quickAccessSurahs.map((num, idx) => {
          const surah = surahs[num]
          if (!surah) return null

          return (
            <motion.div
              key={num}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="relative group"
            >
              <Link
                href={`/surah/${num}`}
                className="block aspect-square bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/20 hover:to-primary/30 border border-primary/20 hover:border-primary rounded-xl flex flex-col items-center justify-center transition-all duration-300"
              >
                <span className="text-lg font-bold text-primary">{num}</span>
                <span className="text-[10px] text-muted-foreground truncate w-full px-1 text-center">
                  {surah.englishName.length > 10 ? surah.englishName.slice(0, 8) + '..' : surah.englishName}
                </span>
              </Link>

              {/* Quick actions */}
              <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.preventDefault(); toggleFavoriteSurah(num) }}
                  className={`p-1 rounded-full shadow-md transition-colors ${
                    isFavorite(num)
                      ? 'bg-yellow-500 text-white'
                      : 'bg-background text-muted-foreground hover:text-yellow-500'
                  }`}
                  title={isFavorite(num) ? t('remove_from_favorites') : t('add_to_favorites')}
                >
                  <Star className={`w-3 h-3 ${isFavorite(num) ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); toggleQuickAccessSurah(num) }}
                  className="p-1 rounded-full bg-background text-muted-foreground hover:text-destructive shadow-md"
                  title={t('remove_from_quick_access')}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Favorite indicator */}
              {isFavorite(num) && (
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-background" />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Add new quick access */}
      <div className="relative">
        <details className="group">
          <summary className="cursor-pointer text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
            + {t('add_surah_quick_access')}
          </summary>
          <div className="mt-3 p-4 bg-muted/50 rounded-lg border border-border">
            <QuickSurahSelector onSelect={(num) => {
              if (!isQuickAccess(num)) {
                toggleQuickAccessSurah(num)
              }
            }} exclude={quickAccessSurahs} />
          </div>
        </details>
      </div>
    </div>
  )
}

function QuickSurahSelector({ onSelect, exclude }: { onSelect: (num: number) => void, exclude: number[] }) {
  const [search, setSearch] = useState('')
  const [surahs, setSurahs] = useState<Surah[]>([])
  const { t } = useI18n()

  useEffect(() => {
    const load = async () => {
      const data = await getAllSurahs()
      setSurahs(data)
    }
    load()
  }, [])

  const filtered = surahs.filter(s =>
    s.englishName.toLowerCase().includes(search.toLowerCase()) ||
    s.number.toString() === search
  ).slice(0, 10)

  return (
    <div>
      <input
        type="text"
        placeholder={t('search_surah')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-2"
      />
      <div className="flex flex-wrap gap-2">
        {filtered.map(surah => (
          <button
            key={surah.number}
            onClick={() => onSelect(surah.number)}
            disabled={exclude.includes(surah.number)}
            className={`px-2 py-1 rounded-md text-xs transition-colors ${
              exclude.includes(surah.number)
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
          >
            {surah.number}. {surah.englishName}
          </button>
        ))}
      </div>
    </div>
  )
}
