'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface BackButtonProps {
  className?: string
}

export default function BackButton({ className = '' }: BackButtonProps) {
  const router = useRouter()
  const { t } = useI18n()

  return (
    <button
      onClick={() => router.back()}
      className={`flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {t('back', { defaultValue: 'Back' })}
    </button>
  )
}
