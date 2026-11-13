'use client'
/**
 * AudioEngine — drives one <audio> element from the shared player store.
 *
 * Two modes:
 *  - chapter: one mp3 per surah + verse/word timings (quran.com CDN). Word-synced.
 *  - ayah:    one mp3 per ayah (everyayah.com). Used for everyayah-only reciters and as an error fallback.
 *
 * The store stays the source of truth for *what* should play (queue, currentKey, status);
 * the engine reports back *what is playing* (currentKey, currentWord, status) and only calls
 * store.set when a value really changes.
 */
import { toast } from 'sonner'
import { usePlayer, ayahCount } from '@/lib/stores/player'
import { useReader } from '@/lib/stores/reader'
import { chapters, surahNamesBn } from '@/lib/quran/chapters'
import { useAppStore } from '@/lib/store'
import { tx, type Lang } from '@/lib/lang'
import { fetchChapterAudio, prefetchChapterAudio, type ChapterAudio } from './api'
import { getReciter, everyAyahUrl, type Reciter } from './reciters'
import { useClock } from './clock'
import { usePlayerPrefs } from './prefs'
import { useSleep } from './sleep'
import { audioBridge } from './bridge'
import { getOfflineAudioObjectUrl } from '@/lib/offline/audio-cache'
import { setMediaMetadata, setMediaState, setMediaPosition, setMediaHandlers, clearMedia } from './media-session'

const EPS = 30 // ms: treat an ayah as finished slightly before its end timestamp
const bn = () => useAppStore.getState().language === 'bn'
const lng = () => (useAppStore.getState().language as Lang) || 'en'

export class AudioEngine {
  private audio: HTMLAudioElement
  private pre: HTMLAudioElement
  private mode: 'chapter' | 'ayah' = 'chapter'
  private ch: ChapterAudio | null = null
  private loaded: { surah: number; reciter: number } | null = null
  private loading = false
  private token = 0
  private localUrl: string | null = null
  private revokeLocal() { if (this.localUrl) { URL.revokeObjectURL(this.localUrl); this.localUrl = null } }
  private reportedKey: string | null = null
  private ayahNo = 1
  private repeatLeft = 1
  private finished = false
  private lastWord: number | null = null
  private lastClock = 0
  private lastPos = 0
  private internalPause = false
  private raf = 0
  private iv: ReturnType<typeof setInterval> | null = null
  private sleepIv: ReturnType<typeof setInterval> | null = null
  private ayahOnly = new Set<string>()
  private altReciter = new Set<string>()
  private unsubs: (() => void)[] = []
  private cleanups: (() => void)[] = []

  constructor(audio: HTMLAudioElement) {
    this.audio = audio
    this.pre = new Audio()
    this.pre.preload = 'auto'
    audio.preload = 'auto'
    this.bindAudio()
    this.unsubs.push(usePlayer.subscribe((s, p) => this.onPlayer(s, p)))
    this.unsubs.push(
      useReader.subscribe((s, p) => {
        if (s.playbackRate !== p.playbackRate) this.applyRate()
        if (s.repeatAyah !== p.repeatAyah) this.repeatLeft = Math.max(1, s.repeatAyah)
        if (s.reciterId !== p.reciterId) this.onReciterChange()
      })
    )
    this.sleepIv = setInterval(() => this.sleepTick(), 1000)
    audioBridge.seekFraction = (f) => this.seekFraction(f)
    this.bindMediaSession()
  }

  destroy() {
    this.unsubs.forEach((u) => u())
    this.cleanups.forEach((c) => c())
    this.stopTicker()
    if (this.sleepIv) clearInterval(this.sleepIv)
    audioBridge.seekFraction = undefined
    this.audio.pause()
    this.revokeLocal()
    this.pre.removeAttribute('src')
    clearMedia()
  }

  /* ------------------------------------------------------------ store → engine */

