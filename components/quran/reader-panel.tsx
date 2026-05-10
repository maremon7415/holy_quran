'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Play, Pause, Bookmark, BookmarkCheck, MoreHorizontal, BookOpen, StickyNote, CheckCircle2, Tag, Loader2 } from 'lucide-react'
import { Ayah } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'

const TafsirViewer = dynamic(() => import('@/components/tafsir-viewer'), { ssr: false })
const AyahNotes = dynamic(() => import('@/components/ayah-notes'), { ssr: false })

interface TranslationData {
  ayahs: Array<{ number: number; text: string }>
}

interface ReaderPanelProps {
  surahNumber: number
  surahName: string
  surahArabicName: string
  ayahs: Ayah[]
  englishTranslation: TranslationData | null
  bengaliTranslation: TranslationData | null
  totalAyahs: number
  revelationType?: 'Meccan' | 'Medinan'
}

function AyahBlock({
  ayah,
  surahNumber,
  surahName,
  totalAyahs,
  englishText,
  bengaliText,
  playingAyah,
  onPlayAyah,
  isRead,
  languageOptions,
}: {
  ayah: Ayah
  surahNumber: number
  surahName: string
  totalAyahs: number
  englishText?: string
  bengaliText?: string
  playingAyah: number | null
  onPlayAyah: (ayahNumber: number) => void
  isRead: boolean
  languageOptions: { arabic: boolean; english: boolean; bengali: boolean }
}) {
  const {
    ayahFontSize,
    translationFontSize,
    arabicFont,
    banglaFont,
    englishFont,
    markAyahAsRead,
    importantAyahs,
    addImportantAyah,
    removeImportantAyah,
  } = useAppStore()
  const { data: session } = useSession()
  const { t } = useI18n()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isImportant, setIsImportant] = useState(false)
  const [showTafsir, setShowTafsir] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [hasBeenViewed, setHasBeenViewed] = useState(false)
  const isPlaying = playingAyah === ayah.numberInSurah

  useEffect(() => {
    const important = importantAyahs.find(
      (a) => a.surahNumber === surahNumber && a.ayahNumber === ayah.numberInSurah
    )
    setIsImportant(Boolean(important))
  }, [importantAyahs, surahNumber, ayah.numberInSurah])

  useEffect(() => {
    const element = document.getElementById(`quran-ayah-${ayah.numberInSurah}`)
    if (!element || isRead) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenViewed) {
            setHasBeenViewed(true)
            setTimeout(() => {
              markAyahAsRead(surahNumber, ayah.numberInSurah, {
                surahName,
                totalAyahs,
              })
            }, 2000)
          }
        })
      },
      { threshold: 0.5, rootMargin: '-10% 0px -10% 0px' }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [surahNumber, ayah.numberInSurah, surahName, totalAyahs, isRead, hasBeenViewed, markAyahAsRead])

  const toggleBookmark = async () => {
    if (!session) {
      alert(t('login_required_bookmarks'))
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ayah',
          title: `${surahName} - Verse ${ayah.numberInSurah}`,
          surahNumber,
          ayahNumber: ayah.numberInSurah,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setIsBookmarked(!data.deleted)
      }
    } catch {}
    setIsSaving(false)
  }

  const toggleImportant = () => {
    if (isImportant) {
      removeImportantAyah(surahNumber, ayah.numberInSurah)
      setIsImportant(false)
    } else {
      addImportantAyah({ surahNumber, ayahNumber: ayah.numberInSurah, tags: ['important'] })
      setIsImportant(true)
    }
  }

  return (
    <>
      <div
        id={`quran-ayah-${ayah.numberInSurah}`}
        className={`group flex gap-4 py-6 border-b border-border/40 last:border-b-0 transition-colors ${
          isRead ? 'bg-emerald-500/3' : ''
        } ${isPlaying ? 'border-l-4 border-l-primary bg-primary/5 pl-4' : ''}`}
      >
        <div className="flex flex-col items-center gap-1.5 pt-1 shrink-0 w-10">
          <span className="text-[10px] font-bold text-muted-foreground">{ayah.numberInSurah}</span>
          <button
            onClick={() => onPlayAyah(ayah.numberInSurah)}
            className={`p-1.5 rounded-lg transition-colors ${
              isPlaying
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-primary'
            }`}
            title={t('play_audio')}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={toggleBookmark}
            disabled={isSaving}
            className={`p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors ${
              isBookmarked ? 'text-primary bg-primary/10' : ''
            }`}
            title={t('add_bookmark')}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isBookmarked ? (
              <BookmarkCheck className="w-3.5 h-3.5" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={toggleImportant}
            className={`p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors ${
              isImportant ? 'text-yellow-500 bg-yellow-500/10' : ''
            }`}
            title={t('add_tags')}
          >
            <Tag className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowTafsir(true)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
            title={t('view_tafsir')}
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowNotes(true)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
            title={t('add_note')}
          >
            <StickyNote className="w-3.5 h-3.5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMore(!showMore)}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {showMore && (
              <div className="absolute left-10 top-0 z-20 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[140px]">
                <button
                  onClick={() => {
                    markAyahAsRead(surahNumber, ayah.numberInSurah, { surahName, totalAyahs })
                    setShowMore(false)
                  }}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-muted flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isRead ? t('already_read') : t('mark_read')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {languageOptions.arabic && (
            <div
              className={`leading-[2.4] md:leading-[2.8] tracking-wide text-foreground quran-arabic-text px-1 ${arabicFont}`}
              style={{ fontSize: `${ayahFontSize}px`, direction: 'rtl', unicodeBidi: 'plaintext', fontFeatureSettings: "'liga' 1" }}
            >
              <span className="inline" dir="rtl">{ayah.text}</span>
            </div>
          )}

          <div className="mt-3 space-y-3">
            {languageOptions.english && englishText && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 block mb-1">
                  {t('english_translation_label')}
                </span>
                <p
                  className={`text-foreground/90 leading-relaxed quran-translation-text ${englishFont}`}
                  style={{ fontSize: `${translationFontSize}px` }}
                >
                  {englishText}
                </p>
              </div>
            )}

            {languageOptions.bengali && bengaliText && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 block mb-1">
                  {t('bengali_translation_label')}
                </span>
                <p
                  className={`text-foreground/85 leading-relaxed quran-translation-text ${banglaFont}`}
                  style={{ fontSize: `${translationFontSize}px` }}
                >
                  {bengaliText}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground/60 uppercase tracking-wider">
            <span>{t('verse')} {ayah.numberInSurah}</span>
            {ayah.juz > 0 && <span>Juz {ayah.juz}</span>}
            {ayah.page > 0 && <span>Pg {ayah.page}</span>}
            {isRead && <span className="text-emerald-600">{t('read')}</span>}
          </div>
        </div>
      </div>

      <TafsirViewer
        surahNumber={surahNumber}
        ayahNumber={ayah.numberInSurah}
        isOpen={showTafsir}
        onClose={() => setShowTafsir(false)}
        totalAyahs={totalAyahs}
      />

      <AyahNotes
        surahNumber={surahNumber}
        ayahNumber={ayah.numberInSurah}
        surahName={surahName}
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
      />
    </>
  )
}

