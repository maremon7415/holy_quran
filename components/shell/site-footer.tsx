'use client'
import NextLink from 'next/link'
import Link from '@/lib/i18n/link'
import { localeHref } from '@/lib/i18n/routes'
import { Logo } from '@/components/brand/logo'
import { chapters, surahHref, surahNamesBn } from '@/lib/quran/chapters'
import { site } from '@/lib/site'
import { useLang } from '@/lib/lang'
import { pick, type Tr } from '@/lib/i18n/t'

const POPULAR_SURAHS = [1, 2, 18, 36, 55, 56, 67, 78, 112, 113, 114, 32]
const POPULAR_PAGES: { href: string; label: Tr }[] = [
  { href: '/surah/al-baqarah/255', label: { en: 'Ayatul Kursi (2:255)', bn: 'আয়াতুল কুরসি (২:২৫৫)', ar: 'آية الكرسي (٢:٢٥٥)' } },
  { href: '/surah/al-baqarah/285', label: { en: 'Last two ayahs of Al-Baqarah', bn: 'সূরা বাকারার শেষ দুই আয়াত', ar: 'خواتيم سورة البقرة' } },
  { href: '/names-of-allah', label: { en: '99 Names of Allah', bn: 'আল্লাহর ৯৯ নাম', ar: 'أسماء الله الحسنى' } },
  { href: '/dua', label: { en: 'Daily Duas from Quran & Sunnah', bn: 'কুরআন ও সুন্নাহর দৈনন্দিন দোয়া', ar: 'أدعية يومية من القرآن والسنة' } },
  { href: '/hadith', label: { en: 'Hadith: Bukhari, Muslim & more', bn: 'হাদিস: বুখারী, মুসলিমসহ', ar: 'الحديث: البخاري ومسلم وغيرهما' } },
  { href: '/hadith/bukhari/1', label: { en: 'Sahih al-Bukhari 1: Actions by intentions', bn: 'সহীহ বুখারী ১: নিয়তের হাদিস', ar: 'صحيح البخاري ١: إنما الأعمال بالنيات' } },
  { href: '/topics', label: { en: 'What the Quran says about…', bn: 'বিষয়ভিত্তিক কুরআন', ar: 'ماذا يقول القرآن عن…' } },
  { href: '/hifz', label: { en: 'Memorise the Quran (Hifz)', bn: 'কুরআন হিফজ করুন', ar: 'احفظ القرآن' } },
  { href: '/juz/30', label: { en: 'Juz Amma (Para 30)', bn: 'আমপারা (৩০ নম্বর পারা)', ar: 'جزء عمّ (الجزء ٣٠)' } },
  { href: '/prayer-times', label: { en: 'Prayer times today', bn: 'আজকের নামাজের সময়', ar: 'مواقيت الصلاة اليوم' } },
]

/** Popular Bangla searches → the /bn twin of each page (Bangla SEO entry points; falls back to /x until a twin exists). */
const BANGLA_LINKS = [
  { href: '/surah/al-baqarah/255', label: 'আয়াতুল কুরসি বাংলা অর্থসহ' },
  { href: '/surah/ya-sin', label: 'সূরা ইয়াসিন বাংলা উচ্চারণ ও অর্থ' },
  { href: '/surah/al-mulk', label: 'সূরা মুলক বাংলা অর্থসহ' },
  { href: '/dua/dua-before-sleeping', label: 'ঘুমানোর দোয়া' },
  { href: '/names-of-allah', label: 'আল্লাহর ৯৯ নাম অর্থসহ' },
  { href: '/dua', label: 'দৈনন্দিন দোয়া' },
  { href: '/hadith', label: 'হাদিস সমগ্র: বুখারী, মুসলিম' },
  { href: '/topics/anxiety', label: 'দুশ্চিন্তা দূর করার আয়াত' },
].map((l) => ({ ...l, href: localeHref('bn', l.href) }))

