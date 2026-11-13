'use client'
import { useAppStore } from '@/lib/store'
import { useLang } from '@/lib/lang'
import { cn } from '@/lib/utils'

const LANGS = [
  { id: 'en', label: 'EN' },
  { id: 'bn', label: 'বাং' },
] as const

export function LanguageToggle({ className }: { className?: string }) {
  const lang = useLang()
  const setLanguage = useAppStore((s) => s.setLanguage)
  return (
    <div className={cn('relative flex rounded-full bg-muted p-0.5 text-xs font-semibold', className)} role="radiogroup" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l.id}
          role="radio"
          aria-checked={lang === l.id}
          onClick={() => {
            setLanguage(l.id)
            document.documentElement.lang = l.id
            document.documentElement.dataset.lang = l.id
          }}
          className={cn('relative z-10 rounded-full px-2.5 py-1 transition-colors', lang === l.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
