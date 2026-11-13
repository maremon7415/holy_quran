import Link from 'next/link'
import { GuideFrame } from '@/components/learn/frame'
import { FiqhNote, HadithRef, QuranPassage, RecitationCard, Section } from '@/components/learn/ui'
import { collectionLd, howToLd } from '@/lib/content/seo'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { lt } from '@/lib/i18n/lt'
import { bnNum, pick } from '@/lib/i18n/t'
import { SurahName } from '@/lib/i18n/surah-name'
import { chapters, surahHref } from '@/lib/quran/chapters'
import { getVersesByRefs } from '@/lib/quran/data'
import { guideMeta } from './learn'
import { beginnerSurahs, prayerRows, rakahKindLabel, recitationById, salahMistakes, salahSteps, type RakahCell } from '@/data/learn/salah'
import { duaBySlug } from '@/data/content/duas'

function Cell({ c, locale }: { c?: RakahCell; locale: Locale }) {
  if (!c) return <span aria-label={locale === 'bn' ? 'নেই' : 'none'} className="text-muted-foreground">·</span>
  return (
    <span className="inline-flex flex-col items-start">
      <span className="text-lg font-bold leading-none">{locale === 'bn' ? bnNum(c.n) : c.n}</span>
      <span className="mt-1 text-[11px] font-semibold text-muted-foreground">{lt(locale, rakahKindLabel[c.kind])}</span>
    </span>
  )
}

