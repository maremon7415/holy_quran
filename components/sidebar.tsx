'use client'

import { useEffect, useState } from 'react'
import { Settings, Type, Languages } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto rounded-[28px] border border-primary/15 bg-background/95 p-0 shadow-[0_40px_120px_-50px_rgba(36,81,61,0.45)] backdrop-blur-md dark:border-primary/20 dark:bg-card/95 sm:max-w-2xl">
          <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top_right,rgba(36,81,61,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(36,81,61,0.10),transparent_26%)] opacity-90 dark:bg-[radial-gradient(circle_at_top_right,rgba(110,231,183,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(110,231,183,0.08),transparent_28%)]" />

          <div className="relative z-10 p-5 sm:p-6">
            <DialogHeader className="mb-6 text-left">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <Settings className="h-3.5 w-3.5" />
                {t('display_settings')}
              </div>
              <DialogTitle className="mt-3 text-2xl font-bold text-foreground">
                {t('display_settings')}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 md:grid-cols-2">
              <section className="rounded-3xl border border-primary/10 bg-background/80 p-5 backdrop-blur-sm dark:bg-background/40">
                <div className="mb-4 flex items-center gap-2">
                  <Type className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    {t('sizes')}
                  </h3>
                </div>

                <div className="space-y-4">
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
              </section>

              <section className="rounded-3xl border border-primary/10 bg-background/80 p-5 backdrop-blur-sm dark:bg-background/40">
                <div className="mb-4 flex items-center gap-2">
                  <Languages className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    {t('fonts')}
                  </h3>
                </div>

                <div className="space-y-4">
                  <FontSelect
                    label={t('arabic_font')}
                    value={arabicFont}
                    onValueChange={setArabicFont}
                    options={arabicFonts}
                  />
                  <FontSelect
                    label={t('english_font')}
                    value={englishFont}
                    onValueChange={setEnglishFont}
                    options={englishFonts}
                  />
                  <FontSelect
                    label={t('bangla_font')}
                    value={banglaFont}
                    onValueChange={setBanglaFont}
                    options={banglaFonts}
                  />
                </div>
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
    <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 dark:border-primary/20 dark:bg-primary/8">
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-primary shadow-sm dark:bg-background/80">
          {value}px
        </span>
      </div>

      <div className="grid grid-cols-[48px_1fr_48px] items-center gap-3">
        <button
          onClick={onDecrease}
          className="h-11 rounded-2xl border border-primary/12 bg-background text-base font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary"
        >
          A-
        </button>
        <div className="h-2 overflow-hidden rounded-full bg-primary/10">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.max(20, Math.min(100, value * 1.6))}%` }}
          />
        </div>
        <button
          onClick={onIncrease}
          className="h-11 rounded-2xl border border-primary/12 bg-background text-base font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary"
        >
          A+
        </button>
      </div>
    </div>
  )
}

function FontSelect({
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
    <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 dark:border-primary/20 dark:bg-primary/8">
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full rounded-2xl border-primary/12 bg-background px-4 py-6 shadow-none hover:border-primary/25">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
