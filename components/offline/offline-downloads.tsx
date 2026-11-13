'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Check, Download, Loader2, Trash2, X, HardDrive } from 'lucide-react'
import { useMounted, useTx } from '@/lib/lang'
import { useReader } from '@/lib/stores/reader'
import { chapters, surahNamesBn, surahHref } from '@/lib/quran/chapters'
import { getReciter } from '@/lib/audio/reciters'
import { UiIcon } from '@/components/ui-icon'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { cachedPagePaths, deleteDownloadedPages, EST_AUDIO_ALL_MB, EST_PAGES_MB, fmtBytes, isPersisted, requestPersist, storageEstimate } from '@/lib/offline/cache'
import { cancelPagesDownload, canDownloadPages, startPagesDownload, subscribeProgress, type PagesProgress } from '@/lib/offline/pages'
import { deleteAllAudio, deleteSurahAudio, useAudioIndex, verifyAudioIndex } from '@/lib/offline/audio-cache'
import { cancelAudioJobs, enqueueSurahs, useAudioJobs } from '@/lib/offline/audio-queue'

const bar = (pct: number) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
    <div className="h-full rounded-full bg-gradient-to-r from-gold to-primary transition-[width] duration-300" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
  </div>
)

/** Self-contained "Offline & downloads" card. `full` adds the per-surah recitation list (used on /downloads). */
export function OfflineDownloads({ full = false }: { full?: boolean }) {
  const mounted = useMounted()
  const t = useTx()
  const reciterId = useReader((s) => s.reciterId)
  const reciter = getReciter(reciterId)
  const entries = useAudioIndex((s) => s.entries)
  const jobs = useAudioJobs()
  const [swOk, setSwOk] = useState<boolean | null>(null)
  const [pagesCached, setPagesCached] = useState(0)
  const [juzCached, setJuzCached] = useState(0)
  const [withJuz, setWithJuz] = useState(false)
  const [prog, setProg] = useState<PagesProgress | null>(null)
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null)
  const [persisted, setPersisted] = useState(false)
  const lastMsg = useRef(0)

  const refresh = useCallback(async () => {
    const paths = await cachedPagePaths()
    setPagesCached(chapters.filter((c) => paths.has(surahHref(c.id))).length)
    setJuzCached(Array.from({ length: 30 }, (_, i) => `/juz/${i + 1}`).filter((p) => paths.has(p)).length)
    setStorage(await storageEstimate())
    setPersisted(await isPersisted())
  }, [])

  useEffect(() => {
    if (!mounted) return
    let alive = true
    let tries = 0
    const check = () => void canDownloadPages().then((ok) => { if (!alive) return; setSwOk(ok); if (!ok && tries++ < 15) setTimeout(check, 1500) })
    check()
    void refresh()
    void verifyAudioIndex()
    const unsub = subscribeProgress((p) => {
      lastMsg.current = Date.now()
      setProg(p)
      if (p.state === 'done' || p.state === 'cancelled' || p.state === 'error') { void refresh(); if (p.state === 'done') toast.success(t({ en: 'The whole Quran is saved for offline reading.', bn: 'পুরো কুরআন অফলাইনে পড়ার জন্য সংরক্ষিত হয়েছে।' })) }
      else if (p.phase === 'pages' && p.done % 10 === 0) void refresh()
    })
    return () => { alive = false; unsub() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, refresh])

  // refresh storage numbers as audio downloads finish
  useEffect(() => { if (mounted) void storageEstimate().then(setStorage) }, [mounted, entries, jobs.current])

  const running = prog && prog.state === 'running'
  const audioDone = useMemo(() => chapters.filter((c) => entries[`${reciterId}:${c.id}`]), [entries, reciterId])
  const audioBytes = useMemo(() => Object.entries(entries).filter(([k]) => k.startsWith(`${reciterId}:`)).reduce((a, [, v]) => a + v.bytes, 0), [entries, reciterId])
  const allAudioBytes = useMemo(() => Object.values(entries).reduce((a, v) => a + v.bytes, 0), [entries])
  const jobActive = jobs.current !== null || jobs.pending.length > 0

  if (!mounted) return <div className="card-soft mt-6 h-72 rounded-3xl shimmer" />

  const pagesPct = prog && prog.state === 'running' ? (prog.phase === 'pages' ? (prog.done / Math.max(1, prog.total)) * 85 : 85 + (prog.done / Math.max(1, prog.total)) * 15) : (pagesCached / 114) * 100
  const complete = pagesCached >= 114
  const surahName = (id: number) => (t({ en: 'en', bn: 'bn' }) === 'bn' ? surahNamesBn[id - 1] ?? chapters[id - 1].nameSimple : chapters[id - 1].nameSimple)

  const startPages = async () => {
    try {
      void requestPersist().then(setPersisted)
      setProg({ type: 'progress', jobId: '', phase: 'pages', state: 'running', done: 0, total: 114, bytes: 0, failed: 0 })
      await startPagesDownload({ withJuz })
    } catch {
      setProg(null)
      toast.error(t({ en: 'Offline mode needs the installed app / production build (service worker not active yet — reload once and try again).', bn: 'অফলাইন মোডের জন্য সার্ভিস ওয়ার্কার চালু থাকতে হবে — একবার রিলোড করে আবার চেষ্টা করুন।' }))
    }
  }
  const downloadAll = () => {
    if (!reciter.chapter) return toast.info(t({ en: 'This reciter only has per-ayah audio, which can’t be saved yet. Pick a chapter-recitation reciter.', bn: 'এই ক্বারীর কেবল আয়াত-ভিত্তিক অডিও আছে, যা এখনো সংরক্ষণ করা যায় না।' }))
    const missing = chapters.map((c) => c.id).filter((id) => !entries[`${reciterId}:${id}`])
    if (!missing.length) return
    const est = Math.round((EST_AUDIO_ALL_MB * missing.length) / 114)
    if (!window.confirm(t({ en: `Download ${missing.length} recitations by ${reciter.name}? About ${est} MB. Keep the app open on Wi-Fi.`, bn: `${reciter.name}-এর ${missing.length}টি তিলাওয়াত ডাউনলোড করবেন? প্রায় ${est} MB। ওয়াই-ফাইয়ে অ্যাপ খোলা রাখুন।` }))) return
    void requestPersist().then(setPersisted)
    enqueueSurahs(reciterId, missing, { failed: t({ en: 'A recitation could not be downloaded. Check your connection.', bn: 'একটি তিলাওয়াত ডাউনলোড করা যায়নি। সংযোগ দেখুন।' }) })
  }
  const downloadOne = (id: number) => {
    if (!reciter.chapter) return toast.info(t({ en: 'This reciter only has per-ayah audio, which can’t be saved yet.', bn: 'এই ক্বারীর অডিও সংরক্ষণ করা যায় না।' }))
    enqueueSurahs(reciterId, [id], { failed: t({ en: 'Could not download that recitation. Check your connection.', bn: 'তিলাওয়াত ডাউনলোড করা যায়নি। সংযোগ দেখুন।' }) })
  }

  const btn = 'inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold transition disabled:opacity-50'

  return (
    <section className="card-soft mt-6 space-y-6 rounded-3xl p-5 sm:p-7">
      <h2 className="flex items-center gap-3 font-display text-xl font-semibold"><UiIcon name="quran" size={30} />{t({ en: 'Offline & downloads', bn: 'অফলাইন ও ডাউনলোড' })}</h2>

      {/* storage */}
      <div className="rounded-2xl bg-surface-2 p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 font-medium"><HardDrive className="size-4 text-primary" />{t({ en: 'Storage used by Noor', bn: 'নূরের ব্যবহৃত স্টোরেজ' })}</span>
          <span className="tabular-nums text-muted-foreground">{storage ? `${fmtBytes(storage.usage)} / ${fmtBytes(storage.quota)}` : '—'}</span>
        </div>
        <div className="mt-2">{bar(storage && storage.quota ? Math.max(1, (storage.usage / storage.quota) * 100) : 0)}</div>
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{persisted ? t({ en: 'Protected: the browser won’t clear your downloads automatically.', bn: 'সুরক্ষিত: ব্রাউজার ডাউনলোড নিজে থেকে মুছবে না।' }) : t({ en: 'The browser may clear downloads if the device runs low on space.', bn: 'জায়গা কমে গেলে ব্রাউজার ডাউনলোড মুছে ফেলতে পারে।' })}</span>
          {!persisted && <button onClick={() => void requestPersist().then((ok) => { setPersisted(ok); if (!ok) toast.info(t({ en: 'The browser declined — installing the app usually helps.', bn: 'ব্রাউজার রাজি হয়নি — অ্যাপ ইনস্টল করলে সাধারণত কাজ করে।' })) })} className="shrink-0 rounded-full border px-3 py-1 font-semibold text-foreground">{t({ en: 'Keep my downloads', bn: 'ডাউনলোড রাখুন' })}</button>}
        </div>
      </div>

      {/* reading */}
      <div>
        <h3 className="font-semibold">{t({ en: 'Read the whole Quran offline', bn: 'অফলাইনে পুরো কুরআন পড়ুন' })}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t({ en: `Saves all 114 surah pages (Arabic, English, Bangla, transliteration) and the app files they need — about ${EST_PAGES_MB} MB. Pages you open are also saved automatically.`, bn: `১১৪টি সূরার সব পৃষ্ঠা (আরবি, ইংরেজি, বাংলা, উচ্চারণ) ও প্রয়োজনীয় অ্যাপ ফাইল সংরক্ষণ হবে — প্রায় ${EST_PAGES_MB} MB। যে পৃষ্ঠা খুলবেন তা নিজে থেকেও সংরক্ষিত হয়।` })}</p>
        <div className="mt-3">{bar(pagesPct)}</div>
        <p className="mt-2 text-xs text-muted-foreground tabular-nums" aria-live="polite">
          {running
            ? prog!.phase === 'pages'
              ? t({ en: `Saving surah pages… ${prog!.done}/${prog!.total}`, bn: `সূরার পৃষ্ঠা সংরক্ষণ হচ্ছে… ${prog!.done}/${prog!.total}` })
              : t({ en: `Saving app files… ${prog!.done}/${prog!.total}`, bn: `অ্যাপ ফাইল সংরক্ষণ হচ্ছে… ${prog!.done}/${prog!.total}` })
            : complete
              ? t({ en: `All 114 surahs saved${juzCached ? ` · ${juzCached}/30 juz pages` : ''}`, bn: `সব ১১৪টি সূরা সংরক্ষিত${juzCached ? ` · ${juzCached}/৩০ পারা` : ''}` })
              : t({ en: `${pagesCached}/114 surahs saved`, bn: `${pagesCached}/১১৪টি সূরা সংরক্ষিত` })}
          {prog?.failed ? ` · ${t({ en: `${prog.failed} failed — press Resume`, bn: `${prog.failed}টি ব্যর্থ — আবার চালান` })}` : ''}
        </p>
        <label className="mt-3 flex items-center justify-between gap-4 text-sm"><span>{t({ en: 'Also save the 30 juz pages', bn: '৩০ পারার পৃষ্ঠাও সংরক্ষণ করুন' })}</span><Switch checked={withJuz} onCheckedChange={setWithJuz} disabled={!!running} /></label>
        <div className="mt-4 flex flex-wrap gap-2">
          {running ? (
            <button onClick={() => void cancelPagesDownload()} className={cn(btn, 'border')}><X className="size-4" />{t({ en: 'Cancel', bn: 'বাতিল' })}</button>
          ) : (
            <button onClick={startPages} disabled={swOk === false} className={cn(btn, 'bg-primary text-primary-foreground')}>
              <Download className="size-4" />{complete && (!withJuz || juzCached === 30) ? t({ en: 'Update', bn: 'আপডেট' }) : pagesCached > 0 ? t({ en: 'Resume download', bn: 'ডাউনলোড চালিয়ে যান' }) : t({ en: 'Download Quran', bn: 'কুরআন ডাউনলোড' })}
            </button>
          )}
          {(pagesCached > 0 || juzCached > 0) && !running && (
            <button onClick={() => void deleteDownloadedPages().then(refresh)} className={cn(btn, 'border text-muted-foreground')}><Trash2 className="size-4" />{t({ en: 'Remove', bn: 'মুছুন' })}</button>
          )}
        </div>
        {swOk === false && <p className="mt-3 text-xs text-gold">{t({ en: 'Offline mode switches on in the installed / production app (the service worker isn’t running in this session).', bn: 'ইনস্টল করা / প্রোডাকশন অ্যাপে অফলাইন মোড চালু হয় (এই সেশনে সার্ভিস ওয়ার্কার চালু নেই)।' })}</p>}
      </div>

      {/* audio */}
      <div>
        <h3 className="font-semibold">{t({ en: 'Recitation for offline listening', bn: 'অফলাইনে তিলাওয়াত শুনুন' })}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t({ en: `Reciter: ${reciter.name}. Change it in Recitation settings.`, bn: `ক্বারী: ${reciter.name}। তিলাওয়াত সেটিংসে পরিবর্তন করুন।` })}</p>
        {!reciter.chapter && <p className="mt-2 text-xs text-gold">{t({ en: 'This reciter streams per-ayah files, which can’t be saved yet — choose a chapter-recitation reciter such as Mishary Alafasy.', bn: 'এই ক্বারী আয়াত-ভিত্তিক ফাইল ব্যবহার করেন, যা সংরক্ষণ করা যায় না।' })}</p>}
        <p className="mt-3 text-sm tabular-nums">
          <span className="font-semibold">{audioDone.length}/114</span> {t({ en: 'surahs downloaded', bn: 'সূরা ডাউনলোড হয়েছে' })} · {fmtBytes(audioBytes)}
          {allAudioBytes > audioBytes && <span className="text-muted-foreground"> ({fmtBytes(allAudioBytes)} {t({ en: 'all reciters', bn: 'সব ক্বারী' })})</span>}
        </p>
        {jobActive && (
          <div className="mt-3">
            {bar(jobs.total ? (jobs.loaded / jobs.total) * 100 : 3)}
            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground tabular-nums"><Loader2 className="size-3.5 animate-spin" />{jobs.current ? `${surahName(jobs.current)} · ${fmtBytes(jobs.loaded)}${jobs.total ? ` / ${fmtBytes(jobs.total)}` : ''}` : ''}{jobs.pending.length ? ` · ${t({ en: `${jobs.pending.length} queued`, bn: `${jobs.pending.length}টি অপেক্ষায়` })}` : ''}</p>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {jobActive ? (
            <button onClick={cancelAudioJobs} className={cn(btn, 'border')}><X className="size-4" />{t({ en: 'Cancel', bn: 'বাতিল' })}</button>
          ) : (
            <button onClick={downloadAll} disabled={audioDone.length === 114} className={cn(btn, 'bg-primary text-primary-foreground')}><Download className="size-4" />{t({ en: 'Download all', bn: 'সব ডাউনলোড' })}</button>
          )}
          {allAudioBytes > 0 && !jobActive && (
            <button onClick={() => { if (window.confirm(t({ en: 'Delete all downloaded recitations?', bn: 'সব ডাউনলোড করা তিলাওয়াত মুছবেন?' }))) void deleteAllAudio().then(() => toast.success(t({ en: 'Recitations removed', bn: 'তিলাওয়াত মুছে ফেলা হয়েছে' }))) }} className={cn(btn, 'border text-muted-foreground')}><Trash2 className="size-4" />{t({ en: 'Delete all', bn: 'সব মুছুন' })}</button>
          )}
        </div>

        {full ? (
          <ul className="mt-5 grid gap-2 sm:grid-cols-2" data-testid="audio-list">
            {chapters.map((c) => {
              const e = entries[`${reciterId}:${c.id}`]
              const active = jobs.current === c.id
              const queued = jobs.pending.includes(c.id)
              return (
                <li key={c.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold-soft text-sm font-semibold tabular-nums">{c.id}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{surahName(c.id)}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">{e ? `${t({ en: 'Downloaded', bn: 'ডাউনলোড হয়েছে' })} · ${fmtBytes(e.bytes)}` : active ? `${jobs.total ? Math.round((jobs.loaded / jobs.total) * 100) : 0}%` : queued ? t({ en: 'Queued', bn: 'অপেক্ষায়' }) : t({ en: 'Not downloaded', bn: 'ডাউনলোড হয়নি' })}</p>
                  </div>
                  {e ? (
                    <button aria-label={t({ en: 'Delete download', bn: 'ডাউনলোড মুছুন' })} onClick={() => void deleteSurahAudio(reciterId, c.id)} className="grid size-9 place-items-center rounded-full border text-muted-foreground transition hover:text-foreground"><Trash2 className="size-4" /></button>
                  ) : active || queued ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : (
                    <button aria-label={t({ en: 'Download', bn: 'ডাউনলোড' })} onClick={() => downloadOne(c.id)} className="grid size-9 place-items-center rounded-full bg-accent text-primary transition hover:bg-primary hover:text-primary-foreground"><Download className="size-4" /></button>
                  )}
                  {e && <Check className="hidden size-4 text-primary sm:block" />}
                </li>
              )
            })}
          </ul>
        ) : (
          <Link href="/downloads" className="mt-4 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline">{t({ en: 'Manage recitations surah by surah →', bn: 'সূরা অনুযায়ী তিলাওয়াত ম্যানেজ করুন →' })}</Link>
        )}
      </div>
    </section>
  )
}
