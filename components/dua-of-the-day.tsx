'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookHeart } from 'lucide-react'
import { Dua, getAllDuas } from '@/lib/dua-data'
import { useI18n } from '@/lib/i18n'
import { useAppStore } from '@/lib/store'

export default function DuaOfTheDay() {
  const [dua, setDua] = useState<Dua | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useI18n()
  const { language, arabicFont } = useAppStore()

  useEffect(() => {
    const fetchDua = async () => {
      try {
        const data = await getAllDuas()
        if (data && data.length > 0) {
          // Select a random dua for the day based on the date
          const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
          const index = dayOfYear % data.length
          setDua(data[index])
        }
      } catch (error) {
        console.error('Failed to fetch dua of the day', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDua()
  }, [])

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 h-[200px] animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-muted rounded-full"></div>
          <div className="h-5 w-32 bg-muted rounded"></div>
        </div>
        <div className="h-12 bg-muted/60 rounded mb-2"></div>
        <div className="h-8 bg-muted/40 rounded w-2/3"></div>
      </div>
    )
  }

  if (!dua) return null

  const translation = language === 'bn' ? dua.translation.bn : dua.translation.en

  return (
    <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-primary/30 transition-colors">
      <div className="absolute -bottom-10 -right-10 text-primary/5 group-hover:text-primary/10 transition-colors">
        <BookHeart className="w-48 h-48" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BookHeart className="w-5 h-5 text-primary" />
            {t('dua_of_day')}
          </h3>
          <Link href="/dua" className="text-sm text-primary hover:underline flex items-center gap-1">
            {t('view_all', { defaultValue: 'View All' })} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <p className="text-xl text-center font-arabic text-foreground mb-3 leading-loose" dir="rtl">
            {dua.arabic}
          </p>
          
          <p className="text-sm text-muted-foreground text-center line-clamp-2 italic">
            "{translation}"
          </p>
        </div>
        
        <div className="mt-4 flex justify-between items-center border-t border-border/50 pt-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-primary/70">
            {dua.category}
          </span>
          <span className="text-xs text-muted-foreground">
            {dua.reference}
          </span>
        </div>
      </div>
    </div>
  )
}