  private onPlayer(s: ReturnType<typeof usePlayer.getState>, p: ReturnType<typeof usePlayer.getState>) {
    if (s.status === 'idle' && p.status !== 'idle') return this.teardown()
    if (!s.queue) return

    if (s.queue !== p.queue || s.seekNonce !== p.seekNonce) {
      this.finished = false
      void this.sync(s.seekNonce !== p.seekNonce)
      return
    }
    if (s.currentKey !== p.currentKey && s.currentKey !== this.reportedKey) {
      void this.sync(false)
      return
    }
    if (s.status !== p.status && this.loaded && !this.loading) {
      if (s.status === 'playing') {
        if (this.finished) { this.finished = false; this.seekToKey(`${s.queue.surah}:${s.queue.from}`) }
        else if (this.audio.paused) this.play()
      } else if (s.status === 'paused') {
        if (!this.audio.paused) this.safePause()
      }
    }
  }

  private async sync(force: boolean) {
    const s = usePlayer.getState()
    const q = s.queue
    if (!q || !s.currentKey) return
    const rid = useReader.getState().reciterId
    const stale = !this.loaded || this.loaded.surah !== q.surah || this.loaded.reciter !== rid
    if (!stale) {
      if (force || s.currentKey !== this.reportedKey) this.seekToKey(s.currentKey)
      return
    }
    const token = ++this.token
    const ok = await this.load(q.surah, rid, token)
    if (!ok || token !== this.token) return
    const now = usePlayer.getState()
    this.seekToKey(now.currentKey ?? `${q.surah}:${q.from}`)
  }

  private onReciterChange() {
    const s = usePlayer.getState()
    if (!s.queue || !s.currentKey) return
    this.loaded = null
    if (s.status !== 'paused') usePlayer.getState()._set({ status: 'loading' })
    void this.sync(false)
  }

  private teardown() {
    this.token++
    this.safePause()
    this.audio.removeAttribute('src')
    this.audio.load()
    this.revokeLocal()
    this.pre.removeAttribute('src')
    this.loaded = null
    this.ch = null
    this.loading = false
    this.reportedKey = null
    this.lastWord = null
    this.finished = false
    this.stopTicker()
    useClock.getState().set({ fraction: 0, ayahFraction: 0, time: 0, duration: 0, ticks: [], buffering: false })
    useSleep.getState().set(null)
    this.audio.volume = 1
    clearMedia()
  }

  /* ------------------------------------------------------------ loading */

  private applyRate() {
    const r = useReader.getState().playbackRate || 1
    this.audio.defaultPlaybackRate = r
    this.audio.playbackRate = r
  }

