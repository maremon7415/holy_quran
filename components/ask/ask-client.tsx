'use client'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Cpu, ShieldCheck, Sparkles, X } from 'lucide-react'
import Link from '@/lib/i18n/link'
import { useLang, useTx } from '@/lib/lang'
import { chapters, surahHref, readerHref, surahNamesBn, toArabicDigits, toBanglaDigits } from '@/lib/quran/chapters'
import { ayahKeys, encodeQueryVector } from '@/lib/ask/vectors'
import type { AskResponse, AskResult } from '@/lib/ask'
import { useLocalModel } from './use-local-model'

const EXAMPLES = {
  en: [
    'What does Allah say about people who are patient in hardship?',
    'Verses that comfort a grieving person',
    'How should I treat my parents?',
    'Can Allah forgive all my sins?',
    'Does Allah answer when I call on Him?',
  ],
  bn: [
    'বাবা-মায়ের সাথে আচরণ নিয়ে কুরআনে কী আছে',
    'দুশ্চিন্তায় মন শান্ত হবে কীভাবে',
    'কষ্টের পরে কি স্বস্তি আসে?',
    'দান-সদকার পুরস্কার কী?',
  ],
  ar: ['الصبر عند المصيبة', 'الإحسان إلى الوالدين'],
}

type Status = 'idle' | 'loading' | 'done' | 'error'
interface OfflineHit { key: string; surah: number; ayah: number; score: number }

