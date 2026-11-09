'use client'
/**
 * Global audio player: owns the hidden <audio> element + engine, renders the mini player
 * and the expanded sheet. Mounted once from app/layout.tsx.
 */
import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { usePlayer } from '@/lib/stores/player'
import { AudioEngine } from '@/lib/audio/engine'
import { MiniPlayer } from './mini-player'

const ExpandedPlayer = dynamic(() => import('./expanded-player').then((m) => m.ExpandedPlayer), { ssr: false })

export function PlayerRoot() {
  const ref = useRef<HTMLAudioElement>(null)
  const hasQueue = usePlayer((s) => !!s.queue)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const engine = new AudioEngine(el)
    return () => engine.destroy()
  }, [])

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={ref} preload="none" playsInline hidden />
      <MiniPlayer />
      {hasQueue && <ExpandedPlayer />}
    </>
  )
}
