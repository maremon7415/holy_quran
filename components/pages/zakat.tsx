import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { Faq } from '@/components/content/faq'
import { AyahCard } from '@/components/content/ayah-card'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { ZakatCalculator } from '@/components/places/zakat-calculator'
import { chipCls } from '@/components/places/city-ui'
import { buildMeta, howToLd } from '@/lib/content/seo'
import { lt } from '@/lib/i18n/lt'
import { localeHref, type Locale } from '@/lib/i18n/routes'
import { getVersesByRefs } from '@/lib/quran/data'
import { absoluteUrl } from '@/lib/site'
import { bnDigits } from '@/lib/places/dates'
import { GRAMS_PER_VORI, NISAB_GOLD_G, NISAB_SILVER_G } from '@/lib/zakat/calc'

const copy = {
  en: {
    title: 'Zakat Calculator Bangladesh — Nisab, Gold & Silver (Vori) 2.5% | যাকাত ক্যালকুলেটর',
    description: 'Free zakat calculator: add cash, bank, gold and silver (grams or vori), business goods, receivables and investments, subtract debts, compare with the gold or silver nisab and see your 2.5% zakat. With Quran references. যাকাত হিসাব করুন।',
    keywords: ['zakat calculator', 'zakat calculator bangladesh', 'nisab', 'zakat on gold', 'zakat on gold vori', 'zakat nisab silver', 'যাকাত ক্যালকুলেটর', 'যাকাতের হিসাব', 'যাকাতের নিসাব', 'সোনার যাকাত ভরি'],
  },
  bn: {
    title: 'যাকাত ক্যালকুলেটর — নিসাব, সোনা-রুপা (ভরি) ও ২.৫% যাকাতের হিসাব | Zakat Calculator Bangladesh',
    description: 'নগদ, ব্যাংক, সোনা-রুপা (গ্রাম বা ভরি), ব্যবসার পণ্য, পাওনা ও বিনিয়োগ যোগ করুন, দেনা বাদ দিন, সোনা বা রুপার নিসাবের সাথে মিলিয়ে ২.৫% যাকাতের হিসাব দেখুন। কুরআনের আয়াতসহ বিনামূল্যে যাকাত ক্যালকুলেটর।',
    keywords: ['যাকাত ক্যালকুলেটর', 'যাকাতের হিসাব', 'যাকাতের নিসাব কত', 'সোনার যাকাত কত ভরি', 'রুপার নিসাব', 'zakat calculator bangladesh', 'নিসাব পরিমাণ'],
  },
}

export const zakatMeta = (locale: Locale): Metadata => buildMeta({ ...copy[locale], path: '/zakat-calculator', locale })