export function AskClient({ initialQuery = '' }: { initialQuery?: string }) {
  const t = useTx()
  const lang = useLang()
  const pathname = usePathname()
  const local = useLocalModel()
  const [text, setText] = useState(initialQuery)
  const [status, setStatus] = useState<Status>('idle')
  const [data, setData] = useState<AskResponse | null>(null)
  const [offline, setOffline] = useState<OfflineHit[] | null>(null)
  const reqId = useRef(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const ranInitial = useRef(false)

  const run = useCallback(async (raw: string) => {
    const q = raw.trim().slice(0, 300)
    if (q.length < 2) return
    const id = ++reqId.current
    setStatus('loading')
    setOffline(null)
    // shallow URL update (shareable ?q=) without a server round-trip
    window.history.replaceState(null, '', `${pathname}?q=${encodeURIComponent(q)}`)
    let vec: Float32Array | null = null
    if (local.state.status === 'ready') {
      try { vec = await local.embed(q) } catch { vec = null }
    }
    const params = new URLSearchParams({ q, lang })
    if (vec) params.set('qv', encodeQueryVector(vec))
    try {
      const res = await fetch(`/api/ask?${params}`)
      if (!res.ok) throw new Error(String(res.status))
      const json = (await res.json()) as AskResponse
      if (id !== reqId.current) return
      setData(json)
      setStatus('done')
    } catch {
      if (id !== reqId.current) return
      // offline / server unreachable: rank on this device when smart search is on
      if (vec) {
        try {
          const hits = await local.search(vec, 12)
          const keys = ayahKeys()
          setOffline(hits.map(([row, score]) => { const [s, a] = keys[row].split(':').map(Number); return { key: keys[row], surah: s, ayah: a, score } }))
          setData(null)
          setStatus('done')
          return
        } catch { /* fall through */ }
      }
      setStatus('error')
    }
  }, [lang, local, pathname])

  useEffect(() => {
    if (ranInitial.current || !initialQuery) return
    ranInitial.current = true
    run(initialQuery)
  }, [initialQuery, run])

  const submit = (e: FormEvent) => { e.preventDefault(); run(text) }
  const ask = (q: string) => { setText(q); run(q); inputRef.current?.focus() }
  const examples = lang === 'bn' ? [...EXAMPLES.bn, ...EXAMPLES.en.slice(0, 2)] : lang === 'ar' ? [...EXAMPLES.ar, ...EXAMPLES.en.slice(0, 3)] : [...EXAMPLES.en, ...EXAMPLES.bn.slice(0, 2)]
  const num = (n: number | string) => (lang === 'bn' ? toBanglaDigits(n) : lang === 'ar' ? toArabicDigits(n) : String(n))
  const scores = data?.results.map((r) => r.score) ?? []
  const range = { max: scores.length ? Math.max(...scores) : 0, min: scores.length ? Math.min(...scores) : 0 }

  return (
    <div>
      <form onSubmit={submit} role="search" className="relative mt-6 max-w-3xl">
        <label htmlFor="ask-q" className="sr-only">{t({ en: 'Your question', bn: 'আপনার প্রশ্ন', ar: 'سؤالك' })}</label>
        <textarea
          id="ask-q"
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); run(text) } }}
          rows={2}
          dir="auto"
          maxLength={300}
          autoComplete="off"
          placeholder={t({ en: 'Ask a question in English, Bangla or Arabic…', bn: 'বাংলা, ইংরেজি বা আরবিতে প্রশ্ন লিখুন…', ar: 'اكتب سؤالك بالعربية أو الإنجليزية أو البنغالية…' })}
          className="block min-h-[5.5rem] w-full resize-none rounded-3xl border border-border bg-card px-5 py-4 pe-16 text-base leading-relaxed shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 sm:text-lg"
        />
        <button type="submit" disabled={text.trim().length < 2 || status === 'loading'} aria-label={t({ en: 'Ask', bn: 'জিজ্ঞাসা করুন', ar: 'اسأل' })} className="absolute bottom-3 end-3 grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow transition active:scale-95 disabled:opacity-50">
          <ArrowUp className="size-5" aria-hidden />
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2" aria-label={t({ en: 'Example questions', bn: 'উদাহরণ প্রশ্ন', ar: 'أسئلة مقترحة' })}>
        {examples.map((q) => (
          <button key={q} type="button" dir="auto" onClick={() => ask(q)} lang={/[ঀ-৿]/.test(q) ? 'bn' : /[؀-ۿ]/.test(q) ? 'ar' : 'en'} className="lift rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-start text-sm hover:bg-accent">{q}</button>
        ))}
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
        <span>{t({ en: 'Private: your questions are not stored or logged. Results are real ayahs ranked by meaning — nothing is generated.', bn: 'গোপনীয়: আপনার প্রশ্ন সংরক্ষণ বা লগ করা হয় না। ফলাফল হলো অর্থের ভিত্তিতে সাজানো আসল আয়াত — কিছুই বানিয়ে লেখা নয়।', ar: 'خصوصية: لا تُحفظ أسئلتك ولا تُسجَّل. النتائج آيات حقيقية مرتبة حسب المعنى — لا يُولَّد أي نص.' })}</span>
      </p>

      <LocalToggle local={local} t={t} num={num} />

      <section aria-live="polite" aria-busy={status === 'loading'} className="mt-8">
        <AnimatePresence mode="wait">
          {status === 'loading' && <Skeleton key="sk" t={t} />}
          {status === 'error' && (
            <motion.p key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-soft rounded-3xl p-6 text-sm">
              {t({ en: 'Could not reach the search right now.', bn: 'এই মুহূর্তে অনুসন্ধান করা যাচ্ছে না।', ar: 'تعذّر الوصول إلى البحث الآن.' })}{' '}
              <Link href={`/search?q=${encodeURIComponent(text)}`} className="font-semibold text-primary hover:underline">{t({ en: 'Try word search', bn: 'শব্দ দিয়ে খুঁজুন', ar: 'جرّب البحث بالكلمات' })}</Link>
            </motion.p>
          )}
          {status === 'done' && offline && (
            <motion.div key="off" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <p className="mb-3 text-sm text-muted-foreground">{t({ en: 'You seem to be offline — ranked on this device. Open a verse to read it.', bn: 'আপনি সম্ভবত অফলাইনে — এই ডিভাইসেই সাজানো হয়েছে। পড়তে আয়াতটি খুলুন।', ar: 'يبدو أنك غير متصل — رُتّبت النتائج على جهازك. افتح الآية لقراءتها.' })}</p>
              <ol className="grid gap-2 sm:grid-cols-2">
                {offline.map((h) => (
                  <li key={h.key}><Link href={readerHref(h.surah, h.ayah)} className="card-soft lift flex items-center justify-between rounded-2xl px-4 py-3 text-sm"><span className="font-semibold">{lang === 'bn' ? surahNamesBn[h.surah - 1] : chapters[h.surah - 1].nameSimple} {num(h.key)}</span><span lang="ar" className="font-arabic">{chapters[h.surah - 1].nameArabic}</span></Link></li>
                ))}
              </ol>
            </motion.div>
          )}
          {status === 'done' && data && (
            <motion.div key={`r-${data.query}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }}>
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
                {data.mode === 'semantic' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><Sparkles className="size-3.5" aria-hidden />{t({ en: 'Search by meaning', bn: 'অর্থ অনুযায়ী অনুসন্ধান', ar: 'بحث بالمعنى' })}</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-gold">{t({ en: 'Word match', bn: 'শব্দ মিলিয়ে', ar: 'مطابقة الكلمات' })}</span>
                )}
                <span className="text-muted-foreground">{num(data.results.length)} {t({ en: data.results.length === 1 ? 'passage' : 'passages', bn: 'টি অংশ', ar: 'مقاطع' })}</span>
                <Link href={`/search?q=${encodeURIComponent(data.query)}`} className="ms-auto text-xs font-medium text-muted-foreground hover:text-primary">{t({ en: 'Search exact words instead', bn: 'হুবহু শব্দ দিয়ে খুঁজুন', ar: 'ابحث بالكلمات حرفيًا' })} <span aria-hidden className="inline-block rtl:rotate-180">→</span></Link>
              </div>
              {data.mode === 'lexical' && (
                <p role="note" className="mb-4 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm">
                  {t({ en: 'Meaning-based search is unavailable right now, so these results come from word matching.', bn: 'এই মুহূর্তে অর্থভিত্তিক অনুসন্ধান পাওয়া যাচ্ছে না, তাই ফলাফল শব্দ মিলিয়ে দেখানো হচ্ছে।', ar: 'البحث بالمعنى غير متاح الآن، لذلك النتائج من مطابقة الكلمات.' })}
                  {local.state.status === 'off' && <> {t({ en: 'You can turn on smart search on this device below.', bn: 'নিচে এই ডিভাইসে স্মার্ট অনুসন্ধান চালু করতে পারেন।', ar: 'يمكنك تفعيل البحث الذكي على جهازك أدناه.' })}</>}
                </p>
              )}
              {data.results.length === 0 ? (
                <p className="card-soft rounded-3xl p-6 text-sm">{t({ en: 'No verses found. Try rephrasing your question or browse topics.', bn: 'কোনো আয়াত পাওয়া যায়নি। প্রশ্নটি অন্যভাবে লিখুন বা বিষয়গুলো দেখুন।', ar: 'لم نجد آيات. أعد صياغة سؤالك أو تصفّح المواضيع.' })} <Link href="/topics" className="font-semibold text-primary hover:underline">{t({ en: 'Topics', bn: 'বিষয়সমূহ', ar: 'المواضيع' })}</Link></p>
              ) : (
                <ol className="space-y-3">
                  {data.results.map((r, i) => <ResultCard key={r.ref} r={r} i={i} range={range} lang={lang} t={t} num={num} semantic={data.mode === 'semantic'} />)}
                </ol>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  )
}

type Tx = ReturnType<typeof useTx>

function ResultCard({ r, i, range, lang, t, num, semantic }: { r: AskResult; i: number; range: { min: number; max: number }; lang: string; t: Tx; num: (n: number | string) => string; semantic: boolean }) {
  const name = lang === 'bn' ? r.surahNameBn : lang === 'ar' ? r.surahNameAr : r.surahName
  // relative to this result list (raw cosine scores sit in a narrow band)
  const relevance = range.max > range.min ? 0.3 + 0.7 * ((r.score - range.min) / (range.max - range.min)) : 1
  return (
    <motion.li initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 6) * 0.04, type: 'spring', stiffness: 380, damping: 30 }}>
      <article className="card-soft rounded-3xl p-5" data-ask-ref={r.ref}>
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Link href={surahHref(r.surah, r.from)} className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:bg-primary hover:text-primary-foreground">
            <span lang="ar" className="font-arabic text-sm">{r.surahNameAr}</span>
            {lang !== 'ar' && <span>{name}</span>}
            <span dir="ltr">{num(r.ref)}</span>
          </Link>
          <span className="flex items-center gap-2 text-[11px] text-muted-foreground" title={`score ${r.score.toFixed(3)}${semantic ? ` · cosine ${r.similarity.toFixed(3)}` : ''}`}>
            {t({ en: 'Relevance', bn: 'প্রাসঙ্গিকতা', ar: 'الصلة' })}
            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted" aria-hidden><span className="block h-full rounded-full bg-primary" style={{ width: `${Math.round(relevance * 100)}%` }} /></span>
            <span className="sr-only">{Math.round(relevance * 100)}%</span>
          </span>
        </header>
        <div className="space-y-4">
          {r.ayahs.map((a) => (
            <div key={a.key}>
              <p lang="ar" dir="rtl" className="quran-text text-right text-[24px] leading-[2.1] sm:text-[26px]">{a.arabic} <span className="ayah-marker">{toArabicDigits(a.ayah)}</span></p>
              {lang === 'bn' ? (
                <>
                  {a.uccharon && <p lang="bn" data-tr="bt" className="font-bangla mt-2 text-sm italic leading-relaxed text-muted-foreground">{a.uccharon}</p>}
                  <p lang="bn" className="font-bangla mt-2 text-[15px] leading-relaxed text-foreground/90">{a.bn}</p>
                </>
              ) : (
                <p lang="en" className="mt-2 text-[15px] leading-relaxed text-foreground/90">{a.en}</p>
              )}
            </div>
          ))}
        </div>
        <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs">
          <span className="font-semibold text-muted-foreground">{t({ en: 'Why this matched:', bn: 'কেন মিলেছে:', ar: 'سبب المطابقة:' })}</span>
          {r.why.topics.map((tp) => (
            <Link key={tp.slug} href={`/topics/${tp.slug}`} className="rounded-full bg-gold-soft px-2.5 py-0.5 font-medium text-gold hover:underline">{t({ en: 'Topic', bn: 'বিষয়', ar: 'موضوع' })}: <span className="capitalize">{lang === 'bn' ? tp.title.bn : lang === 'ar' ? tp.title.ar ?? tp.title.en : tp.title.en}</span></Link>
          ))}
          {r.why.words.map((w) => <span key={w} className="rounded-full border border-border px-2.5 py-0.5">“{w}”</span>)}
          {semantic && <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">{t({ en: 'Close in meaning', bn: 'অর্থে কাছাকাছি', ar: 'قريب في المعنى' })}</span>}
          <Link href={readerHref(r.surah, r.from)} className="ms-auto font-medium text-muted-foreground hover:text-primary">{t({ en: 'Read in context', bn: 'প্রসঙ্গসহ পড়ুন', ar: 'اقرأ في سياقها' })} <span aria-hidden className="inline-block rtl:rotate-180">→</span></Link>
        </footer>
      </article>
    </motion.li>
  )
}

function Skeleton({ t }: { t: Tx }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3" role="status">
      <span className="sr-only">{t({ en: 'Searching by meaning…', bn: 'অর্থ অনুযায়ী খোঁজা হচ্ছে…', ar: 'جارٍ البحث بالمعنى…' })}</span>
      {[0, 1, 2].map((i) => (
        <div key={i} className="card-soft rounded-3xl p-5" aria-hidden>
          <div className="shimmer h-6 w-40 rounded-full" />
          <div className="shimmer ms-auto mt-4 h-7 w-11/12 rounded-xl" />
          <div className="shimmer ms-auto mt-2 h-7 w-3/4 rounded-xl" />
          <div className="shimmer mt-4 h-4 w-full rounded-lg" />
          <div className="shimmer mt-2 h-4 w-2/3 rounded-lg" />
        </div>
      ))}
    </motion.div>
  )
}

function LocalToggle({ local, t, num }: { local: ReturnType<typeof useLocalModel>; t: Tx; num: (n: number | string) => string }) {
  const s = local.state
  const mb = (n: number) => num(Math.round(n / 1e6))
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Cpu className="size-3.5 shrink-0" aria-hidden />
      {s.status === 'off' && (
        <>
          <span>{t({ en: 'Smart search runs on our server.', bn: 'স্মার্ট অনুসন্ধান আমাদের সার্ভারে চলে।', ar: 'البحث الذكي يعمل على خادمنا.' })}</span>
          <button type="button" onClick={local.enable} className="rounded-full border border-border bg-card px-3 py-1 font-semibold text-foreground hover:bg-accent">
            {t({ en: 'Enable smart search on this device (downloads ~210 MB once, cached)', bn: 'এই ডিভাইসে স্মার্ট অনুসন্ধান চালু করুন (একবার ~২১০ MB ডাউনলোড, সংরক্ষিত থাকে)', ar: 'فعّل البحث الذكي على جهازك (تنزيل ~210 ميغابايت مرة واحدة)' })}
          </button>
        </>
      )}
      {s.status === 'loading' && (
        <span role="status" className="flex items-center gap-2">
          {t({ en: 'Downloading the model…', bn: 'মডেল ডাউনলোড হচ্ছে…', ar: 'جارٍ تنزيل النموذج…' })}
          {s.total > 0 && <><span className="h-1.5 w-28 overflow-hidden rounded-full bg-muted" aria-hidden><span className="block h-full bg-primary transition-[width]" style={{ width: `${Math.round((s.loaded / s.total) * 100)}%` }} /></span>{mb(s.loaded)}/{mb(s.total)} MB</>}
        </span>
      )}
      {s.status === 'ready' && (
        <>
          <span className="font-medium text-primary">{t({ en: 'Smart search is running on this device', bn: 'স্মার্ট অনুসন্ধান এই ডিভাইসে চলছে', ar: 'البحث الذكي يعمل على جهازك' })} ({s.device === 'webgpu' ? 'WebGPU' : 'WASM'})</span>
          <button type="button" onClick={local.disable} className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-accent"><X className="size-3" aria-hidden />{t({ en: 'Turn off', bn: 'বন্ধ করুন', ar: 'إيقاف' })}</button>
        </>
      )}
      {s.status === 'error' && (
        <>
          <span>{t({ en: 'Could not start smart search on this device — using the server instead.', bn: 'এই ডিভাইসে স্মার্ট অনুসন্ধান চালু করা যায়নি — সার্ভার ব্যবহার করা হচ্ছে।', ar: 'تعذّر تشغيل البحث الذكي على جهازك — نستخدم الخادم بدلًا من ذلك.' })}</span>
          <button type="button" onClick={local.enable} className="rounded-full px-2 py-1 font-semibold hover:bg-accent">{t({ en: 'Retry', bn: 'আবার চেষ্টা', ar: 'إعادة المحاولة' })}</button>
        </>
      )}
    </div>
  )
}
