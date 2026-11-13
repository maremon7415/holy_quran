'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
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
      const ok = await signInWithPassword(String(fd.get('email')), String(fd.get('password')))
      if (ok) { router.push(callback); router.refresh() }
      else setError(t({ en: 'Invalid email or password.', bn: 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।' }))
    } catch {
      setError(t({ en: 'Something went wrong. Please try again.', bn: 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।' }))
    } finally { setLoading(false) }
  }

  return (
    <AuthCard
      title={t({ en: 'Welcome back', bn: 'স্বাগতম' })}
      subtitle={t({ en: 'Sign in to sync your reading across devices', bn: 'সব ডিভাইসে পড়া সিঙ্ক করতে সাইন ইন করুন' })}
      footer={<>{t({ en: 'New here?', bn: 'নতুন?' })} <Link href={`/register?callbackUrl=${encodeURIComponent(callback)}`} className="font-semibold text-primary hover:underline">{t({ en: 'Create an account', bn: 'অ্যাকাউন্ট খুলুন' })}</Link></>}
    >
      {google && (<><GoogleButton onClick={() => void signInWithGoogle(callback)} label={t({ en: 'Continue with Google', bn: 'গুগল দিয়ে চালিয়ে যান' })} /><OrDivider label={t({ en: 'or with email', bn: 'অথবা ইমেইল দিয়ে' })} /></>)}
      <form onSubmit={submit} className="space-y-4">
        <label className="block"><span className={labelCls}>{t({ en: 'Email', bn: 'ইমেইল' })}</span><input name="email" type="email" required autoComplete="email" className={fieldCls} /></label>
        <label className="block"><span className={labelCls}>{t({ en: 'Password', bn: 'পাসওয়ার্ড' })}</span><input name="password" type="password" required autoComplete="current-password" className={fieldCls} /></label>
        {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
        <button type="submit" disabled={loading} className={btnCls}>{loading ? <Loader2 className="size-5 animate-spin" /> : t({ en: 'Sign in', bn: 'সাইন ইন' })}</button>
      </form>
    </AuthCard>
  )
}
