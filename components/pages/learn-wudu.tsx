import Link from 'next/link'
import { GuideFrame } from '@/components/learn/frame'
import { FiqhNote, HadithRef, QuranPassage, Section } from '@/components/learn/ui'
import { WuduDiagramSvg } from '@/components/learn/wudu-diagram'
import { UiIcon } from '@/components/ui-icon'
import { collectionLd, howToLd } from '@/lib/content/seo'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { lt } from '@/lib/i18n/lt'
import { bnNum, pick } from '@/lib/i18n/t'
import { guideMeta } from './learn'
import { wuduBreakers, wuduSteps } from '@/data/learn/wudu'
import { duaBySlug } from '@/data/content/duas'

export async function WuduPage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const h = (p: string) => localeHref(locale, p)
  const meta = guideMeta('wudu', locale)
  const title = String((meta.title as { absolute: string }).absolute)
  const description = String(meta.description)
  const dua = duaBySlug('dua-after-wudu')!
  const fard = wuduSteps.filter((s) => s.kind === 'fard')
  const faqs = bn
    ? [
        { q: 'অজু করার নিয়ম কী?', a: 'মনে মনে নিয়ত করে “বিসমিল্লাহ” বলুন। দুই হাত কবজি পর্যন্ত তিনবার ধুয়ে কুলি করুন, নাকে পানি দিন, তারপর মুখমণ্ডল তিনবার ধুয়ে কনুইসহ দুই হাত তিনবার ধুয়ে নিন। এরপর মাথা মাসেহ করুন, কান মাসেহ করুন এবং টাখনুসহ দুই পা তিনবার ধুয়ে নিন।' },
        { q: 'অজুর ফরজ কয়টি?', a: 'হানাফী মাযহাবে অজুর ফরজ চারটি, যা কুরআনের ৫:৬ আয়াতে আছে: মুখমণ্ডল ধোয়া, কনুইসহ দুই হাত ধোয়া, মাথার (অন্তত এক-চতুর্থাংশ) মাসেহ এবং টাখনুসহ দুই পা ধোয়া।' },
        { q: 'কী কী কারণে অজু ভেঙে যায়?', a: 'সর্বসম্মতভাবে সামনে-পেছনের রাস্তা দিয়ে কিছু বের হলে, গভীর ঘুমে এবং জ্ঞান হারালে অজু ভাঙে। হানাফী মাযহাবে প্রবাহিত রক্ত বা পুঁজ, মুখভরা বমি ইত্যাদিতেও ভাঙে; অন্য মাযহাবে কিছু ক্ষেত্রে ভিন্ন মত আছে।' },
        { q: 'অজুর পরের দোয়া কী?', a: `“${dua.tl}” অর্থ: ${dua.meaning!.bn} উৎস: ${dua.source}।` },
      ]
    : [
        { q: 'How do I perform wudu step by step?', a: 'Make the intention in your heart and say Bismillah. Wash the hands to the wrists three times, rinse the mouth, clean the nose, wash the face three times, wash the arms to the elbows three times, wipe the head and ears, then wash the feet to the ankles three times.' },
        { q: 'How many obligatory acts (fard) does wudu have?', a: 'In the Hanafi school there are four, taken from Quran 5:6: washing the face, washing the arms to the elbows, wiping the head (at least a quarter) and washing the feet to the ankles.' },
        { q: 'What breaks wudu?', a: 'By agreement, anything leaving the front or back passage, deep sleep and loss of consciousness break wudu. In the Hanafi school flowing blood or pus and vomiting a mouthful also break it; other schools differ on some of these.' },
        { q: 'What is the dua after wudu?', a: `“${dua.tl}” Meaning: ${dua.meaning!.en} Source: ${dua.source}.` },
      ]
  return (
    <GuideFrame
      locale={locale}
      path="/learn/wudu"
      crumbs={[{ name: bn ? 'শিক্ষা' : 'Learn', ar: 'تعلّم', href: '/learn' }, { name: bn ? 'অজুর নিয়ম' : 'Wudu', ar: 'الوضوء', href: '/learn/wudu' }]}
      headline={title}
      description={description}
      keywords={meta.keywords as string[]}
      hero={{
        eyebrow: lt(locale, { en: 'Wudu', bn: 'ওযু (অজু)', ar: 'الوضوء' }), icon: 'hands',
        title: lt(locale, { en: 'How to perform wudu (ablution), step by step', bn: 'অজু (ওযু) করার নিয়ম, ধাপে ধাপে', ar: 'كيفية الوضوء خطوة بخطوة' }),
        subtitle: lt(locale, {
          en: 'Ten simple steps with diagrams, the four obligatory acts from the Quran, what breaks wudu and the dua to say afterwards.',
          bn: 'ছবিসহ ১০টি সহজ ধাপ, কুরআনের চার ফরজ, অজু ভঙ্গের কারণ ও অজুর পরের দোয়া।',
          ar: 'عشر خطوات بسيطة مع الرسوم، والفرائض الأربع من القرآن، ونواقض الوضوء والدعاء بعده.',
        }),
      }}
      ld={[
        howToLd({ name: bn ? 'অজু করার নিয়ম' : 'How to perform wudu', description, path: h('/learn/wudu'), inLanguage: bn ? 'bn' : undefined, steps: wuduSteps.map((s) => ({ name: pick(locale, s.title), text: pick(locale, s.body) + (s.times ? (bn ? ` (${bnNum(s.times)} বার)` : ` (${s.times} times)`) : '') })) }),
        collectionLd({ name: title, description, path: h('/learn/wudu'), inLanguage: bn ? 'bn' : undefined, items: wuduSteps.map((s) => ({ name: pick(locale, s.title), href: `${h('/learn/wudu')}#step-${s.id}` })) }),
      ]}
      faqs={faqs}
      citeNote={bn ? 'অজুর নিয়ম' : 'Wudu'}
      toc={[
        { id: 'quran', label: { en: 'In the Quran', bn: 'কুরআনে', ar: 'في القرآن' } },
        { id: 'steps', label: { en: 'Steps', bn: 'ধাপসমূহ', ar: 'الخطوات' } },
        { id: 'fard', label: { en: 'Obligatory acts', bn: 'ফরজ', ar: 'الفرائض' } },
        { id: 'breakers', label: { en: 'What breaks wudu', bn: 'অজু ভঙ্গের কারণ', ar: 'نواقض الوضوء' } },
        { id: 'dua', label: { en: 'Dua after wudu', bn: 'অজুর দোয়া', ar: 'دعاء الوضوء' } },
      ]}
    >
      <Section id="quran" title={lt(locale, { en: 'Wudu in the Quran (5:6)', bn: 'কুরআনে অজুর আয়াত (৫:৬)', ar: 'الوضوء في القرآن (٥:٦)' })} intro={lt(locale, { en: 'The four obligatory acts of wudu come from this ayah. The same ayah also allows tayammum when water is not available or cannot be used.', bn: 'অজুর চার ফরজ এই আয়াত থেকেই এসেছে। পানি না পেলে বা ব্যবহার করতে না পারলে একই আয়াতে তায়াম্মুমেরও অনুমতি আছে।', ar: 'من هذه الآية فرائض الوضوء الأربع، وفيها الإذن بالتيمم عند فقد الماء.' })}>
        <QuranPassage refs={['5:6']} locale={locale} />
        <p className="mt-3 text-sm text-muted-foreground">
          {lt(locale, { en: 'The Prophet ﷺ said that no prayer is accepted without wudu', bn: 'নবী ﷺ বলেছেন, অজু ছাড়া নামাজ কবুল হয় না', ar: 'قال النبي ﷺ: لا تُقبل صلاة بغير وضوء' })}{' '}
          (<HadithRef id="bukhari-135" locale={locale} />). {lt(locale, { en: 'A detailed description of the Prophet’s wudu is in', bn: 'নবী ﷺ-এর অজুর বিস্তারিত বর্ণনা আছে', ar: 'ووصف وضوئه ﷺ في' })} <HadithRef id="bukhari-159" locale={locale} />.
        </p>
      </Section>

      <Section id="steps" title={lt(locale, { en: 'Step-by-step wudu', bn: 'ধাপে ধাপে অজু', ar: 'خطوات الوضوء' })} intro={lt(locale, { en: 'Steps marked “Fard” are the obligatory acts; the rest are sunnah acts that complete the wudu.', bn: '“ফরজ” চিহ্নিত ধাপগুলো আবশ্যক; বাকিগুলো সুন্নত, যা অজুকে পূর্ণ করে।', ar: 'الخطوات الموسومة «فرض» هي الفرائض، والباقي سنن.' })}>
        <ol className="grid gap-4 sm:grid-cols-2">
          {wuduSteps.map((s, n) => (
            <li key={s.id} id={`step-${s.id}`} data-wudu-step={s.id} className="card-soft scroll-mt-24 rounded-3xl p-5">
              <div className="flex items-start gap-4">
                <div className="grid size-24 shrink-0 place-items-center rounded-2xl bg-accent"><WuduDiagramSvg id={s.id} /></div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{bn ? bnNum(n + 1) : n + 1}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.kind === 'fard' ? 'bg-primary text-primary-foreground' : 'bg-gold-soft text-gold'}`}>{s.kind === 'fard' ? lt(locale, { en: 'Fard', bn: 'ফরজ', ar: 'فرض' }) : lt(locale, { en: 'Sunnah', bn: 'সুন্নত', ar: 'سنة' })}</span>
                    {s.times && <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">{bn ? `${bnNum(s.times)} বার` : <>{lt(locale, { en: `${s.times} times`, bn: `${bnNum(s.times)} বার`, ar: `${s.times} مرات` })}</>}</span>}
                  </div>
                  <h3 className="font-display mt-2 text-lg font-semibold leading-snug">{lt(locale, s.title)}</h3>
                </div>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed">{lt(locale, s.body)}</p>
              {s.id === 'dua' && <p className="mt-2 text-sm"><Link href={h('/dua/dua-after-wudu')} className="font-semibold text-primary hover:underline">{lt(locale, { en: 'Open the dua page', bn: 'দোয়ার পাতা খুলুন', ar: 'افتح صفحة الدعاء' })} <span className="inline-block rtl:rotate-180">→</span></Link></p>}
              {s.tip && <FiqhNote locale={locale} title={{ en: 'Good to know', bn: 'জানা ভালো', ar: 'للعلم' }}>{lt(locale, s.tip)}</FiqhNote>}
            </li>
          ))}
        </ol>
      </Section>

      <Section id="fard" title={lt(locale, { en: 'The four obligatory acts (fard)', bn: 'অজুর চার ফরজ', ar: 'فرائض الوضوء الأربع' })}>
        <ol className="grid gap-3 sm:grid-cols-4">
          {fard.map((s, n) => (
            <li key={s.id} className="rounded-2xl border border-border bg-card p-4 text-center">
              <span className="mx-auto grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{bn ? bnNum(n + 1) : n + 1}</span>
              <p className="mt-2 text-sm font-semibold">{lt(locale, s.title)}</p>
            </li>
          ))}
        </ol>
        <FiqhNote locale={locale}>
          {lt(locale, {
            en: 'The Hanafi school counts these four as fard and treats the rest (intention, order, rinsing the mouth and nose and so on) as sunnah. Other schools also require the intention and the order of the steps, and some count rinsing the mouth and nose as obligatory. If you are unsure, follow the practice of your school and ask a scholar.',
            bn: 'হানাফী মাযহাবে এই চারটি ফরজ; বাকি (নিয়ত, ধারাবাহিকতা, কুলি, নাকে পানি দেওয়া ইত্যাদি) সুন্নত। অন্য মাযহাবে নিয়ত ও ধারাবাহিকতাও আবশ্যক এবং কারো মতে কুলি ও নাকে পানি দেওয়াও ফরজ। নিশ্চিত না হলে নিজের মাযহাবের আমল অনুসরণ করুন এবং আলেমকে জিজ্ঞাসা করুন।',
            ar: 'يعدّ الحنفية هذه الأربعة فرضًا وما سواها سنة، وعند غيرهم تشترط النية والترتيب، وبعضهم يوجب المضمضة والاستنشاق. فإن شككت فالزم مذهبك واسأل عالمًا.',
          })}
        </FiqhNote>
      </Section>

      <Section id="breakers" title={lt(locale, { en: 'What breaks wudu', bn: 'যে কারণে অজু ভেঙে যায়', ar: 'ما ينقض الوضوء' })}>
        <h3 className="mb-2 font-semibold">{lt(locale, { en: 'Agreed by the schools', bn: 'সব মাযহাবে স্বীকৃত', ar: 'متفق عليه' })}</h3>
        <ul className="space-y-2 text-[15px] leading-relaxed">
          {wuduBreakers.filter((b) => b.agreed).map((b, n) => <li key={n} className="flex gap-2"><span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />{lt(locale, b.text)}</li>)}
        </ul>
        <FiqhNote locale={locale} title={{ en: 'Where scholars differ', bn: 'যেখানে মতভেদ আছে', ar: 'مواضع الخلاف' }}>
          <ul className="space-y-2">
            {wuduBreakers.filter((b) => !b.agreed).map((b, n) => <li key={n} className="flex gap-2"><span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" />{lt(locale, b.text)}</li>)}
          </ul>
        </FiqhNote>
      </Section>

      <Section id="dua" title={lt(locale, { en: 'Dua after wudu', bn: 'অজুর পরের দোয়া', ar: 'الدعاء بعد الوضوء' })}>
        <article className="card-soft rounded-3xl p-5 sm:p-7">
          <p lang="ar" dir="rtl" className="quran-text text-center text-[clamp(1.4rem,4.5vw,2.1rem)] leading-[2.2] text-arabic">{dua.ar}</p>
          <p lang={bn ? 'bn' : undefined} className={`mt-3 text-center text-lg ${bn ? 'font-bangla' : ''}`}>{lt(locale, dua.meaning!)}</p>
          <p className="mt-3 text-center text-sm text-muted-foreground">{dua.source} · <Link href={h('/dua/dua-after-wudu')} className="font-semibold text-primary hover:underline">{lt(locale, { en: 'full dua page', bn: 'সম্পূর্ণ দোয়ার পাতা', ar: 'صفحة الدعاء كاملة' })}</Link></p>
        </article>
        <p className="mt-4 text-sm text-muted-foreground">
          <UiIcon name="mosque" size={18} className="me-1.5 align-text-bottom" />
          {lt(locale, { en: 'Now you are ready to pray: ', bn: 'এখন নামাজের জন্য প্রস্তুত: ', ar: 'أنت الآن مستعد للصلاة: ' })}
          <Link href={h('/learn/salah')} className="font-semibold text-primary hover:underline">{lt(locale, { en: 'learn how to pray', bn: 'নামাজ শিক্ষা', ar: 'تعلّم الصلاة' })}</Link>.
        </p>
      </Section>
    </GuideFrame>
  )
}
