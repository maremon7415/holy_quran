'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, Languages } from 'lucide-react'
import Navbar from '@/components/navbar'
import Sidebar from '@/components/sidebar'
import ShortcutPanel from '@/components/shortcut-panel'
import AyahItem from '@/components/ayah-item'
import LoadingSpinner from '@/components/loading-spinner'
import LanguageSelectionModal, {
  SurahLanguageOptions,
} from '@/components/language-selection-modal'
import { getSurahDetails, getSurahTranslation, Ayah } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'

interface TranslationData {
  ayahs: Array<{
    number: number
    text: string
  }>
}

function initialOptions(language: 'en' | 'ar' | 'bn'): SurahLanguageOptions {
  return { arabic: true, english: true, bengali: true }
}

export default function SurahPage() {
  const params = useParams()
  const router = useRouter()
  const { language, addToRecentlyViewed } = useAppStore()
  const { t } = useI18n()
  const surahId = params.id as string

  const [ayahs, setAyahs] = useState<Ayah[]>([])
  const [englishTranslation, setEnglishTranslation] = useState<TranslationData | null>(null)
  const [bengaliTranslation, setBengaliTranslation] = useState<TranslationData | null>(null)
  const [surahName, setSurahName] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [languageOptions, setLanguageOptions] = useState<SurahLanguageOptions>(initialOptions(language))

  useEffect(() => {
    setLanguageOptions(initialOptions(language))
  }, [language])

  useEffect(() => {
    if (loading) return
    const hash = window.location.hash
    if (hash && hash.startsWith('#ayah-')) {
      const ayahNumber = hash.replace('#ayah-', '')
      setTimeout(() => {
        const element = document.getElementById(`ayah-${ayahNumber}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.classList.add('ring-2', 'ring-primary', 'ring-offset-2')
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2')
          }, 3000)
        }
      }, 300)
    }
  }, [loading])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const surahNum = parseInt(surahId, 10)

        const details = await getSurahDetails(surahNum)
        if (details) {
          setAyahs(details.ayahs)
          setSurahName(details.englishName)
          addToRecentlyViewed({
            surahNumber: surahNum,
            surahName: details.englishName,
            lastAyahRead: 1,
          })
        }

        const [enTrans, bnTrans] = await Promise.all([
          getSurahTranslation(surahNum, 'en'),
          getSurahTranslation(surahNum, 'bn'),
        ])

        if (enTrans) {
          setEnglishTranslation(enTrans)
        }
        if (bnTrans) {
          setBengaliTranslation(bnTrans)
        }
      } catch (error) {
        console.error('Failed to fetch surah data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [surahId, addToRecentlyViewed])

  const translationIndex = useMemo(() => {
    const map = new Map<number, { en?: string; bn?: string }>()

    englishTranslation?.ayahs.forEach((ayah) => {
      const existing = map.get(ayah.number) || {}
      map.set(ayah.number, { ...existing, en: ayah.text })
    })

    bengaliTranslation?.ayahs.forEach((ayah) => {
      const existing = map.get(ayah.number) || {}
      map.set(ayah.number, { ...existing, bn: ayah.text })
    })

    return map
  }, [englishTranslation, bengaliTranslation])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <Sidebar />
        <ShortcutPanel />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LoadingSpinner />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <Sidebar />
      <ShortcutPanel />
      <LanguageSelectionModal
        open={modalOpen}
        value={languageOptions}
        onClose={() => setModalOpen(false)}
        onChange={setLanguageOptions}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          {t('back')}
        </motion.button>

        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-sm"
          >
            <Languages className="w-4 h-4 text-primary" />
            {t('reading_languages')}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 text-white mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{surahName}</h1>
          <p className="text-lg opacity-90">{ayahs.length} {t('verses')}</p>
          <p className="text-sm opacity-80 mt-2 italic">
            {t('read_full_surah_with_language')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {ayahs.map((ayah) => {
            const translations = translationIndex.get(ayah.number)
            return (
              <AyahItem
                key={ayah.number}
                ayahNumber={ayah.numberInSurah}
                arabicText={languageOptions.arabic ? ayah.text : undefined}
                englishText={languageOptions.english ? translations?.en : undefined}
                bengaliText={languageOptions.bengali ? translations?.bn : undefined}
                surahNumber={parseInt(surahId, 10)}
                surahName={surahName}
                totalAyahs={ayahs.length}
              />
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 1, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mt-12 py-8 border-t border-border"
        >
          <p className="text-muted-foreground text-sm">{t('quran_data_credit')}</p>
        </motion.div>
      </div>
    </main>
  )
}
