'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useTx } from '@/lib/lang'
import { AuthCard, btnCls, fieldCls } from '@/components/auth-card'

export default function RegisterPage() {
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fd.get('name'), email: fd.get('email'), password: fd.get('password') }),
      })
      if (res.ok) router.push('/login')
      else {
        const data = await res.json().catch(() => ({}))
        setError(data.message || t({ en: 'Registration failed.', bn: 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।' }))
      }
    } catch {
      setError(t({ en: 'Something went wrong. Please try again.', bn: 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।' }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title={t({ en: 'Create your account', bn: 'অ্যাকাউন্ট খুলুন' })}
      subtitle={t({ en: 'Keep your bookmarks safe across devices', bn: 'সব ডিভাইসে বুকমার্ক নিরাপদ রাখুন' })}
      footer={<>{t({ en: 'Already have an account?', bn: 'আগেই অ্যাকাউন্ট আছে?' })} <Link href="/login" className="font-semibold text-primary hover:underline">{t({ en: 'Sign in', bn: 'সাইন ইন' })}</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block"><span className="mb-1.5 block text-sm font-medium">{t({ en: 'Name', bn: 'নাম' })}</span><input name="name" type="text" required autoComplete="name" className={fieldCls} /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-medium">{t({ en: 'Email', bn: 'ইমেইল' })}</span><input name="email" type="email" required autoComplete="email" className={fieldCls} /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-medium">{t({ en: 'Password', bn: 'পাসওয়ার্ড' })}</span><input name="password" type="password" required minLength={6} autoComplete="new-password" className={fieldCls} /></label>
        {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
        <button type="submit" disabled={loading} className={btnCls}>{loading ? <Loader2 className="size-5 animate-spin" /> : t({ en: 'Create account', bn: 'অ্যাকাউন্ট খুলুন' })}</button>
      </form>
    </AuthCard>
  )
}
