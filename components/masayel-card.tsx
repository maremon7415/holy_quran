'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, BookOpenCheck } from 'lucide-react'
import { Masayel } from '@/lib/masayel-data'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'

interface MasayelCardProps {
  masayel: Masayel
}

export default function MasayelCard({ masayel }: MasayelCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { language, translationFontSize } = useAppStore()
  const { t } = useI18n()

  const question = language === 'bn' ? masayel.question.bn : masayel.question.en
  const answer = language === 'bn' ? masayel.answer.bn : masayel.answer.en

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between p-5 text-left md:p-6 bg-transparent hover:bg-muted/10 transition-colors"
      >
        <div className="flex gap-4 pr-4">
          <BookOpenCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 
              className="font-medium text-foreground leading-relaxed"
              style={{ fontSize: `${translationFontSize}px` }}
            >
              {question}
            </h3>
            <span className="inline-block mt-2 text-xs font-semibold uppercase tracking-wider text-primary/70 bg-primary/5 px-2 py-1 rounded">
              {masayel.category}
            </span>
          </div>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="p-5 md:p-6 pt-0 md:pt-0 border-t border-border/50">
              <div 
                className="text-muted-foreground leading-relaxed mt-4"
                style={{ fontSize: `${translationFontSize}px` }}
              >
                {answer}
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-medium">
                  {t('reference', { defaultValue: 'Source / Reference' })}
                </span>
                <span className="text-xs text-foreground font-medium">
                  {masayel.reference}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
