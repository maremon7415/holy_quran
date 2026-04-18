'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Command, KeyRound } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { getAllSurahs, Surah } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

export default function ShortcutPanel() {
  const { ui, setUIState } = useAppStore()
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [search, setSearch] = useState('')
  const router = useRouter()
  const { t } = useI18n()

  const isOpen = ui.isSearchOpen

  useEffect(() => {
    const load = async () => {
      const data = await getAllSurahs()
      setSurahs(data)
    }
    load()
  }, [])

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setUIState({ isSearchOpen: !ui.isSearchOpen })
      }
      if (e.key === 'Escape' && isOpen) {
        setUIState({ isSearchOpen: false })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, ui.isSearchOpen, setUIState])

  const filtered = surahs.filter(s =>
    s.englishName.toLowerCase().includes(search.toLowerCase()) ||
    s.name.includes(search) ||
    s.number.toString() === search
  )

  const handleSelect = (surah: Surah) => {
    router.push(`/surah/${surah.number}`)
    setUIState({ isSearchOpen: false })
    setSearch('')
  }

  const quickJumpNumbers = [1, 18, 36, 55, 67, 112, 113, 114]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setUIState({ isSearchOpen: false })}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl mx-auto z-50"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              
              {/* Search Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t('search_surah_name_or_number')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-lg"
                  />
                  <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs text-muted-foreground font-mono">
                    <Command className="w-3 h-3" />
                    K
                  </kbd>
                  <button
                    onClick={() => setUIState({ isSearchOpen: false })}
                    className="p-1 hover:bg-muted rounded-md transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Quick Jump Numbers */}
              {!search && (
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <KeyRound className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{t('quick_jump')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickJumpNumbers.map(num => {
                      const surah = surahs.find(s => s.number === num)
                      return surah ? (
                        <button
                          key={num}
                          onClick={() => handleSelect(surah)}
                          className="px-3 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary text-sm font-medium transition-colors border border-primary/10"
                        >
                          {num}. {surah.englishName}
                        </button>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {/* Results */}
              <div className="max-h-96 overflow-y-auto p-2">
                <AnimatePresence mode="popLayout">
                  {filtered.length > 0 ? (
                    filtered.map((surah, idx) => (
                      <motion.button
                        key={surah.number}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: idx * 0.02 }}
                        onClick={() => handleSelect(surah)}
                        className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-primary/5 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {surah.number}
                          </span>
                          <div>
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {surah.englishName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {surah.englishNameTranslation} • {surah.numberOfAyahs} {t('verses')}
                            </p>
                          </div>
                        </div>
                        <span className="text-2xl font-arabic text-foreground/60">
                          {surah.name}
                        </span>
                      </motion.button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>{t('no_surah_matching', { query: search })}</p>
                     </div>
                     )}
                 </AnimatePresence>
              </div>

              {/* Footer hint */}
              <div className="p-3 bg-muted/30 border-t border-border text-xs text-muted-foreground text-center">
                {t('press_esc_to_close')}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
