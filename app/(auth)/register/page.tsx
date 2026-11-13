import type { Metadata } from 'next'
import { Suspense } from 'react'
import { RegisterForm } from '@/components/sync/register-form'

export const metadata: Metadata = { title: 'Create account', robots: { index: false, follow: false } }

export default function RegisterPage() {
  return <Suspense fallback={<div className="card-soft h-96 w-full max-w-md shimmer" />}><RegisterForm /></Suspense>
}
