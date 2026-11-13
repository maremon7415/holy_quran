import type { L } from './types'

/**
 * Tajweed rules for /learn/tajweed/{rule}. Definitions, letters and pronunciation notes are hand-written (en + bn);
 * every Quran example is generated from the Quran.com tajweed markup by `scripts/build-tajweed-examples.mjs`
 * into `data/learn/tajweed-examples.json` (never hand-typed).
 */
export type TajweedGroup = 'noon' | 'meem' | 'sound' | 'madd' | 'letters' | 'stopping'

export interface TajweedRule {
  slug: string
  group: TajweedGroup
  name: L
  /** Arabic name, shown large on the page */
  ar: string
  /** Legend colour class (see tajweedLegend / globals.css) used for the swatch; synthetic classes are styled in components/learn/learn.css */
  cls: string
  /** One-sentence answer (also the meta description seed and the FAQ lead) */
  summary: L
  definition: L
  /** Arabic letters / signs the rule is about */
  letters?: { ar: string[]; note: L }
  how: L[]
  mistakes: L[]
  faqs: { q: L; a: L }[]
  related: string[]
  /** heading for each example group when a rule has more than one (ids as in tajweed-examples.json) */
  groups?: Record<string, L>
}

export const tajweedGroups: Record<TajweedGroup, { title: L; blurb: L }> = {
  noon: {
    title: { en: 'Noon sakinah & tanween', bn: 'নুন সাকিন ও তানবীন', ar: 'أحكام النون الساكنة والتنوين' },
    blurb: { en: 'Five rules that depend on the letter after a noon with sukun (نْ) or tanween (ً ٌ ٍ).', bn: 'নুন সাকিন (نْ) বা তানবীনের (ً ٌ ٍ) পরের হরফ অনুযায়ী পাঁচটি নিয়ম।' },
  },
  meem: {
    title: { en: 'Meem sakinah', bn: 'মীম সাকিন', ar: 'أحكام الميم الساكنة' },
    blurb: { en: 'Three rules for a meem with sukun (مْ).', bn: 'মীম সাকিনের (مْ) তিনটি নিয়ম।' },
  },
  sound: {
    title: { en: 'Qalqalah & ghunnah', bn: 'কলকলা ও গুন্নাহ', ar: 'القلقلة والغنّة' },
    blurb: { en: 'Two qualities of sound: the echo and the nasal hum.', bn: 'শব্দের দুটি বৈশিষ্ট্য: প্রতিধ্বনি ও নাকের সুর।' },
  },
  madd: {
    title: { en: 'Madd (prolongation)', bn: 'মাদ্দ (দীর্ঘ করে পড়া)', ar: 'أحكام المدّ' },
    blurb: { en: 'Stretching a long vowel for a set number of counts (harakat).', bn: 'দীর্ঘ স্বরকে নির্দিষ্ট মাত্রা (হরকত) পর্যন্ত টেনে পড়া।' },
  },
  letters: {
    title: { en: 'Letters & hamzatul wasl', bn: 'হরফ ও হামযাতুল ওয়াসল', ar: 'أحكام الحروف' },
    blurb: { en: 'How the definite article lam, the connecting hamza and heavy/light letters behave.', bn: 'আলিফ-লাম, সংযোগকারী হামযা এবং মোটা/চিকন হরফের নিয়ম।' },
  },
  stopping: {
    title: { en: 'Stopping & starting (waqf)', bn: 'থামা ও শুরু করা (ওয়াকফ)', ar: 'الوقف والابتداء' },
    blurb: { en: 'The small signs in the mushaf that tell you where to pause.', bn: 'মুসহাফে ছোট চিহ্নগুলো কোথায় থামতে হবে তা বলে দেয়।' },
  },
}

