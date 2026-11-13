import type { Metadata } from 'next'
import { T } from '@/lib/i18n/text'
import { JourneyHome } from '@/components/journey/journey-home'
import { UiIcon } from '@/components/ui-icon'
import { absoluteUrl } from '@/lib/site'

const title = 'My Quran Journey — Reading Streak, Khatam Planner & Progress | আমার যাত্রা'
const description =
  'Track your Quran reading streak, daily goal and yearly heatmap. Plan a Khatam (finish the Quran in 30 days or any pace) with daily page portions, earn achievements and back up your progress. কুরআন পাঠের স্ট্রিক ও খতম পরিকল্পনা।'

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: ['Quran khatam planner', 'finish Quran in 30 days', 'Quran reading tracker', 'Ramadan Quran plan', 'কুরআন খতম পরিকল্পনা'],
  alternates: { canonical: '/journey' },
  openGraph: { title, description, url: absoluteUrl('/journey'), type: 'website' },
}

export default function JourneyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 lg:pb-16">
      <header className="relative mb-8 overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-9 sm:px-10 sm:py-12">
        <div className="bg-pattern pointer-events-none absolute inset-0" />
        <div className="relative flex items-center gap-5">
          <UiIcon name="journey" size={72} className="hidden sm:block" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold"><T en="My Journey · আমার যাত্রা" bn="আমার যাত্রা" ar="رحلتي" /></p>
            <h1 className="mt-2 font-display text-3xl leading-tight sm:text-5xl"><T en="Small steps, " bn="ছোট ছোট পদক্ষেপ, " ar="خطوات صغيرة، " /><span className="text-gradient-gold"><T en="every day" bn="প্রতিদিন" ar="كل يوم" /></span></h1>
            <p className="mt-3 max-w-2xl text-muted-foreground"><T en="Your streak, goals, Khatam plan and achievements — all stored privately on this device." bn="আপনার স্ট্রিক, লক্ষ্য, খতম পরিকল্পনা ও অর্জন — সবকিছু শুধু আপনার ডিভাইসে।" ar="مواظبتك وأهدافك وخطة ختمتك وإنجازاتك — كلها محفوظة بخصوصية على هذا الجهاز." /></p>
            <p className="mt-1 font-bangla text-sm text-muted-foreground">আপনার স্ট্রিক, লক্ষ্য, খতম পরিকল্পনা ও অর্জন — সবকিছু শুধু আপনার ডিভাইসে।</p>
          </div>
        </div>
      </header>
      <JourneyHome />
    </div>
  )
}
