'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Volume2 } from 'lucide-react'
import Link from '@/lib/i18n/link'
import { PlayAyah } from './play-ayah'
import { arabicLetters, letterForms, makhrajGroups, type ArabicLetter } from '@/data/learn/alphabet'
import words from '@/data/learn/alphabet-words.json'
import { surahHref } from '@/lib/quran/chapters'
import { refLabelFor } from '@/lib/i18n/quran'
import { bnNum } from '@/lib/i18n/t'
import { useLang, useTx } from '@/lib/lang'
import { cn } from '@/lib/utils'

const wordOf = (id: string) => (words as Record<string, { word: string; ref: string }>)[id]

/** Speak an Arabic text with the browser's speech synthesis (no external audio). */
function useArabicSpeech() {
  const [state, setState] = useState<{ supported: boolean; voice: boolean }>({ supported: false, voice: false })
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const check = () => setState({ supported: true, voice: window.speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith('ar')) })
    check()
    window.speechSynthesis.addEventListener?.('voiceschanged', check)
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', check)
  }, [])
  const speak = useCallback((text: string) => {
    try {
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'ar-SA'
      u.rate = 0.8
      const v = window.speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith('ar'))
      if (v) u.voice = v
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    } catch { /* speech unavailable */ }
  }, [])
  return { ...state, speak }
}

