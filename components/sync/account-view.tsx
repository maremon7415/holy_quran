'use client'
import { useRef, useState } from 'react'
import Link from '@/lib/i18n/link'
import { toast } from 'sonner'
import { RefreshCw, Smartphone, Download, Upload, LogOut, Trash2, Cloud } from 'lucide-react'
import { UiIcon } from '@/components/ui-icon'
import { useLang, useMounted, useTx } from '@/lib/lang'
import { exportBackup, importBackup } from '@/lib/sync/backup'
import { signOutKeepLocal } from '@/lib/sync/account'
import * as engine from '@/lib/sync/engine'
import { useSyncState } from '@/lib/sync/state'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { SyncStatusPill, timeAgo } from './sync-status'

const btn = 'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-60'

function Panel({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <section className="card-soft mt-6 space-y-4 p-5 sm:p-7">
      <h2 className="flex items-center gap-3 font-display text-xl font-semibold"><UiIcon name={icon} size={30} />{title}</h2>
      {children}
    </section>
  )
}

export function AccountView() {
  const mounted = useMounted()
  const t = useTx()
  const lang = useLang()
  const { enabled, user, status, lastSyncedAt, error, devices, deviceId } = useSyncState()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const doImport = async (f: File) => {
    try {
      await importBackup(f)
      toast.success(t({ en: 'Backup restored — reloading…', bn: 'ব্যাকআপ পুনরুদ্ধার হয়েছে…', ar: 'تمت استعادة النسخة الاحتياطية — جارٍ إعادة التحميل…' }))
      setTimeout(() => location.reload(), 800)
    } catch {
      toast.error(t({ en: 'That file is not a Noor backup.', bn: 'এটি নূর ব্যাকআপ ফাইল নয়।', ar: 'هذا الملف ليس نسخة احتياطية من نور.' }))
    }
  }
  const signOut = async () => {
    setBusy(true)
    try {
      await signOutKeepLocal()
      toast.success(t({ en: 'Signed out. Your data is still on this device.', bn: 'সাইন আউট হয়েছে। আপনার তথ্য এই ডিভাইসে আছে।', ar: 'تم تسجيل الخروج. بياناتك ما زالت على هذا الجهاز.' }))
    } finally { setBusy(false) }
  }
  const deleteCloud = async () => {
    setBusy(true)
    try {
      await engine.deleteCloud()
      toast.success(t({ en: 'Cloud data deleted. Sync is now off.', bn: 'ক্লাউড তথ্য মুছে ফেলা হয়েছে। সিঙ্ক এখন বন্ধ।', ar: 'حُذفت البيانات السحابية. المزامنة متوقفة الآن.' }))
    } catch { toast.error(t({ en: 'Could not delete cloud data.', bn: 'ক্লাউড তথ্য মোছা যায়নি।', ar: 'تعذّر حذف البيانات السحابية.' })) } finally { setBusy(false) }
  }

  if (!mounted || enabled === null) return <div className="mx-auto max-w-3xl px-4 py-16"><div className="card-soft h-72 shimmer" /></div>

  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-10 sm:px-6">
      <div className="flex items-center gap-4">
        <UiIcon name="user" size={56} />
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t({ en: 'Account & sync', bn: 'অ্যাকাউন্ট ও সিঙ্ক', ar: 'الحساب والمزامنة' })}</h1>
          <p className="text-muted-foreground">{t({ en: 'Your reading, everywhere.', bn: 'আপনার পড়া, সব জায়গায়।', ar: 'قراءتك معك في كل مكان.' })}</p>
        </div>
      </div>

      {enabled === false && (
        <Panel icon="info" title={t({ en: 'Accounts not enabled on this deployment', bn: 'এই ডিপ্লয়মেন্টে অ্যাকাউন্ট চালু নেই', ar: 'الحسابات غير مفعّلة في هذا النشر' })}>
          <p className="text-sm text-muted-foreground">{t({ en: 'Everything works without an account — your bookmarks, notes and progress are stored privately on this device. Use a backup file to move them to another device.', bn: 'অ্যাকাউন্ট ছাড়াই সবকিছু কাজ করে — আপনার বুকমার্ক, নোট ও অগ্রগতি এই ডিভাইসে ব্যক্তিগতভাবে সংরক্ষিত। অন্য ডিভাইসে নিতে ব্যাকআপ ফাইল ব্যবহার করুন।', ar: 'كل شيء يعمل دون حساب — علاماتك وملاحظاتك وتقدّمك محفوظة بخصوصية على هذا الجهاز. استخدم ملف نسخة احتياطية لنقلها إلى جهاز آخر.' })}</p>
        </Panel>
      )}

      {enabled && !user && (
        <Panel icon="sparkle" title={t({ en: 'Sync across devices', bn: 'সব ডিভাইসে সিঙ্ক', ar: 'المزامنة عبر الأجهزة' })}>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              t({ en: 'Bookmarks, notes and favourites', bn: 'বুকমার্ক, নোট ও ফেভারিট', ar: 'العلامات والملاحظات والمفضلة' }),
              t({ en: 'Reading progress, streaks and khatam plans', bn: 'পড়ার অগ্রগতি, স্ট্রিক ও খতম পরিকল্পনা', ar: 'تقدّم القراءة والمواظبة وخطط الختمة' }),
              t({ en: 'Hifz memorisation schedule', bn: 'হিফজ রিভিশন সময়সূচি', ar: 'جدول مراجعة الحفظ' }),
              t({ en: 'Reader and prayer preferences', bn: 'রিডার ও নামাজের সেটিংস', ar: 'تفضيلات القارئ والصلاة' }),
            ].map((x) => <li key={x} className="flex items-center gap-2"><Cloud className="size-4 text-primary" />{x}</li>)}
          </ul>
          <p className="text-sm text-muted-foreground">{t({ en: 'Existing data on this device is merged with your account — nothing is overwritten.', bn: 'এই ডিভাইসের তথ্য আপনার অ্যাকাউন্টের সাথে মেশানো হবে — কিছুই মুছবে না।', ar: 'تُدمج البيانات الموجودة على هذا الجهاز مع حسابك — لا يُستبدل شيء.' })}</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/login?callbackUrl=/account" className={`${btn} bg-primary text-primary-foreground`}>{t({ en: 'Sign in', bn: 'সাইন ইন', ar: 'تسجيل الدخول' })}</Link>
            <Link href="/register?callbackUrl=/account" className={`${btn} border`}>{t({ en: 'Create account', bn: 'অ্যাকাউন্ট খুলুন', ar: 'إنشاء حساب' })}</Link>
          </div>
        </Panel>
      )}

      {enabled && user && (
        <>
          <section className="card-soft relative mt-6 overflow-hidden p-5 sm:p-7">
            <div aria-hidden className="bg-pattern pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom_right,black,transparent_60%)]" />
            <div className="relative flex flex-wrap items-center gap-4">
              <span className="grid size-16 place-items-center rounded-3xl bg-primary font-display text-2xl font-semibold text-primary-foreground">{(user.name || user.email || '?').charAt(0).toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-xl font-semibold">{user.name || user.email}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
              <SyncStatusPill />
            </div>
          </section>

          <Panel icon="clock" title={t({ en: 'Sync', bn: 'সিঙ্ক', ar: 'المزامنة' })}>
            {status === 'error' && error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
            {status === 'offline' && <p className="text-sm text-muted-foreground">{t({ en: 'You are offline. Changes are kept on this device and will sync when you are back online.', bn: 'আপনি অফলাইন। পরিবর্তন এই ডিভাইসে আছে, অনলাইনে ফিরলে সিঙ্ক হবে।', ar: 'أنت غير متصل. تُحفظ التغييرات على هذا الجهاز وستُزامن عند عودة الاتصال.' })}</p>}
            {status === 'paused' && <p className="text-sm text-muted-foreground">{t({ en: 'Sync is off. Your data stays on this device only.', bn: 'সিঙ্ক বন্ধ। আপনার তথ্য শুধু এই ডিভাইসে থাকবে।', ar: 'المزامنة متوقفة. تبقى بياناتك على هذا الجهاز فقط.' })}</p>}
            <p className="text-sm text-muted-foreground">{t({ en: 'Last synced', bn: 'শেষ সিঙ্ক', ar: 'آخر مزامنة' })}: <span className="font-medium text-foreground">{timeAgo(lastSyncedAt, lang)}</span></p>
            <div className="flex flex-wrap gap-2">
              {status === 'paused' ? (
                <button onClick={() => engine.resume()} className={`${btn} bg-primary text-primary-foreground`}><Cloud className="size-4" />{t({ en: 'Turn sync on', bn: 'সিঙ্ক চালু করুন', ar: 'تشغيل المزامنة' })}</button>
              ) : (
                <button onClick={() => void engine.sync('manual')} disabled={status === 'syncing'} className={`${btn} bg-primary text-primary-foreground`}><RefreshCw className={status === 'syncing' ? 'size-4 animate-spin' : 'size-4'} />{t({ en: 'Sync now', bn: 'এখনই সিঙ্ক', ar: 'زامن الآن' })}</button>
              )}
            </div>
          </Panel>

          <Panel icon="mosque" title={t({ en: 'Devices', bn: 'ডিভাইস', ar: 'الأجهزة' })}>
            {devices.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t({ en: 'No devices have synced yet.', bn: 'এখনো কোনো ডিভাইস সিঙ্ক করেনি।', ar: 'لم تُزامن أي أجهزة بعد.' })}</p>
            ) : (
              <ul className="space-y-2">
                {devices.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
                    <Smartphone className="size-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{d.name}{d.id === deviceId && <span className="ms-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{t({ en: 'This device', bn: 'এই ডিভাইস', ar: 'هذا الجهاز' })}</span>}</p>
                      <p className="text-xs text-muted-foreground">{t({ en: 'Last synced', bn: 'শেষ সিঙ্ক', ar: 'آخر مزامنة' })} {timeAgo(d.lastSyncedAt, lang)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}

      <Panel icon="note" title={t({ en: 'Backup', bn: 'ব্যাকআপ', ar: 'النسخ الاحتياطي' })}>
        <p className="text-sm text-muted-foreground">{t({ en: 'Download a copy of everything stored on this device, or restore one.', bn: 'এই ডিভাইসের সব তথ্যের একটি কপি ডাউনলোড বা রিস্টোর করুন।', ar: 'نزّل نسخة من كل ما هو محفوظ على هذا الجهاز، أو استعد نسخة.' })}</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportBackup} className={`${btn} border`}><Download className="size-4" />{t({ en: 'Export backup', bn: 'ব্যাকআপ ডাউনলোড', ar: 'تصدير نسخة احتياطية' })}</button>
          <button onClick={() => fileRef.current?.click()} className={`${btn} border`}><Upload className="size-4" />{t({ en: 'Restore backup', bn: 'ব্যাকআপ রিস্টোর', ar: 'استعادة نسخة احتياطية' })}</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && void doImport(e.target.files[0])} />
        </div>
      </Panel>

      {enabled && user && (
        <Panel icon="settings" title={t({ en: 'Session & privacy', bn: 'সেশন ও গোপনীয়তা', ar: 'الجلسة والخصوصية' })}>
          <div className="flex flex-wrap gap-2">
            <button onClick={signOut} disabled={busy} className={`${btn} border`}><LogOut className="size-4" />{t({ en: 'Sign out (keep local data)', bn: 'সাইন আউট (লোকাল তথ্য থাকবে)', ar: 'تسجيل الخروج (مع إبقاء البيانات المحلية)' })}</button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button disabled={busy} className={`${btn} border border-destructive/40 text-destructive`}><Trash2 className="size-4" />{t({ en: 'Delete my cloud data', bn: 'আমার ক্লাউড তথ্য মুছুন', ar: 'حذف بياناتي السحابية' })}</button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>{t({ en: 'Delete your cloud data?', bn: 'ক্লাউড তথ্য মুছবেন?', ar: 'هل تريد حذف بياناتك السحابية؟' })}</AlertDialogTitle>
                  <AlertDialogDescription>{t({ en: 'This removes the synced copy from our servers. Data on your devices is not touched, and sync will be turned off here until you turn it back on.', bn: 'এটি সার্ভার থেকে সিঙ্ক করা কপি মুছে দেবে। আপনার ডিভাইসের তথ্য অক্ষত থাকবে এবং আবার চালু না করা পর্যন্ত সিঙ্ক বন্ধ থাকবে।', ar: 'سيؤدي هذا إلى إزالة النسخة المُزامنة من خوادمنا. لن تتأثر البيانات على أجهزتك، وستتوقف المزامنة هنا حتى تعيد تشغيلها.' })}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">{t({ en: 'Cancel', bn: 'বাতিল', ar: 'إلغاء' })}</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteCloud} className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90">{t({ en: 'Delete', bn: 'মুছুন', ar: 'حذف' })}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Panel>
      )}
    </div>
  )
}
