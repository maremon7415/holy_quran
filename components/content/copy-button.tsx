'use client'
import { useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'
import { useTx } from '@/lib/lang'
import { cn } from '@/lib/utils'

const btn = 'inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground/80 transition hover:border-primary/40 hover:bg-accent hover:text-foreground active:scale-95'

export function CopyButton({ text, label, className }: { text: string; label?: { en: string; bn: string }; className?: string }) {
  const t = useTx()
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className={cn(btn, className)}
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800) } catch { /* ignore */ }
      }}
    >
      {done ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
      {done ? t({ en: 'Copied', bn: 'কপি হয়েছে' }) : t(label ?? { en: 'Copy', bn: 'কপি' })}
    </button>
  )
}

export function ShareButton({ title, text, path, className }: { title: string; text?: string; path: string; className?: string }) {
  const t = useTx()
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className={cn(btn, className)}
      onClick={async () => {
        const url = `${window.location.origin}${path}`
        try {
          if (navigator.share) await navigator.share({ title, text, url })
          else { await navigator.clipboard.writeText(url); setDone(true); setTimeout(() => setDone(false), 1800) }
        } catch { /* cancelled */ }
      }}
    >
      {done ? <Check className="size-3.5 text-primary" /> : <Share2 className="size-3.5" />}
      {done ? t({ en: 'Link copied', bn: 'লিংক কপি হয়েছে' }) : t({ en: 'Share', bn: 'শেয়ার' })}
    </button>
  )
}
