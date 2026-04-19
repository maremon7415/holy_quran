'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Activity } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useAppStore } from '@/lib/store'

export default function DhikrWidget() {
  const [count, setCount] = useState(0)
  const { t } = useI18n()
  const { addDhikrSession } = useAppStore()

  const handleTap = (e: React.MouseEvent) => {
    e.preventDefault()
    setCount(c => c + 1)
    if (navigator.vibrate) navigator.vibrate(20)
  }

  const handleSave = () => {
    if (count > 0) {
      addDhikrSession(count)
      setCount(0)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          {t('dhikr_counter', { defaultValue: 'Quick Dhikr' })}
        </h3>
        <Link 
          href="/dhikr"
          onClick={handleSave} 
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          {t('open', { defaultValue: 'Open Counter' })} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <button
          onClick={handleTap}
          className="w-20 h-20 shrink-0 bg-primary/10 hover:bg-primary/20 text-primary rounded-full flex flex-col items-center justify-center transition-transform active:scale-90 border border-primary/20"
        >
          <span className="text-2xl font-bold font-mono tracking-tighter leading-none mb-1 text-foreground">
            {count}
          </span>
          <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
            TAP
          </span>
        </button>
        
        <div className="flex-1">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${Math.min((count / 33) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground flex justify-between">
            <span>Progress (33)</span>
            {count >= 33 && <span className="text-primary font-medium">Goal reached!</span>}
          </p>
        </div>
      </div>
    </div>
  )
}
