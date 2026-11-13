import type { L } from './types'

/** Wudu (ablution) as practised in the Hanafi school (the common practice in Bangladesh), with notes where schools differ. */
export type WuduDiagram = 'niyyah' | 'hands' | 'mouth' | 'nose' | 'face' | 'arms' | 'head' | 'ears' | 'feet' | 'dua'
export type StepKind = 'fard' | 'sunnah'

export interface WuduStep {
  id: WuduDiagram
  title: L
  body: L
  /** how many times (omitted when once) */
  times?: number
  kind: StepKind
  /** short tip */
  tip?: L
}

export const wuduSteps: WuduStep[] = [
  { id: 'niyyah', kind: 'sunnah', title: { en: 'Intention and Bismillah', bn: 'নিয়ত ও বিসমিল্লাহ', ar: 'النية والبسملة' },
    body: { en: 'Intend in your heart to purify yourself for prayer and say “Bismillah”. Saying the intention aloud is not required.', bn: 'মনে মনে নামাজের জন্য পবিত্র হওয়ার নিয়ত করুন এবং “বিসমিল্লাহ” বলুন। মুখে নিয়ত উচ্চারণ করা জরুরি নয়।', ar: 'انوِ بقلبك الطهارة للصلاة وقل «بسم الله».' },
    tip: { en: 'Schools differ on whether the intention is a condition or a sunnah of wudu; all agree it belongs in the heart.', bn: 'নিয়ত ওযুর শর্ত না সুন্নত, এ নিয়ে মাযহাবের মতভেদ আছে; সবাই একমত যে নিয়ত অন্তরের বিষয়।' } },
  { id: 'hands', kind: 'sunnah', times: 3, title: { en: 'Wash both hands', bn: 'দুই হাত কবজি পর্যন্ত ধোয়া', ar: 'غسل الكفين' },
    body: { en: 'Wash both hands up to the wrists, three times, running the fingers of one hand between the fingers of the other.', bn: 'দুই হাত কবজি পর্যন্ত তিনবার ধুয়ে নিন এবং এক হাতের আঙুল দিয়ে অন্য হাতের আঙুলের ফাঁক খিলাল করুন।', ar: 'اغسل كفيك إلى الرسغين ثلاث مرات.' } },
  { id: 'mouth', kind: 'sunnah', times: 3, title: { en: 'Rinse the mouth', bn: 'কুলি করা', ar: 'المضمضة' },
    body: { en: 'Take water into the mouth with the right hand, swirl it around and spit it out, three times. Use a miswak first if you have one.', bn: 'ডান হাতে পানি নিয়ে মুখে দিন, ঘুরিয়ে ফেলে দিন, তিনবার। মিসওয়াক থাকলে আগে ব্যবহার করুন।', ar: 'تمضمض ثلاث مرات.' } },
  { id: 'nose', kind: 'sunnah', times: 3, title: { en: 'Clean the nose', bn: 'নাকে পানি দেওয়া', ar: 'الاستنشاق' },
    body: { en: 'Sniff a little water into the nostrils with the right hand and blow it out with the left, three times. Do not sniff hard if you are fasting.', bn: 'ডান হাতে নাকে সামান্য পানি টেনে বাম হাতে ঝেড়ে ফেলুন, তিনবার। রোজা অবস্থায় জোরে টানবেন না।', ar: 'استنشق الماء واستنثر ثلاث مرات.' } },
  { id: 'face', kind: 'fard', times: 3, title: { en: 'Wash the face', bn: 'মুখমণ্ডল ধোয়া', ar: 'غسل الوجه' },
    body: { en: 'Wash the whole face three times, from the hairline to the chin and from ear to ear, so that no part stays dry. Run wet fingers through a beard.', bn: 'কপালের চুলের গোড়া থেকে থুতনি পর্যন্ত এবং এক কান থেকে অন্য কান পর্যন্ত পুরো মুখ তিনবার ধুয়ে নিন; কোনো অংশ শুকনো থাকবে না। দাড়ি থাকলে ভেজা আঙুল দিয়ে খিলাল করুন।', ar: 'اغسل وجهك كاملًا ثلاث مرات.' },
    tip: { en: 'Washing the face is the first of the four obligatory acts in Quran 5:6.', bn: 'মুখ ধোয়া কুরআনের ৫:৬ আয়াতের চার ফরজের প্রথমটি।' } },
  { id: 'arms', kind: 'fard', times: 3, title: { en: 'Wash the arms to the elbows', bn: 'কনুই পর্যন্ত হাত ধোয়া', ar: 'غسل اليدين إلى المرفقين' },
    body: { en: 'Wash the right arm from the fingertips up to and including the elbow, three times, then the left arm the same way. Move rings and watches so water reaches the skin.', bn: 'ডান হাত আঙুলের মাথা থেকে কনুইসহ তিনবার ধুয়ে নিন, তারপর বাম হাত একইভাবে। আংটি বা ঘড়ি নাড়িয়ে নিন যাতে চামড়ায় পানি পৌঁছায়।', ar: 'اغسل يديك مع المرفقين ثلاث مرات، اليمنى ثم اليسرى.' } },
  { id: 'head', kind: 'fard', title: { en: 'Wipe the head (masah)', bn: 'মাথা মাসেহ করা', ar: 'مسح الرأس' },
    body: { en: 'With wet hands wipe over the head once, from the front to the back and back to the front. In the Hanafi school the minimum that fulfils the obligation is about a quarter of the head; the sunnah is to wipe all of it.', bn: 'ভেজা হাতে মাথার ওপর একবার সামনে থেকে পেছনে এবং পেছন থেকে সামনে মাসেহ করুন। হানাফী মাযহাবে ফরজ আদায়ের নূন্যতম হলো মাথার প্রায় এক-চতুর্থাংশ; পুরো মাথা মাসেহ করা সুন্নত।', ar: 'امسح رأسك بيدين مبللتين مرة واحدة.' },
    tip: { en: 'Other schools hold that most or all of the head (or a few hairs, in the Shafi‘i view) must be wiped.', bn: 'অন্য মাযহাবে মাথার অধিকাংশ বা পুরোটা (শাফেয়ী মতে অন্তত কয়েকটি চুল) মাসেহ করতে হয়।' } },
  { id: 'ears', kind: 'sunnah', title: { en: 'Wipe the ears', bn: 'কান মাসেহ করা', ar: 'مسح الأذنين' },
    body: { en: 'With the same wetness wipe the inside of the ears with the index fingers and the back with the thumbs.', bn: 'মাথা মাসেহের সেই ভেজা হাতেই তর্জনী দিয়ে কানের ভেতর এবং বুড়ো আঙুল দিয়ে কানের পেছনে মাসেহ করুন।', ar: 'امسح أذنيك بباطن الإصبعين وظاهر الإبهامين.' } },
  { id: 'feet', kind: 'fard', times: 3, title: { en: 'Wash the feet to the ankles', bn: 'টাখনু পর্যন্ত পা ধোয়া', ar: 'غسل الرجلين إلى الكعبين' },
    body: { en: 'Wash the right foot up to and including the ankle, three times, then the left foot. Use the little finger of the left hand to clean between the toes.', bn: 'ডান পা টাখনুসহ তিনবার ধুয়ে নিন, তারপর বাম পা। বাম হাতের কনিষ্ঠ আঙুল দিয়ে পায়ের আঙুলের ফাঁক খিলাল করুন।', ar: 'اغسل رجليك مع الكعبين ثلاث مرات، اليمنى ثم اليسرى.' },
    tip: { en: 'Wiping over leather socks (khuff) instead of washing the feet is allowed under conditions that a scholar can explain.', bn: 'শর্তসাপেক্ষে মোজার (খুফ) ওপর মাসেহ করা জায়েজ; আলেমের কাছ থেকে শর্তগুলো জেনে নিন।' } },
  { id: 'dua', kind: 'sunnah', title: { en: 'Dua after wudu', bn: 'ওযুর পরের দোয়া', ar: 'الدعاء بعد الوضوء' },
    body: { en: 'Face the qibla if you can and say the testimony of faith. See the verified dua page for the Arabic, meaning and source.', bn: 'সম্ভব হলে কিবলামুখী হয়ে শাহাদাতের দোয়া পড়ুন। আরবি, অর্থ ও সূত্রের জন্য যাচাইকৃত দোয়ার পাতা দেখুন।', ar: 'ادعُ بدعاء ما بعد الوضوء.' } },
]

