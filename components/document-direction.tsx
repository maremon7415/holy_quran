'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'

export default function DocumentDirection() {
  const { language } = useAppStore()

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    body.classList.remove('lang-en', 'lang-ar', 'lang-bn')

    if (language === 'ar') {
      root.setAttribute('lang', 'ar')
      root.setAttribute('dir', 'rtl')
      body.classList.add('lang-ar')
    } else if (language === 'bn') {
      root.setAttribute('lang', 'bn')
      root.setAttribute('dir', 'ltr')
      body.classList.add('lang-bn')
    } else {
      root.setAttribute('lang', 'en')
      root.setAttribute('dir', 'ltr')
      body.classList.add('lang-en')
    }
  }, [language])

  return null
}
