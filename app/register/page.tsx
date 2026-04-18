'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Book, Loader2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (res.ok) {
        router.push('/login')
      } else {
        const data = await res.json()
          setError(data.message || t('registration_failed'))
      }
    } catch (err) {
      setError(t('generic_error_try_again'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Book className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{t('create_account')}</h1>
            <p className="text-muted-foreground text-sm mt-2">{t('sign_up_to_access_bookmarks')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('name')}</label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('email')}</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('password')}</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {error && <p className="text-sm text-destructive font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('sign_up')}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t('already_have_account')}{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t('sign_in_link')}
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
