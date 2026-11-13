/**
 * Ask the Quran — lightweight lexical signals for the hybrid ranker (client + server safe):
 * content words of a natural question (stop-words removed, light stemming), word overlap with an
 * ayah's text and matching against the curated Quran topics.
 */
import { isArabic, isBangla, normalizeArabic, normalizeLatin } from '@/lib/quran/normalize'

export type Script = 'en' | 'bn' | 'ar'

export const scriptOf = (q: string): Script => (isBangla(q) ? 'bn' : isArabic(q) ? 'ar' : 'en')

const EN_STOP = new Set(`a about above after again against all allah am an and any are as at be because been before being below between both but by can could did do does doing down during each even ever every few for from further god had has have having he her here hers him his how i if in into is it its itself just let lord me more most my myself no nor not now of off on once only or other our ours out over own quran quranic said same say says she should so some such tell than that the their theirs them then there these they this those through to too under until up upon us verse verses very was we were what when where which while who whom why will with would you your yours yourself ayah ayat ayahs surah mention mentions mentioned about talk talks speak speaks regarding concerning anything something someone people person things thing get gets got one ones also still much many really way ways teach teaches`.split(' '))

const BN_STOP = new Set(`কী কি কে কেন কীভাবে কিভাবে কোথায় কখন কোন কোনো এবং ও আর বা নিয়ে নিয়ে সম্পর্কে বিষয়ে ব্যাপারে আছে আছেন রয়েছে হয় হলে হবে হয়ে করে করা করলে করেন করেছি করব করবে করবেন বলে বলেন বলা বলেছেন কুরআন কুরআনে কোরআনে কোরআন আল্লাহ আল্লাহর আল্লাহকে আমি আমার আমাকে আমরা তুমি তোমার আপনি আপনার সে তার তাদের যে যা যারা এই ওই সেই এ সব সকল জন্য থেকে দিয়ে মধ্যে সাথে সঙ্গে উপর ওপর পরে আগে না নয় নেই শুধু তো ই আয়াত আয়াতে সূরা উচিত দরকার কেমন কতটা এমন`.split(' '))

const AR_STOP = new Set(['ما', 'ماذا', 'من', 'في', 'عن', 'على', 'الى', 'إلى', 'هل', 'كيف', 'لماذا', 'متى', 'أين', 'اين', 'و', 'او', 'أو', 'ثم', 'ان', 'إن', 'أن', 'الله', 'القران', 'القرآن', 'يقول', 'قال', 'هو', 'هي', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'الذين', 'عند', 'مع', 'كل', 'لا', 'لم', 'لن', 'قد', 'يا', 'اية', 'ايات', 'آية', 'آيات', 'سورة'])

/** Light English stemmer: enough to make "parents/parent", "patient/patience", "forgives/forgiving" meet. */
export function stemEn(w: string): string {
  let s = w
  if (s.length > 5 && s.endsWith('ies')) s = s.slice(0, -3) + 'y'
  else if (s.length > 4 && /(ches|shes|sses|xes)$/.test(s)) s = s.slice(0, -2)
  else if (s.length > 3 && s.endsWith('s') && !s.endsWith('ss') && !s.endsWith('us')) s = s.slice(0, -1)
  for (const suf of ['ingly', 'ness', 'ment', 'ence', 'ance', 'ing', 'ful', 'ed', 'er', 'ly', 'ent', 'ant', 'e']) {
    if (s.length - suf.length >= 4 && s.endsWith(suf)) { s = s.slice(0, -suf.length); break }
  }
  return s
}

/** Bangla: strip the commonest case/plural suffixes so "ধৈর্যশীলদের" ⊃ "ধৈর্য", "পিতামাতার" ⊃ "পিতামাতা". */
const BN_SUFFIX = ['গুলোর', 'গুলো', 'দেরকে', 'দের', 'েরা', 'ের', 'কে', 'তে', 'য়ে', 'র', 'ে', 'রা']
export function stemBn(w: string): string {
  for (const suf of BN_SUFFIX) if (w.length - suf.length >= 2 && w.endsWith(suf)) return w.slice(0, -suf.length)
  return w
}

export interface Term { raw: string; stem: string }

