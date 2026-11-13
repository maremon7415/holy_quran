import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { JsonLd } from '@/components/seo/json-ld'
import { PageHero, pageShell } from '@/components/content/page-hero'
import { Reveal } from '@/components/content/reveal'
import { UiIcon } from '@/components/ui-icon'
import { buildMeta, publisherLd } from '@/lib/content/seo'
import { site, absoluteUrl } from '@/lib/site'
import { lt } from '@/lib/i18n/lt'

export const metadata: Metadata = buildMeta({
  title: 'About Noor Quran: Features, Sources & Privacy | নূর কুরআন সম্পর্কে',
  description: 'What Noor Quran is, what it offers, where the Quran text, translations and audio come from, how your data is handled, and how to contribute to the open-source project.',
  path: '/about',
  keywords: ['about Noor Quran', 'Quran app sources', 'Quran translation authors', 'নূর কুরআন'],
})

type L3 = { en: string; bn: string; ar: string }
const features: { icon: string; title: L3; text: L3; href: string }[] = [
  { icon: 'quran', title: { en: 'Read', bn: 'পড়ুন', ar: 'اقرأ' }, text: { en: 'The full Quran in Uthmani script with Saheeh International, Abdel Haleem and Bangla (Taisirul Quran) translations, word-by-word meaning, tajweed colours and tafsir.', bn: 'সম্পূর্ণ কুরআন উসমানী লিপিতে—সহীহ ইন্টারন্যাশনাল, আবদেল হালিম ও বাংলা (তাইসিরুল কুরআন) অনুবাদ, শব্দে শব্দে অর্থ, তাজবীদের রং ও তাফসীরসহ।', ar: 'القرآن الكريم كاملًا بالرسم العثماني مع ترجمات صحيح إنترناشيونال وعبد الحليم والترجمة البنغالية (تيسير القرآن)، ومعنى كل كلمة وألوان التجويد والتفسير.' }, href: '/quran' },
  { icon: 'listen', title: { en: 'Listen', bn: 'শুনুন', ar: 'استمع' }, text: { en: 'Recitations by many reciters with ayah-by-ayah audio and word-synced highlighting.', bn: 'অনেক ক্বারীর তিলাওয়াত, আয়াতভিত্তিক অডিও ও শব্দ অনুযায়ী হাইলাইটসহ।', ar: 'تلاوات بأصوات قرّاء كثيرين، آية بآية مع تمييز الكلمات أثناء التلاوة.' }, href: '/listen' },
  { icon: 'hifz', title: { en: 'Memorise', bn: 'মুখস্থ করুন', ar: 'احفظ' }, text: { en: 'A hifz studio with repetition and review to help you memorise at your own pace.', bn: 'পুনরাবৃত্তি ও রিভিউয়ের মাধ্যমে নিজের গতিতে মুখস্থ করার হিফজ স্টুডিও।', ar: 'استوديو حفظ يعتمد على التكرار والمراجعة لتحفظ بالسرعة التي تناسبك.' }, href: '/hifz' },
  { icon: 'topics', title: { en: 'Topics', bn: 'বিষয়', ar: 'المواضيع' }, text: { en: 'Verses grouped by feeling, character, family, faith and society, so you can find what the Quran says about what is on your mind.', bn: 'অনুভূতি, চরিত্র, পরিবার, ঈমান ও সমাজ অনুযায়ী সাজানো আয়াত—মনে যা ঘুরছে সে বিষয়ে কুরআন কী বলে তা খুঁজে নিন।', ar: 'آيات مرتّبة حسب المشاعر والأخلاق والأسرة والإيمان والمجتمع لتجد ما يقوله القرآن عمّا يشغل بالك.' }, href: '/topics' },
  { icon: 'dua', title: { en: 'Duas', bn: 'দোয়া', ar: 'الأدعية' }, text: { en: 'Authentic duas from the Quran and Sunnah with Arabic, transliteration, meaning and source.', bn: 'কুরআন ও সুন্নাহর প্রামাণ্য দোয়া—আরবি, উচ্চারণ, অর্থ ও উৎসসহ।', ar: 'أدعية صحيحة من القرآن والسنة بالنص العربي والنطق ومعناها ومصدرها.' }, href: '/dua' },
  { icon: 'names', title: { en: '99 Names of Allah', bn: 'আল্লাহর ৯৯ নাম', ar: 'أسماء الله الحسنى' }, text: { en: 'Each Beautiful Name with meaning, explanation, a Quran reference, flashcards and a quiz.', bn: 'প্রতিটি সুন্দর নাম অর্থ, ব্যাখ্যা ও কুরআনের রেফারেন্সসহ, সঙ্গে ফ্ল্যাশকার্ড ও কুইজ।', ar: 'كل اسم من الأسماء الحسنى بمعناه وشرحه ومرجعه في القرآن، مع بطاقات تعليمية واختبار.' }, href: '/names-of-allah' },
  { icon: 'prayer', title: { en: 'Prayer times & Qibla', bn: 'নামাজের সময় ও কিবলা', ar: 'مواقيت الصلاة والقبلة' }, text: { en: 'Prayer times for your location, a Qibla compass and a Hijri calendar.', bn: 'আপনার অবস্থান অনুযায়ী নামাজের সময়, কিবলা কম্পাস ও হিজরি ক্যালেন্ডার।', ar: 'مواقيت الصلاة حسب موقعك وبوصلة القبلة والتقويم الهجري.' }, href: '/prayer-times' },
  { icon: 'journey', title: { en: 'Khatam journey', bn: 'খতম যাত্রা', ar: 'رحلة الختم' }, text: { en: 'A planner and streak tracker to help you complete the Quran.', bn: 'কুরআন খতম করতে সহায়ক পরিকল্পনা ও ধারাবাহিকতা ট্র্যাকার।', ar: 'مخطِّط ومتتبّع للمواظبة يعينك على ختم القرآن.' }, href: '/journey' },
]

