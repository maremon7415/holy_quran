import Link from 'next/link'
import type { Metadata } from 'next'
import { UiIcon } from '@/components/ui-icon'
import { T } from '@/lib/i18n/text'
import { SavedSurahs } from '@/components/offline/saved-surahs'

export const metadata: Metadata = { title: 'Offline', robots: { index: false } }

export default function Offline() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <UiIcon name="lantern" size={88} className="animate-float" />
      <h1 className="mt-6 font-display text-3xl font-semibold"><T en="You’re offline" bn="আপনি অফলাইনে আছেন" ar="أنت غير متصل" /></h1>
      <p className="mt-3 text-muted-foreground"><T en="Surahs you have opened or downloaded are still available. Reconnect to explore the rest. You can save the whole Quran in Settings → Offline & downloads." bn="আপনি যে সূরাগুলো খুলেছেন বা ডাউনলোড করেছেন সেগুলো এখনো পাওয়া যাবে। বাকিগুলো দেখতে ইন্টারনেটে যুক্ত হোন। সেটিংস → অফলাইন ও ডাউনলোডে পুরো কুরআন সংরক্ষণ করতে পারবেন।" ar="السور التي فتحتها أو نزّلتها ما زالت متاحة. اتصل بالإنترنت لتصفّح البقية. يمكنك حفظ القرآن كاملًا من الإعدادات ← دون إنترنت والتنزيلات." /></p>
      <p className="mt-6 font-arabic text-2xl text-gold" dir="rtl">أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ</p>
      <p className="mt-1 text-sm text-muted-foreground"><T en="“Verily, in the remembrance of Allah do hearts find rest.” — 13:28" bn="“জেনে রাখো, আল্লাহর স্মরণেই অন্তর প্রশান্ত হয়।” — ১৩:২৮" ar="﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾ — 13:28" /></p>
      <SavedSurahs />
      <Link href="/" prefetch={false} className="mt-8 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"><T en="Try again" bn="আবার চেষ্টা করুন" ar="حاول مرة أخرى" /></Link>
    </div>
  )
}
