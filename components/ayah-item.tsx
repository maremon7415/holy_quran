'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookmarkCheck,
  BookmarkPlus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Tag,
  X,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'

interface AyahItemProps {
  ayahNumber: number
  arabicText?: string
  englishText?: string
  bengaliText?: string
  surahNumber: number
  surahName: string
  totalAyahs: number
}

export default function AyahItem({
  ayahNumber,
  arabicText,
  englishText,
  bengaliText,
  surahNumber,
  surahName,
  totalAyahs,
}: AyahItemProps) {
  const {
    ayahFontSize,
    translationFontSize,
    arabicFont,
    banglaFont,
    englishFont,
    importantAyahs,
    addImportantAyah,
    removeImportantAyah,
    markAyahAsRead,
    readVerses,
  } = useAppStore()
  const { data: session } = useSession()
  const { t } = useI18n()

  const [expanded, setExpanded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showTagPanel, setShowTagPanel] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [isImportant, setIsImportant] = useState(false)
  const [currentTags, setCurrentTags] = useState<string[]>([])

  const isRead = useMemo(
    () => readVerses.some((v) => v.surahNumber === surahNumber && v.ayahNumber === ayahNumber),
    [readVerses, surahNumber, ayahNumber]
  )
  const hasTranslations = Boolean(englishText || bengaliText)

  useEffect(() => {
    const important = importantAyahs.find(
      (ayah) => ayah.surahNumber === surahNumber && ayah.ayahNumber === ayahNumber
    )
    setIsImportant(Boolean(important))
    setCurrentTags(important?.tags || [])
  }, [importantAyahs, surahNumber, ayahNumber])

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
          title: `${surahName} - Verse ${ayahNumber}`,
          surahNumber,
          ayahNumber,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setIsBookmarked(!data.deleted)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddTag = () => {
    const cleaned = newTag.trim()
    if (!cleaned || currentTags.includes(cleaned)) {
      return
    }

    const updatedTags = [...currentTags, cleaned]
    setCurrentTags(updatedTags)
    addImportantAyah({
      surahNumber,
      ayahNumber,
      tags: updatedTags,
    })
    setIsImportant(true)
    setNewTag('')
  }

  const handleRemoveTag = (tag: string) => {
    const updatedTags = currentTags.filter((item) => item !== tag)
    setCurrentTags(updatedTags)

    if (updatedTags.length === 0) {
      setIsImportant(false)
      removeImportantAyah(surahNumber, ayahNumber)
    } else {
      addImportantAyah({
        surahNumber,
        ayahNumber,
        tags: updatedTags,
      })
    }
  }

  const handleMarkAsRead = () => {
    if (isRead) {
      return
    }
    markAyahAsRead(surahNumber, ayahNumber, {
      surahName,
      totalAyahs,
    })
  }

  return (
    <motion.div
      layout
      id={`ayah-${ayahNumber}`}
      className={`bg-card border rounded-2xl p-6 md:p-8 mb-6 transition-all duration-300 group relative overflow-hidden ${
        isRead
          ? 'border-emerald-500/50 shadow-emerald-500/10 shadow-lg'
          : 'border-border/60 hover:border-primary/40 hover:shadow-lg dark:hover:border-primary/55'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex items-center justify-between mb-8">
        <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 text-primary text-base font-bold border-2 border-primary/20 shadow-lg">
          {ayahNumber}
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAsRead}
            className={`h-9 px-3 ${
              isRead
                ? 'bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/18'
                : 'text-foreground/80 hover:bg-primary/10 hover:text-primary dark:text-foreground/85 dark:hover:bg-primary/14'
            }`}
            title={isRead ? t('already_read') : t('mark_read')}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="ml-1 hidden sm:inline">{isRead ? t('read') : t('mark_read')}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTagPanel(!showTagPanel)}
            className={`h-9 px-3 ${isImportant ? 'bg-yellow-500/10 text-yellow-600' : ''}`}
            title={t('add_tags')}
          >
            <Tag className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleBookmark}
            disabled={isSaving}
            className={`h-9 px-3 ${isBookmarked ? 'bg-primary/10 text-primary' : ''}`}
            title={isBookmarked ? t('remove_bookmark') : t('add_bookmark')}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isBookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <BookmarkPlus className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showTagPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6"
          >
            <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{t('tags')}</span>
              </div>

              {currentTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {currentTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} aria-label={t('remove_tag', { tag })}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder={t('add_tag_placeholder')}
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  className="h-9 text-sm"
                />
                <Button size="sm" onClick={handleAddTag} className="h-9">
                  <Tag className="w-3 h-3 mr-1" />
                  {t('add')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {arabicText && (
        <div
          className={`text-right leading-[2.2] md:leading-[2.4] text-foreground ${arabicFont} relative`}
          style={{ fontSize: `${ayahFontSize}px`, direction: 'rtl' }}
        >
          <span className="relative z-10">{arabicText}</span>
          {ayahNumber === 1 && (
            <div className="absolute -top-2 left-0 text-xs text-primary/50 font-medium">{surahName}</div>
          )}
        </div>
      )}

      {hasTranslations && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-3 mt-2 group"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span className="relative">
            {expanded ? t('hide_translations') : t('view_translations')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all" />
          </span>
        </button>
      )}

      <AnimatePresence>
        {expanded && hasTranslations && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4 border-t border-border/50 mt-2">
              {englishText && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`rounded-xl border border-border/40 bg-muted/45 p-5 text-foreground ${englishFont} transition-colors hover:bg-muted/60 dark:border-border/60 dark:bg-muted/30 dark:text-foreground/95 dark:hover:bg-muted/45`}
                >
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/30">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      {t('english_translation_label')}
                    </span>
                  </div>
                  <p className="leading-relaxed" style={{ fontSize: `${translationFontSize}px` }}>{englishText}</p>
                </motion.div>
              )}

              {bengaliText && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`rounded-xl border border-border/40 bg-muted/45 p-5 text-foreground ${banglaFont} transition-colors hover:bg-muted/60 dark:border-border/60 dark:bg-muted/30 dark:text-foreground/95 dark:hover:bg-muted/45`}
                >
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/30">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      {t('bengali_translation_label')}
                    </span>
                  </div>
                  <p className="leading-relaxed" style={{ fontSize: `${translationFontSize}px` }}>{bengaliText}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
