import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/components/sync/login-form'

export const metadata: Metadata = { title: 'Sign in', robots: { index: false, follow: false } }

export default function LoginPage() {
  return <Suspense fallback={<div className="card-soft h-96 w-full max-w-md shimmer" />}><LoginForm /></Suspense>
}
