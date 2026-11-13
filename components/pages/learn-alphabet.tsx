import Link from 'next/link'
import { GuideFrame } from '@/components/learn/frame'
import { Section } from '@/components/learn/ui'
import { AlphabetGrid, AlphabetQuiz } from '@/components/learn/alphabet'
import { absoluteUrl } from '@/lib/site'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { lt } from '@/lib/i18n/lt'
import { pick } from '@/lib/i18n/t'
import { getVersesByRefs } from '@/lib/quran/data'
import { guideMeta } from './learn'
import { arabicLetters, makhrajGroups } from '@/data/learn/alphabet'

export async function AlphabetPage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const [hero] = await getVersesByRefs(['96:4'])
  const meta = guideMeta('arabic-alphabet', locale)
  const title = String((meta.title as { absolute: string }).absolute)
  const description = String(meta.description)
  const url = absoluteUrl(h('/learn/arabic-alphabet'))
  const faqs = bn
    ? [
        { q: 'আরবি বর্ণমালায় কয়টি হরফ?', a: 'আরবি বর্ণমালায় ২৮টি হরফ। এগুলো ডান থেকে বামে লেখা হয় এবং বেশিরভাগ হরফ শব্দের শুরু, মাঝ ও শেষে আলাদা রূপ নেয়।' },
        { q: 'কোন হরফগুলো পরের হরফের সঙ্গে জোড়া লাগে না?', a: 'ছয়টি হরফ পরের হরফের সঙ্গে জোড়া লাগে না: ا د ذ ر ز و। এদের শুরুর রূপ আলাদা রূপের মতোই এবং মাঝের রূপ শেষের রূপের মতো।' },
        { q: 'মাখরাজ কী?', a: 'মাখরাজ হলো হরফ উচ্চারণের স্থান। প্রধান পাঁচটি এলাকা: জাওফ (মুখ ও গলার ফাঁকা স্থান), হালক (কণ্ঠনালি), লিসান (জিহ্বা), শাফাতান (ঠোঁট) ও খাইশূম (নাক)।' },
        { q: 'কুরআন পড়ার জন্য আরবি বর্ণমালা কীভাবে শিখব?', a: 'প্রথমে ২৮ হরফের নাম ও আকৃতি চিনুন, তারপর চার রূপ ও মাখরাজ অনুশীলন করুন, এবং কুইজ দিয়ে নিজেকে যাচাই করুন। উস্তাদের কাছ থেকে উচ্চারণ শুনে নেওয়া সবচেয়ে ভালো।' },
      ]
    : [
        { q: 'How many letters are in the Arabic alphabet?', a: 'The Arabic alphabet has 28 letters. It is written from right to left and most letters take a different shape at the start, middle and end of a word.' },
        { q: 'Which letters do not connect to the next letter?', a: 'Six letters never connect to the letter after them: ا د ذ ر ز و. Their initial form looks like the isolated form and their medial form looks like the final form.' },
        { q: 'What is makhraj?', a: 'Makhraj is the articulation point of a letter. The main areas are al-jawf (the empty space of the mouth and throat), al-halq (throat), al-lisan (tongue), ash-shafatan (lips) and al-khayshum (nasal passage).' },
        { q: 'How do I learn the Arabic alphabet for reading the Quran?', a: 'Learn the 28 names and shapes first, then practise the four forms and the articulation points, and test yourself with the quiz. It is best to have a teacher listen to your pronunciation.' },
      ]
  return (
    <GuideFrame
      locale={locale}
      path="/learn/arabic-alphabet"
      crumbs={[{ name: bn ? 'শিক্ষা' : 'Learn', ar: 'تعلّم', href: '/learn' }, { name: bn ? 'আরবি বর্ণমালা' : 'Arabic alphabet', ar: 'الحروف العربية', href: '/learn/arabic-alphabet' }]}
      headline={title}
      description={description}
      keywords={meta.keywords as string[]}
      hero={{
        eyebrow: lt(locale, { en: 'Arabic alphabet', bn: 'আরবি বর্ণমালা', ar: 'الحروف العربية' }), icon: 'read', arabic: hero?.ar,
        title: lt(locale, { en: 'The Arabic alphabet for reading the Quran', bn: 'কুরআন পড়ার জন্য আরবি বর্ণমালা', ar: 'الحروف العربية لقراءة القرآن' }),
        subtitle: lt(locale, {
          en: 'All 28 letters with names, four forms, where each is pronounced, a real Quran word for every letter, audio and a practice quiz.',
          bn: 'সব ২৮টি হরফ: নাম, চার রূপ, কোথা থেকে উচ্চারিত, প্রতিটি হরফের জন্য কুরআনের আসল শব্দ, অডিও ও অনুশীলন কুইজ।',
          ar: 'الحروف الثمانية والعشرون بأسمائها وأشكالها الأربعة ومخارجها مع كلمة قرآنية لكل حرف وصوت واختبار تدريبي.',
        }),
      }}
      ld={[{
        '@context': 'https://schema.org', '@type': 'DefinedTermSet', '@id': `${url}#letters`, name: bn ? 'আরবি বর্ণমালার ২৮টি হরফ' : 'The 28 letters of the Arabic alphabet', url, inLanguage: bn ? 'bn' : 'en',
        hasDefinedTerm: arabicLetters.map((l, i) => ({ '@type': 'DefinedTerm', name: pick(locale, l.name), alternateName: [l.ar, l.name.ar, l.name.en], termCode: String(i + 1), description: pick(locale, l.makhraj), url: `${url}#l-${l.id}` })),
      }]}
      faqs={faqs}
      citeNote={bn ? 'আরবি বর্ণমালা' : 'Arabic alphabet'}
      toc={[
        { id: 'letters', label: { en: 'The 28 letters', bn: '২৮টি হরফ', ar: 'الحروف' } },
        { id: 'forms', label: { en: 'Letter forms', bn: 'হরফের রূপ', ar: 'أشكال الحروف' } },
        { id: 'makhraj', label: { en: 'Makhraj', bn: 'মাখরাজ', ar: 'المخارج' } },
        { id: 'quiz', label: { en: 'Practice quiz', bn: 'অনুশীলন কুইজ', ar: 'اختبار تدريبي' } },
      ]}
    >
      <Section id="letters" title={lt(locale, { en: 'The 28 letters', bn: '২৮টি হরফ', ar: 'الحروف الثمانية والعشرون' })} intro={lt(locale, { en: 'Arabic is written from right to left. Each card shows the letter, its name, its four forms, where it is pronounced and a word from the Quran.', bn: 'আরবি ডান থেকে বামে লেখা হয়। প্রতিটি কার্ডে হরফ, নাম, চার রূপ, উচ্চারণের স্থান এবং কুরআনের একটি শব্দ দেখানো হয়েছে।', ar: 'تُكتب العربية من اليمين إلى اليسار، وتعرض كل بطاقة الحرف واسمه وأشكاله ومخرجه وكلمة من القرآن.' })}>
        <AlphabetGrid />
      </Section>

      <Section id="forms" title={lt(locale, { en: 'How letters change shape', bn: 'হরফ কীভাবে আকৃতি বদলায়', ar: 'كيف تتغير أشكال الحروف' })}>
        <div className="max-w-3xl space-y-3 text-[15px] leading-relaxed">
          <p>{lt(locale, { en: 'Most letters join to the next letter, so they have four forms: alone (isolated), at the start of a connected group (initial), in the middle (medial) and at the end (final).', bn: 'বেশিরভাগ হরফ পরের হরফের সঙ্গে জোড়া লাগে, তাই এদের চারটি রূপ: আলাদা, শুরুতে, মাঝে ও শেষে।', ar: 'تتصل معظم الحروف بما بعدها فلها أربعة أشكال: منفصل وأول ووسط وآخر.' })}</p>
          <p>{lt(locale, { en: 'Six letters (ا د ذ ر ز و) never join to the letter after them. After one of these, the next letter starts a new connected group.', bn: 'ছয়টি হরফ (ا د ذ ر ز و) পরের হরফের সঙ্গে কখনো জোড়া লাগে না। এদের পরের হরফ নতুন একটি জোড়ার গুচ্ছ শুরু করে।', ar: 'ستة حروف (ا د ذ ر ز و) لا تتصل بما بعدها.' })}</p>
          <p>{lt(locale, { en: 'Vowel marks (fatha, kasra, damma), sukun and shadda sit above or below the letters; learn them after the alphabet. The hamza (ء) is a letter-like sign made in the deepest part of the throat.', bn: 'হরকত (যবর, যের, পেশ), সুকুন ও তাশদীদ হরফের ওপরে বা নিচে বসে; বর্ণমালার পর এগুলো শিখুন। হামযা (ء) গলার একদম গভীর থেকে উচ্চারিত হরফসদৃশ চিহ্ন।', ar: 'تُوضع الحركات والسكون والشدة فوق الحروف أو تحتها، والهمزة تخرج من أقصى الحلق.' })}</p>
        </div>
      </Section>

      <Section id="makhraj" title={lt(locale, { en: 'Makhraj: where each letter is pronounced', bn: 'মাখরাজ: কোন হরফ কোথা থেকে উচ্চারিত', ar: 'المخارج: من أين يخرج كل حرف' })} intro={lt(locale, { en: 'Grouped by the main articulation areas. The nasal sound of noon and meem (ghunnah) comes from the nasal passage (al-khayshum). See the tajweed pages for how these sounds behave in recitation.', bn: 'প্রধান উচ্চারণ-এলাকা অনুযায়ী সাজানো। নুন ও মীমের নাকের সুর (গুন্নাহ) নাক (আল-খাইশূম) থেকে আসে। তিলাওয়াতে এই ধ্বনির আচরণ জানতে তাজবীদের পাতা দেখুন।', ar: 'مرتبة بحسب مناطق المخرج الرئيسة؛ وغنة النون والميم من الخيشوم.' })}>
        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(makhrajGroups) as (keyof typeof makhrajGroups)[]).map((g) => (
            <div key={g} className="rounded-3xl border border-border bg-card p-5">
              <h3 className="font-display text-lg font-semibold">{lt(locale, makhrajGroups[g])}</h3>
              <ul className="mt-3 flex flex-wrap gap-2" lang="ar" dir="rtl">
                {arabicLetters.filter((l) => l.group === g).map((l) => <li key={l.id}><a href={`#l-${l.id}`} className="font-arabic grid min-w-12 place-items-center rounded-2xl bg-accent px-3 py-1.5 text-3xl leading-[1.6] text-arabic transition hover:bg-primary hover:text-primary-foreground">{l.ar}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm"><Link href={h('/learn/tajweed')} className="font-semibold text-primary hover:underline">{lt(locale, { en: 'Next: learn the tajweed rules', bn: 'এরপর: তাজবীদের নিয়ম শিখুন', ar: 'التالي: تعلّم أحكام التجويد' })} <span className="inline-block rtl:rotate-180">→</span></Link></p>
      </Section>

      <Section id="quiz" title={lt(locale, { en: 'Practice quiz', bn: 'অনুশীলন কুইজ', ar: 'اختبار تدريبي' })} intro={lt(locale, { en: 'Test yourself on letter names and forms. Your best score is saved on this device only.', bn: 'হরফের নাম ও রূপে নিজেকে যাচাই করুন। আপনার সর্বোচ্চ স্কোর শুধু এই ডিভাইসে সংরক্ষিত থাকে।', ar: 'اختبر نفسك في أسماء الحروف وأشكالها؛ تُحفظ أفضل نتيجة على هذا الجهاز فقط.' })}>
        <AlphabetQuiz />
      </Section>
    </GuideFrame>
  )
}
