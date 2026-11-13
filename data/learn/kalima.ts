import type { L } from './types'

/**
 * The six kalimas as taught in South Asia. The numbering and grouping is a teaching convention (not a list found as such in the
 * Quran or hadith); the phrases themselves come from the Quran and hadith. `quran` refs are rendered from the corpus,
 * `hadith` ids point to data/learn/hadith-sources.ts (checked against the hadith corpus by scripts/verify-learn-sources.mjs),
 * `dua` slugs link to verified dua pages. Anything without a verified source is labelled "commonly taught".
 */
export interface Kalima {
  n: number
  slug: string
  name: { ar: string; en: string; bn: string }
  /** What the name means */
  nameMeaning: L
  ar: string
  /** Bangla uccharon (pronunciation) */
  bn: string
  /** English transliteration */
  tl: string
  meaning: L
  /** Where the wording comes from */
  note: L
  quran?: string[]
  hadith?: string[]
  dua?: string[]
  /** true: the full wording is a widely taught form without a single verified source for the whole text */
  commonlyTaught: boolean
}

export const kalimas: Kalima[] = [
  {
    n: 1, slug: 'tayyibah', name: { ar: 'كَلِمَة طَيِّبَة', en: 'Kalima Tayyibah', bn: 'কালিমা তাইয়্যিবা' }, nameMeaning: { en: 'The word of purity', bn: 'পবিত্র বাক্য' },
    ar: 'لَا إِلٰهَ إِلَّا اللّٰهُ مُحَمَّدٌ رَسُولُ اللّٰهِ',
    bn: 'লা ইলাহা ইল্লাল্লাহু মুহাম্মাদুর রাসূলুল্লাহ',
    tl: 'La ilaha illallahu Muhammadur rasulullah',
    meaning: { en: 'There is no god but Allah; Muhammad ﷺ is the Messenger of Allah.', bn: 'আল্লাহ ছাড়া কোনো ইলাহ (উপাস্য) নেই; মুহাম্মদ ﷺ আল্লাহর রাসূল।' },
    note: { en: 'The two halves are found in the Quran: “know that there is no deity except Allah” (47:19) and “Muhammad is the Messenger of Allah” (48:29). Together they form the declaration of faith.', bn: 'দুই অংশই কুরআনে আছে: “জেনে রাখো, আল্লাহ ছাড়া কোনো ইলাহ নেই” (৪৭:১৯) এবং “মুহাম্মদ আল্লাহর রাসূল” (৪৮:২৯)। একসঙ্গে এটি ঈমানের ঘোষণা।' },
    quran: ['47:19', '48:29'], commonlyTaught: false,
  },
  {
    n: 2, slug: 'shahadah', name: { ar: 'كَلِمَة شَهَادَة', en: 'Kalima Shahadah', bn: 'কালিমা শাহাদাত' }, nameMeaning: { en: 'The word of testimony', bn: 'সাক্ষ্যের বাক্য' },
    ar: 'أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    bn: 'আশহাদু আল্লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারীকা লাহু, ওয়া আশহাদু আন্না মুহাম্মাদান আবদুহু ওয়া রাসূলুহু',
    tl: 'Ashhadu an la ilaha illallahu wahdahu la sharika lah, wa ashhadu anna Muhammadan ‘abduhu wa rasuluh',
    meaning: { en: 'I bear witness that there is no god but Allah alone, with no partner, and I bear witness that Muhammad ﷺ is His servant and messenger.', bn: 'আমি সাক্ষ্য দিচ্ছি, আল্লাহ ছাড়া কোনো ইলাহ নেই; তিনি একক, তাঁর কোনো শরিক নেই। আর আমি সাক্ষ্য দিচ্ছি, মুহাম্মদ ﷺ তাঁর বান্দা ও রাসূল।' },
    note: { en: 'This is the wording of the testimony recited after wudu (Sahih Muslim 234). The testimony of faith is the first of the five pillars of Islam in the hadith of Ibn ‘Umar (Sahih al-Bukhari 8).', bn: 'এটি ওযুর পরে পড়া সাক্ষ্যের শব্দ (সহীহ মুসলিম ২৩৪)। ইবনে উমর (রা.)-এর হাদিসে ইসলামের পাঁচ স্তম্ভের প্রথমটি এই সাক্ষ্য (সহীহ বুখারী ৮)।' },
    hadith: ['bukhari-8'], dua: ['dua-after-wudu'], commonlyTaught: false,
  },
  {
    n: 3, slug: 'tamjeed', name: { ar: 'كَلِمَة تَمْجِيد', en: 'Kalima Tamjeed', bn: 'কালিমা তামজীদ' }, nameMeaning: { en: 'The word of glorification', bn: 'মহিমা ঘোষণার বাক্য' },
    ar: 'سُبْحَانَ اللّٰهِ وَالْحَمْدُ لِلّٰهِ وَلَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ الْعَلِيِّ الْعَظِيمِ',
    bn: 'সুবহানাল্লাহি ওয়াল হামদুলিল্লাহি ওয়া লা ইলাহা ইল্লাল্লাহু ওয়াল্লাহু আকবার, ওয়া লা হাওলা ওয়া লা কুওওয়াতা ইল্লা বিল্লাহিল আলিয়্যিল আযীম',
    tl: 'Subhanallahi walhamdulillahi wa la ilaha illallahu wallahu akbar, wa la hawla wa la quwwata illa billahil ‘aliyyil ‘azim',
    meaning: { en: 'Glory be to Allah, all praise is for Allah, there is no god but Allah, Allah is the Greatest; there is no power and no strength except with Allah, the Most High, the Mighty.', bn: 'আল্লাহ পবিত্র, সকল প্রশংসা আল্লাহর, আল্লাহ ছাড়া কোনো ইলাহ নেই, আল্লাহ সর্বমহান; মহান ও সর্বোচ্চ আল্লাহর সাহায্য ছাড়া কোনো উপায় ও শক্তি নেই।' },
    note: { en: 'The four phrases “SubhanAllah, Alhamdulillah, La ilaha illallah, Allahu akbar” are reported together in Sahih Muslim 2137, and “La hawla wa la quwwata illa billah” is described as a treasure of Paradise in Sahih al-Bukhari 4205. Joining them in this single form is the commonly taught wording.', bn: '“সুবহানাল্লাহ, আলহামদুলিল্লাহ, লা ইলাহা ইল্লাল্লাহ, আল্লাহু আকবার” চারটি বাক্য একসঙ্গে সহীহ মুসলিম ২১৩৭-এ এসেছে, আর “লা হাওলা ওয়া লা কুওওয়াতা ইল্লা বিল্লাহ”-কে জান্নাতের ধনভান্ডার বলা হয়েছে (সহীহ বুখারী ৪২০৫)। এই একত্র রূপটি প্রচলিতভাবে শেখানো হয়।' },
    hadith: ['muslim-2137', 'bukhari-4205'], dua: ['dua-after-salah-tasbih'], commonlyTaught: true,
  },
  {
    n: 4, slug: 'tawheed', name: { ar: 'كَلِمَة تَوْحِيد', en: 'Kalima Tawheed', bn: 'কালিমা তাওহীদ' }, nameMeaning: { en: 'The word of oneness', bn: 'একত্ববাদের বাক্য' },
    ar: 'لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ أَبَدًا أَبَدًا ذُو الْجَلَالِ وَالْإِكْرَامِ بِيَدِهِ الْخَيْرُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    bn: 'লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারীকা লাহু, লাহুল মুলকু ওয়া লাহুল হামদু, ইউহয়ী ওয়া ইউমীতু ওয়া হুওয়া হাইয়ুল লা ইয়ামূতু আবাদান আবাদা, যুল জালালি ওয়াল ইকরাম, বিয়াদিহিল খাইর, ওয়া হুওয়া আলা কুল্লি শাইয়িন কাদীর',
    tl: 'La ilaha illallahu wahdahu la sharika lah, lahul mulku wa lahul hamd, yuhyi wa yumit, wa huwa hayyun la yamutu abadan abada, dhul jalali wal ikram, biyadihil khayr, wa huwa ‘ala kulli shay’in qadir',
    meaning: { en: 'There is no god but Allah alone, with no partner. His is the dominion and His is the praise. He gives life and causes death, and He is Ever-Living and never dies, forever. Possessor of majesty and honour. In His hand is all good, and He has power over everything.', bn: 'আল্লাহ ছাড়া কোনো ইলাহ নেই; তিনি একক, তাঁর কোনো শরিক নেই। রাজত্ব তাঁরই, প্রশংসা তাঁরই। তিনি জীবন দেন ও মৃত্যু ঘটান; তিনি চিরঞ্জীব, কখনো মৃত্যুবরণ করেন না। মহিমা ও সম্মানের অধিকারী। কল্যাণ তাঁরই হাতে, আর তিনি সবকিছুর ওপর ক্ষমতাবান।' },
    note: { en: 'The opening “La ilaha illallahu wahdahu la sharika lahu, lahul mulku wa lahul hamdu wa huwa ‘ala kulli shay’in qadir” is reported in Sahih al-Bukhari 844 (the dhikr after salah). The longer form with “yuhyi wa yumit…” is the commonly taught wording of this kalima.', bn: 'শুরুর অংশ “লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারীকা লাহু, লাহুল মুলকু ওয়া লাহুল হামদু ওয়া হুওয়া আলা কুল্লি শাইয়িন কাদীর” সহীহ বুখারী ৮৪৪-এ (নামাজের পরের যিকির) এসেছে। “ইউহয়ী ওয়া ইউমীতু…”সহ দীর্ঘ রূপটি এই কালিমার প্রচলিত শিক্ষা।' },
    hadith: ['bukhari-844'], commonlyTaught: true,
  },
  {
    n: 5, slug: 'astaghfar', name: { ar: 'كَلِمَة اسْتِغْفَار', en: 'Kalima Astaghfar', bn: 'কালিমা ইস্তিগফার' }, nameMeaning: { en: 'The word of seeking forgiveness', bn: 'ক্ষমা প্রার্থনার বাক্য' },
    ar: 'أَسْتَغْفِرُ اللّٰهَ رَبِّي مِنْ كُلِّ ذَنْبٍ أَذْنَبْتُهُ عَمَدًا أَوْ خَطَأً سِرًّا أَوْ عَلَانِيَةً وَأَتُوبُ إِلَيْهِ مِنَ الذَّنْبِ الَّذِي أَعْلَمُ وَمِنَ الذَّنْبِ الَّذِي لَا أَعْلَمُ إِنَّكَ أَنْتَ عَلَّامُ الْغُيُوبِ وَسَتَّارُ الْعُيُوبِ وَغَفَّارُ الذُّنُوبِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ الْعَلِيِّ الْعَظِيمِ',
    bn: 'আস্তাগফিরুল্লাহা রাব্বী মিন কুল্লি যাম্বিন আযনাবতুহু আমাদান আও খাতাআন, সিররান আও আলানিয়াতান, ওয়া আতূবু ইলাইহি মিনায যাম্বিল্লাযী আ‘লামু ওয়া মিনায যাম্বিল্লাযী লা আ‘লামু, ইন্নাকা আনতা আল্লামুল গুয়ূবি ওয়া সাত্তারুল উয়ূবি ওয়া গাফ্ফারুয যুনূব, ওয়া লা হাওলা ওয়া লা কুওওয়াতা ইল্লা বিল্লাহিল আলিয়্যিল আযীম',
    tl: 'Astaghfirullaha rabbi min kulli dhanbin adhnabtuhu ‘amadan aw khata’an, sirran aw ‘alaniyah, wa atubu ilayhi minadh-dhanbil-ladhi a‘lamu wa minadh-dhanbil-ladhi la a‘lam, innaka anta ‘allamul ghuyub, wa sattarul ‘uyub, wa ghaffarudh-dhunub, wa la hawla wa la quwwata illa billahil ‘aliyyil ‘azim',
    meaning: { en: 'I seek forgiveness from Allah, my Lord, for every sin I committed knowingly or by mistake, secretly or openly, and I turn to Him in repentance from the sin I know and the sin I do not know. You are the Knower of the unseen, the Concealer of faults and the Forgiver of sins. There is no power and no strength except with Allah, the Most High, the Mighty.', bn: 'আমি আমার রব আল্লাহর কাছে ক্ষমা চাই প্রতিটি গুনাহর জন্য যা আমি জেনে বা ভুলে, গোপনে বা প্রকাশ্যে করেছি; এবং আমি তাঁর কাছে তাওবা করি সেই গুনাহ থেকে যা আমি জানি এবং যা জানি না। নিশ্চয় আপনি গায়েবের জ্ঞানী, দোষ গোপনকারী ও গুনাহ ক্ষমাকারী। মহান ও সর্বোচ্চ আল্লাহর সাহায্য ছাড়া কোনো উপায় ও শক্তি নেই।' },
    note: { en: 'Commonly taught wording. The practice of saying “Astaghfirullah” after salah is reported in Sahih Muslim 591, and for the most excellent form of istighfar see Sayyidul Istighfar.', bn: 'প্রচলিতভাবে শেখানো শব্দ। নামাজের পর “আস্তাগফিরুল্লাহ” বলার কথা সহীহ মুসলিম ৫৯১-এ আছে; ইস্তিগফারের শ্রেষ্ঠ রূপের জন্য সাইয়্যিদুল ইস্তিগফার দেখুন।' },
    dua: ['dua-after-salah-allahumma-antas-salam', 'sayyidul-istighfar'], commonlyTaught: true,
  },
  {
    n: 6, slug: 'radd-e-kufr', name: { ar: 'كَلِمَة رَدِّ كُفْر', en: 'Kalima Radd-e-Kufr', bn: 'কালিমা রদ্দে কুফর' }, nameMeaning: { en: 'The word of rejecting disbelief', bn: 'কুফর প্রত্যাখ্যানের বাক্য' },
    ar: 'اللّٰهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ أَنْ أُشْرِكَ بِكَ شَيْئًا وَأَنَا أَعْلَمُ بِهِ وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ بِهِ تُبْتُ عَنْهُ وَتَبَرَّأْتُ مِنَ الْكُفْرِ وَالشِّرْكِ وَالْكِذْبِ وَالْغِيبَةِ وَالْبِدْعَةِ وَالنَّمِيمَةِ وَالْفَوَاحِشِ وَالْبُهْتَانِ وَالْمَعَاصِي كُلِّهَا وَأَسْلَمْتُ وَأَقُولُ لَا إِلٰهَ إِلَّا اللّٰهُ مُحَمَّدٌ رَسُولُ اللّٰهِ',
    bn: 'আল্লাহুম্মা ইন্নী আউযু বিকা মিন আন উশরিকা বিকা শাইআন ওয়া আনা আ‘লামু বিহী, ওয়া আস্তাগফিরুকা লিমা লা আ‘লামু বিহী, তুবতু আনহু ওয়া তাবাররা’তু মিনাল কুফরি ওয়াশ শিরকি ওয়াল কিযবি ওয়াল গীবাতি ওয়াল বিদ‘আতি ওয়ান নামীমাতি ওয়াল ফাওয়াহিশি ওয়াল বুহতানি ওয়াল মা‘আসী কুল্লিহা, ওয়া আসলামতু ওয়া আকূলু লা ইলাহা ইল্লাল্লাহু মুহাম্মাদুর রাসূলুল্লাহ',
    tl: 'Allahumma inni a‘udhu bika min an ushrika bika shay’an wa ana a‘lamu bih, wa astaghfiruka lima la a‘lamu bih, tubtu ‘anhu wa tabarra’tu minal kufri wash-shirki wal kidhbi wal ghibati wal bid‘ati wan-namimati wal fawahishi wal buhtani wal ma‘asi kulliha, wa aslamtu wa aqulu la ilaha illallahu Muhammadur rasulullah',
    meaning: { en: 'O Allah, I seek refuge in You from knowingly associating anything with You, and I ask Your forgiveness for what I do not know. I repent from it, and I free myself from disbelief, associating partners with Allah, lying, backbiting, innovation, slander, indecencies, false accusation and all disobedience. I submit, and I say: there is no god but Allah, Muhammad is the Messenger of Allah.', bn: 'হে আল্লাহ, আমি জেনেশুনে আপনার সঙ্গে কাউকে শরিক করা থেকে আপনার কাছে আশ্রয় চাই এবং যা জানি না তার জন্য ক্ষমা চাই। আমি তা থেকে তাওবা করছি এবং কুফর, শিরক, মিথ্যা, গীবত, বিদআত, চোগলখুরি, অশ্লীলতা, অপবাদ ও সব গুনাহ থেকে নিজেকে মুক্ত করছি। আমি ইসলাম গ্রহণ করলাম এবং বলছি: আল্লাহ ছাড়া কোনো ইলাহ নেই, মুহাম্মদ আল্লাহর রাসূল।' },
    note: { en: 'Commonly taught wording; this page does not trace it to a single authenticated hadith. Its themes (seeking refuge from shirk, repentance and affirming the shahadah) are those of the Quran and Sunnah.', bn: 'প্রচলিতভাবে শেখানো শব্দ; এই পাতা একে কোনো একটি সহীহ হাদিসের সঙ্গে যুক্ত করে না। এর বিষয়বস্তু (শিরক থেকে আশ্রয়, তাওবা ও শাহাদাত স্বীকার) কুরআন ও সুন্নাহর শিক্ষারই প্রতিধ্বনি।' },
    commonlyTaught: true,
  },
]
