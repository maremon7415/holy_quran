'use client'
import { useEffect, useState } from 'react'
import Link from '@/lib/i18n/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useTx } from '@/lib/lang'
import { AccountsOff, AuthCard, GoogleButton, OrDivider, btnCls, fieldCls, labelCls } from '@/components/auth-card'
import { loadAccountStatus, safeCallback, signInWithGoogle, signInWithPassword } from '@/lib/sync/account'
import { useSyncState } from '@/lib/sync/state'

export function LoginForm() {
  const router = useRouter()
  const t = useTx()
  const params = useSearchParams()
  const callback = safeCallback(params.get('callbackUrl'))
  const authError = params.get('error')
  const { enabled, google } = useSyncState()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => { void loadAccountStatus() }, [])

  if (enabled === null) return <div className="card-soft h-96 w-full max-w-md shimmer" />
  if (!enabled) return <AccountsOff t={t} />

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    try {
      const r = await signInWithPassword(String(fd.get('email')), String(fd.get('password')))
      if (r === 'ok') { router.push(callback); router.refresh() }
      else if (r === 'rate_limited') setError(t({ en: 'Too many sign-in attempts. Please wait a few minutes and try again.', bn: 'অনেকবার সাইন ইনের চেষ্টা হয়েছে। কয়েক মিনিট পরে আবার চেষ্টা করুন।', ar: 'محاولات تسجيل دخول كثيرة. يُرجى الانتظار بضع دقائق ثم المحاولة مرة أخرى.' }))
      else setError(t({ en: 'Invalid email or password.', bn: 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।', ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' }))
    } catch {
      setError(t({ en: 'Something went wrong. Please try again.', bn: 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।', ar: 'حدث خطأ ما. يُرجى المحاولة مرة أخرى.' }))
    } finally { setLoading(false) }
  }

  return (
    <AuthCard
      title={t({ en: 'Welcome back', bn: 'স্বাগতম', ar: 'مرحبًا بعودتك' })}
      subtitle={t({ en: 'Sign in to sync your reading across devices', bn: 'সব ডিভাইসে পড়া সিঙ্ক করতে সাইন ইন করুন', ar: 'سجّل الدخول لمزامنة قراءتك عبر أجهزتك' })}
      footer={<>{t({ en: 'New here?', bn: 'নতুন?', ar: 'جديد هنا؟' })} <Link href={`/register?callbackUrl=${encodeURIComponent(callback)}`} className="font-semibold text-primary hover:underline">{t({ en: 'Create an account', bn: 'অ্যাকাউন্ট খুলুন', ar: 'أنشئ حسابًا' })}</Link></>}
    >
      {google && (<><GoogleButton onClick={() => void signInWithGoogle(callback)} label={t({ en: 'Continue with Google', bn: 'গুগল দিয়ে চালিয়ে যান', ar: 'المتابعة باستخدام Google' })} /><OrDivider label={t({ en: 'or with email', bn: 'অথবা ইমেইল দিয়ে', ar: 'أو بالبريد الإلكتروني' })} /></>)}
      {authError && !error && (
        <p role="alert" className="mb-4 text-sm font-medium text-destructive">
          {authError === 'GoogleEmailExists'
            ? t({ en: 'An account with this email already exists — sign in with your password, then link Google in Account settings.', bn: 'এই ইমেইলে আগেই একটি অ্যাকাউন্ট আছে — পাসওয়ার্ড দিয়ে সাইন ইন করে অ্যাকাউন্ট সেটিংসে গুগল যুক্ত করুন।', ar: 'يوجد حساب بهذا البريد الإلكتروني — سجّل الدخول بكلمة المرور، ثم اربط Google من إعدادات الحساب.' })
            : authError === 'GoogleEmailUnverified'
              ? t({ en: 'Your Google account’s email is not verified, so it can’t be used to sign in here.', bn: 'আপনার গুগল অ্যাকাউন্টের ইমেইল যাচাই করা নেই, তাই এটি দিয়ে এখানে সাইন ইন করা যাবে না।', ar: 'البريد الإلكتروني لحساب Google غير مُوثّق، لذا لا يمكن استخدامه لتسجيل الدخول هنا.' })
              : t({ en: 'Sign-in failed. Please try again.', bn: 'সাইন ইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।', ar: 'فشل تسجيل الدخول. يُرجى المحاولة مرة أخرى.' })}
        </p>
      )}
      <form onSubmit={submit} className="space-y-4">
        <label className="block"><span className={labelCls}>{t({ en: 'Email', bn: 'ইমেইল', ar: 'البريد الإلكتروني' })}</span><input name="email" type="email" required autoComplete="email" className={fieldCls} /></label>
        <label className="block"><span className={labelCls}>{t({ en: 'Password', bn: 'পাসওয়ার্ড', ar: 'كلمة المرور' })}</span><input name="password" type="password" required autoComplete="current-password" className={fieldCls} /></label>
        {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
        <button type="submit" disabled={loading} className={btnCls}>{loading ? <Loader2 className="size-5 animate-spin" /> : t({ en: 'Sign in', bn: 'সাইন ইন', ar: 'تسجيل الدخول' })}</button>
      </form>
    </AuthCard>
  )
}
