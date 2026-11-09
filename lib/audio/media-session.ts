/** Thin wrapper over the Media Session API (lock-screen / notification controls). */
const ms = () => (typeof navigator !== 'undefined' && 'mediaSession' in navigator ? navigator.mediaSession : null)

export function setMediaMetadata(m: { title: string; artist: string; album: string }) {
  const s = ms()
  if (!s || typeof MediaMetadata === 'undefined') return
  s.metadata = new MediaMetadata({
    ...m,
    artwork: [
      { src: '/brand/logo-512.png', sizes: '512x512', type: 'image/png' },
    ],
  })
}
export function setMediaState(state: 'playing' | 'paused' | 'none') {
  const s = ms()
  if (s) s.playbackState = state
}
export function setMediaPosition(duration: number, position: number, rate: number) {
  const s = ms()
  if (!s?.setPositionState || !isFinite(duration) || duration <= 0) return
  try { s.setPositionState({ duration, position: Math.max(0, Math.min(position, duration)), playbackRate: rate }) } catch {}
}
export function setMediaHandlers(h: Partial<Record<MediaSessionAction, MediaSessionActionHandler | null>>) {
  const s = ms()
  if (!s) return
  for (const [k, fn] of Object.entries(h)) {
    try { s.setActionHandler(k as MediaSessionAction, fn ?? null) } catch {}
  }
}
export function clearMedia() {
  const s = ms()
  if (!s) return
  s.metadata = null
  s.playbackState = 'none'
}
