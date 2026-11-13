// Hadith cited on the Islamic-events pages. No imports: read directly by Node in scripts/verify-hadith-sources.mjs,
// which checks each entry's Arabic keyword (`kw`, compared after normalisation) against the open hadith corpus
// (fawazahmed0/hadith-api) at exactly that number. Numbering = the commonly cited one (Muslim: Fu'ad 'Abd al-Baqi).
export interface EventHadith {
  id: string
  c: 'bukhari' | 'muslim' | 'tirmidhi' | 'nasai'
  n: number
  /** Arabic phrase that must occur in the hadith (verified by the script) */
  kw: string
  /** Faithful short summary — not a verbatim quote */
  en: string
  bn: string
  ar: string
}

export const EVENT_HADITH: Record<string, EventHadith> = {
  sighting: {
    id: 'sighting', c: 'bukhari', n: 1909, kw: 'صوموا لرؤيته وافطروا لرؤيته',
    en: 'The Prophet ﷺ said: “Start fasting on seeing the crescent and give up fasting on seeing the crescent; if it is overcast, complete thirty days of Sha’ban.”',
    bn: 'নবী ﷺ বলেছেন: “চাঁদ দেখে রোজা শুরু করো এবং চাঁদ দেখে রোজা ভাঙো; আকাশ মেঘলা থাকলে শা’বানের ত্রিশ দিন পূর্ণ করো।”',
    ar: 'قال النبي ﷺ: «صوموا لرؤيته وأفطروا لرؤيته، فإن غُبِّي عليكم فأكملوا عدة شعبان ثلاثين».',
  },
  oddNights: {
    id: 'oddNights', c: 'bukhari', n: 2017, kw: 'تحروا ليله القدر في الوتر من العشر الاواخر من رمضان',
    en: 'The Prophet ﷺ said: “Search for the Night of Qadr in the odd nights of the last ten days of Ramadan.”',
    bn: 'নবী ﷺ বলেছেন: “রমজানের শেষ দশকের বেজোড় রাতগুলোতে লাইলাতুল কদর খোঁজো।”',
    ar: 'قال النبي ﷺ: «تحرَّوا ليلة القدر في الوتر من العشر الأواخر من رمضان».',
  },
  arafahFast: {
    id: 'arafahFast', c: 'muslim', n: 1162, kw: 'يكفر السنه الماضيه والباقيه',
    en: 'Asked about fasting the day of Arafah, the Prophet ﷺ said it expiates the sins of the previous year and the coming year; fasting Ashura expiates the previous year.',
    bn: 'আরাফার দিনের রোজা সম্পর্কে জিজ্ঞাসা করা হলে নবী ﷺ বলেন, এটি আগের এক বছর ও পরের এক বছরের গুনাহের কাফফারা হয়; আর আশুরার রোজা আগের এক বছরের গুনাহের কাফফারা।',
    ar: 'سُئل النبي ﷺ عن صيام يوم عرفة فقال: «يكفِّر السنة الماضية والباقية»، وعن صيام عاشوراء: «يكفِّر السنة الماضية».',
  },
  ashuraMusa: {
    id: 'ashuraMusa', c: 'bukhari', n: 2004, kw: 'نحن احق بموسي',
    en: 'Ibn Abbas reported that the Prophet ﷺ found the Jews of Madinah fasting on Ashura, the day Allah saved the Children of Israel; he said “We have more claim over Musa than you”, fasted it and ordered the Muslims to fast it.',
    bn: 'ইবনে আব্বাস (রা.) বর্ণনা করেন, নবী ﷺ মদিনায় ইহুদিদের আশুরার দিন রোজা রাখতে দেখেন — এটি সেই দিন যেদিন আল্লাহ বনী ইসরাঈলকে রক্ষা করেছিলেন। তিনি বলেন, “মূসার ব্যাপারে তোমাদের চেয়ে আমরাই অধিক হকদার”; তিনি নিজে রোজা রাখেন এবং মুসলিমদের রোজা রাখতে বলেন।',
    ar: 'عن ابن عباس أن النبي ﷺ قدم المدينة فرأى اليهود تصوم عاشوراء، فقال: «نحن أحق بموسى منكم» فصامه وأمر بصيامه.',
  },
  ashuraNinth: {
    id: 'ashuraNinth', c: 'muslim', n: 1134, kw: 'لئن بقيت الي قابل لاصومن التاسع',
    en: 'Ibn Abbas reported that the Prophet ﷺ said: “If I live until next year, I will certainly fast on the ninth.”',
    bn: 'ইবনে আব্বাস (রা.) বর্ণনা করেন, নবী ﷺ বলেছেন: “আগামী বছর বেঁচে থাকলে আমি অবশ্যই নবম তারিখেও রোজা রাখব।”',
    ar: 'عن ابن عباس أن النبي ﷺ قال: «لئن بقيتُ إلى قابل لأصومنَّ التاسع».',
  },
  muharramFast: {
    id: 'muharramFast', c: 'muslim', n: 1163, kw: 'شهر الله المحرم',
    en: 'Abu Hurayrah reported that the Prophet ﷺ said: “The most excellent fast after Ramadan is Allah’s month, al-Muharram.”',
    bn: 'আবু হুরায়রা (রা.) বর্ণনা করেন, নবী ﷺ বলেছেন: “রমজানের পর সর্বোত্তম রোজা আল্লাহর মাস মুহাররমের রোজা।”',
    ar: 'عن أبي هريرة عن النبي ﷺ: «أفضل الصيام بعد رمضان شهر الله المحرم».',
  },
  whiteDays: {
    id: 'whiteDays', c: 'tirmidhi', n: 761, kw: 'ثلاث عشره واربع عشره وخمس عشره',
    en: 'Abu Dharr reported that the Prophet ﷺ said: “O Abu Dharr, when you fast three days of the month, fast the thirteenth, fourteenth and fifteenth.”',
    bn: 'আবু যার (রা.) বর্ণনা করেন, নবী ﷺ বলেছেন: “হে আবু যার, মাসে তিন দিন রোজা রাখলে ১৩, ১৪ ও ১৫ তারিখে রাখো।”',
    ar: 'عن أبي ذر قال: قال رسول الله ﷺ: «يا أبا ذر إذا صمت من الشهر ثلاثة أيام فصم ثلاث عشرة وأربع عشرة وخمس عشرة».',
  },
  threeDays: {
    id: 'threeDays', c: 'bukhari', n: 1981, kw: 'ثلاثه ايام من كل شهر',
    en: 'Abu Hurayrah reported that his friend, the Prophet ﷺ, advised him to fast three days every month.',
    bn: 'আবু হুরায়রা (রা.) বলেন, তাঁর বন্ধু নবী ﷺ তাঁকে প্রতি মাসে তিন দিন রোজা রাখার উপদেশ দিয়েছেন।',
    ar: 'عن أبي هريرة قال: أوصاني خليلي ﷺ بصيام ثلاثة أيام من كل شهر.',
  },
  eidNoFast: {
    id: 'eidNoFast', c: 'muslim', n: 1138, kw: 'يوم الفطر ويوم الاضحي',
    en: 'The Prophet ﷺ forbade fasting on the day of Eid al-Fitr and the day of Eid al-Adha.',
    bn: 'নবী ﷺ ঈদুল ফিতর ও ঈদুল আজহার দিনে রোজা রাখতে নিষেধ করেছেন।',
    ar: 'نهى النبي ﷺ عن صيام يوم الفطر ويوم الأضحى.',
  },
  tashreeq: {
    id: 'tashreeq', c: 'muslim', n: 1141, kw: 'ايام التشريق ايام اكل وشرب',
    en: 'The Prophet ﷺ said: “The days of Tashreeq are days of eating and drinking.” (the three days after Eid al-Adha, 11–13 Dhu al-Hijjah)',
    bn: 'নবী ﷺ বলেছেন: “আইয়ামে তাশরীক পানাহারের দিন।” (ঈদুল আজহার পরের তিন দিন, ১১–১৩ জিলহজ)',
    ar: 'قال النبي ﷺ: «أيام التشريق أيام أكل وشرب» (١١–١٣ ذو الحجة).',
  },
}
