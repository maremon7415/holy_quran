import Link from 'next/link'
import { UiIcon } from '@/components/ui-icon'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <UiIcon name="qibla" size={88} className="animate-float" />
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">This page has lost its direction</h1>
      <p className="mt-3 text-muted-foreground">Let’s guide you back. Try searching for a surah or an ayah like 2:255.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Home</Link>
        <Link href="/quran" className="rounded-full border px-6 py-3 font-semibold">All surahs</Link>
      </div>
    </div>
  )
}