export async function SalahPage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const [hero] = await getVersesByRefs(['108:2'])
  const meta = guideMeta('salah', locale)
  const title = String((meta.title as { absolute: string }).absolute)
  const description = String(meta.description)
  const faqs = bn
    ? [
        { q: 'নামাজ পড়ার নিয়ম কী (সংক্ষেপে)?', a: 'ওযু করে কিবলামুখী হয়ে নিয়ত করুন; তাকবীরে তাহরীমা বলে হাত বেঁধে সানা, আউযুবিল্লাহ, বিসমিল্লাহ, সূরা ফাতিহা ও একটি সূরা পড়ুন; রুকু, কওমা, দুই সিজদা (জালসাসহ) করুন; দ্বিতীয় রাকআতের শেষে বা শেষ রাকআতে তাশাহহুদ, দরূদ ও দোয়া পড়ে দুই দিকে সালাম ফিরান।' },
        { q: 'পাঁচ ওয়াক্ত নামাজের ফরজ কত রাকআত?', a: 'ফজর ২, যোহর ৪, আসর ৪, মাগরিব ৩ এবং এশা ৪ রাকআত ফরজ। সঙ্গে সুন্নত ও এশার পর ৩ রাকআত বিতর (হানাফী মাযহাবে ওয়াজিব)।' },
        { q: 'নিয়ত কি মুখে বলতে হয়?', a: 'না। নিয়ত অন্তরের বিষয়; মুখে বলা জরুরি নয়। কোন নামাজ পড়ছেন তা মনে ঠিক করে তাকবীর বলুন।' },
        { q: 'নামাজ শেখার জন্য কোন সূরাগুলো আগে মুখস্থ করব?', a: 'প্রথমে সূরা ফাতিহা, তারপর আমপারার ছোট সূরা যেমন ইখলাস, কাওসার, আসর, নাস ও ফালাক। সঙ্গে তাশাহহুদ, দরূদ ও একটি দোয়া শিখুন।' },
      ]
    : [
        { q: 'What are the steps of salah in short?', a: 'Make wudu, face the qibla and make the intention. Say the opening takbir, fold the hands and recite Thana, Ta‘awwudh, Bismillah, al-Fatiha and a surah; then ruku, qawmah and two sujoods with the sitting between them. At the end sit for the Tashahhud, Durood and a dua, and finish with the salam to the right and left.' },
        { q: 'How many rak‘ahs are fard in the five daily prayers?', a: 'Fajr 2, Dhuhr 4, Asr 4, Maghrib 3 and Isha 4 fard rak‘ahs, plus the sunnah prayers and, after Isha, 3 rak‘ahs of Witr (wajib in the Hanafi school).' },
        { q: 'Do I have to say the intention aloud?', a: 'No. The intention is in the heart; saying it aloud is not required. Decide in your heart which prayer you are praying, then say the takbir.' },
        { q: 'Which surahs should a beginner learn first?', a: 'Start with al-Fatiha, then short surahs of Juz Amma such as al-Ikhlas, al-Kawthar, al-‘Asr, an-Nas and al-Falaq. Also learn the Tashahhud, Durood and one dua.' },
      ]
  const stepName = (s: (typeof salahSteps)[number]) => pick(locale, s.title)
  return (
    <GuideFrame
      locale={locale}
      path="/learn/salah"
      crumbs={[{ name: bn ? 'শিক্ষা' : 'Learn', ar: 'تعلّم', href: '/learn' }, { name: bn ? 'নামাজ শিক্ষা' : 'Salah', ar: 'الصلاة', href: '/learn/salah' }]}
      headline={title}
      description={description}
      keywords={meta.keywords as string[]}
      hero={{
        eyebrow: lt(locale, { en: 'Salah', bn: 'নামাজ শিক্ষা', ar: 'الصلاة' }), icon: 'mosque', arabic: hero?.ar,
        title: lt(locale, { en: 'How to pray salah, step by step', bn: 'নামাজ শিক্ষা: ধাপে ধাপে নামাজ পড়ার নিয়ম', ar: 'كيف تصلي خطوة بخطوة' }),
        subtitle: lt(locale, {
          en: 'The rak‘ah table for the five daily prayers and every step from niyyah to salam, with each recitation in Arabic, Bangla pronunciation and meaning.',
          bn: 'পাঁচ ওয়াক্ত নামাজের রাকআতের তালিকা এবং নিয়ত থেকে সালাম পর্যন্ত প্রতিটি ধাপ, প্রতিটি পাঠ আরবি, বাংলা উচ্চারণ ও অর্থসহ।',
          ar: 'جدول ركعات الصلوات الخمس وكل خطوة من النية إلى السلام مع الأذكار بالعربية ونطقها ومعناها.',
        }),
      }}
      ld={[
        howToLd({ name: bn ? 'নামাজ পড়ার নিয়ম' : 'How to pray salah', description, path: h('/learn/salah'), inLanguage: bn ? 'bn' : undefined, steps: salahSteps.map((s) => ({ name: stepName(s), text: pick(locale, s.body) })) }),
        collectionLd({ name: title, description, path: h('/learn/salah'), inLanguage: bn ? 'bn' : undefined, items: salahSteps.map((s) => ({ name: stepName(s), href: `${h('/learn/salah')}#${s.id}` })) }),
      ]}
      faqs={faqs}
      citeNote={bn ? 'নামাজ শিক্ষা' : 'Salah'}
      toc={[
        { id: 'times', label: { en: 'Prayer times', bn: 'নামাজের সময়', ar: 'أوقات الصلاة' } },
        { id: 'rakahs', label: { en: 'Rak‘ah table', bn: 'রাকআতের তালিকা', ar: 'جدول الركعات' } },
        { id: 'steps', label: { en: 'Step by step', bn: 'ধাপে ধাপে', ar: 'خطوة بخطوة' } },
        { id: 'witr', label: { en: 'Witr & qunut', bn: 'বিতর ও কুনুত', ar: 'الوتر والقنوت' } },
        { id: 'mistakes', label: { en: 'Common mistakes', bn: 'সাধারণ ভুল', ar: 'أخطاء شائعة' } },
        { id: 'surahs', label: { en: 'Short surahs', bn: 'ছোট সূরা', ar: 'السور القصيرة' } },
      ]}
    >
      <Section id="times" title={lt(locale, { en: 'The five daily prayers and their times', bn: 'পাঁচ ওয়াক্ত নামাজ ও তাদের সময়', ar: 'الصلوات الخمس وأوقاتها' })} intro={lt(locale, { en: 'Prayer is prescribed at fixed times for the believers (Quran 4:103). The exact minutes depend on your city and the date.', bn: 'মুমিনদের ওপর নামাজ নির্দিষ্ট সময়ে ফরজ করা হয়েছে (কুরআন ৪:১০৩)। সঠিক মিনিট শহর ও তারিখের ওপর নির্ভর করে।', ar: 'الصلاة مفروضة في أوقات محددة (النساء ١٠٣)، والدقائق تختلف بحسب المدينة والتاريخ.' })}>
        <QuranPassage refs={['4:103']} locale={locale} />
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {prayerRows.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <p className="font-display text-lg font-semibold">{lt(locale, r.name)}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{lt(locale, r.time)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          <Link href={h('/prayer-times')} className="text-primary hover:underline">{lt(locale, { en: 'Prayer times for your city', bn: 'আপনার শহরের নামাজের সময়', ar: 'مواقيت الصلاة لمدينتك' })} <span className="inline-block rtl:rotate-180">→</span></Link>
          <Link href={h('/qibla')} className="text-primary hover:underline">{lt(locale, { en: 'Find the qibla', bn: 'কিবলা নির্ণয়', ar: 'اتجاه القبلة' })} <span className="inline-block rtl:rotate-180">→</span></Link>
        </p>
      </Section>

      <Section id="rakahs" title={lt(locale, { en: 'Number of rak‘ahs (Hanafi)', bn: 'রাকআতের সংখ্যা (হানাফী)', ar: 'عدد الركعات (حنفي)' })} intro={lt(locale, { en: 'Fard prayers are obligatory. The 12 emphasised sunnah rak‘ahs (2 before Fajr, 4 before and 2 after Dhuhr, 2 after Maghrib, 2 after Isha) are based on the hadith in Sahih Muslim 728 and Jami at-Tirmidhi 415; the others listed are non-emphasised sunnah.', bn: 'ফরজ নামাজ আবশ্যক। ১২ রাকআত তাকিদপূর্ণ সুন্নত (ফজরের আগে ২, যোহরের আগে ৪ ও পরে ২, মাগরিবের পরে ২, এশার পরে ২) সহীহ মুসলিম ৭২৮ ও জামে তিরমিযী ৪১৫-এর হাদিসের ভিত্তিতে; তালিকার বাকিগুলো গায়রে মুয়াক্কাদা সুন্নত।', ar: 'الفرائض لازمة، والسنن المؤكدة اثنتا عشرة ركعة بحسب حديث صحيح مسلم ٧٢٨ وسنن الترمذي ٤١٥.' })}>
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table data-rakah-table className="w-full min-w-[40rem] border-separate border-spacing-0 overflow-hidden rounded-3xl border border-border bg-card text-start text-sm">
            <caption className="sr-only">{lt(locale, { en: 'Rak‘ahs of the five daily prayers according to the Hanafi school', bn: 'হানাফী মাযহাব অনুযায়ী পাঁচ ওয়াক্ত নামাজের রাকআত', ar: 'ركعات الصلوات الخمس عند الحنفية' })}</caption>
            <thead className="bg-muted/60 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                {[
                  { en: 'Prayer', bn: 'নামাজ', ar: 'الصلاة' }, { en: 'Sunnah before', bn: 'আগের সুন্নত', ar: 'سنة قبلية' }, { en: 'Fard', bn: 'ফরজ', ar: 'الفرض' }, { en: 'Sunnah after', bn: 'পরের সুন্নত', ar: 'سنة بعدية' }, { en: 'Witr', bn: 'বিতর', ar: 'الوتر' },
                ].map((c) => <th key={c.en} scope="col" className="px-4 py-3 text-start font-bold">{lt(locale, c)}</th>)}
              </tr>
            </thead>
            <tbody>
              {prayerRows.map((r) => (
                <tr key={r.id} data-prayer={r.id} className="align-top odd:bg-background/40">
                  <th scope="row" className="border-t border-border px-4 py-3 text-start">
                    <span className="font-display text-base font-semibold">{lt(locale, r.name)}</span>
                    {r.note && <span className="mt-1 block max-w-[16rem] text-xs font-normal leading-relaxed text-muted-foreground">{lt(locale, r.note)}</span>}
                  </th>
                  <td className="border-t border-border px-4 py-3"><Cell c={r.before} locale={locale} /></td>
                  <td className="border-t border-border bg-primary/5 px-4 py-3"><Cell c={r.fard} locale={locale} /></td>
                  <td className="border-t border-border px-4 py-3"><Cell c={r.after} locale={locale} /></td>
                  <td className="border-t border-border px-4 py-3"><Cell c={r.witr} locale={locale} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {lt(locale, { en: 'Sources: ', bn: 'সূত্র: ', ar: 'المصادر: ' })}<HadithRef id="muslim-728" locale={locale} />, <HadithRef id="tirmidhi-415" locale={locale} />.
        </p>
        <FiqhNote locale={locale}>
          {lt(locale, {
            en: 'The number of sunnah rak‘ahs and whether witr is wajib or sunnah differ between the schools; the table follows the Hanafi school. The Jumu‘ah prayer replaces Dhuhr on Friday with 2 fard rak‘ahs after the khutbah.',
            bn: 'সুন্নত রাকআতের সংখ্যা এবং বিতর ওয়াজিব না সুন্নত, তা নিয়ে মাযহাবের মধ্যে মতভেদ আছে; তালিকাটি হানাফী মাযহাব অনুযায়ী। জুমার দিন খুতবার পর ২ রাকআত ফরজ জুমার নামাজ যোহরের স্থান নেয়।',
            ar: 'يختلف المذاهب في عدد السنن وفي وجوب الوتر أو سنيته، والجدول وفق المذهب الحنفي.',
          })}
        </FiqhNote>
      </Section>

      <Section id="steps" title={lt(locale, { en: 'How to pray, step by step', bn: 'ধাপে ধাপে নামাজ পড়ার নিয়ম', ar: 'خطوات الصلاة' })} intro={lt(locale, { en: 'Follow the Prophet’s instruction “pray as you have seen me pray”', bn: 'নবী ﷺ-এর নির্দেশ “আমাকে যেভাবে নামাজ পড়তে দেখেছ সেভাবে পড়”', ar: 'اتبع قوله ﷺ: «صلّوا كما رأيتموني أصلي»' })}>
        <p className="-mt-3 mb-5 text-xs text-muted-foreground">(<HadithRef id="bukhari-631" locale={locale} />)</p>
        <ol className="space-y-6">
          {salahSteps.map((s, n) => (
            <li key={s.id} id={s.id} data-salah-step={s.id} className="card-soft scroll-mt-24 rounded-[2rem] p-5 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-base font-bold text-primary-foreground">{bn ? bnNum(n + 1) : n + 1}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{lt(locale, s.title)}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed sm:text-base">{lt(locale, s.body)}</p>
                </div>
              </div>
              {(s.recite?.length || s.quran?.length || s.dua?.length) ? (
                <div className="mt-5 space-y-4">
                  {s.recite?.map((id) => { const r = recitationById(id); return r ? <RecitationCard key={id} r={r} locale={locale} /> : null })}
                  {s.quran && <QuranPassage refs={s.quran} locale={locale} />}
                  {s.dua && s.dua.length > 0 && (
                    <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <span className="font-semibold">{lt(locale, { en: 'Related duas:', bn: 'সম্পর্কিত দোয়া:', ar: 'أدعية ذات صلة:' })}</span>
                      {s.dua.map((slug) => { const d = duaBySlug(slug); return d ? <Link key={slug} href={h(`/dua/${slug}`)} className="text-primary hover:underline">{bn ? d.title.bn.split(':')[0] : d.title.en.split(':')[0]}</Link> : null })}
                    </p>
                  )}
                </div>
              ) : null}
              {s.note && <FiqhNote locale={locale}>{lt(locale, s.note)}</FiqhNote>}
            </li>
          ))}
        </ol>
      </Section>

      <Section id="witr" title={lt(locale, { en: 'Witr and the Dua Qunut', bn: 'বিতর নামাজ ও দোয়া কুনুত', ar: 'الوتر ودعاء القنوت' })} intro={lt(locale, { en: 'In the Hanafi practice Witr is three rak‘ahs prayed after Isha with one sitting (Tashahhud only) after the second rak‘ah. In the third rak‘ah, after al-Fatiha and a surah, say “Allahu akbar” raising the hands, fold them again, recite the Dua Qunut and then go into ruku.', bn: 'হানাফী আমলে বিতর এশার পর তিন রাকআত; দ্বিতীয় রাকআতে শুধু তাশাহহুদ পড়ে বসে তৃতীয় রাকআতে উঠতে হয়। তৃতীয় রাকআতে ফাতিহা ও সূরার পর হাত তুলে “আল্লাহু আকবার” বলে আবার হাত বেঁধে দোয়া কুনুত পড়ে রুকুতে যেতে হয়।', ar: 'الوتر عند الحنفية ثلاث ركعات بعد العشاء، ويُقرأ القنوت في الثالثة قبل الركوع.' })}>
        <RecitationCard r={recitationById('qunut-common')!} locale={locale} />
        <p className="mt-3 text-sm text-muted-foreground">
          {lt(locale, { en: 'A form of Dua Qunut taught by the Prophet ﷺ is also recited: ', bn: 'নবী ﷺ-এর শেখানো দোয়া কুনুতও পড়া হয়: ', ar: 'ويُقرأ أيضًا دعاء القنوت المأثور: ' })}
          <Link href={h('/dua/dua-qunut')} className="font-semibold text-primary hover:underline">{lt(locale, { en: 'Dua Qunut (verified dua page)', bn: 'দোয়া কুনুত (যাচাইকৃত দোয়ার পাতা)', ar: 'دعاء القنوت (صفحة موثقة)' })}</Link>.
        </p>
        <FiqhNote locale={locale}>
          {lt(locale, {
            en: 'Other schools pray Witr as one, three or more rak‘ahs, may give the salam after two rak‘ahs, and place the qunut after the ruku or only in part of the year. Follow your school and consult a scholar.',
            bn: 'অন্য মাযহাবে বিতর এক, তিন বা তারও বেশি রাকআত হতে পারে, দুই রাকআতের পর সালাম ফিরানো যায়, এবং কুনুত রুকুর পরে বা বছরের একটি অংশে পড়া হয়। নিজের মাযহাব অনুসরণ করুন ও আলেমের পরামর্শ নিন।',
            ar: 'يصلي غير الحنفية الوتر ركعة أو ثلاثًا أو أكثر ويضعون القنوت بعد الركوع أو في بعض السنة.',
          })}
        </FiqhNote>
      </Section>

      <Section id="mistakes" title={lt(locale, { en: 'Common mistakes to avoid', bn: 'যে ভুলগুলো এড়িয়ে চলবেন', ar: 'أخطاء شائعة' })}>
        <ul className="grid gap-3 sm:grid-cols-2">
          {salahMistakes.map((m, n) => (
            <li key={n} className="rounded-2xl border border-border bg-card p-4">
              <p className="font-semibold">{lt(locale, m.title)}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{lt(locale, m.body)}{n === 0 && <> (<HadithRef id="bukhari-757" locale={locale} />)</>}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="surahs" title={lt(locale, { en: 'Short surahs for beginners (Juz Amma)', bn: 'নতুনদের জন্য ছোট সূরা (আমপারা)', ar: 'سور قصيرة للمبتدئين (جزء عمّ)' })} intro={lt(locale, { en: 'These short surahs are easy to memorise and are often recited after al-Fatiha. Open any of them to read, listen and see the Bangla pronunciation.', bn: 'এই ছোট সূরাগুলো মুখস্থ করা সহজ এবং ফাতিহার পর প্রায়ই পড়া হয়। পড়তে, শুনতে ও বাংলা উচ্চারণ দেখতে যেকোনোটি খুলুন।', ar: 'سور قصيرة يسهل حفظها وتُقرأ بعد الفاتحة.' })}>
        <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {beginnerSurahs.map((id) => (
            <li key={id}>
              <Link href={h(surahHref(id))} data-beginner-surah={id} className="card-soft lift flex items-center justify-between gap-3 rounded-2xl p-4">
                <span>
                  <span className="block text-sm font-semibold"><SurahName id={id} /></span>
                  <span className="block text-xs text-muted-foreground">{bn ? `${bnNum(chapters[id - 1].versesCount)} আয়াত` : lt(locale, { en: `${chapters[id - 1].versesCount} ayahs`, bn: `${bnNum(chapters[id - 1].versesCount)} আয়াত`, ar: `${chapters[id - 1].versesCount} آيات` })}</span>
                </span>
                <span lang="ar" className="font-arabic text-xl text-gold">{chapters[id - 1].nameArabic}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm"><Link href={h('/juz/30')} className="font-semibold text-primary hover:underline">{lt(locale, { en: 'Read all of Juz Amma', bn: 'পুরো আমপারা পড়ুন', ar: 'اقرأ جزء عمّ كاملًا' })} <span className="inline-block rtl:rotate-180">→</span></Link></p>
        <p className="mt-2 text-sm text-muted-foreground">{lt(locale, { en: 'Before you pray, make ', bn: 'নামাজের আগে শিখুন ', ar: 'قبل الصلاة تعلّم ' })}<Link href={h('/learn/wudu')} className="font-semibold text-primary hover:underline">{lt(locale, { en: 'wudu', bn: 'অজুর নিয়ম', ar: 'الوضوء' })}</Link>{lt(locale, { en: ' and learn the ', bn: ' এবং ', ar: ' وتعلّم ' })}<Link href={h('/learn/tajweed')} className="font-semibold text-primary hover:underline">{lt(locale, { en: 'tajweed rules', bn: 'তাজবীদের নিয়ম', ar: 'أحكام التجويد' })}</Link>.</p>
      </Section>
    </GuideFrame>
  )
}
