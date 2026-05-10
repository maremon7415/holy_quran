'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { getAllSurahs, getSurahDetails, Ayah } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface SearchResult {
  surahNumber: number
  surahName: string
  ayahNumber: number
  arabicText: string
  englishText: string
}

interface AyahSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AyahSearchModal({ isOpen, onClose }: AyahSearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [loadedSurahs, setLoadedSurahs] = useState<Record<number, { ayahs: Ayah[], english: any }>>({})
  const router = useRouter()

  const searchAyahs = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    const q = searchQuery.toLowerCase()
    const searchResults: SearchResult[] = []

    for (const surahNumber of Object.keys(loadedSurahs).map(Number)) {
      const data = loadedSurahs[surahNumber]
      if (!data) continue

      for (const ayah of data.ayahs) {
        const englishMatch = data.english?.ayahs?.find((e: any) => e.number === ayah.numberInSurah)
        const englishText = englishMatch?.text?.toLowerCase() || ''
        const arabicText = ayah.text

        if (arabicText.includes(q) || englishText.includes(q)) {
          searchResults.push({
            surahNumber,
            surahName: `Surah ${surahNumber}`,
            ayahNumber: ayah.numberInSurah,
            arabicText: ayah.text,
            englishText: englishMatch?.text || '',
          })
        }

        if (searchResults.length >= 50) break
      }
      if (searchResults.length >= 50) break
    }

    setResults(searchResults)
    setLoading(false)
  }, [loadedSurahs])

  useEffect(() => {
    const loadSurahs = async () => {
      const allSurahs = await getAllSurahs()
      const surahNums = allSurahs.map((s: any) => s.number)
      
      const newLoaded: Record<number, { ayahs: Ayah[], english: any }> = {}
      
      for (const num of surahNums.slice(0, 20)) {
        try {
          const surah = await getSurahDetails(num)
          if (surah) {
            newLoaded[num] = { ayahs: surah.ayahs, english: null }
          }
        } catch {}
      }
      
      setLoadedSurahs(newLoaded)
    }
    
    if (isOpen && Object.keys(loadedSurahs).length === 0) {
      loadSurahs()
    }
  }, [isOpen])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        searchAyahs(query)
      } else {
        setResults([])
      }
    }, 300)
    
    return () => clearTimeout(timer)
  }, [query, searchAyahs])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!isOpen) {
          onClose()
        }
      }
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const navigateToAyah = (result: SearchResult) => {
    router.push(`/quran?surah=${result.surahNumber}#quran-ayah-${result.ayahNumber}`)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]"
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-border overflow-hidden mx-4"
          >
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Arabic or English text..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-lg"
                autoFocus
              />
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              {loading && (
                <div className="text-center py-8 text-muted-foreground">Searching...</div>
              )}
              
              {!loading && query.length >= 2 && results.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No results found for "{query}"
                </div>
              )}
              
              {!loading && results.length > 0 && (
                <div className="space-y-2">
                  {results.map((result) => (
                    <button
                      key={`${result.surahNumber}-${result.ayahNumber}`}
                      onClick={() => navigateToAyah(result)}
                      className="w-full text-left p-4 rounded-xl bg-muted/50 hover:bg-primary/5 transition-colors group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-primary">
                          {result.surahName} - Verse {result.ayahNumber}
                        </span>
                      </div>
                      <p className="text-lg font-arabic text-foreground text-right mb-2" dir="rtl">
                        {result.arabicText}
                      </p>
                      {result.englishText && (
                        <p className="text-sm text-muted-foreground">
                          {result.englishText}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {!loading && query.length < 2 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Type at least 2 characters to search</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}