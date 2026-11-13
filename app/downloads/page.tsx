import type { Metadata } from 'next'
import { OfflineDownloads } from '@/components/offline/offline-downloads'
import { T } from '@/lib/i18n/text'

export const metadata: Metadata = { title: 'Offline & downloads', description: 'Save the Quran and recitations for offline use.', robots: { index: false } }

export default function DownloadsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold"><T en="Offline" bn="অফলাইন" ar="دون اتصال" /></p>
      <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl"><T en="Downloads" bn="ডাউনলোড" ar="التنزيلات" /></h1>
      <OfflineDownloads full />
    </div>
  )
}
