import Link from 'next/link'
import { GuideFrame } from '@/components/learn/frame'
import { QuranPassage, Section, SourceLine } from '@/components/learn/ui'
import { collectionLd } from '@/lib/content/seo'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { lt } from '@/lib/i18n/lt'
import { NotAr } from '@/lib/i18n/text'
import { bnNum, pick } from '@/lib/i18n/t'
import { getVersesByRefs } from '@/lib/quran/data'
import { guideMeta } from './learn'
import { kalimas } from '@/data/learn/kalima'
import { duaBySlug } from '@/data/content/duas'

export async function KalimaPage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const [hero] = await getVersesByRefs(['112:1'])
  const meta = guideMeta('kalima', locale)
  const title = String((meta.title as { absolute: string }).absolute)
  const description = String(meta.description)
  const faqs = bn
    ? [
        { q: 'কালেমা কয়টি?', a: 'উপমহাদেশে ছয়টি কালেমা শেখানো হয়: ১. তাইয়্যিবা, ২. শাহাদাত, ৩. তামজীদ, ৪. তাওহীদ, ৫. ইস্তিগফার, ৬. রদ্দে কুফর।' },
        { q: 'প্রথম কালেমা কোনটি?', a: 'প্রথম কালেমা তাইয়্যিবা: “লা ইলাহা ইল্লাল্লাহু মুহাম্মাদুর রাসূলুল্লাহ” — আল্লাহ ছাড়া কোনো ইলাহ নেই, মুহাম্মদ ﷺ আল্লাহর রাসূল।' },
        { q: 'ছয় কালেমা কি কুরআন-হাদিসে এই ক্রমে আছে?', a: 'না। ছয়টি আলাদা কালেমা হিসেবে সাজানো ও নম্বর দেওয়া একটি শিক্ষাগত রীতি, যা উপমহাদেশে প্রচলিত। বাক্যগুলোর মূল বা অংশবিশেষ কুরআন ও হাদিসে আছে; কোন অংশের সূত্র যাচাই করা গেছে তা প্রতিটি কালেমার নিচে লেখা আছে।' },
        { q: 'ঈমান আনতে কোন কালেমা পড়তে হয়?', a: 'ঈমানের মূল ঘোষণা হলো শাহাদাত: আল্লাহ ছাড়া কোনো ইলাহ নেই এবং মুহাম্মদ ﷺ তাঁর বান্দা ও রাসূল। ইসলাম গ্রহণ সংক্রান্ত বিস্তারিত বিষয়ে আলেমের পরামর্শ নিন।' },
      ]
    : [
        { q: 'How many kalimas are there?', a: 'In South Asia six kalimas are taught: 1. Tayyibah, 2. Shahadah, 3. Tamjeed, 4. Tawheed, 5. Astaghfar, 6. Radd-e-Kufr.' },
        { q: 'What is the first kalima?', a: 'The first kalima is Kalima Tayyibah: “La ilaha illallahu Muhammadur rasulullah”, meaning there is no god but Allah and Muhammad ﷺ is the Messenger of Allah.' },
        { q: 'Are the six kalimas listed in this order in the Quran or hadith?', a: 'No. Arranging and numbering them as six kalimas is a teaching convention common in South Asia. The phrases, or parts of them, come from the Quran and hadith; under each kalima this page says which source could be verified and which wording is simply commonly taught.' },
        { q: 'Which kalima is said to accept Islam?', a: 'The core declaration of faith is the testimony (shahadah): that there is no god but Allah and that Muhammad ﷺ is His servant and messenger. For questions about embracing Islam, please consult a scholar.' },
      ]
  return (
    <GuideFrame
      locale={locale}
      path="/learn/kalima"
      crumbs={[{ name: bn ? 'শিক্ষা' : 'Learn', ar: 'تعلّم', href: '/learn' }, { name: bn ? '৬ কালেমা' : 'Six Kalimas', ar: 'الكلمات الست', href: '/learn/kalima' }]}
      headline={title}
      description={description}
      keywords={meta.keywords as string[]}
      hero={{
        eyebrow: lt(locale, { en: 'Six Kalimas', bn: '৬ কালেমা', ar: 'الكلمات الست' }), icon: 'sparkle', arabic: hero?.ar,
        title: lt(locale, { en: 'The six kalimas: Arabic, pronunciation and meaning', bn: '৬ কালেমা: আরবি, বাংলা উচ্চারণ ও অর্থ', ar: 'الكلمات الست: النص والنطق والمعنى' }),
        subtitle: lt(locale, {
          en: 'Each kalima with its Arabic text, Bangla pronunciation, English transliteration and meaning, and an honest note about where the wording comes from.',
          bn: 'প্রতিটি কালেমা আরবি, বাংলা উচ্চারণ, ইংরেজি ট্রান্সলিটারেশন ও অর্থসহ এবং শব্দগুলোর উৎস সম্পর্কে সৎ তথ্যসহ।',
          ar: 'كل كلمة بنصها العربي ونطقها ومعناها مع بيان صادق لمصدر صيغتها.',
        }),
      }}
      ld={[collectionLd({ name: title, description, path: h('/learn/kalima'), inLanguage: bn ? 'bn' : undefined, items: kalimas.map((k) => ({ name: pick(locale, { en: k.name.en, bn: k.name.bn }), href: `${h('/learn/kalima')}#${k.slug}` })) })]}
      faqs={faqs}
      scholar={false}
      citeNote={bn ? 'ছয় কালেমা' : 'Six kalimas'}
      toc={kalimas.map((k) => ({ id: k.slug, label: { en: `${k.n}. ${k.name.en.replace('Kalima ', '')}`, bn: `${bnNum(k.n)}. ${k.name.bn.replace('কালেমা ', '')}` } }))}
    >
      <aside data-kalima-note className="mt-6 rounded-2xl border border-gold/30 bg-gold-soft/40 p-4 text-sm leading-relaxed text-foreground/85">
        <strong className="font-semibold">{lt(locale, { en: 'About the “six kalimas”: ', bn: '“ছয় কালেমা” সম্পর্কে: ', ar: 'عن «الكلمات الست»: ' })}</strong>
        {lt(locale, {
          en: 'Grouping and numbering the phrases as six kalimas is a teaching convention in South Asia, not a list found as such in the Quran or hadith. The phrases themselves come from the Quran and hadith. We cite a source only where we could verify it against the Quran corpus or the hadith corpus; otherwise the wording is labelled “commonly taught”.',
          bn: 'এই বাক্যগুলোকে ছয় কালেমা হিসেবে সাজানো ও নম্বর দেওয়া উপমহাদেশের একটি শিক্ষাগত রীতি; কুরআন বা হাদিসে এভাবে কোনো তালিকা নেই। বাক্যগুলো কুরআন ও হাদিস থেকে নেওয়া। আমরা কেবল সেখানেই সূত্র দিয়েছি যেখানে কুরআনের কর্পাস বা হাদিসের কর্পাসের সঙ্গে মিলিয়ে যাচাই করা গেছে; অন্যথায় “প্রচলিত পাঠ” লেখা হয়েছে।',
          ar: 'ترتيب العبارات وترقيمها كستّ كلمات عُرفٌ تعليمي في جنوب آسيا وليس قائمة واردة بهذا الشكل في القرآن أو الحديث، لكن العبارات نفسها مأخوذة من القرآن والحديث. ولا نذكر مصدرًا إلا حيث أمكن التحقق منه في مدونة القرآن أو الحديث، وإلا وُصفت الصيغة بأنها «شائعة التعليم».',
        })}
      </aside>

      <div className="mt-8 space-y-8">
        {kalimas.map((k) => (
          <article key={k.slug} id={k.slug} data-kalima={k.slug} aria-labelledby={`${k.slug}-h`} className="card-soft scroll-mt-24 rounded-[2rem] p-5 sm:p-8">
            <header className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">{bn ? bnNum(k.n) : k.n}</span>
              <div>
                <h2 id={`${k.slug}-h`} className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{bn ? k.name.bn : lt(locale, { en: k.name.en, bn: k.name.bn })}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span lang="ar" className="font-arabic text-lg text-gold">{k.name.ar}</span> · {lt(locale, k.nameMeaning)}
                  {!bn && <NotAr> · <span lang="bn" className="font-bangla">{k.name.bn}</span></NotAr>}
                </p>
              </div>
            </header>
            <p lang="ar" dir="rtl" className="quran-text mt-6 text-center text-[clamp(1.6rem,5vw,2.6rem)] leading-[2.3] text-arabic">{k.ar}</p>
            <dl className="mx-auto mt-6 max-w-3xl space-y-4 text-center sm:text-start">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">{lt(locale, { en: 'Bangla pronunciation', bn: 'বাংলা উচ্চারণ', ar: 'النطق بالبنغالية' })}</dt>
                <dd lang="bn" className="font-bangla mt-1 text-lg leading-relaxed">{k.bn}</dd>
              </div>
              <NotAr>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">{lt(locale, { en: 'Transliteration', bn: 'ইংরেজি ট্রান্সলিটারেশন', ar: 'النطق اللاتيني' })}</dt>
                  <dd lang="en" className="mt-1 italic leading-relaxed text-muted-foreground">{k.tl}</dd>
                </div>
              </NotAr>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">{lt(locale, { en: 'Meaning', bn: 'অর্থ', ar: 'المعنى' })}</dt>
                <dd lang={bn ? 'bn' : undefined} className={`mt-1 text-lg leading-relaxed ${bn ? 'font-bangla' : ''}`}>{lt(locale, k.meaning)}</dd>
              </div>
            </dl>
            <div className="mx-auto mt-6 max-w-3xl rounded-2xl bg-muted/50 p-4 text-sm leading-relaxed">
              <p className="mb-1 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {lt(locale, { en: 'Where the wording comes from', bn: 'শব্দগুলোর উৎস', ar: 'مصدر الصيغة' })}
                <span className={`rounded-full px-2 py-0.5 text-[10px] normal-case tracking-normal ${k.commonlyTaught ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>{k.commonlyTaught ? lt(locale, { en: 'Commonly taught form', bn: 'প্রচলিত পাঠ', ar: 'صيغة شائعة' }) : lt(locale, { en: 'Source verified', bn: 'সূত্র যাচাইকৃত', ar: 'المصدر موثّق' })}</span>
              </p>
              <p>{lt(locale, k.note)}</p>
              <SourceLine hadith={k.hadith} locale={locale} />
              {k.dua && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {k.dua.map((s, i) => { const d = duaBySlug(s); return d ? <span key={s}>{i > 0 && ' · '}<Link href={h(`/dua/${s}`)} className="text-primary underline underline-offset-2">{bn ? d.title.bn.split(':')[0] : d.title.en.split(':')[0]}</Link></span> : null })}
                </p>
              )}
            </div>
            {k.quran && <div className="mt-5"><QuranPassage refs={k.quran} locale={locale} /></div>}
          </article>
        ))}
      </div>
      <Section id="memorise" title={lt(locale, { en: 'How to memorise the kalimas', bn: 'কালেমা মুখস্থ করার সহজ উপায়', ar: 'كيف تحفظ الكلمات' })}>
        <ol className="list-decimal space-y-2 ps-5 text-[15px] leading-relaxed marker:font-semibold marker:text-primary">
          <li>{lt(locale, { en: 'Read the Arabic slowly while following the Bangla pronunciation.', bn: 'বাংলা উচ্চারণ দেখে ধীরে ধীরে আরবি পড়ুন।' })}</li>
          <li>{lt(locale, { en: 'Learn one kalima at a time, a short phrase at a time, and repeat it aloud.', bn: 'একবারে একটি কালেমা, ছোট ছোট অংশে ভেঙে জোরে জোরে বারবার পড়ুন।' })}</li>
          <li>{lt(locale, { en: 'Think about the meaning so the words stay with you, and ask a teacher to check your pronunciation.', bn: 'অর্থ নিয়ে ভাবুন যাতে শব্দগুলো মনে থাকে, এবং উস্তাদকে দিয়ে উচ্চারণ যাচাই করে নিন।' })}</li>
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">
          {lt(locale, { en: 'Next: learn how to make ', bn: 'এরপর শিখুন ' })}
          <Link href={h('/learn/wudu')} className="font-semibold text-primary hover:underline">{lt(locale, { en: 'wudu', bn: 'অজুর নিয়ম' })}</Link>{lt(locale, { en: ' and ', bn: ' ও ' })}
          <Link href={h('/learn/salah')} className="font-semibold text-primary hover:underline">{lt(locale, { en: 'how to pray', bn: 'নামাজ শিক্ষা' })}</Link>.
        </p>
      </Section>
    </GuideFrame>
  )
}
