import type { Metadata } from 'next'
import { SavedView } from '@/components/saved/saved-view'

export const metadata: Metadata = {
  title: 'Saved — Bookmarks & Notes | সংরক্ষিত',
  description: 'Your saved ayahs, favourite surahs, duas and personal notes, stored privately on your device.',
  alternates: { canonical: '/saved' },
  robots: { index: false },
}

export default function SavedPage() {
  return <SavedView />
}
