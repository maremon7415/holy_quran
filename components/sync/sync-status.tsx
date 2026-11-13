'use client'
import { Check, CloudOff, Loader2, TriangleAlert, Pause } from 'lucide-react'
import { useTx } from '@/lib/lang'
import { useSyncState, type SyncStatus } from '@/lib/sync/state'
import { cn } from '@/lib/utils'

export function useStatusLabel() {
  const t = useTx()
  return (s: SyncStatus): string => {
    switch (s) {
      case 'synced': return t({ en: 'Synced', bn: 'সিঙ্ক হয়েছে' })
      case 'syncing': return t({ en: 'Syncing…', bn: 'সিঙ্ক হচ্ছে…' })
      case 'offline': return t({ en: 'Offline — will sync later', bn: 'অফলাইন — পরে সিঙ্ক হবে' })
      case 'error': return t({ en: 'Sync problem', bn: 'সিঙ্ক সমস্যা' })
      case 'paused': return t({ en: 'Sync is off', bn: 'সিঙ্ক বন্ধ' })
      case 'signed-out': return t({ en: 'Not signed in', bn: 'সাইন ইন করা নেই' })
      case 'disabled': return t({ en: 'Accounts not enabled', bn: 'অ্যাকাউন্ট চালু নেই' })
      default: return t({ en: 'Checking…', bn: 'যাচাই হচ্ছে…' })
    }
  }
}

export function StatusIcon({ status, className }: { status: SyncStatus; className?: string }) {
  const c = cn('size-4', className)
  if (status === 'syncing' || status === 'checking' || status === 'idle') return <Loader2 className={cn(c, 'animate-spin')} />
  if (status === 'synced') return <Check className={c} />
  if (status === 'offline') return <CloudOff className={c} />
  if (status === 'paused') return <Pause className={c} />
  return <TriangleAlert className={c} />
}

export function SyncStatusPill({ className }: { className?: string }) {
  const status = useSyncState((s) => s.status)
  const label = useStatusLabel()
  const tone = status === 'synced' ? 'bg-primary/10 text-primary' : status === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
  return (
    <span role="status" className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', tone, className)}>
      <StatusIcon status={status} className="size-3.5" />
      {label(status)}
    </span>
  )
}

export function timeAgo(iso: string | null | undefined, lang: 'en' | 'bn'): string {
  if (!iso) return lang === 'bn' ? 'কখনো নয়' : 'never'
  const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000)
  const bn = lang === 'bn'
  if (s < 45) return bn ? 'এইমাত্র' : 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return bn ? `${m} মিনিট আগে` : `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return bn ? `${h} ঘণ্টা আগে` : `${h} h ago`
  const d = Math.round(h / 24)
  return bn ? `${d} দিন আগে` : `${d} d ago`
}