const credits: { name: string; role: L3; href?: string }[] = [
  { name: 'Quran.com / Quran Foundation API', role: { en: 'Quran text in Uthmani and simple script, chapter information, word-by-word data, tajweed text, tafsir, audio timing data and the translations below.', bn: 'কুরআনের উসমানী ও সরল লিপির টেক্সট, সূরার তথ্য, শব্দে শব্দে ডেটা, তাজবীদ টেক্সট, তাফসীর, অডিও টাইমিং ডেটা ও নিচের অনুবাদগুলো।', ar: 'نص القرآن بالرسم العثماني والإملائي، ومعلومات السور، وبيانات الكلمات، ونص التجويد، والتفسير، وبيانات توقيت الصوت، والترجمات المذكورة أدناه.' }, href: 'https://quran.com' },
  { name: 'Saheeh International', role: { en: 'English translation of the meanings of the Quran.', bn: 'কুরআনের অর্থের ইংরেজি অনুবাদ।', ar: 'ترجمة معاني القرآن إلى الإنجليزية.' } },
  { name: 'M.A.S. Abdel Haleem', role: { en: 'English translation, The Qur’an (Oxford World’s Classics).', bn: 'ইংরেজি অনুবাদ, The Qur’an (Oxford World’s Classics)।', ar: 'ترجمة إنجليزية، The Qur’an (Oxford World’s Classics).' } },
  { name: 'Taisirul Quran (তাইসিরুল কুরআন)', role: { en: 'Bangla translation.', bn: 'বাংলা অনুবাদ।', ar: 'الترجمة البنغالية.' } },
  { name: 'Tanzil Project', role: { en: 'The English transliteration originates from the Tanzil Project’s Quran data.', bn: 'ইংরেজি প্রতিবর্ণীকরণ তানযীল প্রজেক্টের কুরআন ডেটা থেকে নেওয়া।', ar: 'التحويل الحرفي اللاتيني مأخوذ من بيانات مشروع تنزيل.' }, href: 'https://tanzil.net' },
  { name: 'EveryAyah', role: { en: 'Per-ayah recitation audio files.', bn: 'আয়াতভিত্তিক তিলাওয়াতের অডিও ফাইল।', ar: 'ملفات التلاوة الصوتية آية بآية.' }, href: 'https://everyayah.com' },
]

