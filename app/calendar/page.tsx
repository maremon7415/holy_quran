'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Sidebar from '@/components/sidebar'
import { useI18n } from '@/lib/i18n'
import HijriCalendarGrid from '@/components/hijri-calendar'

export default function CalendarPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true)
      try {
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        const res = await fetch(`https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`)
        const data = await res.json()
        if (data.code === 200) {
          setCalendarData(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch calendar', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCalendar()
  }, [currentDate])

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  return (
    <main className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <Sidebar />

      <div className="max-w-4xl mx-auto px-4 py-8 mt-16 md:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <CalendarIcon className="w-4 h-4 rotate-180" /> {t('back', { defaultValue: 'Back' })}
          </button>
          
          <div className="flex items-center gap-3 mb-6">
            <CalendarIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              {t('islamic_calendar', { defaultValue: 'Islamic Calendar' })}
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center bg-card border border-border rounded-2xl p-4 gap-4 shadow-sm">
            <h2 className="text-xl font-medium text-foreground">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            
            <div className="flex gap-2">
              <button 
                onClick={prevMonth}
                className="p-2 bg-muted/50 hover:bg-muted rounded-full transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-muted/50 hover:bg-muted rounded-full text-sm font-medium transition-colors"
              >
                Today
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 bg-muted/50 hover:bg-muted rounded-full transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="h-96 bg-muted/50 rounded-3xl animate-pulse"></div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <HijriCalendarGrid 
              month={currentDate.getMonth()} 
              year={currentDate.getFullYear()} 
              calendarData={calendarData} 
            />
          </motion.div>
        )}
      </div>
    </main>
  )
}
