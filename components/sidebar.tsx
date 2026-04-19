'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Settings, Type, Languages } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Sidebar() {
  const {
    translationFontSize,
    setTranslationFontSize,
    ayahFontSize,
    setAyahFontSize,
    arabicFont,
    setArabicFont,
    englishFont,
    setEnglishFont,
    banglaFont,
    setBanglaFont,
  } = useAppStore()

  const [isOpen, setIsOpen] = useState(false)
  const { t } = useI18n()

  const handleTranslationFontChange = (delta: number) => {
    setTranslationFontSize(Math.max(12, Math.min(32, translationFontSize + delta)))
  }

  const handleAyahFontChange = (delta: number) => {
    setAyahFontSize(Math.max(18, Math.min(64, ayahFontSize + delta)))
  }

  const arabicFonts = [
    { name: 'Amiri', value: 'font-amiri' },
    { name: 'Cairo', value: 'font-cairo' },
    { name: 'Lateef', value: 'font-lateef' },
  ]

  const englishFonts = [
    { name: 'Inter', value: 'font-inter' },
    { name: 'Merriweather', value: 'font-merriweather' },
    { name: 'Outfit', value: 'font-outfit' },
  ]

  const banglaFonts = [
    { name: 'Noto Sans', value: 'font-noto-bengali' },
    { name: 'Hind Siliguri', value: 'font-hind-siliguri' },
    { name: 'Tiro Bangla', value: 'font-tiro-bangla' },
  ]

  useEffect(() => {
    const openSettings = () => setIsOpen(true)
    window.addEventListener('open-settings-drawer', openSettings)
    return () => window.removeEventListener('open-settings-drawer', openSettings)
  }, [])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex items-center justify-center rounded-full bg-primary p-3 text-primary-foreground shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl sm:bottom-8 sm:right-8 sm:p-4"
      >
        <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]"
            />
            
            {/* Modal Content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="pointer-events-auto relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-[32px] border border-primary/15 bg-background shadow-[0_40px_100px_-40px_rgba(36,81,61,0.5)] backdrop-blur-xl dark:border-primary/20 dark:bg-card"
              >
                <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top_right,rgba(36,81,61,0.12),transparent_40%)] opacity-50" />

                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute right-4 top-4 z-20 p-2.5 rounded-full bg-muted/50 hover:bg-muted transition-all active:scale-90 text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="relative z-10 p-5 sm:p-7">
                  <header className="mb-5 flex items-center justify-between pr-10">
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-foreground">
                        {t('display_settings')}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                          {t('personalization', { defaultValue: 'Personalize' })}
                        </span>
                      </div>
                    </div>
                  </header>

                  <div className="space-y-4">
                    {/* Sizes Section - COMPACT */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <SizeControl
                        label={t('translation_text_size')}
                        value={translationFontSize}
                        onDecrease={() => handleTranslationFontChange(-2)}
                        onIncrease={() => handleTranslationFontChange(2)}
                      />
                      <SizeControl
                        label={t('arabic_verse_text_size')}
                        value={ayahFontSize}
                        onDecrease={() => handleAyahFontChange(-2)}
                        onIncrease={() => handleAyahFontChange(2)}
                      />
                    </div>

                    {/* Fonts Section - COMPACT */}
                    <div className="rounded-3xl border border-primary/10 bg-muted/10 p-4 space-y-3">
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <Languages className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">{t('fonts')}</span>
                      </div>
                      
                      <div className="grid gap-2">
                        <CompactFontSelect
                          label={t('arabic_font')}
                          value={arabicFont}
                          onValueChange={setArabicFont}
                          options={arabicFonts}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <CompactFontSelect
                            label={t('english_font')}
                            value={englishFont}
                            onValueChange={setEnglishFont}
                            options={englishFonts}
                          />
                          <CompactFontSelect
                            label={t('bangla_font')}
                            value={banglaFont}
                            onValueChange={setBanglaFont}
                            options={banglaFonts}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                    >
                      {t('apply', { defaultValue: 'Apply Changes' })}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function SizeControl({
  label,
  value,
  onDecrease,
  onIncrease,
}: {
  label: string
  value: number
  onDecrease: () => void
  onIncrease: () => void
}) {
  return (
    <div className="rounded-2xl bg-muted/20 border border-border/50 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-[11px] font-bold text-primary">{value}px</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onDecrease} className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-background border border-border/60 text-xs font-black hover:border-primary/40 active:scale-90 transition-all">-</button>
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${Math.max(20, Math.min(100, value * 1.5))}%` }} />
        </div>
        <button onClick={onIncrease} className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-background border border-border/60 text-xs font-black hover:border-primary/40 active:scale-90 transition-all">+</button>
      </div>
    </div>
  )
}

function CompactFontSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: Array<{ name: string; value: string }>
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">{label}</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full h-11 rounded-xl bg-background border-border/60 text-[11px] font-bold focus:ring-1 focus:ring-primary/20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs font-medium">
              {o.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
