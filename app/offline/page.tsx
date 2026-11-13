import Link from 'next/link'
import type { Metadata } from 'next'
import { UiIcon } from '@/components/ui-icon'
import { SavedSurahs } from '@/components/offline/saved-surahs'

export const metadata: Metadata = { title: 'Offline', robots: { index: false } }

export default function Offline() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <UiIcon name="lantern" size={88} className="animate-float" />
      <h1 className="mt-6 font-display text-3xl font-semibold">You’re offline</h1>
      <p className="mt-3 text-muted-foreground">Surahs you have opened or downloaded are still available. Reconnect to explore the rest. You can save the whole Quran in Settings → Offline & downloads.</p>
      <p className="mt-6 font-arabic text-2xl text-gold" dir="rtl">أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ</p>
      <p className="mt-1 text-sm text-muted-foreground">“Verily, in the remembrance of Allah do hearts find rest.” — 13:28</p>
      <SavedSurahs />
      <Link href="/" prefetch={false} className="mt-8 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Try again</Link>
    </div>
  )
}
