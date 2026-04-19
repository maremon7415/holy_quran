'use client'

import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import Navbar from '@/components/navbar'
import Sidebar from '@/components/sidebar'
import { useRouter } from 'next/navigation'
import DhikrCounter from '@/components/dhikr-counter'
import { useI18n } from '@/lib/i18n'

export default function DhikrPage() {
  const { t } = useI18n()
  const router = useRouter()

  return (
    <main className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <Sidebar />

      <div className="max-w-4xl mx-auto px-4 py-8 mt-16 md:mt-0 flex flex-col min-h-[calc(100vh-theme(spacing.16))]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <Activity className="w-4 h-4 rotate-180" /> {t('back', { defaultValue: 'Back' })}
          </button>
          
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              {t('dhikr_counter', { defaultValue: 'Dhikr Counter' })}
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Keep track of your daily tasbeeh and remembrance of Allah.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex items-center justify-center -mt-10"
        >
          <DhikrCounter />
        </motion.div>
      </div>
    </main>
  )
}
