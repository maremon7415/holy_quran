'use client'
import { create } from 'zustand'
import { toast } from 'sonner'
import { downloadSurahAudio, type DownloadHandle } from './audio-cache'

interface Jobs {
  rid: number | null
  current: number | null
  loaded: number
  total: number
  pending: number[]
  failed: number
}
export const useAudioJobs = create<Jobs>(() => ({ rid: null, current: null, loaded: 0, total: 0, pending: [], failed: 0 }))

let handle: DownloadHandle | null = null
let running = false

/** Download chapters one at a time (module-level so it keeps going while you navigate). */
export function enqueueSurahs(rid: number, surahs: number[], msgs: { failed: string }) {
  const st = useAudioJobs.getState()
  if (st.rid !== null && st.rid !== rid && (running || st.pending.length)) cancelAudioJobs()
  const have = new Set([...useAudioJobs.getState().pending, ...(useAudioJobs.getState().current ? [useAudioJobs.getState().current!] : [])])
  useAudioJobs.setState((s) => ({ rid, pending: [...s.pending, ...surahs.filter((x) => !have.has(x))] }))
  void run(msgs)
}

async function run(msgs: { failed: string }) {
  if (running) return
  running = true
  try {
    for (;;) {
      const s = useAudioJobs.getState()
      const next = s.pending[0]
      if (next === undefined || s.rid === null) break
      useAudioJobs.setState({ pending: s.pending.slice(1), current: next, loaded: 0, total: 0 })
      handle = downloadSurahAudio(s.rid, next, (loaded, total) => useAudioJobs.setState({ loaded, total }))
      try {
        const r = await handle.promise
        if (r === 'cancelled') break
      } catch {
        useAudioJobs.setState((x) => ({ failed: x.failed + 1 }))
        toast.error(msgs.failed)
        if (typeof navigator !== 'undefined' && !navigator.onLine) { useAudioJobs.setState({ pending: [] }); break }
      }
    }
  } finally {
    running = false
    handle = null
    useAudioJobs.setState({ current: null, loaded: 0, total: 0, rid: null, pending: [] })
  }
}

export function cancelAudioJobs() {
  useAudioJobs.setState({ pending: [] })
  handle?.cancel()
}