  private async load(surah: number, rid: number, token: number): Promise<boolean> {
    const r = getReciter(rid)
    const clock = useClock.getState()
    clock.set({ buffering: true, fraction: 0, ayahFraction: 0, time: 0 })
    this.loaded = null
    this.loading = true
    this.safePause()
    const count = ayahCount(surah)

    if (r.chapter && !this.ayahOnly.has(`${rid}:${surah}`)) {
      try {
        const ch = await fetchChapterAudio(rid, surah)
        if (token !== this.token) return false
        this.ch = ch
        this.mode = 'chapter'
        // prefer a downloaded copy (blob: URL — seekable); fall back to the network
        const local = await getOfflineAudioObjectUrl(ch.url)
        if (token !== this.token) { if (local) URL.revokeObjectURL(local); return false }
        this.revokeLocal()
        this.localUrl = local
        if (!local && typeof navigator !== 'undefined' && !navigator.onLine) {
          toast.info(tx(lng(), { en: 'You’re offline and this recitation isn’t downloaded. Download it in Settings → Offline & downloads to listen without internet.', bn: 'আপনি অফলাইনে আছেন। অফলাইনে শুনতে আগে এই তিলাওয়াত ডাউনলোড করুন (সেটিংস → অফলাইন)।', ar: 'أنت غير متصل وهذه التلاوة غير مُنزَّلة. نزّلها من الإعدادات ← دون إنترنت والتنزيلات لتستمع بلا اتصال.' }))
        }
        this.audio.src = local ?? ch.url
        this.applyRate()
        await this.whenReady(token)
        if (token !== this.token) return false
        this.loaded = { surah, reciter: rid }
        this.loading = false
        clock.set({ mode: 'chapter', duration: ch.duration / 1000, ticks: ch.timings.map((t) => t.from / ch.duration), buffering: false })
        prefetchChapterAudio(rid, surah + 1)
        return true
      } catch {
        if (token !== this.token) return false
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          // offline and nothing downloaded for this surah/reciter
          toast.info(tx(lng(), { en: 'You’re offline and this recitation isn’t downloaded. Download it in Settings → Offline & downloads to listen without internet.', bn: 'আপনি অফলাইনে আছেন। এই তিলাওয়াত ডাউনলোড করা নেই — সেটিংস → অফলাইন ও ডাউনলোড থেকে ডাউনলোড করুন।', ar: 'أنت غير متصل وهذه التلاوة غير مُنزَّلة. نزّلها من الإعدادات ← دون إنترنت والتنزيلات لتستمع بلا اتصال.' }))
          this.loading = false
          clock.set({ buffering: false })
          usePlayer.getState()._set({ status: 'paused' })
          return false
        }
        this.ayahOnly.add(`${rid}:${surah}`)
        toast.info(tx(lng(), { en: 'Switching to per-ayah audio for a steadier stream', bn: 'ধারাবাহিক অডিও পাওয়া যায়নি — আয়াত অনুযায়ী অডিওতে যাচ্ছি', ar: 'التحويل إلى الصوت آية بآية لبثٍّ أكثر ثباتًا' }))
      }
    }
    // per-ayah mode
    this.mode = 'ayah'
    this.ch = null
    this.loaded = { surah, reciter: rid }
    this.loading = false
    this.applyRate()
    clock.set({ mode: 'ayah', duration: 0, ticks: Array.from({ length: count }, (_, i) => i / count), buffering: false })
    return true
  }

  private whenReady(_token: number) {
    return new Promise<void>((resolve, reject) => {
      const a = this.audio
      if (a.readyState >= 1) return resolve()
      const to = setTimeout(() => done(new Error('timeout')), 20000)
      const ok = () => done()
      const bad = () => done(new Error('error'))
      const done = (err?: Error) => {
        clearTimeout(to)
        a.removeEventListener('loadedmetadata', ok)
        a.removeEventListener('error', bad)
        if (err) reject(err)
        else resolve()
      }
      a.addEventListener('loadedmetadata', ok)
      a.addEventListener('error', bad)
    })
  }

  private reciter(): Reciter {
    const rid = useReader.getState().reciterId
    const surah = this.loaded?.surah ?? 1
    return this.altReciter.has(`${rid}:${surah}`) ? getReciter(7) : getReciter(rid)
  }

  /* ------------------------------------------------------------ seeking / ayah changes */

  private report(key: string, word: number | null = null) {
    this.reportedKey = key
    const st = usePlayer.getState()
    if (st.currentKey !== key || st.currentWord !== word) usePlayer.getState()._set({ currentKey: key, currentWord: word })
    this.lastWord = word
    this.updateMetadata()
  }

  private seekToKey(key: string) {
    const q = usePlayer.getState().queue
    if (!q || !this.loaded) return
    const n = Math.max(1, Math.min(Number(key.split(':')[1]) || 1, ayahCount(q.surah)))
    this.ayahNo = n
    this.repeatLeft = Math.max(1, useReader.getState().repeatAyah)
    this.finished = false
    this.audio.volume = this.sleepVolume()
    if (this.mode === 'chapter' && this.ch) {
      const t = this.ch.timings[n - 1] ?? this.ch.timings[0]
      this.audio.currentTime = t.from / 1000
    } else {
      this.loadAyahSrc(n)
    }
    this.report(`${q.surah}:${n}`)
    this.tick(true)
    if (usePlayer.getState().status !== 'paused') this.play()
  }

  private loadAyahSrc(n: number) {
    const q = usePlayer.getState().queue
    if (!q) return
    const r = this.reciter()
    this.audio.src = everyAyahUrl(r, q.surah, n)
    this.applyRate()
    const end = Math.min(q.to, ayahCount(q.surah))
    if (n < end) this.pre.src = everyAyahUrl(r, q.surah, n + 1)
  }

  seekFraction(f: number) {
    const st = usePlayer.getState()
    const q = st.queue
    if (!q || !this.loaded) return
    const count = ayahCount(q.surah)
    let n: number
    if (this.mode === 'chapter' && this.ch) {
      const t = f * this.ch.duration
      n = this.findIdx(t) + 1
      this.audio.currentTime = t / 1000
    } else {
      n = Math.min(count, Math.floor(f * count) + 1)
    }
    if (n < q.from || n > Math.min(q.to, count)) {
      usePlayer.getState()._set({ queue: { surah: q.surah, from: Math.min(q.from, n), to: Math.max(q.to, n) } })
    }
    if (this.mode === 'ayah') {
      this.ayahNo = n
      this.loadAyahSrc(n)
    }
    this.ayahNo = n
    this.repeatLeft = Math.max(1, useReader.getState().repeatAyah)
    this.finished = false
    this.report(`${q.surah}:${n}`)
    this.tick(true)
    if (st.status === 'playing' || st.status === 'loading') this.play()
  }

  private play() {
    if (this.audio.volume < 1 && !useSleep.getState().endsAt) this.audio.volume = 1
    const p = this.audio.play()
    p?.then(() => {
      const st = usePlayer.getState()
      if (st.status === 'loading' && st.queue) st._set({ status: 'playing' })
    })
    p?.catch((err: { name?: string }) => {
      if (err?.name === 'AbortError') return
      if (err?.name === 'NotAllowedError') {
        usePlayer.getState()._set({ status: 'paused' })
        return
      }
      void this.onAudioError()
    })
  }

  private safePause() {
    this.internalPause = true
    this.audio.pause()
    this.internalPause = false
  }

  /* ------------------------------------------------------------ ticking */

  private startTicker() {
    if (this.raf || typeof window === 'undefined') return
    const loop = () => {
      this.tick()
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
    // background tabs pause rAF; keep ayah boundaries accurate with a timer
    this.iv = setInterval(() => { if (document.hidden) this.tick() }, 120)
  }
  private stopTicker() {
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
    if (this.iv) clearInterval(this.iv)
    this.iv = null
  }

  private findIdx(t: number) {
    const tm = this.ch!.timings
    let lo = 0, hi = tm.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (tm[mid].from <= t) lo = mid
      else hi = mid - 1
    }
    return lo
  }

  private tick(force = false) {
    const st = usePlayer.getState()
    const q = st.queue
    if (!q || !this.loaded || this.loading) return
    const a = this.audio
    const count = ayahCount(q.surah)
    const endN = Math.min(q.to, count)
    let ayahFraction = 0
    let fraction = 0

    if (this.mode === 'chapter' && this.ch) {
      const tm = this.ch.timings
      const t = a.currentTime * 1000
      let cur = tm[this.ayahNo - 1]
      if (!cur) return
      if (!a.paused && !a.seeking) {
        if (t >= cur.to - EPS && t < cur.to + 400) {
          if (this.repeatLeft > 1) {
            this.repeatLeft--
            a.currentTime = cur.from / 1000
            this.setWord(null)
            return
          }
          if (this.ayahNo >= endN) return this.finishQueue()
          this.ayahNo++
          this.repeatLeft = Math.max(1, useReader.getState().repeatAyah)
          cur = tm[this.ayahNo - 1]
          this.report(`${q.surah}:${this.ayahNo}`)
        } else if (t < cur.from - 150 || t >= cur.to + 400) {
          // playhead moved elsewhere (external seek / throttled tab) → resync
          const i = this.findIdx(t)
          if (i + 1 > endN) return this.finishQueue()
          this.ayahNo = i + 1
          this.repeatLeft = Math.max(1, useReader.getState().repeatAyah)
          cur = tm[i]
          this.report(`${q.surah}:${this.ayahNo}`)
        }
      }
      // word sync
      let w: number | null = null
      for (let i = 0; i < cur.words.length; i++) {
        if (cur.words[i][1] <= t) w = cur.words[i][0]
        else break
      }
      if (t < cur.from - 150) w = null
      this.setWord(w)
      ayahFraction = Math.max(0, Math.min(1, (t - cur.from) / Math.max(1, cur.to - cur.from)))
      fraction = Math.max(0, Math.min(1, t / this.ch.duration))
    } else {
      const d = a.duration
      ayahFraction = isFinite(d) && d > 0 ? a.currentTime / d : 0
      fraction = (this.ayahNo - 1 + ayahFraction) / count
    }

    const now = performance.now()
    if (force || now - this.lastClock > 80) {
      this.lastClock = now
      const c = useClock.getState()
      if (Math.abs(c.fraction - fraction) > 0.0003 || Math.abs(c.ayahFraction - ayahFraction) > 0.002) {
        c.set({ fraction, ayahFraction, time: a.currentTime })
      }
      if (now - this.lastPos > 1000 && this.mode === 'chapter') {
        this.lastPos = now
        setMediaPosition(a.duration, a.currentTime, a.playbackRate)
      }
    }
  }

  private setWord(w: number | null) {
    if (w === this.lastWord) return
    this.lastWord = w
    usePlayer.getState()._set({ currentWord: w })
  }

  /* ------------------------------------------------------------ end of queue */

  private finishQueue() {
    const st = usePlayer.getState()
    const q = st.queue
    if (!q) return
    const sleep = useSleep.getState()
    if (sleep.mode === 'end') {
      sleep.set(null)
      this.endPlayback()
      toast(tx(lng(), { en: 'Sleep timer — recitation stopped', bn: 'স্লিপ টাইমার — তিলাওয়াত থেমেছে', ar: 'مؤقّت النوم — توقفت التلاوة' }))
      return
    }
    if (st.loop) {
      this.seekToKey(`${q.surah}:${q.from}`)
      return
    }
    const whole = q.to >= ayahCount(q.surah)
    if (whole && q.surah < 114 && usePlayerPrefs.getState().autoNext) {
      usePlayer.getState().playSurah(q.surah + 1, 1)
      return
    }
    this.endPlayback()
  }

  private endPlayback() {
    this.finished = true
    this.safePause()
    this.setWord(null)
    this.stopTicker()
    usePlayer.getState()._set({ status: 'paused', currentWord: null })
    useClock.getState().set({ ayahFraction: 1 })
  }

  /* ------------------------------------------------------------ <audio> events */

  private bindAudio() {
    const a = this.audio
    const on = <K extends keyof HTMLMediaElementEventMap>(ev: K, fn: () => void) => {
      a.addEventListener(ev, fn)
      this.cleanups.push(() => a.removeEventListener(ev, fn))
    }
    on('playing', () => {
      const st = usePlayer.getState()
      if (!st.queue) return
      if (st.status !== 'playing') st._set({ status: 'playing' })
      useClock.getState().set({ buffering: false })
      setMediaState('playing')
      this.startTicker()
    })
    on('waiting', () => { if (!this.loading) useClock.getState().set({ buffering: true }) })
    on('canplay', () => useClock.getState().set({ buffering: false }))
    on('pause', () => {
      this.stopTicker()
      if (this.internalPause || a.ended) return
      setMediaState('paused')
      if (usePlayer.getState().status === 'playing' && this.loaded && !this.loading) usePlayer.getState()._set({ status: 'paused' })
    })
    on('timeupdate', () => this.tick())
    on('seeked', () => this.tick(true))
    on('ended', () => {
      if (this.mode === 'chapter') return this.finishQueue()
      // per-ayah mode: repeat / advance
      const q = usePlayer.getState().queue
      if (!q) return
      if (this.repeatLeft > 1) {
        this.repeatLeft--
        a.currentTime = 0
        this.play()
        return
      }
      const endN = Math.min(q.to, ayahCount(q.surah))
      if (this.ayahNo >= endN) return this.finishQueue()
      this.ayahNo++
      this.repeatLeft = Math.max(1, useReader.getState().repeatAyah)
      this.loadAyahSrc(this.ayahNo)
      this.report(`${q.surah}:${this.ayahNo}`)
      this.play()
    })
    on('error', () => { void this.onAudioError() })
  }

  private async onAudioError() {
    if (this.loading || !this.audio.getAttribute('src')) return
    const st = usePlayer.getState()
    const q = st.queue
    if (!q || !this.loaded) return
    const rid = this.loaded.reciter
    const k = `${rid}:${q.surah}`
    const key = st.currentKey ?? `${q.surah}:${q.from}`
    if (this.mode === 'chapter') {
      toast.info(tx(lng(), { en: 'Audio hiccup — switching to per-ayah audio', bn: 'অডিও লোড হয়নি — আয়াত অনুযায়ী অডিওতে যাচ্ছি', ar: 'تعذّر تحميل الصوت — التحويل إلى الصوت آية بآية' }))
      this.ayahOnly.add(k)
      this.loaded = null
      usePlayer.getState()._set({ status: 'loading' })
      const token = ++this.token
      if (await this.load(q.surah, rid, token)) this.seekToKey(key)
      return
    }
    if (!this.altReciter.has(k) && getReciter(rid).folder !== 'Alafasy_128kbps') {
      toast.info(tx(lng(), { en: 'That recitation is unavailable — falling back to Mishary Alafasy', bn: 'এই তিলাওয়াত পাওয়া যায়নি — মিশারী আলাফাসীতে যাচ্ছি', ar: 'هذه التلاوة غير متاحة — التحويل إلى مشاري العفاسي' }))
      this.altReciter.add(k)
      this.loadAyahSrc(this.ayahNo)
      this.play()
      return
    }
    toast.error(tx(lng(), { en: 'Could not load audio. Please check your connection.', bn: 'অডিও লোড করা যায়নি। ইন্টারনেট সংযোগ দেখুন।', ar: 'تعذّر تحميل الصوت. تحقق من اتصالك بالإنترنت.' }))
    this.stopTicker()
    usePlayer.getState()._set({ status: 'error' })
    useClock.getState().set({ buffering: false })
  }

  /* ------------------------------------------------------------ sleep timer */

  private sleepVolume() {
    const { endsAt } = useSleep.getState()
    if (!endsAt) return 1
    const left = endsAt - Date.now()
    return left < 10000 ? Math.max(0.05, left / 10000) : 1
  }

  private sleepTick() {
    const sl = useSleep.getState()
    if (!sl.endsAt) {
      if (this.audio.volume < 1 && sl.mode === null) this.audio.volume = 1
      return
    }
    const left = sl.endsAt - Date.now()
    if (left <= 0) {
      sl.set(null)
      this.safePause()
      this.audio.volume = 1
      if (usePlayer.getState().queue) usePlayer.getState()._set({ status: 'paused' })
      toast(tx(lng(), { en: 'Sleep timer — recitation stopped', bn: 'স্লিপ টাইমার — তিলাওয়াত থেমেছে', ar: 'مؤقّت النوم — توقفت التلاوة' }))
    } else if (!this.audio.paused) {
      this.audio.volume = this.sleepVolume()
    }
  }

  /* ------------------------------------------------------------ media session */

  private updateMetadata() {
    const q = usePlayer.getState().queue
    if (!q) return
    const c = chapters[q.surah - 1]
    const name = lng() === 'ar' ? c.nameArabic : bn() ? surahNamesBn[q.surah - 1] || c.nameSimple : c.nameSimple
    setMediaMetadata({
      title: `${name} · ${tx(lng(), { en: 'Ayah', bn: 'আয়াত', ar: 'آية' })} ${this.ayahNo}`,
      artist: getReciter(useReader.getState().reciterId).name,
      album: `Noor Quran — ${c.nameArabic}`,
    })
  }

  private bindMediaSession() {
    const p = () => usePlayer.getState()
    setMediaHandlers({
      play: () => p().resume(),
      pause: () => p().pause(),
      stop: () => p().stop(),
      nexttrack: () => p().next(),
      previoustrack: () => p().prev(),
      seekto: (d) => {
        if (d.seekTime != null && this.mode === 'chapter' && this.ch) p().seekFraction((d.seekTime * 1000) / this.ch.duration)
      },
      seekforward: () => p().next(),
      seekbackward: () => p().prev(),
    })
  }
}
