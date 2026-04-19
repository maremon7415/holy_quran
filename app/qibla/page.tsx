'use client'

import Navbar from '@/components/navbar'
import QiblaCompass from '@/components/qibla-compass'
import { motion } from 'framer-motion'
import { ArrowLeft, Compass } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function QiblaPage() {
  const { t } = useI18n()

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 pt-12">
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/" 
            className="p-2 rounded-full bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Compass className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-foreground">
              {t('qibla_finder', { defaultValue: 'Qibla Finder' })}
            </h1>
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-border rounded-[2.5rem] p-4 sm:p-10 shadow-xl overflow-hidden relative"
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10">
            <QiblaCompass />
          </div>
        </motion.section>

        {/* Informational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="p-6 rounded-3xl bg-muted/20 border border-border/50">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-3">{t('about_qibla', { defaultValue: 'About Qibla' })}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The Qibla is the direction towards the Kaaba in the Sacred Mosque in Mecca, Saudi Arabia. It is the direction used by Muslims in various religious contexts, particularly the direction of prayer for the salah.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-muted/20 border border-border/50">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-3">{t('accuracy_tips', { defaultValue: 'Accuracy Tips' })}</h3>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
              <li>{t('avoid_metals', { defaultValue: 'Avoid magnetic objects like keys or speakers.' })}</li>
              <li>{t('surface_flat', { defaultValue: 'Hold your device flat parallel to the ground.' })}</li>
              <li>{t('calibrate_often', { defaultValue: 'Calibrate your compass before each use.' })}</li>
              <li>{t('outdoor_gps', { defaultValue: 'Outdoor use provides better GPS accuracy.' })}</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