/** Popular city timetables (static labels: the footer must not pull the 150-city dataset into every page). */
const POPULAR_CITIES: { slug: string; label: Tr }[] = [
  { slug: 'dhaka', label: { en: 'Dhaka', bn: 'ঢাকা', ar: 'دكا' } },
  { slug: 'chattogram', label: { en: 'Chattogram', bn: 'চট্টগ্রাম', ar: 'شيتاغونغ' } },
  { slug: 'sylhet', label: { en: 'Sylhet', bn: 'সিলেট', ar: 'سيلهيت' } },
  { slug: 'rajshahi', label: { en: 'Rajshahi', bn: 'রাজশাহী', ar: 'راجشاهي' } },
  { slug: 'khulna', label: { en: 'Khulna', bn: 'খুলনা', ar: 'خولنا' } },
  { slug: 'london', label: { en: 'London', bn: 'লন্ডন', ar: 'لندن' } },
  { slug: 'new-york', label: { en: 'New York', bn: 'নিউ ইয়র্ক', ar: 'نيويورك' } },
  { slug: 'makkah', label: { en: 'Makkah', bn: 'মক্কা', ar: 'مكة المكرمة' } },
]

const C = {
  popularSurahs: { en: 'Popular Surahs', bn: 'জনপ্রিয় সূরা', ar: 'سور مختارة' },
  popular: { en: 'Popular', bn: 'জনপ্রিয়', ar: 'الأكثر زيارة' },
  bangla: { en: 'বাংলায় পড়ুন', bn: 'বাংলায় জনপ্রিয়', ar: 'بالبنغالية' },
  allSurahs: { en: 'All 114 Surahs', bn: 'সব ১১৪টি সূরা', ar: 'جميع السور الـ١١٤' },
  recitation: { en: 'Quran Recitation', bn: 'কুরআন তিলাওয়াত', ar: 'تلاوات القرآن' },
  khatam: { en: 'Khatam Planner', bn: 'খতম পরিকল্পনা', ar: 'مخطط الختمة' },
  about: { en: 'About & Sources', bn: 'আমাদের সম্পর্কে ও উৎস', ar: 'عن الموقع والمصادر' },
  github: { en: 'Open source on GitHub', bn: 'GitHub-এ ওপেন সোর্স', ar: 'مفتوح المصدر على GitHub' },
  verse: { en: '“Indeed, this Quran guides to that which is most suitable.” — 17:9', bn: '“নিশ্চয়ই এই কুরআন সেই পথ দেখায় যা সবচেয়ে সরল ও সঠিক।” — ১৭:৯', ar: 'سورة الإسراء ١٧:٩' },
  credits: { en: 'Quran text, translations & audio via the open Quran.com (Quran Foundation) API · Free forever, no ads.', bn: 'কুরআনের পাঠ, অনুবাদ ও অডিও উন্মুক্ত Quran.com (Quran Foundation) API থেকে · চিরকাল ফ্রি, কোনো বিজ্ঞাপন নেই।', ar: 'نص القرآن والترجمات والتلاوات عبر واجهة Quran.com المفتوحة (مؤسسة القرآن) · مجاني دائمًا وبلا إعلانات.' },
  description: { en: site.description, bn: site.descriptionBn, ar: 'نور القرآن — القرآن الكريم بالنص العربي مع الترجمة البنغالية والإنجليزية، ومعاني الكلمات، وألوان التجويد، والتفسير، وأكثر من عشرين قارئًا، واستوديو للحفظ، والأدعية، وأسماء الله الحسنى، ومواقيت الصلاة والقبلة. مجاني وسريع وبلا إعلانات.' },
} satisfies Record<string, Tr>