export default function ReaderPanel({
  surahNumber,
  surahName,
  surahArabicName,
  ayahs,
  englishTranslation,
  bengaliTranslation,
  totalAyahs,
  revelationType,
}: ReaderPanelProps) {
  const { language } = useAppStore()
  const { t } = useI18n()
  const { audioState, playAyah } = useAppStore()
  const [languageOptions, setLanguageOptions] = useState({
    arabic: true,
    english: true,
    bengali: language === 'bn',
  })

  useEffect(() => {
    setLanguageOptions({
      arabic: true,
      english: true,
      bengali: language === 'bn',
    })
  }, [language])

  const { readVerses } = useAppStore()

  const translationIndex = useMemo(() => {
    const map = new Map<number, { en?: string; bn?: string }>()
    englishTranslation?.ayahs.forEach((a) => {
      const existing = map.get(a.number) || {}
      map.set(a.number, { ...existing, en: a.text })
    })
    bengaliTranslation?.ayahs.forEach((a) => {
      const existing = map.get(a.number) || {}
      map.set(a.number, { ...existing, bn: a.text })
    })
    return map
  }, [englishTranslation, bengaliTranslation])

  const handlePlayAyah = useCallback((ayahNumber: number) => {
    playAyah(surahNumber, ayahNumber)
  }, [surahNumber, playAyah])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 lg:px-10 pb-28">
        <div className="text-center pt-4 pb-2">
          {revelationType && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium mb-2 ${
              revelationType === 'Meccan' 
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' 
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
            }`}>
              <span>🕌</span>
              <span>{revelationType}</span>
            </span>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{surahName}</h1>
          <div className="text-2xl md:text-3xl text-foreground/80 mb-2" dir="rtl">
            {surahArabicName}
          </div>
          <p className="text-sm text-muted-foreground">
            {totalAyahs} {t('verses')} · {ayahs[0]?.juz ? `Juz ${ayahs[0].juz}` : ''}
          </p>
        </div>

        <div className="flex items-start justify-start mt-3 mb-4">
          {(['arabic', 'english', 'bengali'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() =>
                setLanguageOptions((prev) => ({
                  ...prev,
                  [lang]: !prev[lang],
                }))
              }
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                languageOptions[lang]
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {lang === 'arabic' ? 'Arabic' : lang === 'english' ? 'English' : 'Bengali'}
            </button>
          ))}
        </div>

        {ayahs.map((ayah) => {
          const translations = translationIndex.get(ayah.number)
          const isRead = readVerses.some(
            (v) => v.surahNumber === surahNumber && v.ayahNumber === ayah.numberInSurah
          )
          return (
            <AyahBlock
              key={ayah.number}
              ayah={ayah}
              surahNumber={surahNumber}
              surahName={surahName}
              totalAyahs={totalAyahs}
              englishText={translations?.en}
              bengaliText={translations?.bn}
              playingAyah={audioState.isPlaying && audioState.surahNumber === surahNumber ? audioState.ayahNumber : null}
              onPlayAyah={handlePlayAyah}
              isRead={isRead}
              languageOptions={languageOptions}
            />
          )
        })}
      </div>
    </div>
  )
}

function HeadphonesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  )
}