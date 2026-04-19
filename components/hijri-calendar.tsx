'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'

interface HijriCalendarGridProps {
  month: number
  year: number
  calendarData: any[]
}

interface IslamicEvent {
  id: string
  name: string
  nameBn: string
  hijriMonth: number
  hijriDay: number
}

export default function HijriCalendarGrid({ month, year, calendarData }: HijriCalendarGridProps) {
  const [events, setEvents] = useState<IslamicEvent[]>([])
  const { language } = useAppStore()

  useEffect(() => {
    fetch('/data/islamic-events.json')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(console.error)
  }, [])

  if (!calendarData || calendarData.length === 0) return null

  // Calculate empty padding days based on the first day of the month
  const firstDayStr = calendarData[0]?.gregorian?.date // "DD-MM-YYYY"
  const [d, m, y] = firstDayStr.split('-')
  const firstDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
  
  // 0 is Sunday, 1 is Monday in JS. Let's make Monday first (or Sunday based on locale. We'll use Sunday as 0 offset).
  let startDayOfWeek = firstDate.getDay() // 0-6

  const paddingDays = Array.from({ length: startDayOfWeek }).map((_, i) => null)
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} className="min-h-[80px] p-2 rounded-xl bg-muted/20 border border-transparent"></div>
        ))}
        
        {calendarData.map((dayData, i) => {
          const gregDay = dayData.gregorian.day
          const hijriMonthEn = dayData.hijri.month.en
          const hijriMonthNum = dayData.hijri.month.number
          const hijriDayStr = dayData.hijri.day
          
          // Check for events
          const hD = parseInt(hijriDayStr)
          const hM = parseInt(hijriMonthNum)
          
          const dayEvents = events.filter(e => e.hijriMonth === hM && e.hijriDay === hD)
          
          const isToday = new Date().getDate().toString().padStart(2, '0') === gregDay &&
                          new Date().getMonth() === month &&
                          new Date().getFullYear() === year

          return (
            <div 
              key={`day-${i}`} 
              className={`min-h-[80px] md:min-h-[100px] p-2 rounded-xl border flex flex-col transition-colors group ${
                isToday ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/30' : 'bg-background hover:bg-muted/30 border-border/50 hover:border-primary/20'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                  {gregDay}
                </span>
                <span className="text-xs font-semibold text-muted-foreground/70 bg-muted/30 px-1.5 py-0.5 rounded">
                  {hijriDayStr}
                </span>
              </div>
              
              <div className="mt-1 flex-1 flex flex-col">
                <span className="text-[10px] md:text-xs text-muted-foreground truncate" title={hijriMonthEn}>
                  {hijriMonthEn}
                </span>
                
                {dayEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="mt-auto bg-primary/10 text-primary text-[10px] md:text-xs font-medium px-1 py-0.5 rounded truncate"
                    title={language === 'bn' ? event.nameBn : event.name}
                  >
                    {language === 'bn' ? event.nameBn : event.name}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