/** Content words of a question, with stems, for the query's script. */
export function contentTerms(q: string, script: Script = scriptOf(q)): Term[] {
  const seen = new Set<string>()
  const out: Term[] = []
  const push = (raw: string, stem: string) => { if (stem && !seen.has(stem)) { seen.add(stem); out.push({ raw, stem }) } }
  if (script === 'en') {
    for (const w of normalizeLatin(q).split(' ')) if (w.length > 2 && !EN_STOP.has(w)) push(w, stemEn(w))
  } else if (script === 'bn') {
    for (const w of q.replace(/[^ঀ-৿\s-]/g, ' ').split(/[\s-]+/)) {
      if (w.length < 2 || BN_STOP.has(w)) continue
      const stem = stemBn(w)
      if (stem.length >= 2 && !BN_STOP.has(stem)) push(w, stem)
    }
  } else {
    for (const w of normalizeArabic(q.replace(/[^؀-ۿ\s]/g, ' ')).split(' ')) {
      if (w.length < 2 || AR_STOP.has(w)) continue
      push(w, w.replace(/^(وال|بال|فال|كال|لل|ال|و)/, '') || w)
    }
  }
  return out
}

/** Prepared, normalised ayah text for overlap tests. */
export interface AyahText { en: string; bn: string; ar: string }

export function prepareAyahText(v: { en: string; enH?: string; bn: string; sim?: string }): AyahText {
  const en = ` ${normalizeLatin(`${v.en} ${v.enH ?? ''}`).split(' ').map(stemEn).join(' ')} `
  return { en, bn: v.bn, ar: v.sim ? ` ${normalizeArabic(v.sim)} ` : '' }
}

/** Which query terms occur in the ayah (English words compared as stems, Bangla/Arabic as substrings). */
export function matchedTerms(terms: Term[], text: AyahText, script: Script): Term[] {
  if (script === 'en') return terms.filter((t) => t.stem.length >= 3 && text.en.includes(` ${t.stem} `))
  if (script === 'bn') return terms.filter((t) => text.bn.includes(t.stem))
  return terms.filter((t) => t.stem.length >= 2 && text.ar.includes(t.stem))
}

/* ───────── topics ───────── */

export interface TopicLike { slug: string; en: string; bn: string; ar?: string; keywords: string[]; refs: string[] }
export interface TopicMatch { slug: string; title: { en: string; bn: string; ar?: string }; strength: number; refs: string[] }

/**
 * Score how strongly a question names a curated topic: share of a topic phrase's content words that
 * appear in the query (best phrase wins). "what does the Quran say about patience" → patience = 1.
 */
export function matchTopics(q: string, topics: TopicLike[], min = 0.5): TopicMatch[] {
  const script = scriptOf(q)
  const qTerms = contentTerms(q, script)
  if (!qTerms.length) return []
  const qStems = qTerms.map((t) => t.stem)
  const has = (stem: string) => qStems.some((s) => s === stem || (script !== 'en' && stem.length >= 3 && (s.includes(stem) || (s.length >= 3 && stem.includes(s)))))
  const out: TopicMatch[] = []
  for (const t of topics) {
    const phrases = [t.slug.replace(/-/g, ' '), t.en, t.bn, t.ar ?? '', ...t.keywords].filter((p) => p && scriptOf(p) === script)
    let best = 0
    for (const p of phrases) {
      const pt = contentTerms(p, script)
      if (!pt.length) continue
      const hit = pt.filter((x) => has(x.stem)).length
      best = Math.max(best, hit / pt.length)
    }
    if (best >= min) out.push({ slug: t.slug, title: { en: t.en, bn: t.bn, ar: t.ar }, strength: best, refs: t.refs })
  }
  return out.sort((a, b) => b.strength - a.strength).slice(0, 3)
}

/** Palette heuristic: a natural question (≥ 4 words, or ends with ? / ؟) rather than a keyword or reference. */
export function looksLikeQuestion(q: string): boolean {
  const s = q.trim()
  if (s.length < 6 || /^\d/.test(s)) return false
  return /[?？؟]$/.test(s) || s.split(/\s+/).filter(Boolean).length >= 4
}