export const tajweedRules: TajweedRule[] = [
  {
    slug: 'izhar', group: 'noon', ar: 'إِظْهَار', cls: 'izhar',
    name: { en: 'Izhar (clear pronunciation)', bn: 'ইযহার (স্পষ্ট করে পড়া)', ar: 'الإظهار' },
    summary: { en: 'Izhar means pronouncing noon sakinah or tanween clearly, with no merging and no extra nasal sound, when one of the six throat letters ء ه ع ح غ خ follows.', bn: 'নুন সাকিন বা তানবীনের পরে কণ্ঠনালির ছয় হরফ (ء ه ع ح غ خ) এলে নুনের আওয়াজ স্পষ্ট করে পড়াকে ইযহার বলে; কোনো মিশ্রণ বা বাড়তি গুন্নাহ হয় না।' },
    definition: { en: 'Izhar halqi (“throat izhar”) applies when noon sakinah or tanween meets a letter that is pronounced from the throat. Because the noon is made in the tongue and the throat letters come from far back, the two sounds are easy to keep apart: say the noon (or the “n” of the tanween) cleanly from its own place and then move straight on to the next letter.', bn: 'নুন সাকিন বা তানবীনের পরে যে হরফগুলো গলা থেকে উচ্চারিত হয় সেগুলো এলে ইযহার হালকী হয়। নুনের উচ্চারণস্থান জিহ্বা, আর এই হরফগুলোর উচ্চারণস্থান গলার ভেতরে, তাই দুই আওয়াজ আলাদা থাকে: নুনকে নিজের মাখরাজ থেকে স্পষ্ট করে বলে সঙ্গে সঙ্গে পরের হরফে যান।' },
    letters: { ar: ['ء', 'ه', 'ع', 'ح', 'غ', 'خ'], note: { en: 'The six throat letters (hamza, ha, ayn, ha, ghayn, kha).', bn: 'কণ্ঠনালির ছয় হরফ (হামযা, হা, আইন, হা, গাইন, খা)।' } },
    how: [
      { en: 'Pronounce the noon (or the “n” of the tanween) fully, from the tip of the tongue.', bn: 'নুন (বা তানবীনের “ন”) জিহ্বার অগ্রভাগ থেকে পূর্ণ আওয়াজে বলুন।' },
      { en: 'Do not hold it, hum it or blend it into the next letter.', bn: 'নুনকে টানবেন না, নাকে গুঞ্জন করবেন না, পরের হরফের সঙ্গে মিশাবেন না।' },
      { en: 'Go straight to the throat letter with its own vowel.', bn: 'এরপর সরাসরি গলার হরফটি তার নিজস্ব হরকতসহ পড়ুন।' },
    ],
    mistakes: [
      { en: 'Adding a ghunnah (nasal hum) to the noon, which turns izhar into something closer to ikhfa.', bn: 'নুনে গুন্নাহ যোগ করা; এতে ইযহার ইখফার মতো হয়ে যায়।' },
      { en: 'Dropping the noon almost silently before ha or ayn.', bn: 'ه বা ع-এর আগে নুনকে প্রায় না বলেই ফেলা।' },
    ],
    faqs: [
      { q: { en: 'How many letters of izhar are there?', bn: 'ইযহারের হরফ কয়টি?' }, a: { en: 'Six: ء ه ع ح غ خ. If the next letter is one of these, the noon sakinah or tanween is read clearly.', bn: 'ছয়টি: ء ه ع ح غ خ। নুন সাকিন বা তানবীনের পরে এগুলোর কোনোটি এলে নুন স্পষ্ট পড়তে হয়।' } },
      { q: { en: 'Is izhar coloured in the app?', bn: 'অ্যাপে কি ইযহার রঙিন দেখানো হয়?' }, a: { en: 'The Quran.com colour data does not mark izhar (nothing changes in its pronunciation), so on these pages the two letters involved are highlighted in amber.', bn: 'Quran.com-এর রঙের তথ্যে ইযহার চিহ্নিত নয় (উচ্চারণে কিছু বদলায় না); তাই এই পাতায় সংশ্লিষ্ট দুটি হরফ হলুদ-কমলা রঙে দেখানো হয়েছে।' } },
    ],
    related: ['idgham-with-ghunnah', 'ikhfa', 'iqlab'],
  },
  {
    slug: 'idgham-with-ghunnah', group: 'noon', ar: 'إِدْغَام بِغُنَّة', cls: 'idgham_ghunnah',
    name: { en: 'Idgham with ghunnah', bn: 'ইদগাম বিগুন্নাহ (গুন্নাহসহ মিশিয়ে পড়া)', ar: 'الإدغام بغنّة' },
    summary: { en: 'Idgham with ghunnah means merging a noon sakinah or tanween into the next letter (ي ن م و) and holding a nasal sound for about two counts.', bn: 'নুন সাকিন বা তানবীনের পরে ي ن م و আসলে নুনকে পরের হরফের সঙ্গে মিশিয়ে প্রায় দুই মাত্রা গুন্নাহসহ পড়াকে ইদগাম বিগুন্নাহ বলে।' },
    definition: { en: 'When noon sakinah or tanween is followed by ya, noon, meem or waw (remembered as يَنْمُو), the noon is not pronounced separately: it is absorbed into the next letter, which is read with a shadda and a nasal hum (ghunnah) of about two counts. The merging happens across two words, e.g. مِن وَالٍ.', bn: 'নুন সাকিন বা তানবীনের পরে ي ن م و (মনে রাখার সূত্র: يَنْمُو) এলে নুন আলাদাভাবে উচ্চারিত হয় না; পরের হরফের সঙ্গে মিশে যায় এবং সেই হরফ তাশদীদসহ প্রায় দুই মাত্রা গুন্নাহর সঙ্গে পড়া হয়। এই মিশ্রণ দুই শব্দের মাঝে ঘটে।' },
    letters: { ar: ['ي', 'ن', 'م', 'و'], note: { en: 'Ya, noon, meem, waw: the letters of “yanmu”.', bn: 'ইয়া, নুন, মীম, ওয়াও: “ইয়ানমু”-র হরফ।' } },
    how: [
      { en: 'Do not stop on the noon: let it flow into the next letter.', bn: 'নুনে থামবেন না; তা পরের হরফে মিশে যাবে।' },
      { en: 'Read the next letter as if it carries a shadda, and hum through the nose for about two counts.', bn: 'পরের হরফ তাশদীদযুক্তের মতো পড়ুন এবং নাক দিয়ে প্রায় দুই মাত্রা গুন্নাহ করুন।' },
      { en: 'Exception: if the noon sakinah and the ya or waw are in the same word (for example دُنْيَا, بُنْيَان, صِنْوَان, قِنْوَان) there is no idgham: read the noon clearly.', bn: 'ব্যতিক্রম: নুন সাকিন এবং ي বা و একই শব্দে থাকলে (যেমন دُنْيَا, بُنْيَان, صِنْوَان, قِنْوَان) ইদগাম হয় না; নুন স্পষ্ট পড়তে হয়।' },
    ],
    mistakes: [
      { en: 'Skipping the ghunnah, so the merged letter sounds flat.', bn: 'গুন্নাহ বাদ দেওয়া; এতে মিশে যাওয়া হরফ সমতল শোনায়।' },
      { en: 'Pausing between the two words instead of joining them.', bn: 'দুই শব্দ জুড়ে না পড়ে মাঝে থেমে যাওয়া।' },
    ],
    faqs: [
      { q: { en: 'What are the letters of idgham with ghunnah?', bn: 'ইদগাম বিগুন্নাহর হরফ কোনগুলো?' }, a: { en: 'Ya (ي), noon (ن), meem (م) and waw (و), often remembered as يَنْمُو.', bn: 'ইয়া (ي), নুন (ن), মীম (م) ও ওয়াও (و); সূত্র: يَنْمُو।' } },
      { q: { en: 'How long is the ghunnah?', bn: 'গুন্নাহ কত মাত্রা?' }, a: { en: 'About two counts (harakat), the same length as a natural madd.', bn: 'প্রায় দুই মাত্রা (হরকত), অর্থাৎ স্বাভাবিক মাদ্দের সমান।' } },
    ],
    related: ['idgham-without-ghunnah', 'ghunnah', 'izhar'],
  },
  {
    slug: 'idgham-without-ghunnah', group: 'noon', ar: 'إِدْغَام بِلَا غُنَّة', cls: 'idgham_wo_ghunnah',
    name: { en: 'Idgham without ghunnah', bn: 'ইদগাম বেগুন্নাহ (গুন্নাহ ছাড়া মিশিয়ে পড়া)', ar: 'الإدغام بغير غنّة' },
    summary: { en: 'Idgham without ghunnah means merging a noon sakinah or tanween completely into a following lam (ل) or ra (ر) with no nasal sound.', bn: 'নুন সাকিন বা তানবীনের পরে ل বা ر এলে নুনকে সম্পূর্ণ মিশিয়ে গুন্নাহ ছাড়া পড়াকে ইদগাম বেগুন্নাহ বলে।' },
    definition: { en: 'When noon sakinah or tanween is followed by lam or ra, the noon disappears into that letter and the lam or ra is read with a shadda. Unlike the four letters of idgham with ghunnah, there is no nasal hum here: the merge is complete.', bn: 'নুন সাকিন বা তানবীনের পরে ل বা ر এলে নুন ঐ হরফে মিশে যায় এবং ل/ر তাশদীদসহ পড়া হয়। ইদগাম বিগুন্নাহর চার হরফের মতো এখানে নাকের গুঞ্জন নেই; মিশ্রণ সম্পূর্ণ।' },
    letters: { ar: ['ل', 'ر'], note: { en: 'Lam and ra.', bn: 'লাম ও রা।' } },
    how: [
      { en: 'Skip the noon sound entirely.', bn: 'নুনের আওয়াজ পুরোপুরি বাদ দিন।' },
      { en: 'Press the lam or ra with a shadda, without any hum through the nose.', bn: 'ل বা ر তাশদীদসহ পড়ুন; নাকে কোনো গুঞ্জন নয়।' },
    ],
    mistakes: [
      { en: 'Adding ghunnah, which is the rule of the other four idgham letters.', bn: 'গুন্নাহ যোগ করা; এটি অন্য চার ইদগাম হরফের নিয়ম।' },
      { en: 'Leaving a faint “n” before the lam or ra.', bn: 'ل বা ر-এর আগে হালকা “ন” রেখে দেওয়া।' },
    ],
    faqs: [
      { q: { en: 'Which letters need idgham without ghunnah?', bn: 'কোন হরফে ইদগাম বেগুন্নাহ হয়?' }, a: { en: 'Only lam (ل) and ra (ر).', bn: 'শুধু লাম (ل) ও রা (ر)।' } },
      { q: { en: 'What is the difference from idgham with ghunnah?', bn: 'ইদগাম বিগুন্নাহর সঙ্গে পার্থক্য কী?' }, a: { en: 'Both merge the noon into the next letter; only the second (ي ن م و) keeps a nasal sound for two counts.', bn: 'দুটিতেই নুন পরের হরফে মিশে যায়; কেবল ي ن م و-এর ক্ষেত্রে দুই মাত্রা গুন্নাহ থাকে।' } },
    ],
    related: ['idgham-with-ghunnah', 'izhar', 'ikhfa'],
  },
  {
    slug: 'iqlab', group: 'noon', ar: 'إِقْلَاب', cls: 'iqlab',
    name: { en: 'Iqlab (conversion)', bn: 'ইকলাব (রূপান্তর)', ar: 'الإقلاب' },
    summary: { en: 'Iqlab means turning a noon sakinah or tanween into a hidden meem sound, with ghunnah, when the letter ba (ب) follows.', bn: 'নুন সাকিন বা তানবীনের পরে ب এলে নুনকে মীমে রূপান্তর করে গুন্নাহসহ পড়াকে ইকলাব বলে।' },
    definition: { en: 'Iqlab (“turning over”) happens when noon sakinah or tanween meets ba. The noon is changed into a meem, which is hidden with the lips lightly closed and a nasal sound of about two counts, then the ba is pronounced. In the mushaf a small meem (ۢ) is written above the noon or tanween as a reminder.', bn: 'নুন সাকিন বা তানবীনের পরে ب এলে ইকলাব হয়। নুন মীমে রূপান্তরিত হয়; ঠোঁট হালকা বন্ধ করে প্রায় দুই মাত্রা গুন্নাহসহ লুকিয়ে পড়া হয়, তারপর ب পড়া হয়। মুসহাফে স্মারক হিসেবে নুন বা তানবীনের ওপর ছোট একটি মীম (ۢ) লেখা থাকে।' },
    letters: { ar: ['ب'], note: { en: 'Only ba.', bn: 'শুধু বা।' } },
    how: [
      { en: 'Close the lips lightly, as for a meem, but do not press them together hard.', bn: 'মীমের মতো ঠোঁট হালকা বন্ধ করুন, তবে জোরে চেপে ধরবেন না।' },
      { en: 'Hum through the nose for about two counts.', bn: 'নাক দিয়ে প্রায় দুই মাত্রা গুন্নাহ করুন।' },
      { en: 'Release the lips into the ba.', bn: 'এরপর ঠোঁট খুলে ب উচ্চারণ করুন।' },
    ],
    mistakes: [
      { en: 'Saying a clear “n” or a fully pressed “m” instead of the hidden meem.', bn: 'লুকানো মীমের বদলে স্পষ্ট “ন” বা জোরে চাপা “ম” বলা।' },
      { en: 'Skipping the ghunnah.', bn: 'গুন্নাহ বাদ দেওয়া।' },
    ],
    faqs: [
      { q: { en: 'What is the small meem above the noon?', bn: 'নুনের ওপর ছোট মীম কেন?' }, a: { en: 'It marks iqlab: the noon sound is converted into a meem before ba.', bn: 'এটি ইকলাবের চিহ্ন; ب-এর আগে নুনের আওয়াজ মীমে রূপান্তরিত হয়।' } },
      { q: { en: 'How many letters cause iqlab?', bn: 'কয়টি হরফে ইকলাব হয়?' }, a: { en: 'One: ba (ب).', bn: 'একটি: বা (ب)।' } },
    ],
    related: ['ikhfa', 'meem-sakinah', 'ghunnah'],
  },
  {
    slug: 'ikhfa', group: 'noon', ar: 'إِخْفَاء', cls: 'ikhafa',
    name: { en: 'Ikhfa (hiding)', bn: 'ইখফা (গোপন করে পড়া)', ar: 'الإخفاء' },
    summary: { en: 'Ikhfa means hiding a noon sakinah or tanween, with ghunnah, before any of the fifteen remaining letters.', bn: 'নুন সাকিন বা তানবীনের পরে বাকি পনেরোটি হরফের কোনোটি এলে নুনকে গুন্নাহসহ গোপন করে পড়াকে ইখফা বলে।' },
    definition: { en: 'Ikhfa is the most common noon rule. The noon is neither clearly pronounced (izhar) nor fully merged (idgham): the tongue does not touch the place of the noon, the sound is carried through the nose for about two counts, and the mouth already takes the shape of the next letter.', bn: 'ইখফা নুনের সবচেয়ে বেশি ব্যবহৃত নিয়ম। নুন না স্পষ্ট হয় (ইযহার), না পুরো মিশে যায় (ইদগাম): জিহ্বা নুনের স্থানে স্পর্শ করে না, আওয়াজ প্রায় দুই মাত্রা নাকের ভেতর দিয়ে যায় এবং মুখ আগেই পরের হরফের আকার নেয়।' },
    letters: { ar: ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'], note: { en: 'Fifteen letters: all those not covered by izhar, idgham and iqlab.', bn: 'পনেরোটি হরফ: ইযহার, ইদগাম ও ইকলাবের বাইরের সব হরফ।' } },
    how: [
      { en: 'Keep the tongue away from the noon’s place (behind the upper front teeth).', bn: 'জিহ্বাকে নুনের স্থান (ওপরের সামনের দাঁতের গোড়া) থেকে দূরে রাখুন।' },
      { en: 'Let the sound resonate in the nose for about two counts.', bn: 'প্রায় দুই মাত্রা নাকের ভেতর আওয়াজ অনুরণিত হতে দিন।' },
      { en: 'Prepare the mouth for the next letter while humming: light before light letters, fuller before heavy ones such as ص ض ط ظ ق.', bn: 'গুন্নাহ চলাকালেই পরের হরফের জন্য মুখ প্রস্তুত করুন: হালকা হরফের আগে হালকা, ص ض ط ظ ق-এর আগে কিছুটা মোটা সুরে।' },
    ],
    mistakes: [
      { en: 'Touching the tongue to the noon’s place, which turns ikhfa into a clear noon.', bn: 'জিহ্বা নুনের স্থানে লাগিয়ে ফেলা; এতে স্পষ্ট নুন হয়ে যায়।' },
      { en: 'Making the ghunnah too short or too long.', bn: 'গুন্নাহ খুব ছোট বা খুব লম্বা করা।' },
    ],
    faqs: [
      { q: { en: 'Which letters need ikhfa?', bn: 'কোন হরফের আগে ইখফা হয়?' }, a: { en: 'Fifteen: ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك.', bn: 'পনেরোটি: ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك।' } },
      { q: { en: 'Is ikhfa the same as idgham?', bn: 'ইখফা কি ইদগামের মতোই?' }, a: { en: 'No. In idgham the noon is absorbed into the next letter (which gets a shadda); in ikhfa the noon is hidden but the next letter has no shadda.', bn: 'না। ইদগামে নুন পরের হরফে মিশে যায় (সেখানে তাশদীদ থাকে); ইখফায় নুন লুকানো থাকে কিন্তু পরের হরফে তাশদীদ থাকে না।' } },
    ],
    related: ['izhar', 'iqlab', 'ghunnah'],
  },
  {
    slug: 'meem-sakinah', group: 'meem', ar: 'أَحْكَام الْمِيم السَّاكِنَة', cls: 'ikhafa_shafawi',
    name: { en: 'Meem sakinah rules', bn: 'মীম সাকিনের নিয়ম', ar: 'أحكام الميم الساكنة' },
    summary: { en: 'A meem with sukun is hidden before ba (ikhfa shafawi), merged before another meem (idgham shafawi) and read clearly before every other letter (izhar shafawi).', bn: 'মীম সাকিনের পরে ب এলে ইখফা শাফাবী, م এলে ইদগাম শাফাবী এবং অন্য সব হরফে ইযহার শাফাবী হয়।' },
    definition: { en: 'The meem sakinah rules are called “shafawi” (labial) because the meem is made with the lips. There are three: ikhfa shafawi (before ba), idgham shafawi (before meem) and izhar shafawi (before any other letter).', bn: 'মীম সাকিনের নিয়মগুলোকে “শাফাবী” (ঠোঁটসংক্রান্ত) বলা হয়, কারণ মীম ঠোঁট থেকে উচ্চারিত হয়। নিয়ম তিনটি: ইখফা শাফাবী (ب-এর আগে), ইদগাম শাফাবী (م-এর আগে) ও ইযহার শাফাবী (অন্য সব হরফের আগে)।' },
    letters: { ar: ['ب', 'م'], note: { en: 'Ba triggers ikhfa, meem triggers idgham; every other letter gives izhar.', bn: 'ب-এ ইখফা, م-এ ইদগাম; বাকি সব হরফে ইযহার।' } },
    how: [
      { en: 'Before ba: close the lips lightly and hum for about two counts, then release into the ba.', bn: 'ب-এর আগে: ঠোঁট হালকা বন্ধ করে প্রায় দুই মাত্রা গুন্নাহ করুন, তারপর ب-এ যান।' },
      { en: 'Before meem: merge into the second meem, which is read with a shadda and about two counts of ghunnah.', bn: 'م-এর আগে: প্রথম মীম দ্বিতীয় মীমে মিশে যায়; তাশদীদসহ প্রায় দুই মাত্রা গুন্নাহ হয়।' },
      { en: 'Before any other letter: pronounce the meem clearly with closed lips, without a hum. Take extra care before waw and fa so the meem is not hidden.', bn: 'অন্য হরফের আগে: ঠোঁট বন্ধ করে মীম স্পষ্ট পড়ুন, গুন্নাহ ছাড়া। و ও ف-এর আগে বিশেষ সতর্ক থাকুন যেন মীম লুকিয়ে না যায়।' },
    ],
    mistakes: [
      { en: 'Hiding the meem before waw or fa because the lips are close to those letters.', bn: 'و বা ف-এর আগে মীম লুকিয়ে ফেলা, কারণ ঠোঁট ঐ হরফের কাছাকাছি।' },
      { en: 'Pressing the lips hard in ikhfa shafawi.', bn: 'ইখফা শাফাবীতে ঠোঁট জোরে চেপে ধরা।' },
    ],
    faqs: [
      { q: { en: 'What does shafawi mean?', bn: '“শাফাবী” মানে কী?' }, a: { en: '“Of the lips”: the meem is articulated with both lips.', bn: '“ঠোঁটসংক্রান্ত”: মীম দুই ঠোঁট থেকে উচ্চারিত হয়।' } },
      { q: { en: 'How many meem sakinah rules are there?', bn: 'মীম সাকিনের নিয়ম কয়টি?' }, a: { en: 'Three: ikhfa shafawi, idgham shafawi and izhar shafawi.', bn: 'তিনটি: ইখফা শাফাবী, ইদগাম শাফাবী ও ইযহার শাফাবী।' } },
    ],
    related: ['ikhfa', 'iqlab', 'ghunnah'],
    groups: {
      'ikhfa-shafawi': { en: 'Ikhfa shafawi: meem before ba', bn: 'ইখফা শাফাবী: ب-এর আগে মীম' },
      'idgham-shafawi': { en: 'Idgham shafawi: meem before meem', bn: 'ইদগাম শাফাবী: م-এর আগে মীম' },
      'izhar-shafawi': { en: 'Izhar shafawi: meem before any other letter', bn: 'ইযহার শাফাবী: অন্য হরফের আগে মীম' },
    },
  },
  {
    slug: 'qalqalah', group: 'sound', ar: 'قَلْقَلَة', cls: 'qalaqah',
    name: { en: 'Qalqalah (echoing)', bn: 'কলকলা (প্রতিধ্বনি)', ar: 'القلقلة' },
    summary: { en: 'Qalqalah is a slight echo or bounce on the five letters ق ط ب ج د when they carry a sukun or when you stop on them.', bn: 'ق ط ب ج د হরফে সাকিন থাকলে বা এতে ওয়াকফ করলে যে হালকা প্রতিধ্বনি বা ঝাঁকুনি হয় তাকে কলকলা বলে।' },
    definition: { en: 'These five letters are “restless” letters: when they are still (sukun) the sound would otherwise stop dead, so a short echo is released from the point of the letter. The echo is stronger when you stop on the letter at the end of a word or ayah.', bn: 'এই পাঁচ হরফ “অস্থির” হরফ: সাকিন অবস্থায় আওয়াজ হঠাৎ থেমে যেত, তাই হরফের মাখরাজ থেকে ছোট্ট প্রতিধ্বনি বের হয়। শব্দ বা আয়াতের শেষে ওয়াকফ করলে এই প্রতিধ্বনি তুলনামূলক জোরালো হয়।' },
    letters: { ar: ['ق', 'ط', 'ب', 'ج', 'د'], note: { en: 'Remembered as قُطْبُ جَدٍّ (“qutbu jadd”).', bn: 'সূত্র: قُطْبُ جَدٍّ (“কুতবু জাদ্দ”)।' } },
    how: [
      { en: 'Pronounce the letter with its sukun, then release a quick, light bounce from the same place.', bn: 'হরফটি সাকিনসহ পড়ুন, তারপর একই মাখরাজ থেকে দ্রুত হালকা ঝাঁকুনি ছাড়ুন।' },
      { en: 'In the middle of a word the echo is small; when stopping at the end of an ayah it is a little stronger.', bn: 'শব্দের মাঝখানে প্রতিধ্বনি ছোট; আয়াতের শেষে ওয়াকফ করলে একটু জোরালো।' },
      { en: 'Keep ق and ط heavy and ب ج د lighter.', bn: 'ق ও ط মোটা সুরে, ب ج د চিকন সুরে রাখুন।' },
    ],
    mistakes: [
      { en: 'Adding a vowel (“buh”, “duh”) instead of a clipped echo.', bn: 'সংক্ষিপ্ত প্রতিধ্বনির বদলে হরকত যোগ করা (“বু”, “দু”)।' },
      { en: 'Skipping the echo, so the letter is swallowed.', bn: 'প্রতিধ্বনি বাদ দেওয়া; এতে হরফ গিলে ফেলা হয়।' },
    ],
    faqs: [
      { q: { en: 'What are the letters of qalqalah?', bn: 'কলকলার হরফ কোনগুলো?' }, a: { en: 'ق ط ب ج د (قُطْبُ جَدٍّ).', bn: 'পাঁচটি হরফ: ق ط ب ج د (সূত্র: قُطْبُ جَدٍّ)।' } },
      { q: { en: 'Does qalqalah happen with a vowel?', bn: 'হরকতযুক্ত হলে কি কলকলা হয়?' }, a: { en: 'No. It applies only when the letter is sakin (has a sukun) or when you stop on it.', bn: 'না। শুধু হরফ সাকিন হলে বা তাতে ওয়াকফ করলে কলকলা হয়।' } },
    ],
    related: ['ghunnah', 'tafkheem-tarqeeq', 'waqf-signs'],
  },
  {
    slug: 'ghunnah', group: 'sound', ar: 'غُنَّة', cls: 'ghunnah',
    name: { en: 'Ghunnah (nasal sound)', bn: 'গুন্নাহ (নাকের সুর)', ar: 'الغنّة' },
    summary: { en: 'Ghunnah is the nasal hum that belongs to noon and meem; it is held for a full two counts on a noon or meem with shadda (نّ مّ).', bn: 'গুন্নাহ হলো নুন ও মীমের নাকের সুর; তাশদীদযুক্ত নুন বা মীমে (نّ مّ) পূর্ণ দুই মাত্রা ধরে রাখতে হয়।' },
    definition: { en: 'Ghunnah is a sound that resonates in the nasal passage and cannot be separated from noon and meem. Its fullest form is on a noon or meem carrying a shadda, as in إِنَّ and ثُمَّ, where it is held for about two counts. The same nasal sound is also part of ikhfa, iqlab and idgham with ghunnah.', bn: 'গুন্নাহ নাকের ভেতর অনুরণিত এক ধরনের আওয়াজ, যা নুন ও মীম থেকে আলাদা করা যায় না। তাশদীদযুক্ত নুন বা মীমে (যেমন إِنَّ, ثُمَّ) এটি পূর্ণরূপে প্রায় দুই মাত্রা ধরে রাখতে হয়। ইখফা, ইকলাব ও ইদগাম বিগুন্নাহতেও একই নাকের সুর থাকে।' },
    letters: { ar: ['نّ', 'مّ'], note: { en: 'Noon and meem with shadda.', bn: 'তাশদীদযুক্ত নুন ও মীম।' } },
    how: [
      { en: 'Self-check: gently pinch your nose while saying it. If the sound changes or is cut off, the ghunnah is coming from the nose, as it should.', bn: 'নিজে যাচাই: পড়ার সময় নাক হালকা চেপে ধরুন। আওয়াজ বদলে গেলে বা আটকে গেলে বুঝবেন গুন্নাহ ঠিকভাবে নাক থেকেই আসছে।' },
      { en: 'Hold it for about two counts without turning it into a long “nnn”.', bn: 'প্রায় দুই মাত্রা ধরে রাখুন; “ন্ন্ন্ন” করে লম্বা করবেন না।' },
      { en: 'Keep the surrounding vowels clean: the hum should not leak into the vowel before it.', bn: 'আশপাশের হরকত পরিষ্কার রাখুন; গুন্নাহ যেন আগের স্বরে ছড়িয়ে না পড়ে।' },
    ],
    mistakes: [
      { en: 'Rushing noon or meem mushaddad so the ghunnah is lost.', bn: 'তাশদীদযুক্ত নুন/মীম তাড়াহুড়ো করে পড়ে গুন্নাহ হারিয়ে ফেলা।' },
      { en: 'Stretching the ghunnah beyond two counts.', bn: 'গুন্নাহ দুই মাত্রার চেয়ে বেশি টানা।' },
    ],
    faqs: [
      { q: { en: 'On which letters is ghunnah required?', bn: 'কোন হরফে গুন্নাহ আবশ্যক?' }, a: { en: 'Always on noon and meem with shadda; it is also part of ikhfa, iqlab and idgham with ghunnah.', bn: 'তাশদীদযুক্ত নুন ও মীমে সবসময়; এছাড়া ইখফা, ইকলাব ও ইদগাম বিগুন্নাহতেও।' } },
      { q: { en: 'How long is ghunnah?', bn: 'গুন্নাহ কত মাত্রা?' }, a: { en: 'About two counts.', bn: 'প্রায় দুই মাত্রা।' } },
    ],
    related: ['idgham-with-ghunnah', 'ikhfa', 'iqlab'],
  },
  {
    slug: 'madd-natural', group: 'madd', ar: 'الْمَدّ الطَّبِيعِيّ', cls: 'madda_normal',
    name: { en: 'Natural madd (madd asli)', bn: 'স্বাভাবিক মাদ্দ (মাদ্দে আসলী/তাবঈ)', ar: 'المدّ الطبيعي (الأصلي)' },
    summary: { en: 'Natural madd is stretching a long vowel (alif, waw or ya of madd) for exactly two counts when no hamza or sukun follows it.', bn: 'মাদ্দের হরফের (আলিফ, ওয়াও, ইয়া) পরে হামযা বা সুকুন না থাকলে সেই দীর্ঘ স্বরকে ঠিক দুই মাত্রা টেনে পড়াকে স্বাভাবিক মাদ্দ বলে।' },
    definition: { en: 'The madd letters are alif after a fatha, waw sakinah after a damma and ya sakinah after a kasra. A natural madd lasts two counts (about the time of opening or closing a finger). The small letters of the mushaf (the dagger alif ـٰ, the small waw ۥ and small ya ۦ) are read the same way.', bn: 'মাদ্দের হরফ: যবরের পরে আলিফ, পেশের পরে সাকিন ওয়াও এবং যেরের পরে সাকিন ইয়া। স্বাভাবিক মাদ্দ দুই মাত্রা (একটি আঙুল খুলতে বা বন্ধ করতে যে সময় লাগে) স্থায়ী হয়। মুসহাফের ছোট হরফগুলোও (খাড়া যবর ـٰ, ছোট ওয়াও ۥ, ছোট ইয়া ۦ) একইভাবে পড়া হয়।' },
    letters: { ar: ['ا', 'و', 'ي'], note: { en: 'Alif after fatha, waw after damma, ya after kasra.', bn: 'যবরের পরে আলিফ, পেশের পরে ওয়াও, যেরের পরে ইয়া।' } },
    how: [
      { en: 'Hold the vowel steadily for two counts: not shorter, not longer.', bn: 'স্বরটি দুই মাত্রা স্থির রাখুন; কম নয়, বেশিও নয়।' },
      { en: 'Keep the pitch even; do not wobble or add a hum.', bn: 'সুর সমান রাখুন; কাঁপাবেন না, গুন্নাহ মেশাবেন না।' },
    ],
    mistakes: [
      { en: 'Cutting the madd short so “qāla” sounds like “qala”.', bn: 'মাদ্দ ছোট করে ফেলা, ফলে “ক্বা-লা” হয়ে যায় “ক্বালা”।' },
      { en: 'Over-stretching, which blurs it with the longer madd types.', bn: 'অতিরিক্ত টানা, যা বড় মাদ্দের সঙ্গে গুলিয়ে ফেলে।' },
    ],
    faqs: [
      { q: { en: 'How many counts is natural madd?', bn: 'স্বাভাবিক মাদ্দ কত মাত্রা?' }, a: { en: 'Two counts (harakat).', bn: 'দুই মাত্রা (হরকত)।' } },
      { q: { en: 'Why is it called natural?', bn: 'একে স্বাভাবিক বলা হয় কেন?' }, a: { en: 'Because the long vowel cannot exist without it: it needs no extra cause such as a hamza or sukun.', bn: 'কারণ এটি ছাড়া দীর্ঘ স্বর হয় না; এর জন্য হামযা বা সুকুনের মতো আলাদা কারণ লাগে না।' } },
    ],
    related: ['madd-muttasil', 'madd-munfasil', 'madd-lazim'],
  },
  {
    slug: 'madd-muttasil', group: 'madd', ar: 'الْمَدّ الْمُتَّصِل', cls: 'madda_obligatory',
    name: { en: 'Connected madd (madd muttasil)', bn: 'মাদ্দে মুত্তাসিল (সংযুক্ত মাদ্দ)', ar: 'المدّ المتصل' },
    summary: { en: 'Madd muttasil occurs when a madd letter is followed by a hamza in the same word; it is stretched for four to five counts.', bn: 'একই শব্দে মাদ্দের হরফের পরে হামযা এলে মাদ্দে মুত্তাসিল হয়; এটি চার থেকে পাঁচ মাত্রা টানতে হয়।' },
    definition: { en: 'When the hamza comes right after the madd letter inside one word (such as جَآءَ, ٱلسَّمَآءِ, سُوٓءَ), the madd is “connected” and must be extended beyond the natural two counts. In the common Hafs teaching it is read as four or five counts, and the same length should be used consistently throughout a recitation. If you stop on such a word, many teachers allow up to six counts.', bn: 'একই শব্দের ভেতরে মাদ্দের হরফের ঠিক পরে হামযা এলে (যেমন جَآءَ, ٱلسَّمَآءِ, سُوٓءَ) মাদ্দটি “সংযুক্ত” এবং স্বাভাবিক দুই মাত্রার চেয়ে বেশি টানতে হয়। প্রচলিত হাফস শিক্ষায় এটি চার বা পাঁচ মাত্রা পড়া হয়, এবং পুরো তিলাওয়াতে একই মাত্রা ধরে রাখা উচিত। এমন শব্দে ওয়াকফ করলে অনেক উস্তাদ ছয় মাত্রা পর্যন্ত অনুমতি দেন।' },
    how: [
      { en: 'Hold the madd letter for four or five counts, choosing one length and keeping it.', bn: 'মাদ্দের হরফ চার বা পাঁচ মাত্রা ধরুন; একটি মাত্রা বেছে নিয়ে তা-ই ধরে রাখুন।' },
      { en: 'Then pronounce the hamza clearly from the throat.', bn: 'তারপর হামযা গলা থেকে স্পষ্ট উচ্চারণ করুন।' },
    ],
    mistakes: [
      { en: 'Reading it as a two-count natural madd.', bn: 'দুই মাত্রার স্বাভাবিক মাদ্দের মতো পড়ে ফেলা।' },
      { en: 'Changing the length from one occurrence to the next.', bn: 'এক জায়গায় এক মাত্রা, অন্য জায়গায় অন্য মাত্রা পড়া।' },
    ],
    faqs: [
      { q: { en: 'How many counts is madd muttasil?', bn: 'মাদ্দে মুত্তাসিল কত মাত্রা?' }, a: { en: 'Four or five counts in the common Hafs teaching (up to six when stopping on it, according to many teachers). Follow your teacher’s chosen length.', bn: 'প্রচলিত হাফস শিক্ষায় চার বা পাঁচ মাত্রা (ওয়াকফে অনেক উস্তাদের মতে ছয় পর্যন্ত)। আপনার উস্তাদের নির্ধারিত মাত্রা অনুসরণ করুন।' } },
      { q: { en: 'What is the difference between muttasil and munfasil?', bn: 'মুত্তাসিল ও মুনফাসিলের পার্থক্য কী?' }, a: { en: 'In muttasil the madd letter and the hamza are in the same word; in munfasil they are in two different words.', bn: 'মুত্তাসিলে মাদ্দের হরফ ও হামযা একই শব্দে; মুনফাসিলে দুই আলাদা শব্দে।' } },
    ],
    related: ['madd-munfasil', 'madd-natural', 'madd-lazim'],
  },
  {
    slug: 'madd-munfasil', group: 'madd', ar: 'الْمَدّ الْمُنْفَصِل', cls: 'madda_obligatory',
    name: { en: 'Separated madd (madd munfasil)', bn: 'মাদ্দে মুনফাসিল (বিচ্ছিন্ন মাদ্দ)', ar: 'المدّ المنفصل' },
    summary: { en: 'Madd munfasil occurs when a madd letter ends one word and a hamza begins the next; its length is permissible within a range, commonly four to five counts in Hafs.', bn: 'এক শব্দের শেষে মাদ্দের হরফ এবং পরের শব্দের শুরুতে হামযা থাকলে মাদ্দে মুনফাসিল হয়; এর মাত্রা একটি সীমার মধ্যে জায়েজ, হাফসে সাধারণত চার-পাঁচ মাত্রা।' },
    definition: { en: 'In munfasil (“separated”) the madd letter is the last letter of one word and the hamza is the first letter of the next, as in يَـٰٓأَيُّهَا and بِمَآ أُنزِلَ. Reciters are allowed some flexibility in length, which is why it is called a “permissible” madd; in the common Hafs teaching it is read with the same four or five counts as muttasil. In the app’s colouring munfasil shares the colour of muttasil.', bn: 'মুনফাসিলে মাদ্দের হরফ এক শব্দের শেষ হরফ এবং হামযা পরের শব্দের প্রথম হরফ, যেমন يَـٰٓأَيُّهَا ও بِمَآ أُنزِلَ। মাত্রায় কিছুটা নমনীয়তার সুযোগ আছে বলে একে “জায়েজ” মাদ্দ বলা হয়; প্রচলিত হাফস শিক্ষায় মুত্তাসিলের মতোই চার-পাঁচ মাত্রা পড়া হয়। অ্যাপের রঙে মুনফাসিল ও মুত্তাসিলের রং একই।' },
    how: [
      { en: 'Stretch the madd letter at the end of the first word to the length your teacher uses (commonly four or five counts).', bn: 'প্রথম শব্দের শেষের মাদ্দের হরফ আপনার উস্তাদের মাত্রা অনুযায়ী (সাধারণত চার-পাঁচ) টানুন।' },
      { en: 'Keep the same length for muttasil and munfasil within one recitation.', bn: 'একই তিলাওয়াতে মুত্তাসিল ও মুনফাসিলে একই মাত্রা রাখুন।' },
      { en: 'Begin the next word with a clear hamza.', bn: 'পরের শব্দ স্পষ্ট হামযা দিয়ে শুরু করুন।' },
    ],
    mistakes: [
      { en: 'Reading it as two counts in one place and five in another.', bn: 'এক জায়গায় দুই মাত্রা, আরেক জায়গায় পাঁচ মাত্রা পড়া।' },
      { en: 'Pausing between the two words and so losing the connection.', bn: 'দুই শব্দের মাঝে থেমে সংযোগ নষ্ট করা।' },
    ],
    faqs: [
      { q: { en: 'Why is munfasil called permissible?', bn: 'মুনফাসিলকে জায়েজ বলা হয় কেন?' }, a: { en: 'Because its length may vary between recitation traditions and teachers; the common Hafs practice is four or five counts.', bn: 'কারণ কিরাআত ও উস্তাদভেদে এর মাত্রা ভিন্ন হতে পারে; প্রচলিত হাফস রীতি চার-পাঁচ মাত্রা।' } },
      { q: { en: 'Do I stop between the two words?', bn: 'দুই শব্দের মাঝে কি থামব?' }, a: { en: 'No. Stretch the madd and continue into the hamza without a break.', bn: 'না। মাদ্দ টেনে বিরতি ছাড়াই হামযায় যান।' } },
    ],
    related: ['madd-muttasil', 'madd-natural', 'madd-arid'],
  },
  {
    slug: 'madd-lazim', group: 'madd', ar: 'الْمَدّ اللَّازِم', cls: 'madda_necessary',
    name: { en: 'Necessary madd (madd lazim)', bn: 'মাদ্দে লাযিম (আবশ্যিক মাদ্দ)', ar: 'المدّ اللازم' },
    summary: { en: 'Madd lazim occurs when a madd letter is followed by a permanent sukun or shadda in the same word; it is always stretched for six counts.', bn: 'একই শব্দে মাদ্দের হরফের পরে স্থায়ী সুকুন বা তাশদীদ থাকলে মাদ্দে লাযিম হয়; এটি সবসময় ছয় মাত্রা টানতে হয়।' },
    definition: { en: 'When a madd letter is followed by a letter that stays sakin or carries a shadda whether you stop or continue (for example ٱلضَّآلِّينَ, ٱلْحَآقَّةُ, ٱلصَّآخَّةُ), the madd is “necessary”: it is the longest madd, six counts, with no flexibility. The same applies to certain disjoined letters at the beginning of some surahs (such as the lam and meem of الٓمٓ).', bn: 'মাদ্দের হরফের পরে এমন হরফ এলে যা ওয়াকফ বা ওয়াসল উভয় অবস্থায় সাকিন থাকে বা তাশদীদযুক্ত (যেমন ٱلضَّآلِّينَ, ٱلْحَآقَّةُ, ٱلصَّآخَّةُ), তখন মাদ্দ “আবশ্যিক”: এটি সবচেয়ে দীর্ঘ মাদ্দ, ছয় মাত্রা, এতে কোনো নমনীয়তা নেই। কিছু সূরার শুরুর হরফে মুকাত্তাআতেও (যেমন الٓمٓ-এর লাম ও মীম) একই নিয়ম প্রযোজ্য।' },
    how: [
      { en: 'Stretch the madd letter for six counts, steadily.', bn: 'মাদ্দের হরফ স্থিরভাবে ছয় মাত্রা টানুন।' },
      { en: 'Then pronounce the shadda or sukun letter that follows.', bn: 'তারপর পরের তাশদীদ বা সুকুনযুক্ত হরফ পড়ুন।' },
    ],
    mistakes: [
      { en: 'Shortening it to four or five counts like muttasil.', bn: 'মুত্তাসিলের মতো চার-পাঁচ মাত্রায় ছোট করে ফেলা।' },
      { en: 'Losing count, so it is longer or shorter in different places.', bn: 'মাত্রা গুলিয়ে ফেলা; ফলে বিভিন্ন জায়গায় কমবেশি হয়।' },
    ],
    faqs: [
      { q: { en: 'How many counts is madd lazim?', bn: 'মাদ্দে লাযিম কত মাত্রা?' }, a: { en: 'Six counts. It is the only madd with a single fixed length.', bn: 'ছয় মাত্রা। এটি একমাত্র মাদ্দ যার মাত্রা নির্দিষ্ট।' } },
      { q: { en: 'Why is it “necessary”?', bn: 'একে “লাযিম” বলা হয় কেন?' }, a: { en: 'Because its cause, the permanent sukun or shadda, never goes away, whether you stop or continue.', bn: 'কারণ এর কারণ, অর্থাৎ স্থায়ী সুকুন বা তাশদীদ, ওয়াকফ বা ওয়াসল কোনো অবস্থাতেই সরে যায় না।' } },
    ],
    related: ['madd-muttasil', 'madd-natural', 'madd-arid'],
  },
  {
    slug: 'madd-arid', group: 'madd', ar: 'الْمَدّ الْعَارِض لِلسُّكُون', cls: 'madda_permissible',
    name: { en: 'Madd ‘arid lis-sukun (madd when stopping)', bn: 'মাদ্দে আরিদ লিস-সুকুন (ওয়াকফের মাদ্দ)', ar: 'المدّ العارض للسكون' },
    summary: { en: 'Madd ‘arid lis-sukun appears when you stop on a word whose last letter follows a madd letter; the stop makes that letter sakin and the madd may be two, four or six counts.', bn: 'যে শব্দের শেষ হরফের আগে মাদ্দের হরফ আছে, সেই শব্দে ওয়াকফ করলে শেষ হরফ সাকিন হয় এবং মাদ্দ দুই, চার বা ছয় মাত্রা হতে পারে; একে মাদ্দে আরিদ লিস-সুকুন বলে।' },
    definition: { en: 'The sukun here is “incidental” (‘arid): it exists only because you stop. In سَيَعْلَمُونَ the noon is really read with a vowel when you continue, but at the ayah end you stop on it and the preceding waw is lengthened. Because the cause is temporary, the length is flexible: two, four or six counts, kept steady within the same stop.', bn: 'এখানে সুকুনটি “সাময়িক” (আরিদ): শুধু ওয়াকফের কারণে আসে। سَيَعْلَمُونَ-এ ওয়াসল করলে নুনে হরকত থাকে, কিন্তু আয়াতের শেষে ওয়াকফ করলে নুন সাকিন হয় এবং আগের ওয়াও টানা হয়। কারণ সাময়িক বলে মাত্রা নমনীয়: দুই, চার বা ছয় মাত্রা, একই তিলাওয়াতে একই রাখুন।' },
    how: [
      { en: 'Choose two, four or six counts and keep it the same for every such stop in your recitation.', bn: 'দুই, চার বা ছয় মাত্রা বেছে নিন এবং পুরো তিলাওয়াতে প্রতিটি এমন ওয়াকফে একই রাখুন।' },
      { en: 'If you do not stop on the word, read it with its vowel and a normal two-count madd.', bn: 'ওয়াকফ না করলে হরকতসহ পড়ুন এবং সাধারণ দুই মাত্রা মাদ্দ করুন।' },
    ],
    mistakes: [
      { en: 'Applying the long madd even when continuing without a stop.', bn: 'ওয়াকফ না করেও লম্বা মাদ্দ করা।' },
      { en: 'Varying the length at every ayah end.', bn: 'প্রতি আয়াতের শেষে আলাদা মাত্রা করা।' },
    ],
    faqs: [
      { q: { en: 'How many counts is madd ‘arid lis-sukun?', bn: 'মাদ্দে আরিদ লিস-সুকুন কত মাত্রা?' }, a: { en: 'Two, four or six counts when stopping.', bn: 'ওয়াকফের সময় দুই, চার বা ছয় মাত্রা।' } },
      { q: { en: 'Does it apply when I do not stop?', bn: 'ওয়াকফ না করলেও কি প্রযোজ্য?' }, a: { en: 'No. It is a rule of stopping only.', bn: 'না। এটি কেবল ওয়াকফের নিয়ম।' } },
    ],
    related: ['madd-natural', 'madd-munfasil', 'waqf-signs'],
  },
  {
    slug: 'lam-shamsiyyah-qamariyyah', group: 'letters', ar: 'اللَّام الشَّمْسِيَّة وَالْقَمَرِيَّة', cls: 'laam_shamsiyah',
    name: { en: 'Lam shamsiyyah & lam qamariyyah', bn: 'লাম শামসিয়্যাহ ও লাম ক্বামারিয়্যাহ', ar: 'اللام الشمسية والقمرية' },
    summary: { en: 'The lam of “al-” is silent and the next letter doubled before the fourteen sun letters, and pronounced clearly before the fourteen moon letters.', bn: '“আল-”-এর লাম চৌদ্দটি সূর্য-হরফের আগে উচ্চারিত হয় না (পরের হরফ দ্বিত্ব হয়), আর চৌদ্দটি চাঁদ-হরফের আগে স্পষ্ট উচ্চারিত হয়।' },
    definition: { en: 'The definite article ٱل (“al-”) behaves in two ways. Before a sun letter (like ش in ٱلشَّمْس, “the sun”) the lam merges into it and the sun letter carries a shadda. Before a moon letter (like ق in ٱلْقَمَر, “the moon”) the lam is pronounced clearly and carries a sukun.', bn: 'ٱل (“আল-”) দুভাবে আচরণ করে। সূর্য-হরফের আগে (যেমন ٱلشَّمْس-এর ش) লাম মিশে যায় এবং সেই হরফে তাশদীদ থাকে। চাঁদ-হরফের আগে (যেমন ٱلْقَمَر-এর ق) লাম স্পষ্ট উচ্চারিত হয় এবং সাকিন থাকে।' },
    letters: { ar: ['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن'], note: { en: 'Sun letters (14). The other 14 (ا ب ج ح خ ع غ ف ق ك م ه و ي) are moon letters, remembered as ٱبْغِ حَجَّكَ وَخَفْ عَقِيمَهُ.', bn: 'সূর্য-হরফ (১৪টি)। বাকি ১৪টি (ا ب ج ح خ ع غ ف ق ك م ه و ي) চাঁদ-হরফ; সূত্র: ٱبْغِ حَجَّكَ وَخَفْ عَقِيمَهُ।' } },
    how: [
      { en: 'Sun letter: skip the lam and read the next letter with a shadda (ash-shams, not al-shams).', bn: 'সূর্য-হরফ: লাম বাদ দিয়ে পরের হরফ তাশদীদসহ পড়ুন (আশ-শামস, “আল-শামস” নয়)।' },
      { en: 'Moon letter: pronounce the lam with a sukun (al-qamar).', bn: 'চাঁদ-হরফ: লাম সাকিনসহ উচ্চারণ করুন (আল-ক্বামার)।' },
      { en: 'When the article starts a word after a connected word, the alif is dropped (wasl) but the lam rule stays the same.', bn: 'আগের শব্দের সঙ্গে জুড়ে পড়লে আলিফ উচ্চারিত হয় না (ওয়াসল), কিন্তু লামের নিয়ম একই থাকে।' },
    ],
    mistakes: [
      { en: 'Pronouncing the lam before sun letters (“al-shams”).', bn: 'সূর্য-হরফের আগে লাম উচ্চারণ করা (“আল-শামস”)।' },
      { en: 'Swallowing the lam before moon letters.', bn: 'চাঁদ-হরফের আগে লাম গিলে ফেলা।' },
    ],
    faqs: [
      { q: { en: 'How do I know a sun letter from a moon letter?', bn: 'সূর্য-হরফ ও চাঁদ-হরফ চিনব কীভাবে?' }, a: { en: 'Look at the mushaf: before a sun letter the lam has no sukun and the next letter has a shadda; before a moon letter the lam has a sukun. In the app’s colours the silent lam is grey.', bn: 'মুসহাফে দেখুন: সূর্য-হরফের আগে লামে সুকুন থাকে না এবং পরের হরফে তাশদীদ থাকে; চাঁদ-হরফের আগে লামে সুকুন থাকে। অ্যাপের রঙে নিঃশব্দ লাম ধূসর।' } },
      { q: { en: 'Why “sun” and “moon”?', bn: '“সূর্য” ও “চাঁদ” কেন?' }, a: { en: 'The names come from the examples: ash-shams (the sun) assimilates the lam, al-qamar (the moon) does not.', bn: 'নামগুলো উদাহরণ থেকে এসেছে: আশ-শামসে লাম মিশে যায়, আল-ক্বামারে মিশে না।' } },
    ],
    related: ['hamzatul-wasl', 'idgham-without-ghunnah', 'tafkheem-tarqeeq'],
    groups: {
      shamsiyyah: { en: 'Lam shamsiyyah (silent lam, shown in grey)', bn: 'লাম শামসিয়্যাহ (নিঃশব্দ লাম, ধূসর)' },
      qamariyyah: { en: 'Lam qamariyyah (clear lam, shown in teal)', bn: 'লাম ক্বামারিয়্যাহ (স্পষ্ট লাম, সবুজাভ নীল)' },
    },
  },
  {
    slug: 'hamzatul-wasl', group: 'letters', ar: 'هَمْزَة الْوَصْل', cls: 'ham_wasl',
    name: { en: 'Hamzatul wasl (connecting hamza)', bn: 'হামযাতুল ওয়াসল (সংযোগের হামযা)', ar: 'همزة الوصل' },
    summary: { en: 'Hamzatul wasl (ٱ) is pronounced only when you begin a word with it; when you join it to the word before, it is dropped.', bn: 'হামযাতুল ওয়াসল (ٱ) শুধু শব্দের শুরুতে থেকে পড়লে উচ্চারিত হয়; আগের শব্দের সঙ্গে জুড়ে পড়লে বাদ যায়।' },
    definition: { en: 'The alif with a small wasla sign (ٱ) is a “connecting” hamza. At the start of a recitation, or after a pause, it is read with a vowel: a fatha in the article “al-”, a kasra in most nouns and verbs (ٱسْم, ٱهْدِنَا), and a damma when the third letter of the verb carries a damma (ٱنظُرُوا۟ is read with a damma). When you continue from the previous word it is not pronounced at all.', bn: 'ছোট ওয়াসলা চিহ্নযুক্ত আলিফ (ٱ) হলো “সংযোগের” হামযা। তিলাওয়াতের শুরুতে বা থেমে আবার শুরু করলে এটি হরকতসহ পড়া হয়: “আল-”-এ যবর, অধিকাংশ ইসম ও ফে’লে যের (ٱسْم, ٱهْدِنَا), আর ক্রিয়ার তৃতীয় হরফে পেশ থাকলে পেশ। আগের শব্দ থেকে জুড়ে পড়লে এটি একেবারেই উচ্চারিত হয় না।' },
    how: [
      { en: 'Joining: read the previous word and the next without the hamza (bismillāh ir-raḥmān, not bismillāhi ʾar-raḥmān).', bn: 'জুড়ে পড়লে: হামযা ছাড়া আগের ও পরের শব্দ একসঙ্গে পড়ুন।' },
      { en: 'Starting: give it the right opening vowel (fatha in “al-”, kasra or damma in verbs and nouns).', bn: 'শুরুতে: সঠিক হরকত দিন (“আল-”-এ যবর; ইসম ও ফে’লে যের বা পেশ)।' },
    ],
    mistakes: [
      { en: 'Pronouncing the hamza in the middle of a continuous recitation.', bn: 'ধারাবাহিক তিলাওয়াতের মাঝখানে হামযা উচ্চারণ করা।' },
      { en: 'Starting a verb with the wrong vowel.', bn: 'ক্রিয়ার শুরুতে ভুল হরকত দেওয়া।' },
    ],
    faqs: [
      { q: { en: 'What is the difference between hamzatul wasl and hamzatul qat‘?', bn: 'হামযাতুল ওয়াসল ও হামযাতুল ক্বাত’র পার্থক্য কী?' }, a: { en: 'Hamzatul qat‘ (ء أ إ) is always pronounced; hamzatul wasl (ٱ) is pronounced only at the start.', bn: 'হামযাতুল ক্বাত’ (ء أ إ) সবসময় উচ্চারিত হয়; হামযাতুল ওয়াসল (ٱ) শুধু শুরুতে।' } },
      { q: { en: 'How is it coloured in the app?', bn: 'অ্যাপে এর রং কী?' }, a: { en: 'Grey, as a silent letter when joined.', bn: 'ধূসর; জুড়ে পড়লে নিঃশব্দ হরফ হিসেবে।' } },
    ],
    related: ['lam-shamsiyyah-qamariyyah', 'waqf-signs', 'madd-natural'],
  },
  {
    slug: 'tafkheem-tarqeeq', group: 'letters', ar: 'التَّفْخِيم وَالتَّرْقِيق', cls: 'tafkheem',
    name: { en: 'Tafkheem & tarqeeq (heavy and light letters)', bn: 'তাফখীম ও তারকীক (মোটা ও চিকন উচ্চারণ)', ar: 'التفخيم والترقيق' },
    summary: { en: 'Some letters are always heavy (خ ص ض غ ط ق ظ); ra and the lam of Allah are heavy after fatha or damma and light after kasra.', bn: 'কিছু হরফ সবসময় মোটা (خ ص ض غ ط ق ظ); রা ও আল্লাহ শব্দের লাম যবর বা পেশের পরে মোটা এবং যেরের পরে চিকন হয়।' },
    definition: { en: 'Tafkheem (“thickening”) fills the mouth with a deep, full sound; tarqeeq (“thinning”) keeps it light. Seven letters (خ ص ض غ ط ق ظ) are always heavy. The ra and the lam of the name Allah change: the lam of Allah is heavy after a fatha or damma (قَالَ ٱللَّهُ) and light after a kasra (بِسْمِ ٱللَّهِ); a ra carrying a fatha or damma is heavy, a ra carrying a kasra is light. Further cases of a sakin ra depend on the letters around it and are best learned with a teacher.', bn: 'তাফখীম (“মোটা করা”) মুখ ভরে গভীর আওয়াজ আনে; তারকীক (“চিকন করা”) আওয়াজ হালকা রাখে। সাতটি হরফ (خ ص ض غ ط ق ظ) সবসময় মোটা। রা ও আল্লাহ শব্দের লাম বদলায়: আল্লাহর লাম যবর বা পেশের পরে মোটা (قَالَ ٱللَّهُ) এবং যেরের পরে চিকন (بِسْمِ ٱللَّهِ); যবর বা পেশযুক্ত রা মোটা, যেরযুক্ত রা চিকন। সাকিন রা-এর আরও কিছু অবস্থা আশপাশের হরফের ওপর নির্ভর করে; উস্তাদের কাছে শেখাই ভালো।' },
    letters: { ar: ['خ', 'ص', 'ض', 'غ', 'ط', 'ق', 'ظ'], note: { en: 'The seven always-heavy letters, remembered as خُصَّ ضَغْطٍ قِظْ.', bn: 'সবসময় মোটা সাতটি হরফ; সূত্র: خُصَّ ضَغْطٍ قِظْ।' } },
    how: [
      { en: 'Heavy: raise the back of the tongue toward the palate so the sound is full and round.', bn: 'মোটা: জিহ্বার পেছনের অংশ তালুর দিকে তুলুন, যাতে আওয়াজ ভরাট ও গোল হয়।' },
      { en: 'Light: keep the tongue low and the sound thin and clear.', bn: 'চিকন: জিহ্বা নিচু রেখে আওয়াজ পাতলা ও পরিষ্কার রাখুন।' },
      { en: 'Check the vowel before the lam of Allah, then decide: fatha or damma = heavy, kasra = light.', bn: 'আল্লাহর লামের আগের হরকত দেখুন: যবর বা পেশ হলে মোটা, যের হলে চিকন।' },
    ],
    mistakes: [
      { en: 'Making the lam of Allah heavy after a kasra, or light after a fatha.', bn: 'যেরের পরে আল্লাহর লাম মোটা বা যবরের পরে চিকন করা।' },
      { en: 'Thinning ق or ط to “k” or “t”.', bn: 'ق বা ط-কে “ক” বা “ত”-এর মতো চিকন করে ফেলা।' },
    ],
    faqs: [
      { q: { en: 'When is the lam of Allah heavy?', bn: 'আল্লাহর লাম কখন মোটা?' }, a: { en: 'After a fatha or damma (for example وَٱللَّهُ, قَالَ ٱللَّهُ). It is light after a kasra (بِٱللَّهِ).', bn: 'যবর বা পেশের পরে (যেমন وَٱللَّهُ, قَالَ ٱللَّهُ)। যেরের পরে (بِٱللَّهِ) চিকন।' } },
      { q: { en: 'Are the examples coloured?', bn: 'উদাহরণ কি রঙিন?' }, a: { en: 'Quran.com’s colour data has no class for this, so heavy cases are shown in orange and light cases in blue on these pages.', bn: 'Quran.com-এর রঙের তথ্যে এর কোনো ক্লাস নেই; তাই এই পাতায় মোটা অবস্থা কমলা এবং চিকন অবস্থা নীল রঙে দেখানো হয়েছে।' } },
    ],
    related: ['qalqalah', 'lam-shamsiyyah-qamariyyah', 'hamzatul-wasl'],
    groups: {
      'lam-heavy': { en: 'Lam of Allah: heavy (after fatha or damma)', bn: 'আল্লাহর লাম: মোটা (যবর বা পেশের পরে)' },
      'lam-light': { en: 'Lam of Allah: light (after kasra)', bn: 'আল্লাহর লাম: চিকন (যেরের পরে)' },
      'ra-heavy': { en: 'Ra: heavy (with fatha or damma)', bn: 'রা: মোটা (যবর বা পেশযুক্ত)' },
      'ra-light': { en: 'Ra: light (with kasra)', bn: 'রা: চিকন (যেরযুক্ত)' },
    },
  },
  {
    slug: 'waqf-signs', group: 'stopping', ar: 'عَلَامَات الْوَقْف', cls: 'waqf',
    name: { en: 'Waqf signs (stopping marks)', bn: 'ওয়াকফের চিহ্ন (থামার চিহ্ন)', ar: 'علامات الوقف' },
    summary: { en: 'Small signs above the line in the mushaf show where to stop, where to continue and where a stop is not allowed.', bn: 'মুসহাফে লাইনের ওপরের ছোট চিহ্নগুলো বলে দেয় কোথায় থামতে হবে, কোথায় চালিয়ে যেতে হবে এবং কোথায় থামা চলবে না।' },
    definition: { en: 'Waqf (“stopping”) is pausing to take a breath at a place where the meaning is complete enough. The Madani mushaf marks the places with the signs below. They guide you but do not replace a teacher; the signs used in South-Asian mushafs differ a little.', bn: 'ওয়াকফ মানে অর্থ যথেষ্ট পূর্ণ হওয়া জায়গায় শ্বাস নেওয়ার জন্য থামা। মাদানী মুসহাফে নিচের চিহ্নগুলো দিয়ে সেই জায়গাগুলো চিহ্নিত থাকে। এগুলো পথ দেখায়, উস্তাদের বিকল্প নয়; উপমহাদেশের মুসহাফে চিহ্নে কিছু পার্থক্য আছে।' },
    how: [
      { en: 'Learn the seven signs in the table and find them in the examples below.', bn: 'নিচের তালিকার সাতটি চিহ্ন শিখুন এবং উদাহরণে খুঁজে দেখুন।' },
      { en: 'At every ayah end you may stop; when you stop, a vowel becomes sukun (with the usual rules for ta marbuta, tanween and madd).', bn: 'প্রতিটি আয়াতের শেষে থামা যায়; থামলে শেষ হরকত সুকুনে পরিণত হয় (তা মারবূতা, তানবীন ও মাদ্দের নিয়মসহ)।' },
      { en: 'If you must stop at a place where stopping is not preferred, go back a few words when you resume.', bn: 'যেখানে থামা পছন্দনীয় নয় সেখানে থামতে বাধ্য হলে আবার শুরুর সময় কয়েকটি শব্দ পেছন থেকে শুরু করুন।' },
    ],
    mistakes: [
      { en: 'Stopping in the middle of a phrase because the breath ran out, without going back when you resume.', bn: 'শ্বাস ফুরিয়ে বাক্যের মাঝে থেমে আবার শুরুর সময় পেছন থেকে না ধরা।' },
      { en: 'Ignoring the stops at the signs and reading through a long passage without a breath.', bn: 'চিহ্ন উপেক্ষা করে লম্বা অংশ শ্বাস না নিয়ে পড়ে যাওয়া।' },
    ],
    faqs: [
      { q: { en: 'What does the sign ۘ mean?', bn: 'ۘ চিহ্নের অর্থ কী?' }, a: { en: 'It is the meem of waqf lazim: stopping is necessary here so that the meaning is not confused.', bn: 'এটি ওয়াকফ লাযিমের মীম: অর্থ যেন গুলিয়ে না যায় তাই এখানে থামা জরুরি।' } },
      { q: { en: 'What does the sign ۙ mean?', bn: 'ۙ চিহ্নের অর্থ কী?' }, a: { en: 'It stands for “la” (do not stop here), unless it comes at the end of an ayah.', bn: 'এটি “লা” (এখানে থামবেন না); তবে আয়াতের শেষে থাকলে থামা যায়।' } },
    ],
    related: ['hamzatul-wasl', 'madd-arid', 'qalqalah'],
    groups: {
      lazim: { en: 'ۘ Waqf lazim: stopping is necessary', bn: 'ۘ ওয়াকফ লাযিম: থামা জরুরি' },
      sila: { en: 'ۖ Continuing is preferred', bn: 'ۖ মিলিয়ে পড়া উত্তম' },
      qila: { en: 'ۗ Stopping is preferred', bn: 'ۗ থামা উত্তম' },
      jaiz: { en: 'ۚ Stopping or continuing are both permitted', bn: 'ۚ থামা বা না থামা দুটিই জায়েজ' },
      muanaqah: { en: 'ۛ Stop at one of the two marked places (mu‘anaqah)', bn: 'ۛ দুই চিহ্নের যেকোনো একটিতে থামুন (মুআনাকা)' },
      la: { en: 'ۙ Do not stop here', bn: 'ۙ এখানে থামবেন না' },
      saktah: { en: 'ۜ Saktah: a brief pause without breath', bn: 'ۜ সাকতা: শ্বাস না ছেড়ে সামান্য বিরতি' },
    },
  },
]

export const tajweedBySlug = (slug: string) => tajweedRules.find((r) => r.slug === slug)
