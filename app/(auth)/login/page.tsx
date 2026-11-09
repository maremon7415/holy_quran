'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useTx } from '@/lib/lang'
import { AuthCard, btnCls, fieldCls } from '@/components/auth-card'

export default function LoginPage() {
  const router = useRouter()
  const t = useTx()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    try {
      const res = await signIn('credentials', { email: fd.get('email') as string, password: fd.get('password') as string, redirect: false })
      if (res?.error) setError(t({ en: 'Invalid email or password.', bn: 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।' }))
      else { router.push('/'); router.refresh() }
    } catch {
      setError(t({ en: 'Something went wrong. Please try again.', bn: 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।' }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title={t({ en: 'Welcome back', bn: 'স্বাগতম' })}
      subtitle={t({ en: 'Sign in to sync your bookmarks', bn: 'বুকমার্ক সিঙ্ক করতে সাইন ইন করুন' })}
      footer={<>{t({ en: 'New here?', bn: 'নতুন?' })} <Link href="/register" className="font-semibold text-primary hover:underline">{t({ en: 'Create an account', bn: 'অ্যাকাউন্ট খুলুন' })}</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block"><span className="mb-1.5 block text-sm font-medium">{t({ en: 'Email', bn: 'ইমেইল' })}</span><input name="email" type="email" required autoComplete="email" className={fieldCls} /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-medium">{t({ en: 'Password', bn: 'পাসওয়ার্ড' })}</span><input name="password" type="password" required autoComplete="current-password" className={fieldCls} /></label>
        {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
        <button type="submit" disabled={loading} className={btnCls}>{loading ? <Loader2 className="size-5 animate-spin" /> : t({ en: 'Sign in', bn: 'সাইন ইন' })}</button>
      </form>
    </AuthCard>
  )
}
