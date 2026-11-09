import Link from 'next/link'
import { chapters, surahHref } from '@/lib/quran/chapters'
import { UiIcon } from '@/components/ui-icon'

const PICKS = [1, 18, 36, 55, 67, 112]

/** Friendly 404 for reader routes, with useful ways forward. */
export function ReaderNotFound({ what = 'page' }: { what?: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-36 pt-10 text-center sm:pt-16">
      <div className="relative overflow-hidden rounded-[2rem] border bg-card px-6 py-12">
        <div className="bg-pattern pointer-events-none absolute inset-0" />
        <div className="relative">
          <UiIcon name="crescent" size={64} className="mx-auto" />
          <p className="mt-4 font-arabic text-3xl text-gold" lang="ar">سُبْحَانَ ٱللَّهِ</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">We couldn&apos;t find that {what}</h1>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">The Quran has 114 surahs and 30 juz. Check the number, or pick a surah below.</p>
          <p className="mt-1 font-bangla text-sm text-muted-foreground" lang="bn">পৃষ্ঠাটি পাওয়া যায়নি — নিচ থেকে একটি সূরা বেছে নিন।</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {PICKS.map((id) => (
              <Link key={id} href={surahHref(id)} className="rounded-full border bg-background/70 px-3.5 py-2 text-sm font-semibold transition hover:border-primary/40 hover:text-primary">
                {chapters[id - 1].nameSimple}
              </Link>
            ))}
          </div>
          <Link href="/quran" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5">
            <UiIcon name="quran" size={20} /> Browse all surahs
          </Link>
        </div>
      </div>
    </div>
  )
}
