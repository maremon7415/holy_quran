import type { LearnHadith } from './types'

/**
 * Every hadith cited on the /learn pages. `scripts/verify-learn-sources.mjs` downloads the open hadith corpus (the same
 * fawazahmed0 Arabic editions as scripts/verify-hadith-sources.mjs) and checks that the numbered hadith contains every phrase
 * in `must`. Unit tests check that every id used by the learn data exists here. Muslim numbers are the Abd al-Baqi numbers.
 */
export const learnHadith: LearnHadith[] = [
  { id: 'bukhari-8', ref: 'Sahih al-Bukhari 8', book: 'bukhari', number: 8, must: ['بني الاسلام على خمس', 'شهاده ان لا اله الا الله'] },
  { id: 'muslim-2137', ref: 'Sahih Muslim 2137', book: 'muslim', number: 2137, must: ['سبحان الله والحمد لله ولا اله الا الله والله اكبر'] },
  { id: 'bukhari-4205', ref: 'Sahih al-Bukhari 4205', book: 'bukhari', number: 4205, must: ['لا حول ولا قوه الا بالله', 'كنز من كنوز الجنه'] },
  { id: 'bukhari-844', ref: 'Sahih al-Bukhari 844', book: 'bukhari', number: 844, must: ['لا اله الا الله وحده لا شريك له', 'له الملك وله الحمد', 'وهو على كل شيء قدير'] },
  { id: 'bukhari-135', ref: 'Sahih al-Bukhari 135', book: 'bukhari', number: 135, must: ['لا تقبل صلاه من احدث حتى يتوضا'] },
  { id: 'bukhari-159', ref: 'Sahih al-Bukhari 159', book: 'bukhari', number: 159, must: ['مضمض', 'استنشق', 'غسل وجهه ثلاثا', 'الى المرفقين', 'مسح براسه', 'الكعبين'] },
  { id: 'bukhari-631', ref: 'Sahih al-Bukhari 631', book: 'bukhari', number: 631, must: ['صلوا كما رايتموني اصلي'] },
  { id: 'bukhari-757', ref: 'Sahih al-Bukhari 757', book: 'bukhari', number: 757, must: ['ارجع فصل فانك لم تصل', 'اذا قمت الى الصلاه فكبر', 'حتى تطمئن راكعا'] },
  { id: 'bukhari-756', ref: 'Sahih al-Bukhari 756', book: 'bukhari', number: 756, must: ['لا صلاه لمن لم يقرا بفاتحه الكتاب'] },
  { id: 'bukhari-735', ref: 'Sahih al-Bukhari 735', book: 'bukhari', number: 735, must: ['يرفع يديه حذو منكبيه', 'اذا كبر للركوع', 'اذا رفع راسه من الركوع'] },
  { id: 'bukhari-831', ref: 'Sahih al-Bukhari 831', book: 'bukhari', number: 831, must: ['التحيات لله والصلوات والطيبات', 'السلام عليك ايها النبي ورحمه الله وبركاته', 'اشهد ان لا اله الا الله'] },
  { id: 'bukhari-689', ref: 'Sahih al-Bukhari 689', book: 'bukhari', number: 689, must: ['سمع الله لمن حمده', 'ربنا ولك الحمد'] },
  { id: 'muslim-772', ref: 'Sahih Muslim 772', book: 'muslim', number: 772, must: ['سبحان ربي العظيم', 'سبحان ربي الاعلى'] },
  { id: 'abudawud-775', ref: 'Sunan Abi Dawud 775', book: 'abudawud', number: 775, must: ['سبحانك اللهم وبحمدك', 'تبارك اسمك', 'ولا اله غيرك'] },
  { id: 'abudawud-996', ref: 'Sunan Abi Dawud 996', book: 'abudawud', number: 996, must: ['السلام عليكم ورحمه الله'] },
  { id: 'muslim-728', ref: 'Sahih Muslim 728', book: 'muslim', number: 728, must: ['ثنتي عشره ركعه'] },
  { id: 'tirmidhi-415', ref: 'Jami at-Tirmidhi 415', book: 'tirmidhi', number: 415, must: ['اربعا قبل الظهر', 'وركعتين بعدها', 'وركعتين بعد المغرب', 'وركعتين بعد العشاء', 'وركعتين قبل صلاه الفجر'] },
]

export const learnHadithById = (id: string) => learnHadith.find((h) => h.id === id)