export default function AboutPage() {
  return (
    <div className={pageShell}>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'AboutPage', name: 'About Noor Quran', url: absoluteUrl('/about'), mainEntity: { ...publisherLd, description: site.description, sameAs: [site.github] } }} />
      <Breadcrumbs items={[{ name: 'About', ar: 'عن الموقع', href: '/about' }]} className="mb-4" />
      <PageHero eyebrow={lt(undefined, { en: 'About', bn: 'পরিচিতি', ar: 'عن الموقع' })} icon="info" arabic="نُور" title={lt(undefined, { en: 'Noor Quran', bn: 'নূর কুরআন', ar: 'نور القرآن' })} subtitle={lt(undefined, { en: `${site.tagline}.`, bn: `${site.taglineBn}।`, ar: 'اقرأ القرآن الكريم واستمع إليه وافهمه واحفظه.' })}>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{lt(undefined, { en: 'Noor is a free, ad-free and open-source Quran companion built to make the Quran easy to read, listen to, understand and memorise in Arabic, English and Bangla.', bn: 'নূর একটি বিনামূল্যের, বিজ্ঞাপনমুক্ত ও ওপেন সোর্স কুরআন সঙ্গী, যা আরবি, ইংরেজি ও বাংলায় কুরআন পড়া, শোনা, বোঝা ও মুখস্থ করা সহজ করে।', ar: 'نور رفيق مجاني خالٍ من الإعلانات ومفتوح المصدر، صُمّم ليسهّل قراءة القرآن والاستماع إليه وفهمه وحفظه بالعربية والإنجليزية والبنغالية.' })}</p>
      </PageHero>

      <section className="mt-12" aria-labelledby="features-h">
        <h2 id="features-h" className="font-display mb-5 text-2xl font-semibold">{lt(undefined, { en: 'What you can do', bn: 'আপনি যা করতে পারবেন', ar: 'ماذا يمكنك أن تفعل' })}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {features.map((f, i) => (
            <li key={f.title.en}><Reveal delay={Math.min(i, 5) * 0.04} className="h-full">
              <Link href={f.href} className="card-soft lift flex h-full gap-4 rounded-3xl p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent"><UiIcon name={f.icon} size={28} /></span>
                <span><span className="block font-semibold">{lt(undefined, f.title)}</span><span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{lt(undefined, f.text)}</span></span>
              </Link>
            </Reveal></li>
          ))}
        </ul>
      </section>

      <section className="mt-12" aria-labelledby="sources-h">
        <h2 id="sources-h" className="font-display mb-2 text-2xl font-semibold">{lt(undefined, { en: 'Data sources & credits', bn: 'তথ্যসূত্র ও কৃতজ্ঞতা', ar: 'مصادر البيانات والشكر' })}</h2>
        <p className="mb-5 text-sm text-muted-foreground">{lt(undefined, { en: 'The Quran text and translations are stored in this project as a static corpus generated from open data, so every verse you see on Noor, including those on topic, dua and name pages, comes from the same checked source. Credit and thanks to everyone below.', bn: 'কুরআনের টেক্সট ও অনুবাদ এই প্রকল্পে উন্মুক্ত ডেটা থেকে তৈরি স্থির সংগ্রহ হিসেবে রাখা আছে, তাই বিষয়, দোয়া ও নামের পাতাসহ নূরে আপনি যে আয়াতই দেখুন তা একই যাচাইকৃত উৎস থেকে আসে। নিচের সবার প্রতি কৃতজ্ঞতা।', ar: 'نص القرآن وترجماته محفوظان في هذا المشروع كمدوّنة ثابتة مولَّدة من بيانات مفتوحة، لذا فكل آية تراها في نور، بما فيها آيات صفحات المواضيع والأدعية والأسماء، مصدرها واحد مدقَّق. الشكر والتقدير لكل من ذُكر أدناه.' })}</p>
        <dl className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {credits.map((c) => (
            <div key={c.name} className="grid gap-1 px-5 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
              <dt className="font-semibold">{c.href ? <a href={c.href} rel="noopener" className="text-primary hover:underline">{c.name}</a> : c.name}</dt>
              <dd className="text-sm leading-relaxed text-muted-foreground">{lt(undefined, c.role)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{lt(undefined, { en: 'Duas and hadith references are cited by collection (for example Sahih al-Bukhari or Sahih Muslim) next to each dua. Short explanations on topic and name pages are original editorial summaries, not fatwas or tafsir; please refer to qualified scholars for rulings.', bn: 'প্রতিটি দোয়ার পাশে হাদীসের সংকলন (যেমন সহীহ বুখারী বা সহীহ মুসলিম) উল্লেখ করা আছে। বিষয়ভিত্তিক ও আসমাউল হুসনা পাতার সংক্ষিপ্ত ব্যাখ্যাগুলো সম্পাদকীয় সারসংক্ষেপ, ফতোয়া বা তাফসীর নয়। বিধানগত বিষয়ে যোগ্য আলেমের শরণাপন্ন হোন।', ar: 'تُنسب الأدعية والأحاديث إلى مصادرها (مثل صحيح البخاري أو صحيح مسلم) بجوار كل دعاء. أما الشروح القصيرة في صفحات المواضيع والأسماء فهي ملخصات تحريرية أصلية وليست فتاوى ولا تفسيرًا؛ فيُرجى الرجوع إلى أهل العلم في الأحكام.' })}</p>
      </section>

      <section className="mt-12" aria-labelledby="privacy-h">
        <h2 id="privacy-h" className="font-display mb-3 text-2xl font-semibold">{lt(undefined, { en: 'Privacy', bn: 'গোপনীয়তা', ar: 'الخصوصية' })}</h2>
        <div className="card-soft space-y-3 rounded-3xl p-6 text-sm leading-relaxed">
          <p>{lt(undefined, { en: 'Noor does not show ads and does not sell or share personal data. Your bookmarks, reading progress, notes, settings and hifz progress are stored locally in your browser (on your device), not on our servers.', bn: 'নূরে কোনো বিজ্ঞাপন নেই এবং ব্যক্তিগত তথ্য বিক্রি বা শেয়ার করা হয় না। আপনার বুকমার্ক, পড়ার অগ্রগতি, নোট, সেটিংস ও হিফজ অগ্রগতি আপনার ডিভাইসের ব্রাউজারেই সংরক্ষিত থাকে, আমাদের সার্ভারে নয়।', ar: 'لا يعرض نور إعلانات ولا يبيع بياناتك الشخصية ولا يشاركها. تُحفظ علاماتك وتقدّمك في القراءة وملاحظاتك وإعداداتك وتقدّمك في الحفظ محليًا في متصفحك (على جهازك) لا على خوادمنا.' })}</p>
          <p>{lt(undefined, { en: 'The site uses Vercel Analytics for anonymous, aggregate page-view statistics, and no other tracking. If you choose to use prayer times or Qibla, your location is used in your browser to calculate them and is sent only to the prayer-time service to fetch times for that place.', bn: 'সাইটটি নামহীন, সামষ্টিক পেজ-ভিউ পরিসংখ্যানের জন্য Vercel Analytics ব্যবহার করে, অন্য কোনো ট্র্যাকিং নেই। নামাজের সময় বা কিবলা ব্যবহার করলে আপনার অবস্থান ব্রাউজারেই হিসাবে ব্যবহৃত হয় এবং ওই স্থানের সময় আনতে কেবল নামাজের সময়ের সেবায় পাঠানো হয়।', ar: 'يستخدم الموقع Vercel Analytics لإحصاءات مجهولة ومجمّعة لعدد مشاهدات الصفحات، ولا يستخدم أي تتبّع آخر. وإذا استخدمت مواقيت الصلاة أو القبلة فإن موقعك يُستعمل في متصفحك للحساب ولا يُرسل إلا إلى خدمة المواقيت لجلب أوقات ذلك المكان.' })}</p>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="oss-h">
        <h2 id="oss-h" className="font-display mb-3 text-2xl font-semibold">{lt(undefined, { en: 'Open source', bn: 'ওপেন সোর্স', ar: 'مفتوح المصدر' })}</h2>
        <div className="card-soft flex flex-col items-start gap-3 rounded-3xl p-6 text-sm leading-relaxed">
          <p>{lt(undefined, { en: 'Noor is open source. If you spot a mistake in a translation, a dua or a reference, or want to contribute code, please open an issue or pull request. Accuracy of the Quran text matters more than anything else here.', bn: 'নূর ওপেন সোর্স। অনুবাদ, দোয়া বা রেফারেন্সে ভুল চোখে পড়লে বা কোডে অবদান রাখতে চাইলে অনুগ্রহ করে ইস্যু বা পুল রিকোয়েস্ট খুলুন। এখানে কুরআনের টেক্সটের নির্ভুলতাই সবচেয়ে গুরুত্বপূর্ণ।', ar: 'نور مشروع مفتوح المصدر. إن لاحظت خطأً في ترجمة أو دعاء أو مرجع، أو أردت المساهمة برمجيًا، فيُرجى فتح بلاغ أو طلب دمج. دقّة نص القرآن أهم عندنا من كل شيء.' })}</p>
          <a href={site.github} rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition active:scale-95">{lt(undefined, { en: 'View on GitHub', bn: 'GitHub-এ দেখুন', ar: 'عرض على GitHub' })}</a>
        </div>
      </section>
    </div>
  )
}