export function AlphabetGrid() {
  const t = useTx()
  const lang = useLang()
  const { supported, voice, speak } = useArabicSpeech()
  const [group, setGroup] = useState<ArabicLetter['group'] | 'all'>('all')
  const list = useMemo(() => arabicLetters.filter((l) => group === 'all' || l.group === group), [group])
  const num = (n: number) => (lang === 'bn' ? bnNum(n) : String(n))
  return (
    <div>
      <div role="group" aria-label={t({ en: 'Filter by articulation area', bn: 'মাখরাজের স্থান অনুযায়ী ছাঁকুন', ar: 'تصفية حسب منطقة المخرج' })} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {(['all', 'jawf', 'halq', 'lisan', 'shafatan'] as const).map((g) => (
          <button key={g} type="button" aria-pressed={group === g} onClick={() => setGroup(g)} data-group={g}
            className={cn('shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition', group === g ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground')}>
            {g === 'all' ? t({ en: 'All 28 letters', bn: 'সব ২৮টি হরফ', ar: 'الحروف كلها' }) : t(makhrajGroups[g])}
          </button>
        ))}
      </div>
      {supported && !voice && (
        <p role="note" className="mt-3 rounded-2xl bg-muted/60 p-3 text-xs text-muted-foreground">{t({ en: 'No Arabic voice was found on this device, so the sound button may read the letter in another language. The example ayahs below play real Quran recitation.', bn: 'এই ডিভাইসে আরবি ভয়েস পাওয়া যায়নি, তাই শব্দ বাটন অন্য ভাষায় পড়তে পারে। নিচের উদাহরণ আয়াতগুলোতে আসল কুরআন তিলাওয়াত শোনা যায়।', ar: 'لم يُعثر على صوت عربي في هذا الجهاز، وقد يقرأ الزر الحرف بلغة أخرى. أما آيات الأمثلة فتُشغَّل بتلاوة حقيقية.' })}</p>
      )}
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-alphabet-grid>
        {list.map((l) => {
          const f = letterForms(l)
          const w = wordOf(l.id)
          const n = arabicLetters.indexOf(l) + 1
          return (
            <li key={l.id}>
              <article data-letter={l.id} aria-labelledby={`l-${l.id}`} className="card-soft flex h-full flex-col rounded-3xl p-4 sm:p-5">
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{num(n)} · {t(makhrajGroups[l.group])}</p>
                    <h3 id={`l-${l.id}`} className="font-display mt-1 text-xl font-semibold">{t(l.name)}</h3>
                    <p className="text-xs text-muted-foreground">{t(l.sound)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span lang="ar" className="font-arabic grid size-16 place-items-center rounded-2xl bg-accent text-5xl leading-none text-arabic">{l.ar}</span>
                  </div>
                </header>
                <dl className="mt-4 grid grid-cols-4 gap-2 text-center" dir="ltr" aria-label={t({ en: 'Forms of the letter', bn: 'হরফের রূপ', ar: 'أشكال الحرف' })}>
                  {([['isolated', { en: 'Alone', bn: 'আলাদা', ar: 'منفصل' }], ['initial', { en: 'Start', bn: 'শুরু', ar: 'أول' }], ['medial', { en: 'Middle', bn: 'মাঝ', ar: 'وسط' }], ['final', { en: 'End', bn: 'শেষ', ar: 'آخر' }]] as const).map(([k, label]) => (
                    <div key={k} className="rounded-xl border border-border bg-background/50 py-2">
                      <dd lang="ar" dir="rtl" className="font-arabic text-3xl leading-[1.4] text-arabic" data-form={k}>{f[k]}</dd>
                      <dt className="mt-0.5 text-[10px] font-semibold text-muted-foreground">{t(label)}</dt>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-sm leading-relaxed text-foreground/85"><span className="font-semibold">{t({ en: 'Makhraj: ', bn: 'মাখরাজ: ', ar: 'المخرج: ' })}</span>{t(l.makhraj)}</p>
                {w && (
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-muted/50 p-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{t({ en: 'Example word from the Quran', bn: 'কুরআন থেকে উদাহরণ শব্দ', ar: 'كلمة من القرآن' })}</p>
                      <p lang="ar" dir="rtl" className="quran-text mt-1 text-start text-3xl leading-[1.8]" data-example-word={l.id}>{w.word}</p>
                      <Link href={surahHref(+w.ref.split(':')[0], +w.ref.split(':')[1])} className="text-xs font-semibold text-primary hover:underline">{refLabelFor(lang, w.ref)}</Link>
                    </div>
                    <PlayAyah surah={+w.ref.split(':')[0]} from={+w.ref.split(':')[1]} />
                  </div>
                )}
                <div className="mt-auto pt-4">
                  {supported ? (
                    <button type="button" onClick={() => speak(l.name.ar)} data-speak={l.id}
                      className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-xs font-semibold transition hover:border-primary/40 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                      <Volume2 className="size-4" aria-hidden /> {t({ en: 'Hear the name', bn: 'নামটি শুনুন', ar: 'اسمع الاسم' })}
                      <span className="sr-only"> {l.name.en}</span>
                    </button>
                  ) : null}
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ───────────── practice quiz ───────────── */
type Mode = 'letter-name' | 'name-letter' | 'form-letter'
interface Q { target: ArabicLetter; options: ArabicLetter[]; form?: 'initial' | 'medial' | 'final' }

/** Letters that share a shape up to dots / small strokes: used as distractors so the quiz teaches the differences. */
const FAMILIES = ['بتثنيه', 'جحخ', 'دذ', 'رز', 'سش', 'صض', 'طظ', 'عغ', 'فق']
const ROUND = 10

function shuffle<T>(a: T[]) {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] }
  return r
}
function makeRound(mode: Mode): Q[] {
  return shuffle(arabicLetters).slice(0, ROUND).map((target) => {
    const fam = FAMILIES.find((f) => f.includes(target.ar))
    const near = fam ? arabicLetters.filter((l) => l !== target && fam.includes(l.ar)) : []
    const others = shuffle(arabicLetters.filter((l) => l !== target && !near.includes(l)))
    const four = shuffle([target, ...[...shuffle(near).slice(0, 2), ...others].slice(0, 3)])
    const form = mode === 'form-letter' ? (['initial', 'medial', 'final'] as const)[Math.floor(Math.random() * 3)] : undefined
    return { target, options: four, form }
  })
}

export function AlphabetQuiz() {
  const t = useTx()
  const lang = useLang()
  const [mode, setMode] = useState<Mode>('letter-name')
  const [round, setRound] = useState<Q[] | null>(null)
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState<number | null>(null)
  useEffect(() => { try { const b = localStorage.getItem('noor-alphabet-best'); if (b) setBest(+b) } catch { /* private mode */ } }, [])
  const num = (n: number) => (lang === 'bn' ? bnNum(n) : String(n))

  const start = () => { setRound(makeRound(mode)); setI(0); setPicked(null); setScore(0); setStreak(0) }
  const q = round?.[i]
  const done = round && i >= round.length
  useEffect(() => {
    if (!done) return
    const nb = Math.max(best ?? 0, score)
    if (nb === best) return
    setBest(nb)
    try { localStorage.setItem('noor-alphabet-best', String(nb)) } catch { /* ignore */ }
  }, [done, score, best])

  const answer = (l: ArabicLetter) => {
    if (!q || picked) return
    setPicked(l.id)
    if (l === q.target) { setScore((s) => s + 1); setStreak((s) => s + 1) } else setStreak(0)
  }
  const next = () => { setPicked(null); setI((x) => x + 1) }
  const shown = q ? (q.form ? letterForms(q.target)[q.form] : q.target.ar) : ''
  const formLabel = q?.form ? { initial: { en: 'at the start of a word', bn: 'শব্দের শুরুতে', ar: 'في أول الكلمة' }, medial: { en: 'in the middle of a word', bn: 'শব্দের মাঝে', ar: 'في وسط الكلمة' }, final: { en: 'at the end of a word', bn: 'শব্দের শেষে', ar: 'في آخر الكلمة' } }[q.form] : null
  const prompt = mode === 'name-letter'
    ? t({ en: 'Which letter is called', bn: 'কোন হরফটির নাম', ar: 'أي حرف اسمه' })
    : mode === 'form-letter'
      ? t({ en: 'This is the form of which letter, shown', bn: 'এটি কোন হরফের রূপ, দেখানো হয়েছে', ar: 'هذا شكل أي حرف، وقد جاء' })
      : t({ en: 'What is the name of this letter?', bn: 'এই হরফটির নাম কী?', ar: 'ما اسم هذا الحرف؟' })

  return (
    <div data-alphabet-quiz className="rounded-[2rem] border border-border bg-card p-5 sm:p-8">
      <div role="group" aria-label={t({ en: 'Quiz type', bn: 'কুইজের ধরন', ar: 'نوع الاختبار' })} className="flex flex-wrap gap-2">
        {([['letter-name', { en: 'Letter → name', bn: 'হরফ → নাম', ar: 'حرف ← اسم' }], ['name-letter', { en: 'Name → letter', bn: 'নাম → হরফ', ar: 'اسم ← حرف' }], ['form-letter', { en: 'Forms → letter', bn: 'রূপ → হরফ', ar: 'شكل ← حرف' }]] as const).map(([m, label]) => (
          <button key={m} type="button" aria-pressed={mode === m} data-mode={m} onClick={() => { setMode(m); setRound(null) }}
            className={cn('rounded-full border px-3.5 py-1.5 text-xs font-semibold transition', mode === m ? 'border-primary bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:border-primary/40')}>{t(label)}</button>
        ))}
      </div>

      {!round && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">{t({ en: `${ROUND} questions per round. Similar-looking letters are used as the wrong answers.`, bn: `প্রতি রাউন্ডে ${bnNum(ROUND)}টি প্রশ্ন। দেখতে কাছাকাছি হরফগুলো ভুল উত্তর হিসেবে আসবে।`, ar: `${ROUND} أسئلة في كل جولة، والحروف المتشابهة تظهر كخيارات خاطئة.` })}</p>
          {best != null && <p className="mt-1 text-xs text-muted-foreground">{t({ en: `Best score: ${best}/${ROUND}`, bn: `সর্বোচ্চ স্কোর: ${num(best)}/${num(ROUND)}`, ar: `أفضل نتيجة: ${best}/${ROUND}` })}</p>}
          <button type="button" onClick={start} data-quiz-start className="mt-5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_12px_28px_-12px_var(--primary)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{t({ en: 'Start the quiz', bn: 'কুইজ শুরু করুন', ar: 'ابدأ الاختبار' })}</button>
        </div>
      )}

      {round && q && !done && (
        <div className="mt-6" data-quiz-question>
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>{t({ en: 'Question', bn: 'প্রশ্ন', ar: 'سؤال' })} {num(i + 1)}/{num(round.length)}</span>
            <span aria-live="polite">{t({ en: 'Score', bn: 'স্কোর', ar: 'النتيجة' })}: {num(score)} · {t({ en: 'Streak', bn: 'ধারা', ar: 'سلسلة' })}: {num(streak)}</span>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-semibold">{prompt}{mode === 'form-letter' && formLabel && <> <span className="text-gold">{t(formLabel)}</span>?</>}</p>
            {mode === 'name-letter'
              ? <p className="font-display mt-3 text-4xl font-semibold" data-quiz-prompt>{t(q.target.name)}<span className="text-muted-foreground">?</span></p>
              : <p lang="ar" dir="rtl" className="font-arabic mt-2 text-8xl leading-[1.6] text-arabic" data-quiz-prompt>{shown}</p>}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label={t({ en: 'Answers', bn: 'উত্তর', ar: 'الإجابات' })}>
            {q.options.map((o) => {
              const correct = o === q.target
              const state = picked ? (correct ? 'correct' : picked === o.id ? 'wrong' : 'idle') : 'idle'
              return (
                <button key={o.id} type="button" disabled={!!picked} onClick={() => answer(o)} data-answer={o.id} data-correct={correct ? '1' : '0'} data-state={state}
                  className={cn('min-h-14 rounded-2xl border px-3 py-3 text-lg font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                    state === 'idle' && 'bg-background hover:border-primary/50 hover:bg-accent', state === 'correct' && 'border-primary bg-primary/10 text-primary', state === 'wrong' && 'border-destructive bg-destructive/10 text-destructive', picked && state === 'idle' && 'opacity-60')}>
                  {mode === 'name-letter' ? <span lang="ar" className="font-arabic text-4xl leading-[1.5]">{o.ar}</span> : t(o.name)}
                </button>
              )
            })}
          </div>
          <p role="status" aria-live="polite" className="mt-4 min-h-6 text-center text-sm font-semibold" data-quiz-feedback>
            {picked && (picked === q.target.id
              ? <span className="text-primary">{t({ en: 'Correct!', bn: 'সঠিক!', ar: 'صحيح!' })}</span>
              : <span className="text-destructive">{t({ en: 'Not quite. The answer is', bn: 'হয়নি। সঠিক উত্তর', ar: 'ليس تمامًا. الجواب' })} {mode === 'name-letter' ? q.target.ar : t(q.target.name)}</span>)}
          </p>
          {picked && <div className="mt-2 text-center"><button type="button" onClick={next} data-quiz-next autoFocus className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{i + 1 >= round.length ? t({ en: 'See result', bn: 'ফলাফল দেখুন', ar: 'عرض النتيجة' }) : t({ en: 'Next question', bn: 'পরের প্রশ্ন', ar: 'السؤال التالي' })}</button></div>}
        </div>
      )}

      {done && (
        <div className="mt-6 text-center" data-quiz-result>
          <p className="font-display text-3xl font-semibold">{num(score)}/{num(ROUND)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{score >= 9 ? t({ en: 'Excellent! You know the letters well.', bn: 'চমৎকার! আপনি হরফগুলো ভালো চেনেন।', ar: 'ممتاز! أنت تعرف الحروف جيدًا.' }) : score >= 6 ? t({ en: 'Good work. Practise the confusing pairs once more.', bn: 'ভালো হয়েছে। গুলিয়ে যাওয়া জোড়াগুলো আরেকবার অনুশীলন করুন।', ar: 'عمل جيد. تدرّب مرة أخرى على الحروف المتشابهة.' }) : t({ en: 'Keep going: review the cards above and try again.', bn: 'চালিয়ে যান: ওপরের কার্ডগুলো দেখে আবার চেষ্টা করুন।', ar: 'واصل: راجع البطاقات أعلاه وحاول مجددًا.' })}</p>
          {best != null && <p className="mt-1 text-xs text-muted-foreground">{t({ en: `Best score: ${best}/${ROUND}`, bn: `সর্বোচ্চ স্কোর: ${num(best)}/${num(ROUND)}`, ar: `أفضل نتيجة: ${best}/${ROUND}` })}</p>}
          <button type="button" onClick={start} data-quiz-restart className="mt-5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{t({ en: 'Play again', bn: 'আবার খেলুন', ar: 'العب مجددًا' })}</button>
        </div>
      )}
    </div>
  )
}
