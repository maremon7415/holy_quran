import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { info: vi.fn(), error: vi.fn(), success: vi.fn() }) }))
vi.mock('@/lib/audio/api', () => ({
  fetchChapterAudio: vi.fn(async () => ({ url: 'https://cdn.test/7/1.mp3', duration: 60000, timings: [{ from: 0, to: 60000, words: [] }] })),
  prefetchChapterAudio: vi.fn(),
}))
vi.mock('@/lib/audio/media-session', () => ({
  setMediaMetadata: vi.fn(), setMediaState: vi.fn(), setMediaPosition: vi.fn(), setMediaHandlers: vi.fn(), clearMedia: vi.fn(),
}))
const offlineUrl = vi.fn()
vi.mock('@/lib/offline/audio-cache', () => ({ getOfflineAudioObjectUrl: (u: string) => offlineUrl(u) }))

import { AudioEngine } from '@/lib/audio/engine'
import { usePlayer } from '@/lib/stores/player'
import { useReader } from '@/lib/stores/reader'

/** Tiny HTMLAudioElement stand-in: just enough for the engine's load path. */
function fakeAudio(readyState: number) {
  const l = new Map<string, Set<() => void>>()
  const el: any = {
    readyState, paused: true, volume: 1, currentTime: 0, defaultPlaybackRate: 1, playbackRate: 1, preload: '', ended: false, src: '',
    addEventListener: (ev: string, fn: () => void) => { if (!l.has(ev)) l.set(ev, new Set()); l.get(ev)!.add(fn) },
    removeEventListener: (ev: string, fn: () => void) => l.get(ev)?.delete(fn),
    emit: (ev: string) => l.get(ev)?.forEach((f) => f()),
    pause: () => {}, load: () => {}, play: () => Promise.resolve(),
    removeAttribute: () => { el.src = '' }, getAttribute: () => el.src || null,
  }
  return el
}

const revoked: string[] = []
const tick = () => new Promise((r) => setTimeout(r, 0))

beforeEach(() => {
  revoked.length = 0
  offlineUrl.mockReset()
  vi.stubGlobal('Audio', function () { return fakeAudio(0) })
  vi.stubGlobal('navigator', { onLine: true })
  vi.stubGlobal('document', { hidden: false })
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation((u) => { revoked.push(u) })
  usePlayer.getState().stop()
  useReader.setState({ reciterId: 7 })
})
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('AudioEngine blob: URL lifetime', () => {
  it('revokes the downloaded-copy blob URL when switching to an ayah-only reciter', async () => {
    offlineUrl.mockResolvedValue('blob:local-1')
    const engine = new AudioEngine(fakeAudio(1))
    usePlayer.getState().playSurah(1, 1)
    await tick(); await tick()
    expect(revoked).toEqual([])
    useReader.setState({ reciterId: 1001 }) // everyayah-only reciter: per-ayah mode never creates a blob URL
    await tick(); await tick()
    expect(revoked).toEqual(['blob:local-1'])
    engine.destroy()
  })

  it('revokes the blob URL when the chapter file fails to load and the engine falls back to per-ayah mode', async () => {
    offlineUrl.mockResolvedValue('blob:local-2')
    const audio = fakeAudio(0)
    const engine = new AudioEngine(audio)
    usePlayer.getState().playSurah(1, 1)
    await tick(); await tick()
    audio.emit('error') // whenReady rejects -> catch -> fallback
    await tick(); await tick()
    expect(revoked).toContain('blob:local-2')
    engine.destroy()
  })

  it('revokes on stop (teardown)', async () => {
    offlineUrl.mockResolvedValue('blob:local-3')
    const engine = new AudioEngine(fakeAudio(1))
    usePlayer.getState().playSurah(1, 1)
    await tick(); await tick()
    usePlayer.getState().stop()
    expect(revoked).toEqual(['blob:local-3'])
    engine.destroy()
  })
})
