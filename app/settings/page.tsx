import type { Metadata } from 'next'
import { SettingsView } from '@/components/settings/settings-view'

export const metadata: Metadata = {
  title: 'Settings — Themes, Fonts, Translations & Reciters',
  description: 'Personalise Noor Quran: five reading themes, Quran fonts, text size, Bangla/English translations, tajweed colours and your favourite reciter.',
  alternates: { canonical: '/settings' },
}

export default function SettingsPage() {
  return <SettingsView />
}
