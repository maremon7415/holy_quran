import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { chapters, surahHref } from '@/lib/quran/chapters'
import { site } from '@/lib/site'

const POPULAR_SURAHS = [1, 2, 18, 36, 55, 56, 67, 78, 112, 113, 114, 32]
const POPULAR_PAGES = [
  { href: '/surah/al-baqarah/255', label: 'Ayatul Kursi (2:255)' },
  { href: '/surah/al-baqarah/285', label: 'Last two ayahs of Al-Baqarah' },
  { href: '/names-of-allah', label: '99 Names of Allah' },
  { href: '/dua', label: 'Daily Duas from Quran & Sunnah' },
  { href: '/topics', label: 'What the Quran says about…' },
  { href: '/hifz', label: 'Memorise the Quran (Hifz)' },
  { href: '/juz/30', label: 'Juz Amma (Para 30)' },
  { href: '/prayer-times', label: 'Prayer times today' },
]

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t bg-surface-2/60 pb-32 pt-16 lg:pb-12">
      <div aria-hidden className="bg-pattern pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">{site.description}</p>
          <p className="mt-3 max-w-sm font-bangla text-sm leading-relaxed text-muted-foreground">{site.taglineBn}</p>
          <p className="mt-6 font-arabic text-2xl text-gold">إِنَّ هَٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ</p>
          <p className="mt-3 text-xs text-muted-foreground">“Indeed, this Quran guides to that which is most suitable.” — 17:9</p>
        </div>
        <FooterCol title="Popular Surahs">
          {POPULAR_SURAHS.map((id) => (
            <Link key={id} href={surahHref(id)} className="hover:text-foreground">Surah {chapters[id - 1].nameSimple}</Link>
          ))}
        </FooterCol>
        <FooterCol title="Popular">
          {POPULAR_PAGES.map((p) => <Link key={p.href} href={p.href} className="hover:text-foreground">{p.label}</Link>)}
        </FooterCol>
        <FooterCol title="Noor">
          <Link href="/quran" className="hover:text-foreground">All 114 Surahs</Link>
          <Link href="/listen" className="hover:text-foreground">Quran Recitation</Link>
          <Link href="/journey" className="hover:text-foreground">Khatam Planner</Link>
          <Link href="/about" className="hover:text-foreground">About & Sources</Link>
          <a href={site.github} className="hover:text-foreground" rel="noopener">Open source on GitHub</a>
        </FooterCol>
      </div>
      <div className="relative mx-auto mt-14 flex max-w-7xl flex-col gap-2 px-4 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
        <p>Quran text, translations & audio via the open Quran.com (Quran Foundation) API · Free forever, no ads.</p>
        <p>© {new Date().getFullYear()} {site.name}</p>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">{title}</h2>
      <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">{children}</div>
    </div>
  )
}
