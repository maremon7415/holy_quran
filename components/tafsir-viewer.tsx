'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, Loader2, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

interface TafsirData {
  surah: number
  ayah: number
  text: string
  source: string
}

interface TafsirViewerProps {
  surahNumber: number
  ayahNumber: number
  isOpen: boolean
  onClose: () => void
  onNavigate?: (ayahNumber: number) => void
  totalAyahs?: number
}

const TAFSIR_SOURCES = [
  { id: 'en.ibn-kathir', name: 'Ibn Kathir (English)' },
  { id: 'en.jalalayn', name: "Al-Jalalayn (English)" },
]

// Generate fallback content when API fails
const getFallbackTafsir = (surah: number, ayah: number): string => {
  return `Tafsir content for Surah ${surah}, Ayah ${ayah} is temporarily unavailable. 

Please try:
- Checking your internet connection
- Selecting a different tafsir source
- Trying again later

The QuranEnc API may be experiencing issues or the specific ayah may not have translation available in the selected source.`
}

export default function TafsirViewer({
  surahNumber,
  ayahNumber,
  isOpen,
  onClose,
  onNavigate,
  totalAyahs = 0,
}: TafsirViewerProps) {
  const [tafsir, setTafsir] = useState<TafsirData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState(TAFSIR_SOURCES[0].id)
  const [retryCount, setRetryCount] = useState(0)
  const { t } = useI18n()

  const fetchTafsir = useCallback(async () => {
    if (!isOpen) return
    
    setLoading(true)
    setError(null)
    
    try {
      const source = TAFSIR_SOURCES.find(s => s.id === selectedSource)
      
      // Use the correct QuranEnc API endpoint
      // This fetches the entire surah translation, then we extract the specific ayah
      const response = await fetch(
        `https://quranenc.com/api/v1/translation/sura/${selectedSource}/${surahNumber}`,
        { 
          method: 'GET',
          headers: { 
            'Accept': 'application/json',
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Validate response structure
      if (!data?.result || !Array.isArray(data.result)) {
        throw new Error('Invalid API response format')
      }
      
      // Find the specific ayah in the results
      // The API returns an array where each item represents an ayah
      const ayahIndex = ayahNumber - 1 // Array is 0-indexed, ayah numbers are 1-indexed
      const ayahData = data.result[ayahIndex]
      
      if (!ayahData) {
        throw new Error(`Ayah ${ayahNumber} not found in surah ${surahNumber}`)
      }
      
      // Extract translation - it could be in different fields depending on the source
      const translationText = ayahData.translation || ayahData.text || ayahData.content
      
      if (!translationText) {
        throw new Error('No translation text available for this ayah')
      }
      
      setTafsir({
        surah: surahNumber,
        ayah: ayahNumber,
        text: translationText,
        source: source?.name || selectedSource,
      })
      
      setError(null)
      
    } catch (err) {
      console.error('Tafsir fetch error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      
      // Show fallback content
      const source = TAFSIR_SOURCES.find(s => s.id === selectedSource)
      setTafsir({
        surah: surahNumber,
        ayah: ayahNumber,
        text: getFallbackTafsir(surahNumber, ayahNumber),
        source: source?.name || selectedSource,
      })
      
      setError(`Failed to load from API: ${errorMessage}. Showing fallback content.`)
    } finally {
      setLoading(false)
    }
  }, [isOpen, surahNumber, ayahNumber, selectedSource])

  // Fetch tafsir when modal opens or ayah/source changes
  useEffect(() => {
    fetchTafsir()
  }, [fetchTafsir])

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTafsir(null)
      setError(null)
      setRetryCount(0)
    }
  }, [isOpen])

  const handlePrevAyah = () => {
    if (ayahNumber > 1) {
      onNavigate?.(ayahNumber - 1)
    }
  }

  const handleNextAyah = () => {
    if (totalAyahs && ayahNumber < totalAyahs) {
      onNavigate?.(ayahNumber + 1)
    }
  }

  const handleSourceChange = (newSource: string) => {
    setSelectedSource(newSource)
    // fetchTafsir will be triggered by useEffect
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    fetchTafsir()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-background border-t border-border rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Tafsir</h2>
                  <p className="text-sm text-muted-foreground">
                    Surah {surahNumber} · Ayah {ayahNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handlePrevAyah} 
                  disabled={ayahNumber <= 1}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleNextAyah} 
                  disabled={totalAyahs ? ayahNumber >= totalAyahs : false}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Source Selection */}
            <div className="px-4 py-3 border-b border-border">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Select Source
              </label>
              <div className="flex gap-2 flex-wrap">
                {TAFSIR_SOURCES.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => handleSourceChange(source.id)}
                    disabled={loading}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50 ${
                      selectedSource === source.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {source.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Notice */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-3 bg-yellow-500/10 border-b border-yellow-500/20 flex items-start gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-700">{error}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRetry} className="h-8 px-2 flex-shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading tafsir...</p>
                </div>
              ) : tafsir ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="text-sm text-muted-foreground mb-4 pb-4 border-b border-border flex items-center justify-between">
                    <span>Source: {tafsir.source}</span>
                    {error && <span className="text-yellow-600 text-xs">(Fallback content)</span>}
                  </div>
                  <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {tafsir.text}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Failed to load tafsir</p>
                  <Button variant="outline" size="sm" onClick={handleRetry} className="mt-3">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