export async function ZakatPage({ locale }: { locale: Locale }) {
  const bn = locale === 'bn'
  const verses = await getVersesByRefs(['9:60', '2:43', '2:267'])
  const path = localeHref(locale, '/zakat-calculator')
  const goldVori = (NISAB_GOLD_G / GRAMS_PER_VORI).toFixed(2)
  const silverVori = (NISAB_SILVER_G / GRAMS_PER_VORI).toFixed(2)
  const n = (v: string | number) => (bn ? bnDigits(v) : String(v))
  const faqs = bn
    ? [
        { q: 'যাকাতের নিসাব কত?', a: `ক্লাসিক্যাল পরিমাণ অনুযায়ী সোনার নিসাব ${n(NISAB_GOLD_G)} গ্রাম (প্রায় ${n(goldVori)} ভরি) এবং রুপার নিসাব ${n(NISAB_SILVER_G)} গ্রাম (প্রায় ${n(silverVori)} ভরি)। কোনটির ভিত্তিতে নিসাব ধরা হবে — এ নিয়ে আলেমদের মতভেদ আছে; এই ক্যালকুলেটরে দুটির যেকোনোটি বেছে নেওয়া যায়।` },
        { q: 'যাকাতের হার কত?', a: 'যাকাতযোগ্য নিট সম্পদের ২.৫% (৪০ ভাগের ১ ভাগ), যখন সম্পদ নিসাব পরিমাণ হয় এবং তার উপর এক চান্দ্র বছর অতিবাহিত হয়।' },
        { q: '১ ভরি সোনা কত গ্রাম?', a: `১ ভরি (তোলা) = ${n(GRAMS_PER_VORI)} গ্রাম।` },
        { q: 'দেনা থাকলে যাকাত কীভাবে হিসাব হবে?', a: 'সাধারণত এখনই পরিশোধযোগ্য দেনা সম্পদ থেকে বাদ দিয়ে নিট সম্পদ হিসাব করা হয়। দীর্ঘমেয়াদি ঋণ (যেমন বাড়ির কিস্তি) কীভাবে ধরা হবে, সে বিষয়ে আলেমদের মতভেদ আছে — নির্ভরযোগ্য আলেমের পরামর্শ নিন।' },
        { q: 'স্বর্ণালঙ্কারের উপর কি যাকাত আছে?', a: 'এ বিষয়ে আলেমদের একাধিক মত আছে (ব্যবহৃত অলঙ্কারে যাকাত ফরজ কি না)। এই ক্যালকুলেটর সোনার ওজন সম্পদে যোগ করে; আপনার ক্ষেত্রে কী প্রযোজ্য তা আপনার আলেমের কাছ থেকে জেনে নিন।' },
      ]
    : [
        { q: 'What is the nisab for zakat?', a: `By the classical weights, the gold nisab is ${NISAB_GOLD_G} g (about ${goldVori} vori) and the silver nisab is ${NISAB_SILVER_G} g (about ${silverVori} vori). Scholars differ on whether to use gold or silver as the benchmark for money; this calculator lets you choose either.` },
        { q: 'What is the zakat rate?', a: '2.5% (one-fortieth) of net zakatable wealth, once it reaches the nisab and a lunar year (hawl) has passed over it.' },
        { q: 'How many grams is one vori of gold?', a: `1 vori (tola) = ${GRAMS_PER_VORI} g.` },
        { q: 'How are debts treated?', a: 'Debts that are due now are generally deducted from your assets before comparing with the nisab. How long-term loans (for example a mortgage) are treated is a point of scholarly difference — ask a trusted scholar.' },
        { q: 'Is zakat due on gold jewellery?', a: 'Scholars hold different views on jewellery that is regularly worn. The calculator adds the weight of gold you enter; ask your local scholar what applies to you.' },
      ]

  return (
    <div className={pageShell}>
      <JsonLd data={[
        { '@context': 'https://schema.org', '@type': 'WebApplication', name: bn ? 'যাকাত ক্যালকুলেটর' : 'Zakat Calculator', url: absoluteUrl(path), applicationCategory: 'FinanceApplication', operatingSystem: 'Any', inLanguage: locale, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
        howToLd({ name: bn ? 'কীভাবে যাকাত হিসাব করবেন' : 'How to calculate zakat', description: copy[locale].description, path, inLanguage: locale, steps: bn
          ? [{ name: 'সম্পদ যোগ করুন', text: 'নগদ, ব্যাংক, সোনা-রুপা, ব্যবসার পণ্য, পাওনা ও বিনিয়োগ যোগ করুন।' }, { name: 'দেনা বাদ দিন', text: 'এখনই পরিশোধযোগ্য দেনা বাদ দিন।' }, { name: 'নিসাবের সাথে মেলান', text: 'নিট সম্পদ সোনা বা রুপার নিসাবের সমান বা বেশি হলে যাকাত প্রযোজ্য।' }, { name: '২.৫% দিন', text: 'নিট সম্পদের ২.৫% যাকাত।' }]
          : [{ name: 'Add your assets', text: 'Cash, bank balances, gold and silver, business goods, receivables and investments.' }, { name: 'Subtract debts', text: 'Deduct debts that are due now.' }, { name: 'Compare with the nisab', text: 'If net wealth is at least the gold or silver nisab, zakat applies.' }, { name: 'Pay 2.5%', text: 'Zakat is 2.5% of the net wealth.' }] }),
      ]} />
      <Breadcrumbs locale={locale} items={[{ name: bn ? 'যাকাত ক্যালকুলেটর' : 'Zakat Calculator', ar: 'حاسبة الزكاة', href: '/zakat-calculator' }]} className="mb-4" />
      <PageHero
        eyebrow={lt(locale, { en: 'Free · private · runs on your device', bn: 'বিনামূল্যে · গোপনীয় · আপনার ডিভাইসেই চলে', ar: 'مجاني وخاص' })}
        icon="hands"
        title={bn ? <>যাকাত ক্যালকুলেটর</> : <>Zakat Calculator</>}
        subtitle={lt(locale, { en: `Work out your zakat in minutes: gold and silver by gram or vori, a nisab based on gold (${NISAB_GOLD_G} g) or silver (${NISAB_SILVER_G} g), and 2.5% of your net wealth.`, bn: `কয়েক মিনিটেই যাকাত হিসাব করুন: গ্রাম বা ভরিতে সোনা-রুপা, সোনার (${n(NISAB_GOLD_G)} গ্রাম) বা রুপার (${n(NISAB_SILVER_G)} গ্রাম) নিসাব এবং নিট সম্পদের ২.৫%।`, ar: 'احسب زكاتك: النصاب بالذهب أو الفضة و٢٫٥٪ من صافي المال.' })}
        arabic="الزَّكَاة"
      />
      <div className="mt-8"><ZakatCalculator defaultCurrency={bn ? 'BDT' : 'USD'} /></div>

      <section className="mt-6 rounded-3xl border border-border bg-card p-5 text-sm" aria-labelledby="price-h">
        <h2 id="price-h" className="font-display text-lg font-semibold">{lt(locale, { en: 'Where to find today’s gold and silver price', bn: 'আজকের সোনা-রুপার দাম কোথায় পাবেন', ar: 'أين تجد سعر الذهب والفضة' })}</h2>
        <p className="mt-2 text-muted-foreground">{lt(locale, {
          en: 'We do not fetch prices from the internet. In Bangladesh, the Bangladesh Jewellers Association (BAJUS) publishes the official daily gold and silver price per vori; elsewhere use your national bank, a local jeweller or a bullion price site, then divide a per-vori or per-ounce price into a price per gram.',
          bn: 'আমরা ইন্টারনেট থেকে স্বয়ংক্রিয়ভাবে দাম আনি না। বাংলাদেশে বাংলাদেশ জুয়েলার্স অ্যাসোসিয়েশন (বাজুস) প্রতিদিন ভরিপ্রতি সোনা-রুপার দাম প্রকাশ করে; অন্য দেশে কেন্দ্রীয় ব্যাংক, স্থানীয় জুয়েলার্স বা বুলিয়ন সাইট দেখুন। ভরি বা আউন্সপ্রতি দামকে গ্রামে ভাগ করে নিন।',
          ar: 'لا نجلب الأسعار تلقائيًا؛ ارجع إلى مصدر محلي موثوق.',
        })}</p>
        <a href="https://www.bajus.org/" target="_blank" rel="noopener noreferrer nofollow" className={`${chipCls} mt-3`}>{lt(locale, { en: 'BAJUS — Bangladesh Jewellers Association ↗', bn: 'বাজুস — বাংলাদেশ জুয়েলার্স অ্যাসোসিয়েশন ↗', ar: 'BAJUS ↗' })}</a>
      </section>

      <section className="mt-12" aria-labelledby="how-h">
        <h2 id="how-h" className="font-display mb-4 text-2xl font-semibold">{lt(locale, { en: 'How zakat is calculated', bn: 'যাকাত কীভাবে হিসাব হয়', ar: 'كيف تُحسب الزكاة' })}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { h: { en: 'Nisab', bn: 'নিসাব', ar: 'النصاب' }, b: { en: `The minimum wealth at which zakat becomes due: ${NISAB_GOLD_G} g of gold (≈ ${goldVori} vori) or ${NISAB_SILVER_G} g of silver (≈ ${silverVori} vori). Because silver is much cheaper, its nisab is a much lower amount of money; scholars and institutions differ on which to use for cash and savings.`, bn: `যে ন্যূনতম সম্পদে যাকাত ফরজ হয়: ${n(NISAB_GOLD_G)} গ্রাম সোনা (≈ ${n(goldVori)} ভরি) অথবা ${n(NISAB_SILVER_G)} গ্রাম রুপা (≈ ${n(silverVori)} ভরি)। রুপার দাম অনেক কম হওয়ায় এর নিসাব টাকার অঙ্কে অনেক কম; নগদ ও সঞ্চয়ের ক্ষেত্রে কোনটি ধরা হবে তা নিয়ে আলেম ও প্রতিষ্ঠানের মতভেদ আছে।`, ar: '' } },
            { h: { en: 'Hawl — one lunar year', bn: 'হাওল — এক চান্দ্র বছর', ar: 'الحول' }, b: { en: 'Zakat is due on wealth that has stayed at or above the nisab for a full lunar (Hijri) year. Many people choose a fixed date each year, such as 1 Ramadan.', bn: 'নিসাব পরিমাণ সম্পদ পূর্ণ এক চান্দ্র (হিজরি) বছর থাকলে যাকাত ফরজ হয়। অনেকে প্রতি বছর একটি নির্দিষ্ট তারিখ (যেমন ১ রমজান) ঠিক করে নেন।', ar: '' } },
            { h: { en: 'Which assets count', bn: 'কোন সম্পদ ধরা হয়', ar: 'الأموال الزكوية' }, b: { en: 'Cash and bank balances, gold and silver, trade goods at market value, money owed to you that you expect back, and investments held for gain. Your home, car and tools for personal use are generally not counted.', bn: 'নগদ ও ব্যাংকের টাকা, সোনা-রুপা, বাজারমূল্যে ব্যবসার পণ্য, ফেরত পাওয়ার আশা আছে এমন পাওনা এবং মুনাফার উদ্দেশ্যে রাখা বিনিয়োগ। বসবাসের বাড়ি, ব্যক্তিগত গাড়ি ও ব্যবহারের সরঞ্জাম সাধারণত ধরা হয় না।', ar: '' } },
            { h: { en: 'Rate: 2.5%', bn: 'হার: ২.৫%', ar: 'المقدار ٢٫٥٪' }, b: { en: 'Zakat is one-fortieth (2.5%) of the net wealth — assets minus debts that are due. Different rules apply to agricultural produce and livestock.', bn: 'যাকাত নিট সম্পদের ৪০ ভাগের ১ ভাগ (২.৫%) — সম্পদ থেকে প্রদেয় দেনা বাদ দিয়ে। কৃষিপণ্য ও গবাদিপশুর জন্য আলাদা নিয়ম আছে।', ar: '' } },
          ].map((c) => (
            <article key={c.h.en} className="card-soft rounded-3xl p-5">
              <h3 className="font-semibold">{lt(locale, c.h)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{bn ? c.b.bn : c.b.en}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="q-h">
        <h2 id="q-h" className="font-display mb-4 text-2xl font-semibold">{lt(locale, { en: 'Zakat in the Quran', bn: 'কুরআনে যাকাত', ar: 'الزكاة في القرآن' })}</h2>
        <div className="space-y-4">{verses.map((v, i) => <AyahCard key={v.k} verse={v} index={i} locale={locale} />)}</div>
        <p className="mt-4 text-sm text-muted-foreground">{lt(locale, { en: 'Ayah 9:60 names the categories who may receive zakat: the poor, the needy, those employed to collect it, those whose hearts are to be reconciled, freeing captives, those in debt, in the cause of Allah, and the wayfarer.', bn: 'সূরা তাওবার ৬০ নম্বর আয়াতে যাকাত গ্রহণের হকদারদের কথা এসেছে: ফকির, মিসকিন, যাকাত আদায়কারী, যাদের অন্তর আকৃষ্ট করা প্রয়োজন, দাসমুক্তি, ঋণগ্রস্ত, আল্লাহর পথে এবং মুসাফির।', ar: 'تذكر الآية ٩:٦٠ مصارف الزكاة الثمانية.' })}</p>
      </section>

      <section className="mt-10 rounded-3xl border border-gold/40 bg-gold-soft/40 p-5 text-sm leading-relaxed" role="note">
        <h2 className="font-display mb-1 text-lg font-semibold">{lt(locale, { en: 'A note on scholarly differences', bn: 'আলেমদের মতভেদ প্রসঙ্গে', ar: 'ملاحظة' })}</h2>
        <p className="text-muted-foreground">{lt(locale, {
          en: 'This tool performs arithmetic on the numbers you enter; it does not issue rulings. Scholars and schools differ on the nisab benchmark, jewellery, long-term debts, pensions, shares and more. For your specific case, consult a trusted local scholar or a zakat institution.',
          bn: 'এই টুল আপনার দেওয়া সংখ্যার উপর শুধু হিসাব করে; কোনো ফতোয়া দেয় না। নিসাবের ভিত্তি, অলঙ্কার, দীর্ঘমেয়াদি ঋণ, পেনশন, শেয়ার ইত্যাদি বিষয়ে আলেম ও মাযহাবের মতভেদ আছে। আপনার নির্দিষ্ট ক্ষেত্রে নির্ভরযোগ্য স্থানীয় আলেম বা যাকাত প্রতিষ্ঠানের পরামর্শ নিন।',
          ar: 'هذه الأداة حسابية فقط ولا تصدر فتاوى؛ استفت أهل العلم في حالتك.',
        })}</p>
      </section>

      <Faq faqs={faqs} locale={locale} />
      <p className="mt-8 text-sm"><Link href={localeHref(locale, '/ramadan')} className="font-medium text-primary hover:underline">{lt(locale, { en: 'Ramadan timetable →', bn: 'রমজানের সময়সূচি →', ar: 'جدول رمضان ←' })}</Link></p>
    </div>
  )
}
