'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, AlertTriangle, Mail, Phone, Globe, Github, MapPin, Construction, CheckCircle2, Sparkles, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

const modalTransition = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1] as const,
}

const STORAGE_KEY = 'quran-app-construction-notice-shown'

interface ConstructionNoticeModalProps {
  delay?: number // delay in seconds before showing
}

export default function ConstructionNoticeModal({ delay = 10 }: ConstructionNoticeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    // Check if already shown
    const hasShown = localStorage.getItem(STORAGE_KEY)
    if (hasShown) return

    // Show modal after delay
    const timer = setTimeout(() => {
      setIsOpen(true)
      // Mark as shown
      localStorage.setItem(STORAGE_KEY, 'true')
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [delay])

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={modalTransition}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            aria-label="Close construction notice modal"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={modalTransition}
            className="fixed top-1/2 left-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-yellow-500/10 p-6 border-b border-border">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                    <Construction className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {t('construction_notice', { defaultValue: 'Under Construction' })}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {t('construction_subtitle', { defaultValue: 'We\'re working hard to improve your experience' })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="relative z-10 rounded-full p-2 bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Main message card */}
              <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/30 border border-orange-200/50 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Info className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        {t('construction_message', { 
                          defaultValue: 'This website is under construction. If you see any errors, problems, or have suggestions for this website, please share them with the developer.' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Developer info section */}
              <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
                <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {t('developer_info', { defaultValue: 'Developer Info' })}
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Md. Emon Miah</p>
                      <p className="text-xs text-muted-foreground">Dhaka, Bangladesh</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <a 
                      href="mailto:dev@emon.pro" 
                      className="text-sm text-primary hover:underline"
                    >
                      dev@emon.pro
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <a 
                      href="tel:+8801785892074" 
                      className="text-sm text-primary hover:underline"
                    >
                      +880 1785 92074
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    <a 
                      href="http://www.emon.pro/" 
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      www.emon.pro
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Github className="w-4 h-4 text-primary" />
                    </div>
                    <a 
                      href="https://github.com/maremon7415" 
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      github.com/maremon7415
                    </a>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t('got_it', { defaultValue: 'Got it' })}
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1"
                >
                  {t('dismiss', { defaultValue: 'Dismiss' })}
                </Button>
              </div>
            </div>

            {/* Footer decoration */}
            <div className="px-6 pb-4">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span>{t('building_experience', { defaultValue: 'Building a better experience for you' })}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
