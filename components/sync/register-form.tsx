'use client'
import { useEffect, useState } from 'react'
import Link from '@/lib/i18n/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useTx } from '@/lib/lang'
import { AccountsOff, AuthCard, GoogleButton, OrDivider, PasswordMeter, btnCls, fieldCls, labelCls } from '@/components/auth-card'
import { loadAccountStatus, safeCallback, signInWithGoogle, signInWithPassword } from '@/lib/sync/account'
import { useSyncState } from '@/lib/sync/state'

export function RegisterForm() {
  const router = useRouter()
  const t = useTx()
  const params = useSearchParams()
  const callback = safeCallback(params.get('callbackUrl'))
  const { enabled, google } = useSyncState()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pw, setPw] = useState('')
  useEffect(() => { void loadAccountStatus() }, [])

  if (enabled === null) return <div className="card-soft h-96 w-full max-w-md shimmer" />
  if (!enabled) return <AccountsOff t={t} />

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email'))
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: fd.get('name'), email, password: pw }) })
      if (res.ok) {
        // the server answers the same way for an email that already has an account (no enumeration);
        // in that case signing in with the submitted password fails and we show a neutral hint
        const r = await signInWithPassword(email, pw)
        if (r === 'ok') { router.push(callback); router.refresh() }
        else setError(t({ en: 'Could not create the account — if you already have one, sign in instead.', bn: 'অ্যাকাউন্ট খোলা যায়নি — আগে থেকেই অ্যাকাউন্ট থাকলে সাইন ইন করুন।', ar: 'تعذّر إنشاء الحساب — إن كان لديك حساب بالفعل فسجّل الدخول.' }))
      } else {
        const data = (await res.json().catch(() => ({}))) as { code?: string }
        setError(
          data.code === 'rate_limited' ? t({ en: 'Too many attempts. Please try again later.', bn: 'অনেকবার চেষ্টা হয়েছে। পরে আবার চেষ্টা করুন।', ar: 'محاولات كثيرة. يُرجى المحاولة لاحقًا.' })
          : data.code === 'weak_password' ? t({ en: 'Password must be at least 8 characters.', bn: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।', ar: 'يجب ألا تقل كلمة المرور عن ٨ أحرف.' })
          : data.code === 'invalid_email' ? t({ en: 'Enter a valid email address.', bn: 'সঠিক ইমেইল দিন।', ar: 'أدخل بريدًا إلكترونيًا صالحًا.' })
          : t({ en: 'Registration failed.', bn: 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।', ar: 'فشل التسجيل.' }),
        )
      }
    } catch {
      setError(t({ en: 'Something went wrong. Please try again.', bn: 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।', ar: 'حدث خطأ ما. يُرجى المحاولة مرة أخرى.' }))
    } finally { setLoading(false) }
  }

  return (
    <AuthCard
      title={t({ en: 'Create your account', bn: 'অ্যাকাউন্ট খুলুন', ar: 'أنشئ حسابك' })}
      subtitle={t({ en: 'Keep your bookmarks and progress safe across devices', bn: 'সব ডিভাইসে বুকমার্ক ও অগ্রগতি নিরাপদ রাখুন', ar: 'احفظ علاماتك وتقدّمك بأمان عبر أجهزتك' })}
      footer={<>{t({ en: 'Already have an account?', bn: 'আগেই অ্যাকাউন্ট আছে?', ar: 'لديك حساب بالفعل؟' })} <Link href={`/login?callbackUrl=${encodeURIComponent(callback)}`} className="font-semibold text-primary hover:underline">{t({ en: 'Sign in', bn: 'সাইন ইন', ar: 'تسجيل الدخول' })}</Link></>}
    >
      {google && (<><GoogleButton onClick={() => void signInWithGoogle(callback)} label={t({ en: 'Sign up with Google', bn: 'গুগল দিয়ে সাইন আপ', ar: 'التسجيل باستخدام Google' })} /><OrDivider label={t({ en: 'or with email', bn: 'অথবা ইমেইল দিয়ে', ar: 'أو بالبريد الإلكتروني' })} /></>)}
      <form onSubmit={submit} className="space-y-4">
        <label className="block"><span className={labelCls}>{t({ en: 'Name', bn: 'নাম', ar: 'الاسم' })}</span><input name="name" type="text" required maxLength={80} autoComplete="name" className={fieldCls} /></label>
        <label className="block"><span className={labelCls}>{t({ en: 'Email', bn: 'ইমেইল', ar: 'البريد الإلكتروني' })}</span><input name="email" type="email" required autoComplete="email" className={fieldCls} /></label>
        <div><label className="block"><span className={labelCls}>{t({ en: 'Password', bn: 'পাসওয়ার্ড', ar: 'كلمة المرور' })}</span><input value={pw} onChange={(e) => setPw(e.target.value)} type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={fieldCls} /></label><PasswordMeter value={pw} t={t} /></div>
        {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
        <button type="submit" disabled={loading} className={btnCls}>{loading ? <Loader2 className="size-5 animate-spin" /> : t({ en: 'Create account', bn: 'অ্যাকাউন্ট খুলুন', ar: 'إنشاء حساب' })}</button>
      </form>
    </AuthCard>
  )
}
