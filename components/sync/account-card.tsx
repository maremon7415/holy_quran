'use client'
import Link from 'next/link'
import { RefreshCw } from 'lucide-react'
import { UiIcon } from '@/components/ui-icon'
import { useLang, useTx } from '@/lib/lang'
import * as engine from '@/lib/sync/engine'
import { useSyncState } from '@/lib/sync/state'
import { SyncStatusPill, timeAgo } from './sync-status'

/** Compact "Account & sync" card for the Settings page. Never errors: shows a note when accounts are disabled. */
export function AccountSyncCard() {
  const t = useTx()
  const lang = useLang()
  const { enabled, user, status, lastSyncedAt, error } = useSyncState()

  return (
    <section className="card-soft mt-6 space-y-4 p-5 sm:p-7">
      <h2 className="flex items-center gap-3 font-display text-xl font-semibold">
        <UiIcon name="user" size={30} />
        {t({ en: 'Account & sync', bn: 'অ্যাকাউন্ট ও সিঙ্ক', ar: 'الحساب والمزامنة' })}
      </h2>

      {enabled === false ? (
        <p className="text-sm text-muted-foreground">{t({ en: 'Accounts not enabled on this deployment. Your data stays on this device — use the backup tools below.', bn: 'এই ডিপ্লয়মেন্টে অ্যাকাউন্ট চালু নেই। আপনার তথ্য এই ডিভাইসেই থাকবে — নিচের ব্যাকআপ ব্যবহার করুন।', ar: 'الحسابات غير مفعّلة في هذا النشر. تبقى بياناتك على هذا الجهاز — استخدم أدوات النسخ الاحتياطي أدناه.' })}</p>
      ) : enabled === null ? (
        <div className="h-16 rounded-2xl shimmer" />
      ) : user ? (
        <>
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-base font-bold text-primary-foreground">{(user.name || user.email || '?').charAt(0).toUpperCase()}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name || user.email}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <SyncStatusPill className="ml-auto shrink-0" />
          </div>
          {status === 'error' && error && <p className="text-sm text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">{t({ en: 'Last synced', bn: 'শেষ সিঙ্ক', ar: 'آخر مزامنة' })}: {timeAgo(lastSyncedAt, lang)}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => void engine.sync('manual')} disabled={status === 'syncing'} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              <RefreshCw className={status === 'syncing' ? 'size-4 animate-spin' : 'size-4'} />
              {t({ en: 'Sync now', bn: 'এখনই সিঙ্ক', ar: 'زامن الآن' })}
            </button>
            <Link href="/account" className="rounded-full border px-5 py-2.5 text-sm font-semibold">{t({ en: 'Manage account', bn: 'অ্যাকাউন্ট ম্যানেজ', ar: 'إدارة الحساب' })}</Link>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{t({ en: 'Sign in to keep your bookmarks, notes, progress and memorisation in sync across all your devices. Everything keeps working without an account.', bn: 'সব ডিভাইসে বুকমার্ক, নোট, অগ্রগতি ও হিফজ সিঙ্ক রাখতে সাইন ইন করুন। অ্যাকাউন্ট ছাড়াও সবকিছু কাজ করবে।', ar: 'سجّل الدخول لمزامنة علاماتك وملاحظاتك وتقدّمك وحفظك عبر كل أجهزتك. كل شيء يعمل أيضًا دون حساب.' })}</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/login?callbackUrl=/settings" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">{t({ en: 'Sign in', bn: 'সাইন ইন', ar: 'تسجيل الدخول' })}</Link>
            <Link href="/register" className="rounded-full border px-5 py-2.5 text-sm font-semibold">{t({ en: 'Create account', bn: 'অ্যাকাউন্ট খুলুন', ar: 'إنشاء حساب' })}</Link>
          </div>
        </>
      )}
    </section>
  )
}
