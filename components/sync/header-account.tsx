'use client'
import Link from 'next/link'
import { UiIcon } from '@/components/ui-icon'
import { useTx } from '@/lib/lang'
import { useSyncState } from '@/lib/sync/state'
import { cn } from '@/lib/utils'

/** Header entry point: user icon (→ /account), or an initial avatar with a sync dot when signed in. */
export function HeaderAccount() {
  const t = useTx()
  const user = useSyncState((s) => s.user)
  const status = useSyncState((s) => s.status)
  const label = user ? t({ en: 'My account', bn: 'আমার অ্যাকাউন্ট', ar: 'حسابي' }) : t({ en: 'Account & sync', bn: 'অ্যাকাউন্ট ও সিঙ্ক', ar: 'الحساب والمزامنة' })
  const initial = (user?.name || user?.email || '?').trim().charAt(0).toUpperCase()
  return (
    <Link href="/account" aria-label={label} title={label} className="relative grid size-10 place-items-center rounded-full transition hover:bg-muted">
      {user ? (
        <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{initial}</span>
      ) : (
        <UiIcon name="user" size={24} />
      )}
      {user && (
        <span
          aria-hidden
          className={cn('absolute bottom-1 end-1 size-2.5 rounded-full border-2 border-background', status === 'synced' ? 'bg-primary' : status === 'error' ? 'bg-destructive' : status === 'syncing' ? 'animate-pulse bg-gold' : 'bg-muted-foreground')}
        />
      )}
    </Link>
  )
}