export const wuduBreakers: { text: L; agreed: boolean }[] = [
  { agreed: true, text: { en: 'Anything that leaves the front or back passage: urine, stool or passing wind.', bn: 'সামনে বা পেছনের রাস্তা দিয়ে কিছু বের হওয়া: প্রস্রাব, পায়খানা বা বায়ু।' } },
  { agreed: true, text: { en: 'Deep sleep, such as sleeping lying down or leaning so that awareness is lost.', bn: 'গভীর ঘুম, যেমন শুয়ে বা হেলান দিয়ে এমনভাবে ঘুমানো যে চেতনা থাকে না।' } },
  { agreed: true, text: { en: 'Loss of consciousness: fainting, intoxication or insanity.', bn: 'জ্ঞান হারানো: অজ্ঞান হওয়া, নেশাগ্রস্ত হওয়া বা পাগলামি।' } },
  { agreed: false, text: { en: 'Flowing blood or pus, vomiting a mouthful, and laughing aloud in a prayer with ruku and sujood: these break wudu in the Hanafi school. Many scholars of other schools do not count them.', bn: 'প্রবাহিত রক্ত বা পুঁজ, মুখভরা বমি এবং রুকু-সিজদাওয়ালা নামাজে অট্টহাসি: হানাফী মাযহাবে এগুলো ওযু ভাঙে। অন্য মাযহাবের অনেক আলেম এগুলো ওযু ভাঙার কারণ মনে করেন না।' } },
  { agreed: false, text: { en: 'Touching the private part directly, or touching a person of the opposite sex (in some views only with desire): these break wudu according to some schools and not according to others, including the Hanafi school.', bn: 'সরাসরি গুপ্তাঙ্গ স্পর্শ করা বা বিপরীত লিঙ্গের কাউকে স্পর্শ করা (কারো মতে কেবল কামভাবসহ): কোনো কোনো মাযহাবে এতে ওযু ভাঙে, হানাফীসহ অন্যদের মতে ভাঙে না।' } },
  { agreed: false, text: { en: 'Eating camel meat is considered to break wudu in the Hanbali school; other schools do not hold this.', bn: 'হাম্বলী মাযহাবে উটের গোশত খেলে ওযু ভাঙে বলে গণ্য করা হয়; অন্য মাযহাবে নয়।' } },
]
