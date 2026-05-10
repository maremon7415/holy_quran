'use client'

import { useState, useMemo } from 'react'
import { Search, Star, Clock, List } from 'lucide-react'
import { Surah } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'

interface SurahListPanelProps {
  surahs: Surah[]
  selectedSurah: number
  onSelectSurah: (surahNumber: number) => void
}

function HexBadge({ number, active }: { number: number; active: boolean }) {
  return (
    <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
      <div
        className="absolute inset-0"
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          backgroundColor: active ? 'rgb(var(--primary))' : 'rgb(var(--primary) / 0.1)',
        }}
      />
      <span
        className={`relative z-10 text-xs font-bold ${active ? 'text-primary-foreground' : 'text-primary'}`}
      >
        {number}
      </span>
    </div>
  )
}

export default function SurahListPanel({
  surahs,
  selectedSurah,
  onSelectSurah,
}: SurahListPanelProps) {
  const [tab, setTab] = useState<'all' | 'favorites' | 'recent'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { favoriteSurahs, recentlyViewed } = useAppStore()
  const { t } = useI18n()

  const filteredSurahs = useMemo(() => {
    let list = surahs

    if (tab === 'favorites') {
      list = surahs.filter((s) => favoriteSurahs.includes(s.number))
    } else if (tab === 'recent') {
      const recentNums = recentlyViewed.map((r) => r.surahNumber)
      list = surahs.filter((s) => recentNums.includes(s.number)).sort((a, b) => {
        const aIdx = recentNums.indexOf(a.number)
        const bIdx = recentNums.indexOf(b.number)
        return aIdx - bIdx
      })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (s) =>
          s.englishName.toLowerCase().includes(q) ||
          s.englishNameTranslation.toLowerCase().includes(q) ||
          String(s.number).includes(q) ||
          s.name.includes(searchQuery)
      )
    }

    return list
  }, [surahs, tab, searchQuery, favoriteSurahs, recentlyViewed])

  const tabs = [
    { key: 'all' as const, label: t('all_surahs'), icon: List },
    { key: 'favorites' as const, label: t('favorites'), icon: Star },
    { key: 'recent' as const, label: t('recent'), icon: Clock },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <div className="flex bg-muted/60 rounded-xl p-1 mb-3">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                tab === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden xl:inline truncate">{label}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('search_surah_name_or_number')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-muted/50 rounded-xl text-sm border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {filteredSurahs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {t('no_surah_found')}
          </div>
        )}
        {filteredSurahs.map((surah) => {
          const isActive = surah.number === selectedSurah
          const revelationLabel = surah.revelationType === 'Meccan' ? t('meccan') : t('medinan')

          return (
            <button
              key={surah.number}
              onClick={() => onSelectSurah(surah.number)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all ${
                isActive
                  ? 'bg-primary/12 border border-primary/20 shadow-sm'
                  : 'border border-transparent hover:bg-muted/50 hover:border-border/50'
              }`}
            >
              <HexBadge number={surah.number} active={isActive} />

              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-foreground'}`}
                >
                  {surah.englishName}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {surah.englishNameTranslation}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-right text-sm font-medium text-foreground/70 leading-relaxed" dir="rtl">
                  {surah.name}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {surah.numberOfAyahs} {t('verses')}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