export function SiteFooter() {
  const lang = useLang()
  const t = (v: Tr) => pick(lang, v)
  const surahName = (id: number) => (lang === 'bn' ? `সূরা ${surahNamesBn[id - 1]}` : lang === 'ar' ? `سورة ${chapters[id - 1].nameArabic}` : `Surah ${chapters[id - 1].nameSimple}`)
  return (
    <footer className="relative mt-24 overflow-hidden border-t bg-surface-2/60 pb-32 pt-16 lg:pb-12">
      <div aria-hidden className="bg-pattern pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">{t(C.description)}</p>
          {lang === 'en' && <p lang="bn" className="mt-3 max-w-sm font-bangla text-sm leading-relaxed text-muted-foreground">{site.taglineBn}</p>}
          <p lang="ar" dir="rtl" className="mt-6 font-arabic text-2xl text-gold">إِنَّ هَٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ</p>
          <p className="mt-3 text-xs text-muted-foreground">{t(C.verse)}</p>
        </div>
        <FooterCol title={t(C.popularSurahs)}>
          {POPULAR_SURAHS.map((id) => (
            <Link key={id} href={surahHref(id)} className="hover:text-foreground">{surahName(id)}</Link>
          ))}
        </FooterCol>
        <FooterCol title={t(C.popular)}>
          {POPULAR_PAGES.map((p) => <Link key={p.href} href={p.href} className="hover:text-foreground">{t(p.label)}</Link>)}
        </FooterCol>
        <FooterCol title={t(C.bangla)} lang="bn">
          {BANGLA_LINKS.map((p) => <NextLink key={p.href} href={p.href} lang="bn" className="font-bangla hover:text-foreground">{p.label}</NextLink>)}
        </FooterCol>
        <FooterCol title={t({ en: 'Noor', bn: 'নূর', ar: 'نور' })}>
          <Link href="/quran" className="hover:text-foreground">{t(C.allSurahs)}</Link>
          <Link href="/listen" className="hover:text-foreground">{t(C.recitation)}</Link>
          <Link href="/journey" className="hover:text-foreground">{t(C.khatam)}</Link>
          <Link href="/about" className="hover:text-foreground">{t(C.about)}</Link>
          <a href={site.github} className="hover:text-foreground" rel="noopener">{t(C.github)}</a>
        </FooterCol>
      </div>
      <nav aria-label={t({ en: 'Prayer times by city', bn: 'শহরভিত্তিক নামাজের সময়', ar: 'مواقيت الصلاة حسب المدينة' })} className="relative mx-auto mt-12 max-w-7xl px-4 sm:px-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">{t({ en: 'Prayer times', bn: 'নামাজের সময়সূচি', ar: 'مواقيت الصلاة' })}</h2>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {POPULAR_CITIES.map((c) => <li key={c.slug}><Link href={`/prayer-times/${c.slug}`} className="hover:text-foreground">{t(c.label)}</Link></li>)}
          <li><Link href="/ramadan" className="hover:text-foreground">{t({ en: 'Ramadan timetable', bn: 'রমজানের সময়সূচি', ar: 'جدول رمضان' })}</Link></li>
          <li><Link href="/hijri-date" className="hover:text-foreground">{t({ en: 'Hijri date today', bn: 'আজকের হিজরি তারিখ', ar: 'التاريخ الهجري' })}</Link></li>
          <li><Link href="/zakat-calculator" className="hover:text-foreground">{t({ en: 'Zakat calculator', bn: 'যাকাত ক্যালকুলেটর', ar: 'حاسبة الزكاة' })}</Link></li>
        </ul>
      </nav>
      <div className="relative mx-auto mt-14 flex max-w-7xl flex-col gap-2 px-4 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
        <p>{t(C.credits)}</p>
        <p>© <span suppressHydrationWarning>{new Date().getFullYear()}</span> {t({ en: site.name, bn: 'নূর কুরআন', ar: 'نور القرآن' })}</p>
      </div>
    </footer>
  )
}

function FooterCol({ title, children, lang }: { title: string; children: React.ReactNode; lang?: string }) {
  return (
    <div lang={lang}>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">{title}</h2>
      <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">{children}</div>
    </div>
  )
}
