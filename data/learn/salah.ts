import type { L } from './types'

/**
 * Salah (prayer) as practised in the Hanafi school (the common practice in Bangladesh), with notes where the schools differ.
 * Quran recitations (Fatiha, short surahs, 2:201) are rendered from the corpus; verified duas are linked to /dua/{slug};
 * `hadith` ids refer to data/learn/hadith-sources.ts (checked by scripts/verify-learn-sources.mjs).
 */
export interface Recitation {
  id: string
  title: L
  ar: string
  /** Bangla uccharon */
  bn: string
  /** English transliteration */
  tl: string
  meaning: L
  /** how many times, if relevant */
  times?: L
  hadith?: string[]
  dua?: string
  /** commonly recited, without a single verified source cited here */
  commonlyRecited?: boolean
}

export const recitations: Recitation[] = [
  { id: 'takbir', title: { en: 'Takbir', bn: 'তাকবীর', ar: 'التكبير' }, ar: 'اللّٰهُ أَكْبَرُ', bn: 'আল্লাহু আকবার', tl: 'Allahu akbar', meaning: { en: 'Allah is the Greatest.', bn: 'আল্লাহ সর্বমহান।' }, hadith: ['bukhari-757'] },
  { id: 'sana', title: { en: 'Thana (Sana)', bn: 'সানা', ar: 'دعاء الاستفتاح' }, ar: 'سُبْحَانَكَ اللّٰهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَىٰ جَدُّكَ وَلَا إِلٰهَ غَيْرُكَ', bn: 'সুবহানাকাল্লাহুম্মা ওয়া বিহামদিকা ওয়া তাবারাকাসমুকা ওয়া তা‘আলা জাদ্দুকা ওয়া লা ইলাহা গাইরুকা', tl: 'Subhanakal-lahumma wa bihamdika wa tabarakasmuka wa ta‘ala jadduka wa la ilaha ghayruk',
    meaning: { en: 'Glory and praise be to You, O Allah; blessed is Your name, exalted is Your majesty, and there is no god but You.', bn: 'হে আল্লাহ, আপনি পবিত্র, আপনার প্রশংসাসহ; আপনার নাম বরকতময়, আপনার মর্যাদা সুউচ্চ এবং আপনি ছাড়া কোনো ইলাহ নেই।' }, hadith: ['abudawud-775'] },
  { id: 'taawwudh', title: { en: 'Ta‘awwudh', bn: 'আউযুবিল্লাহ', ar: 'التعوّذ' }, ar: 'أَعُوذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', bn: 'আউযুবিল্লাহি মিনাশ শাইতানির রাজীম', tl: 'A‘udhu billahi minash-shaytanir-rajim', meaning: { en: 'I seek refuge in Allah from the accursed Shaytan.', bn: 'আমি বিতাড়িত শয়তান থেকে আল্লাহর কাছে আশ্রয় চাই।' }, dua: 'dua-seeking-refuge-from-shaitan' },
  { id: 'ameen', title: { en: 'Ameen', bn: 'আমীন', ar: 'آمين' }, ar: 'آمِين', bn: 'আমীন', tl: 'Ameen', meaning: { en: 'O Allah, accept (our prayer).', bn: 'হে আল্লাহ, কবুল করুন।' } },
  { id: 'ruku', title: { en: 'Tasbih in ruku', bn: 'রুকুর তাসবীহ', ar: 'تسبيح الركوع' }, ar: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ', bn: 'সুবহানা রাব্বিয়াল আযীম', tl: 'Subhana rabbiyal ‘azim', meaning: { en: 'Glory be to my Lord, the Magnificent.', bn: 'আমার মহান রবের পবিত্রতা ঘোষণা করছি।' }, times: { en: 'at least 3 times', bn: 'কমপক্ষে ৩ বার' }, hadith: ['muslim-772'] },
  { id: 'tasmi', title: { en: 'Tasmi‘ (rising from ruku)', bn: 'তাসমী’ (রুকু থেকে ওঠা)', ar: 'التسميع' }, ar: 'سَمِعَ اللّٰهُ لِمَنْ حَمِدَهُ', bn: 'সামিআল্লাহু লিমান হামিদাহ', tl: 'Sami‘allahu liman hamidah', meaning: { en: 'Allah hears the one who praises Him.', bn: 'যে আল্লাহর প্রশংসা করে আল্লাহ তা শোনেন।' }, hadith: ['bukhari-689'] },
  { id: 'tahmid', title: { en: 'Tahmid', bn: 'তাহমীদ', ar: 'التحميد' }, ar: 'رَبَّنَا لَكَ الْحَمْدُ', bn: 'রাব্বানা লাকাল হামদ', tl: 'Rabbana lakal hamd', meaning: { en: 'Our Lord, all praise is Yours. (Also reported with an added “wa”: Rabbana wa lakal hamd.)', bn: 'হে আমাদের রব, সকল প্রশংসা আপনারই। (“রাব্বানা ওয়া লাকাল হামদ” রূপেও বর্ণিত আছে।)' }, hadith: ['bukhari-689'] },
  { id: 'sujood', title: { en: 'Tasbih in sujood', bn: 'সিজদার তাসবীহ', ar: 'تسبيح السجود' }, ar: 'سُبْحَانَ رَبِّيَ الْأَعْلَىٰ', bn: 'সুবহানা রাব্বিয়াল আ‘লা', tl: 'Subhana rabbiyal a‘la', meaning: { en: 'Glory be to my Lord, the Most High.', bn: 'আমার সর্বোচ্চ রবের পবিত্রতা ঘোষণা করছি।' }, times: { en: 'at least 3 times', bn: 'কমপক্ষে ৩ বার' }, hadith: ['muslim-772'] },
  { id: 'tashahhud', title: { en: 'Tashahhud (At-Tahiyyat)', bn: 'তাশাহহুদ (আত্তাহিয়্যাত)', ar: 'التشهد' }, ar: 'اَلتَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ اَلسَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ اَلسَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللّٰهِ الصَّالِحِينَ أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    bn: 'আত্তাহিয়্যাতু লিল্লাহি ওয়াস সালাওয়াতু ওয়াত তাইয়্যিবাতু, আসসালামু আলাইকা আইয়্যুহান নাবিইয়্যু ওয়া রাহমাতুল্লাহি ওয়া বারাকাতুহু, আসসালামু আলাইনা ওয়া আলা ইবাদিল্লাহিস সালিহীন, আশহাদু আল্লা ইলাহা ইল্লাল্লাহু ওয়া আশহাদু আন্না মুহাম্মাদান আবদুহু ওয়া রাসূলুহু',
    tl: 'At-tahiyyatu lillahi was-salawatu wat-tayyibat, as-salamu ‘alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh, as-salamu ‘alayna wa ‘ala ‘ibadillahis-salihin, ashhadu an la ilaha illallahu wa ashhadu anna Muhammadan ‘abduhu wa rasuluh',
    meaning: { en: 'All greetings, prayers and good words are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and messenger.', bn: 'সকল সম্মান, ইবাদত ও পবিত্র বাক্য আল্লাহর জন্য। হে নবী, আপনার ওপর শান্তি এবং আল্লাহর রহমত ও বরকত বর্ষিত হোক। আমাদের ওপর এবং আল্লাহর নেক বান্দাদের ওপর শান্তি বর্ষিত হোক। আমি সাক্ষ্য দিচ্ছি, আল্লাহ ছাড়া কোনো ইলাহ নেই এবং সাক্ষ্য দিচ্ছি, মুহাম্মদ ﷺ তাঁর বান্দা ও রাসূল।' }, hadith: ['bukhari-831'] },
  { id: 'durood', title: { en: 'Durood Ibrahim', bn: 'দরূদে ইবরাহীম', ar: 'الصلاة الإبراهيمية' }, ar: 'اللّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ اللّٰهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    bn: 'আল্লাহুম্মা সাল্লি আলা মুহাম্মাদিন ওয়া আলা আলি মুহাম্মাদিন, কামা সাল্লাইতা আলা ইবরাহীমা ওয়া আলা আলি ইবরাহীমা ইন্নাকা হামীদুম মাজীদ। আল্লাহুম্মা বারিক আলা মুহাম্মাদিন ওয়া আলা আলি মুহাম্মাদিন, কামা বারাকতা আলা ইবরাহীমা ওয়া আলা আলি ইবরাহীমা ইন্নাকা হামীদুম মাজীদ',
    tl: 'Allahumma salli ‘ala Muhammadin wa ‘ala ali Muhammad, kama sallayta ‘ala Ibrahima wa ‘ala ali Ibrahim, innaka hamidum majid. Allahumma barik ‘ala Muhammadin wa ‘ala ali Muhammad, kama barakta ‘ala Ibrahima wa ‘ala ali Ibrahim, innaka hamidum majid',
    meaning: { en: 'O Allah, send prayers upon Muhammad and the family of Muhammad as You sent prayers upon Ibrahim and the family of Ibrahim; You are Praiseworthy and Glorious. O Allah, bless Muhammad and the family of Muhammad as You blessed Ibrahim and the family of Ibrahim; You are Praiseworthy and Glorious.', bn: 'হে আল্লাহ, মুহাম্মদ ও তাঁর পরিবারের ওপর রহমত বর্ষণ করুন, যেমন ইবরাহীম ও তাঁর পরিবারের ওপর রহমত বর্ষণ করেছেন; নিশ্চয় আপনি প্রশংসিত ও মহিমান্বিত। হে আল্লাহ, মুহাম্মদ ও তাঁর পরিবারের ওপর বরকত দিন, যেমন ইবরাহীম ও তাঁর পরিবারকে বরকত দিয়েছেন; নিশ্চয় আপনি প্রশংসিত ও মহিমান্বিত।' }, dua: 'dua-durood-ibrahimiyya' },
  { id: 'dua-refuge', title: { en: 'Dua before the salam', bn: 'সালামের আগের দোয়া', ar: 'الدعاء قبل السلام' }, ar: 'اللّٰهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ وَمِنْ عَذَابِ الْقَبْرِ وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ',
    bn: 'আল্লাহুম্মা ইন্নী আউযু বিকা মিন আযাবি জাহান্নাম, ওয়া মিন আযাবিল কাবরি, ওয়া মিন ফিতনাতিল মাহইয়া ওয়াল মামাত, ওয়া মিন শাররি ফিতনাতিল মাসীহিদ দাজ্জাল', tl: 'Allahumma inni a‘udhu bika min ‘adhabi jahannam, wa min ‘adhabil-qabr, wa min fitnatil-mahya wal-mamat, wa min sharri fitnatil-masihid-dajjal',
    meaning: { en: 'O Allah, I seek refuge in You from the punishment of Hell, from the punishment of the grave, from the trials of life and death, and from the evil of the trial of the False Messiah.', bn: 'হে আল্লাহ, আমি জাহান্নামের আযাব, কবরের আযাব, জীবন ও মৃত্যুর ফিতনা এবং মাসীহ দাজ্জালের ফিতনার অনিষ্ট থেকে আপনার কাছে আশ্রয় চাই।' }, dua: 'dua-before-salam-refuge' },
  { id: 'salam', title: { en: 'Salam', bn: 'সালাম', ar: 'التسليم' }, ar: 'اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ', bn: 'আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ', tl: 'As-salamu ‘alaykum wa rahmatullah', meaning: { en: 'Peace and the mercy of Allah be upon you. (Said turning the face to the right, then to the left.)', bn: 'আপনাদের ওপর শান্তি ও আল্লাহর রহমত বর্ষিত হোক। (প্রথমে ডানে, তারপর বামে মুখ ফিরিয়ে বলুন।)' }, hadith: ['abudawud-996'] },
  { id: 'qunut-common', title: { en: 'Dua Qunut (commonly recited in Hanafi practice)', bn: 'দোয়া কুনুত (হানাফী আমলে প্রচলিত)', ar: 'دعاء القنوت' }, ar: 'اللّٰهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنُؤْمِنُ بِكَ وَنَتَوَكَّلُ عَلَيْكَ وَنُثْنِي عَلَيْكَ الْخَيْرَ وَنَشْكُرُكَ وَلَا نَكْفُرُكَ وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ اللّٰهُمَّ إِيَّاكَ نَعْبُدُ وَلَكَ نُصَلِّي وَنَسْجُدُ وَإِلَيْكَ نَسْعَىٰ وَنَحْفِدُ وَنَرْجُو رَحْمَتَكَ وَنَخْشَىٰ عَذَابَكَ إِنَّ عَذَابَكَ بِالْكُفَّارِ مُلْحِقٌ',
    bn: 'আল্লাহুম্মা ইন্না নাস্তা‘ঈনুকা ওয়া নাস্তাগফিরুকা ওয়া নু’মিনু বিকা ওয়া নাতাওয়াক্কালু আলাইকা ওয়া নুসনী আলাইকাল খাইর, ওয়া নাশকুরুকা ওয়া লা নাকফুরুকা ওয়া নাখলা‘উ ওয়া নাতরুকু মাইঁ ইয়াফজুরুক। আল্লাহুম্মা ইয়্যাকা না‘বুদু ওয়া লাকা নুসাল্লী ওয়া নাসজুদু ওয়া ইলাইকা নাসআ ওয়া নাহফিদু ওয়া নারজূ রাহমাতাকা ওয়া নাখশা আযাবাকা, ইন্না আযাবাকা বিল কুফফারি মুলহিক', tl: 'Allahumma inna nasta‘inuka wa nastaghfiruk, wa nu’minu bika wa natawakkalu ‘alayk, wa nuthni ‘alaykal-khayr, wa nashkuruka wa la nakfuruk, wa nakhla‘u wa natruku man yafjuruk. Allahumma iyyaka na‘budu wa laka nusalli wa nasjud, wa ilayka nas‘a wa nahfid, wa narju rahmataka wa nakhsha ‘adhabak, inna ‘adhabaka bil-kuffari mulhiq',
    meaning: { en: 'O Allah, we seek Your help and Your forgiveness, we believe in You and rely on You, we praise You with all good and thank You and are not ungrateful to You, and we cast off and leave whoever disobeys You. O Allah, You alone we worship, to You we pray and prostrate, to You we hasten, and we hope for Your mercy and fear Your punishment; Your punishment will surely overtake the disbelievers.', bn: 'হে আল্লাহ, আমরা আপনার সাহায্য ও ক্ষমা চাই, আপনার প্রতি ঈমান আনি, আপনার ওপর ভরসা করি, উত্তমরূপে আপনার প্রশংসা করি, আপনার শুকরিয়া আদায় করি এবং অকৃতজ্ঞ হই না; যে আপনার অবাধ্য হয় তাকে আমরা ত্যাগ করি ও বর্জন করি। হে আল্লাহ, আমরা কেবল আপনারই ইবাদত করি, আপনার জন্যই নামাজ পড়ি ও সিজদা করি, আপনার দিকেই ছুটে যাই, আপনার রহমতের আশা করি ও আপনার আযাবকে ভয় করি; নিশ্চয় আপনার আযাব কাফিরদের ওপর পতিত হবে।' }, commonlyRecited: true, dua: 'dua-qunut' },
]

export const recitationById = (id: string) => recitations.find((r) => r.id === id)

export interface SalahStep {
  id: string
  title: L
  /** what to do (posture / action) */
  body: L
  /** recitation ids shown with Arabic, uccharon and meaning */
  recite?: string[]
  /** Quran refs rendered from the corpus (with Bangla uccharon) */
  quran?: string[]
  /** verified dua slugs to link */
  dua?: string[]
  /** where schools differ */
  note?: L
}

export const salahSteps: SalahStep[] = [
  { id: 'preparation', title: { en: 'Before you begin', bn: 'শুরুর আগে', ar: 'قبل البدء' },
    body: { en: 'Make wudu, wear clean clothes that cover the awrah, stand on a clean place and face the qibla. It is enough to know the direction to the Kaaba; use the Qibla page if unsure.', bn: 'ওযু করুন, সতর ঢাকা পরিষ্কার পোশাক পরুন, পরিষ্কার জায়গায় দাঁড়ান এবং কিবলামুখী হোন। কাবার দিক নিশ্চিত না হলে কিবলা পাতা দেখুন।', ar: 'توضأ واستقبل القبلة بثياب نظيفة ساترة.' } },
  { id: 'niyyah', title: { en: 'Niyyah (intention)', bn: 'নিয়ত', ar: 'النية' },
    body: { en: 'Intend in your heart which prayer you are praying (for example “I intend to pray two rak‘ahs of Fajr for the sake of Allah, behind this imam”). Saying it aloud is not required.', bn: 'কোন নামাজ পড়ছেন তা মনে মনে ঠিক করুন (যেমন “আমি আল্লাহর জন্য ফজরের দুই রাকআত ফরজ নামাজ পড়ার নিয়ত করলাম, এই ইমামের পিছনে”)। মুখে বলা জরুরি নয়।', ar: 'انوِ بقلبك الصلاة التي تريد أداءها.' } },
  { id: 'takbir', title: { en: 'Takbir tahrimah (opening takbir)', bn: 'তাকবীরে তাহরীমা', ar: 'تكبيرة الإحرام' },
    body: { en: 'Raise the hands and say “Allahu akbar”. From this moment you are in prayer. In the Hanafi practice men raise the hands to the ears and women to the shoulders; then fold the hands.', bn: 'হাত তুলে “আল্লাহু আকবার” বলুন; এখন থেকে আপনি নামাজে। হানাফী আমলে পুরুষ কান পর্যন্ত এবং নারী কাঁধ পর্যন্ত হাত তোলে; তারপর হাত বাঁধুন।', ar: 'ارفع يديك وقل: الله أكبر.' },
    recite: ['takbir'],
    note: { en: 'Hand position differs: in the Hanafi practice men fold the right hand over the left below the navel and women on the chest; other schools place the hands higher (for example on the chest) or differ in detail. Many scholars also raise the hands when going into ruku and rising from it (Sahih al-Bukhari 735), whereas the Hanafi practice is to raise them only at the opening takbir.', bn: 'হাত রাখার স্থান নিয়ে মতভেদ আছে: হানাফী আমলে পুরুষ ডান হাত বাম হাতের ওপর নাভির নিচে এবং নারী বুকের ওপর রাখে; অন্য মাযহাবে হাত আরও ওপরে (যেমন বুকে) রাখা হয় বা বিস্তারিত ভিন্ন। অনেক আলেম রুকুতে যাওয়ার ও রুকু থেকে ওঠার সময়ও হাত তোলেন (সহীহ বুখারী ৭৩৫); হানাফী আমলে শুধু প্রথম তাকবীরে হাত তোলা হয়।' } },
  { id: 'qiyam', title: { en: 'Qiyam: Thana, Ta‘awwudh, Fatiha and a surah', bn: 'কিয়াম: সানা, আউযুবিল্লাহ, ফাতিহা ও সূরা', ar: 'القيام' },
    body: { en: 'Stand with your gaze on the place of sujood. In the first rak‘ah recite Thana silently, then Ta‘awwudh and Bismillah, then Surah al-Fatiha, say “Ameen”, and recite another surah or at least three short ayahs. In the Hanafi practice the Bismillah and the Ameen are said silently.', bn: 'সিজদার স্থানের দিকে দৃষ্টি রেখে দাঁড়ান। প্রথম রাকআতে নিঃশব্দে সানা পড়ুন, তারপর আউযুবিল্লাহ ও বিসমিল্লাহ, তারপর সূরা ফাতিহা, “আমীন” বলুন এবং আরেকটি সূরা বা অন্তত তিনটি ছোট আয়াত পড়ুন। হানাফী আমলে বিসমিল্লাহ ও আমীন নিঃশব্দে বলা হয়।', ar: 'قف ناظرًا إلى موضع سجودك واقرأ الفاتحة وسورة.' },
    recite: ['sana', 'taawwudh', 'ameen'], quran: ['1:1-7'],
    note: { en: 'Behind an imam: the Hanafi view is to listen silently (citing Quran 7:204), while scholars of other schools recite al-Fatiha (citing “there is no prayer for one who does not recite the Opening of the Book”, Sahih al-Bukhari 756), in some views only in silent prayers. Other schools also differ on the opening supplication (many use a different one) and on saying Ameen aloud.', bn: 'ইমামের পিছনে: হানাফী মত হলো চুপ করে শোনা (দলিল কুরআন ৭:২০৪); অন্য মাযহাবের আলেমরা সূরা ফাতিহা পড়েন (দলিল “যে সূরা ফাতিহা পড়ে না তার নামাজ নেই”, সহীহ বুখারী ৭৫৬), কারো মতে শুধু নিঃশব্দ নামাজে। শুরুর দোয়া (অনেকে অন্য দোয়া পড়েন) এবং উচ্চস্বরে আমীন বলা নিয়েও মতভেদ আছে।' } },
  { id: 'surah', title: { en: 'A surah after al-Fatiha', bn: 'ফাতিহার পর একটি সূরা', ar: 'سورة بعد الفاتحة' },
    body: { en: 'In the first two rak‘ahs of a fard prayer (and in every rak‘ah of sunnah and nafl prayers) add a surah after al-Fatiha. Beginners can use the short surahs of Juz Amma, for example al-Ikhlas.', bn: 'ফরজ নামাজের প্রথম দুই রাকআতে (এবং সুন্নত-নফলের প্রতি রাকআতে) ফাতিহার পর একটি সূরা মেলান। শিক্ষার্থীরা আমপারার ছোট সূরা, যেমন সূরা ইখলাস, পড়তে পারেন।', ar: 'اقرأ بعد الفاتحة سورة قصيرة.' },
    quran: ['112:1-4'] },
  { id: 'ruku', title: { en: 'Ruku (bowing)', bn: 'রুকু', ar: 'الركوع' },
    body: { en: 'Say “Allahu akbar” and bow with the back level, hands on the knees, fingers spread and the head in line with the back. Stay still, then say the tasbih at least three times.', bn: '“আল্লাহু আকবার” বলে রুকুতে যান: পিঠ সমান, দুই হাত হাঁটুতে, আঙুল ফাঁক করে এবং মাথা পিঠ বরাবর। স্থির থেকে কমপক্ষে তিনবার তাসবীহ পড়ুন।', ar: 'اركع مطمئنًا وقل: سبحان ربي العظيم.' }, recite: ['ruku'] },
  { id: 'qawmah', title: { en: 'Qawmah (standing up from ruku)', bn: 'কওমা (রুকু থেকে সোজা হওয়া)', ar: 'الاعتدال' },
    body: { en: 'Rise to stand straight. The imam says “Sami‘allahu liman hamidah”; the followers say “Rabbana lakal hamd”. One praying alone says both. Stand fully upright before going down.', bn: 'সম্পূর্ণ সোজা হয়ে দাঁড়ান। ইমাম “সামিআল্লাহু লিমান হামিদাহ” বলেন; মুক্তাদিরা “রাব্বানা লাকাল হামদ” বলেন। একা নামাজ পড়লে দুটোই বলুন। সিজদায় যাওয়ার আগে পুরোপুরি সোজা হয়ে দাঁড়ান।', ar: 'ارفع من الركوع معتدلًا.' }, recite: ['tasmi', 'tahmid'] },
  { id: 'sujood', title: { en: 'Sujood (prostration)', bn: 'সিজদা', ar: 'السجود' },
    body: { en: 'Say “Allahu akbar” and go down: knees, then hands, then nose and forehead on the ground. Seven parts touch the ground: forehead with the nose, both hands, both knees and the toes of both feet. Say the tasbih at least three times.', bn: '“আল্লাহু আকবার” বলে সিজদায় যান: প্রথমে হাঁটু, তারপর হাত, তারপর নাক ও কপাল মাটিতে। সাতটি অঙ্গ মাটি স্পর্শ করে: কপাল ও নাক, দুই হাত, দুই হাঁটু এবং দুই পায়ের আঙুল। কমপক্ষে তিনবার তাসবীহ পড়ুন।', ar: 'اسجد على سبعة أعضاء وقل: سبحان ربي الأعلى.' }, recite: ['sujood'] },
  { id: 'jalsa', title: { en: 'Jalsa and the second sujood', bn: 'জালসা ও দ্বিতীয় সিজদা', ar: 'الجلسة بين السجدتين' },
    body: { en: 'Say “Allahu akbar”, sit up calmly on the left foot with the right foot upright, then say “Allahu akbar” and make the second sujood the same way. Then rise for the second rak‘ah with “Allahu akbar”.', bn: '“আল্লাহু আকবার” বলে স্থির হয়ে বসুন (বাম পা বিছিয়ে ডান পা খাড়া রেখে), তারপর “আল্লাহু আকবার” বলে একইভাবে দ্বিতীয় সিজদা করুন। এরপর “আল্লাহু আকবার” বলে দ্বিতীয় রাকআতের জন্য উঠুন।', ar: 'اجلس مطمئنًا ثم اسجد السجدة الثانية.' },
    note: { en: 'Some scholars teach saying “Rabbighfir li” (O Lord, forgive me) in the sitting between the two sujoods; the Hanafi practice is to sit quietly for a moment.', bn: 'কোনো কোনো আলেম দুই সিজদার মাঝে “রাব্বিগফিরলী” বলার কথা বলেন; হানাফী আমলে কিছুক্ষণ স্থির বসে থাকা হয়।' } },
  { id: 'second', title: { en: 'The second rak‘ah', bn: 'দ্বিতীয় রাকআত', ar: 'الركعة الثانية' },
    body: { en: 'Stand, say Bismillah silently, recite al-Fatiha and a surah, and repeat ruku, qawmah and the two sujoods exactly as in the first rak‘ah. Thana and Ta‘awwudh are not repeated.', bn: 'দাঁড়িয়ে নিঃশব্দে বিসমিল্লাহ, সূরা ফাতিহা ও একটি সূরা পড়ুন; তারপর রুকু, কওমা ও দুই সিজদা প্রথম রাকআতের মতোই করুন। সানা ও আউযুবিল্লাহ আবার পড়তে হয় না।', ar: 'كرر ما سبق دون الاستفتاح والتعوذ.' }, quran: ['108:1-3'] },
  { id: 'tashahhud', title: { en: 'Qa‘dah: sitting for the Tashahhud', bn: 'বৈঠক: তাশাহহুদ', ar: 'القعود والتشهد' },
    body: { en: 'After the second sujood of the second rak‘ah sit on the left foot with the right foot upright and the hands on the thighs. Recite At-Tahiyyat; at “la ilaha” (in the Hanafi practice) raise the index finger and lower it at “illallah”. In a two-rak‘ah prayer, continue to Durood and dua; in a three- or four-rak‘ah prayer, stand up for the third rak‘ah after the Tashahhud.', bn: 'দ্বিতীয় রাকআতের দ্বিতীয় সিজদার পর বাম পা বিছিয়ে ডান পা খাড়া রেখে দুই হাত উরুর ওপর রেখে বসুন। আত্তাহিয়্যাত পড়ুন; হানাফী আমলে “লা ইলাহা” বলার সময় তর্জনী তুলে “ইল্লাল্লাহ”-তে নামানো হয়। দুই রাকআতের নামাজে দরূদ ও দোয়া পর্যন্ত পড়ুন; তিন বা চার রাকআতের নামাজে তাশাহহুদের পর তৃতীয় রাকআতের জন্য দাঁড়ান।', ar: 'اجلس للتشهد وقل التحيات.' }, recite: ['tashahhud'],
    note: { en: 'Some schools point the finger throughout the Tashahhud, and they differ on the sitting posture (iftirash or tawarruk) in the final sitting. In the 3rd and 4th rak‘ahs of a fard prayer the Hanafi practice is al-Fatiha alone, without an extra surah.', bn: 'কোনো মাযহাবে পুরো তাশাহহুদে আঙুল দিয়ে ইশারা করা হয় এবং শেষ বৈঠকের বসার ধরন (ইফতিরাশ বা তাওয়ার্রুক) নিয়ে মতভেদ আছে। ফরজের তৃতীয় ও চতুর্থ রাকআতে হানাফী আমলে শুধু সূরা ফাতিহা পড়া হয়, অতিরিক্ত সূরা নয়।' } },
  { id: 'durood', title: { en: 'Durood and dua in the final sitting', bn: 'শেষ বৈঠকে দরূদ ও দোয়া', ar: 'الصلاة الإبراهيمية والدعاء' },
    body: { en: 'In the last sitting, after the Tashahhud, send blessings on the Prophet ﷺ with Durood Ibrahim, then make a dua from the Quran or Sunnah, for example Rabbana atina fid-dunya hasanah (2:201) or the dua before the salam.', bn: 'শেষ বৈঠকে তাশাহহুদের পর দরূদে ইবরাহীম পড়ুন, তারপর কুরআন-সুন্নাহর কোনো দোয়া পড়ুন, যেমন রাব্বানা আতিনা ফিদ দুনিয়া হাসানাহ (২:২০১) বা সালামের আগের দোয়া।', ar: 'صلِّ على النبي ﷺ ثم ادعُ بما شئت من الأدعية المأثورة.' }, recite: ['durood', 'dua-refuge'], quran: ['2:201'], dua: ['rabbij-alni-muqimas-salah', 'rabbana-atina-fid-dunya-hasanah'] },
  { id: 'salam', title: { en: 'Salam (ending the prayer)', bn: 'সালাম', ar: 'التسليم' },
    body: { en: 'Turn the face to the right and say “As-salamu ‘alaykum wa rahmatullah”, then to the left and say it again. The prayer is complete.', bn: 'মুখ ডানে ফিরিয়ে “আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ” বলুন, তারপর বামে ফিরিয়ে আবার বলুন। নামাজ সম্পন্ন হলো।', ar: 'سلّم عن يمينك ثم عن يسارك.' }, recite: ['salam'], dua: ['dua-after-salah-allahumma-antas-salam', 'dua-after-salah-tasbih'] },
]

/* ───────── rak‘ah table (Hanafi) ───────── */
export type RakahKind = 'fard' | 'wajib' | 'sunnah' | 'sunnah-gm' | 'nafl'
export interface RakahCell { n: number; kind: RakahKind }
export interface PrayerRow {
  id: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
  name: L
  time: L
  before?: RakahCell
  fard: RakahCell
  after?: RakahCell
  witr?: RakahCell
  note?: L
}

export const prayerRows: PrayerRow[] = [
  { id: 'fajr', name: { en: 'Fajr', bn: 'ফজর', ar: 'الفجر' }, time: { en: 'True dawn until sunrise', bn: 'সুবহে সাদিক থেকে সূর্যোদয় পর্যন্ত', ar: 'من الفجر الصادق إلى الشروق' }, before: { n: 2, kind: 'sunnah' }, fard: { n: 2, kind: 'fard' },
    note: { en: 'The two sunnah before Fajr are the most emphasised of all the sunnah prayers.', bn: 'ফজরের আগের দুই রাকআত সুন্নত সব সুন্নতের মধ্যে সবচেয়ে গুরুত্বপূর্ণ।' } },
  { id: 'dhuhr', name: { en: 'Dhuhr', bn: 'যোহর', ar: 'الظهر' }, time: { en: 'After the sun passes its highest point until Asr', bn: 'সূর্য ঢলার পর থেকে আসরের আগ পর্যন্ত', ar: 'من زوال الشمس إلى العصر' }, before: { n: 4, kind: 'sunnah' }, fard: { n: 4, kind: 'fard' }, after: { n: 2, kind: 'sunnah' },
    note: { en: 'Many also pray 2 optional (nafl) rak‘ahs after the sunnah. On Friday the Jumu‘ah prayer of 2 fard rak‘ahs replaces Dhuhr.', bn: 'অনেকে সুন্নতের পর ২ রাকআত নফলও পড়েন। জুমার দিন যোহরের স্থানে ২ রাকআত ফরজ জুমার নামাজ।' } },
  { id: 'asr', name: { en: 'Asr', bn: 'আসর', ar: 'العصر' }, time: { en: 'Afternoon until sunset', bn: 'বিকেল থেকে সূর্যাস্ত পর্যন্ত', ar: 'من دخول وقت العصر إلى الغروب' }, before: { n: 4, kind: 'sunnah-gm' }, fard: { n: 4, kind: 'fard' },
    note: { en: 'The 4 rak‘ahs before Asr are non-emphasised (ghayr mu’akkadah) sunnah. The Asr time starts later in the Hanafi calculation (shadow twice the object) than in the others (once).', bn: 'আসরের আগের ৪ রাকআত গায়রে মুয়াক্কাদা সুন্নত। হানাফী হিসাবে (ছায়া দ্বিগুণ হলে) আসরের ওয়াক্ত অন্য মাযহাবের (ছায়া একগুণ) চেয়ে পরে শুরু হয়।' } },
  { id: 'maghrib', name: { en: 'Maghrib', bn: 'মাগরিব', ar: 'المغرب' }, time: { en: 'Right after sunset until the twilight fades', bn: 'সূর্যাস্তের পর থেকে পশ্চিম আকাশের আলো মিলিয়ে যাওয়া পর্যন্ত', ar: 'من الغروب إلى مغيب الشفق' }, fard: { n: 3, kind: 'fard' }, after: { n: 2, kind: 'sunnah' },
    note: { en: 'Do not delay the Maghrib fard; 2 optional (nafl) rak‘ahs may follow the sunnah.', bn: 'মাগরিবের ফরজ দেরি করবেন না; সুন্নতের পর ২ রাকআত নফলও পড়া যায়।' } },
  { id: 'isha', name: { en: 'Isha', bn: 'এশা', ar: 'العشاء' }, time: { en: 'After the twilight fades until before dawn', bn: 'পশ্চিম আকাশের আলো মিলিয়ে যাওয়ার পর থেকে সুবহে সাদিকের আগ পর্যন্ত', ar: 'من مغيب الشفق إلى قبيل الفجر' }, before: { n: 4, kind: 'sunnah-gm' }, fard: { n: 4, kind: 'fard' }, after: { n: 2, kind: 'sunnah' }, witr: { n: 3, kind: 'wajib' },
    note: { en: 'Witr is 3 rak‘ahs (wajib in the Hanafi school) with the Dua Qunut before the ruku of the third rak‘ah; other schools pray witr as one or more rak‘ahs and place the qunut differently.', bn: 'বিতর ৩ রাকআত (হানাফী মাযহাবে ওয়াজিব); তৃতীয় রাকআতে রুকুর আগে দোয়া কুনুত পড়া হয়। অন্য মাযহাবে বিতর এক বা একাধিক রাকআত এবং কুনুতের স্থানও ভিন্ন।' } },
]

export const rakahKindLabel: Record<RakahKind, L> = {
  fard: { en: 'Fard', bn: 'ফরজ', ar: 'فرض' },
  wajib: { en: 'Wajib', bn: 'ওয়াজিব', ar: 'واجب' },
  sunnah: { en: 'Sunnah mu’akkadah', bn: 'সুন্নতে মুয়াক্কাদা', ar: 'سنة مؤكدة' },
  'sunnah-gm': { en: 'Sunnah ghayr mu’akkadah', bn: 'সুন্নতে গায়রে মুয়াক্কাদা', ar: 'سنة غير مؤكدة' },
  nafl: { en: 'Nafl', bn: 'নফল', ar: 'نافلة' },
}

export const salahMistakes: { title: L; body: L }[] = [
  { title: { en: 'Rushing without stillness (tuma’ninah)', bn: 'স্থিরতা (তাদীলে আরকান) ছাড়া তাড়াহুড়ো', ar: 'ترك الطمأنينة' }, body: { en: 'Pause fully in ruku, qawmah, sujood and the sitting. In the hadith of the man who prayed badly, the Prophet ﷺ told him to go back and pray again until he was calm in each position (Sahih al-Bukhari 757).', bn: 'রুকু, কওমা, সিজদা ও বৈঠকে পুরোপুরি স্থির হোন। যে ব্যক্তি তাড়াহুড়ো করে নামাজ পড়েছিল, নবী ﷺ তাকে ফিরে গিয়ে প্রতিটি অবস্থায় স্থির হয়ে আবার নামাজ পড়তে বলেছিলেন (সহীহ বুখারী ৭৫৭)।' } },
  { title: { en: 'Not straightening the back in ruku and qawmah', bn: 'রুকু ও কওমায় পিঠ সোজা না করা', ar: 'عدم تسوية الظهر' }, body: { en: 'The back should be level in ruku and you should stand fully upright after it, before going into sujood.', bn: 'রুকুতে পিঠ সমান রাখুন এবং সিজদায় যাওয়ার আগে কওমায় পুরোপুরি সোজা হয়ে দাঁড়ান।' } },
  { title: { en: 'Looking around or fidgeting', bn: 'এদিক-ওদিক তাকানো বা নড়াচড়া করা', ar: 'الالتفات والعبث' }, body: { en: 'Keep your eyes on the place of sujood and avoid unnecessary movement such as adjusting clothes again and again.', bn: 'দৃষ্টি সিজদার স্থানে রাখুন এবং বারবার কাপড় ঠিক করার মতো অপ্রয়োজনীয় নড়াচড়া এড়িয়ে চলুন।' } },
  { title: { en: 'Mispronouncing al-Fatiha', bn: 'সূরা ফাতিহা ভুল পড়া', ar: 'الخطأ في قراءة الفاتحة' }, body: { en: 'Practise the pronunciation with a teacher: confusing letters such as ص/س, ض/د, ح/ه or ع/ء can change the meaning. Use the tajweed pages to learn the rules.', bn: 'উস্তাদের কাছে উচ্চারণ অনুশীলন করুন: ص/س, ض/د, ح/ه বা ع/ء গুলিয়ে ফেললে অর্থ বদলে যেতে পারে। নিয়ম শিখতে তাজবীদের পাতাগুলো দেখুন।' } },
  { title: { en: 'Wrong direction or unclean place', bn: 'ভুল দিক বা অপবিত্র জায়গা', ar: 'الخطأ في القبلة' }, body: { en: 'Check the qibla and the cleanliness of your clothes and prayer place before starting.', bn: 'শুরুর আগে কিবলার দিক এবং পোশাক ও নামাজের জায়গার পবিত্রতা যাচাই করুন।' } },
  { title: { en: 'Forgetting the count of rak‘ahs', bn: 'রাকআতের সংখ্যা ভুলে যাওয়া', ar: 'نسيان عدد الركعات' }, body: { en: 'If you forget the count, a scholar can explain the rules of sahw (prostration of forgetfulness) for your school.', bn: 'রাকআতের সংখ্যা ভুলে গেলে আপনার মাযহাব অনুযায়ী সাহু সিজদার নিয়ম কোনো আলেম জানিয়ে দেবেন।' } },
]

/** Short surahs of Juz Amma that beginners usually learn first (ids). */
export const beginnerSurahs = [103, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114]
