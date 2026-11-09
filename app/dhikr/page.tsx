import type { Metadata } from 'next'
import { DhikrView } from '@/components/dhikr/dhikr-view'
import { absoluteUrl } from '@/lib/site'

const title = 'Digital Tasbih — Dhikr Counter with SubhanAllah, Alhamdulillah, Allahu Akbar | জিকির কাউন্টার'
const description = 'A tactile digital tasbih with haptic feedback, Tasbih Fatima (33/33/34), Astaghfirullah, Salawat and La ilaha illallah presets, targets and daily history. ডিজিটাল তাসবিহ ও জিকির কাউন্টার।'

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: ['tasbih counter', 'digital tasbih', 'dhikr counter', 'SubhanAllah Alhamdulillah Allahu Akbar', 'ডিজিটাল তাসবিহ', 'জিকির'],
  alternates: { canonical: '/dhikr' },
  openGraph: { title, description, url: absoluteUrl('/dhikr'), type: 'website' },
}

export default function DhikrPage() {
  return <DhikrView />
}
