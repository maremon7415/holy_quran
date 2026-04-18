'use client'

import { Globe, Languages, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

const modalTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
}

export interface SurahLanguageOptions {
  arabic: boolean
  english: boolean
  bengali: boolean
}

interface LanguageSelectionModalProps {
  open: boolean
  value: SurahLanguageOptions
  onClose: () => void
  onChange: (value: SurahLanguageOptions) => void
}

export default function LanguageSelectionModal({
  open,
  value,
  onClose,
  onChange,
}: LanguageSelectionModalProps) {
  const { t } = useI18n()

  const toggle = (key: keyof SurahLanguageOptions) => {
    const next = { ...value, [key]: !value[key] }
    if (!next.arabic && !next.english && !next.bengali) {
      return
    }
    onChange(next)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={modalTransition}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
            aria-label="Close language selection modal"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 18 }}
            transition={modalTransition}
            className="fixed top-1/2 left-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <Languages className="w-5 h-5 text-primary" />
                {t('reading_languages')}
              </h3>
              <button
                onClick={onClose}
                className="relative z-10 rounded-full p-2 transition-colors hover:bg-muted"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
                <LanguageOption
                label={t('arabic_text')}
                description={t('original_quranic_arabic')}
                checked={value.arabic}
                onToggle={() => toggle('arabic')}
              />
              <LanguageOption
                label={t('english_translation')}
                description={t('umm_muhammad_translation')}
                checked={value.english}
                onToggle={() => toggle('english')}
              />
              <LanguageOption
                label={t('bengali_translation')}
                description={t('muhiuddin_khan_translation')}
                checked={value.bengali}
                onToggle={() => toggle('bengali')}
              />
            </div>

            <div className="px-5 pb-5 text-xs text-muted-foreground flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" />
              {t('keep_one_language_selected')}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function LanguageOption({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string
  description: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full p-4 rounded-xl border text-left transition-colors ${
        checked
          ? 'border-primary bg-primary/5'
          : 'border-border bg-muted/20 hover:bg-muted/40'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <span
          className={`w-5 h-5 rounded-md border inline-flex items-center justify-center text-[10px] font-bold ${
            checked
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-border text-transparent'
          }`}
        >
          ✓
        </span>
      </div>
    </button>
  )
}
