'use client'
/**
 * Opt-in on-device embedding for Ask the Quran: a module Web Worker (public/ask-worker.js) runs the same model
 * as the server in the browser (WebGPU when available, else WASM). Enabled state is remembered per browser.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import header from '@/data/quran/embeddings.json'

export const LOCAL_KEY = 'noor-ask-local'

export type LocalState =
  | { status: 'off' }
  | { status: 'loading'; loaded: number; total: number }
  | { status: 'ready'; device: string }
  | { status: 'error'; message: string }

type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void }

const readPref = () => { try { return localStorage.getItem(LOCAL_KEY) === '1' } catch { return false } }
const writePref = (on: boolean) => { try { if (on) localStorage.setItem(LOCAL_KEY, '1'); else localStorage.removeItem(LOCAL_KEY) } catch { /* private mode */ } }

export function useLocalModel() {
  const [state, setState] = useState<LocalState>({ status: 'off' })
  const worker = useRef<Worker | null>(null)
  const pending = useRef(new Map<number, Pending>())
  const seq = useRef(0)

  const start = useCallback(() => {
    if (worker.current) return
    if (typeof Worker === 'undefined') { setState({ status: 'error', message: 'Web Workers are not supported' }); return }
    let w: Worker
    try {
      w = new Worker('/ask-worker.js', { type: 'module', name: 'ask-the-quran' })
    } catch (e) {
      setState({ status: 'error', message: e instanceof Error ? e.message : String(e) })
      return
    }
    worker.current = w
    setState({ status: 'loading', loaded: 0, total: 0 })
    w.onmessage = (e: MessageEvent) => {
      const m = e.data
      if (m.type === 'progress') setState({ status: 'loading', loaded: m.loaded, total: m.total })
      else if (m.type === 'ready') setState({ status: 'ready', device: m.device })
      else if (m.type === 'error') { setState({ status: 'error', message: m.message }); w.terminate(); worker.current = null }
      else if (m.type === 'vec' || m.type === 'hits') { pending.current.get(m.id)?.resolve(m.type === 'vec' ? m.vec : m.hits); pending.current.delete(m.id) }
      else if (m.type === 'fail') { pending.current.get(m.id)?.reject(new Error(m.message)); pending.current.delete(m.id) }
    }
    w.onerror = (e) => { setState({ status: 'error', message: e.message || 'Worker failed' }); w.terminate(); worker.current = null }
    w.postMessage({ type: 'init', header, vectorsUrl: `/ask/embeddings.bin?v=${header.sha256}` })
  }, [])

  const enable = useCallback(() => { writePref(true); start() }, [start])
  const disable = useCallback(() => {
    writePref(false)
    worker.current?.terminate()
    worker.current = null
    setState({ status: 'off' })
  }, [])

  // remembered opt-in: warm the worker (model files come from the browser cache)
  useEffect(() => { if (readPref()) start() }, [start])
  useEffect(() => () => { worker.current?.terminate() }, [])

  const call = useCallback(<T,>(msg: Record<string, unknown>, transfer: Transferable[] = []) => new Promise<T>((resolve, reject) => {
    const w = worker.current
    if (!w) return reject(new Error('Smart search is off'))
    const id = ++seq.current
    pending.current.set(id, { resolve: resolve as (v: unknown) => void, reject })
    w.postMessage({ ...msg, id }, transfer)
  }), [])

  const embed = useCallback((text: string) => call<Float32Array>({ type: 'embed', text }), [call])
  const search = useCallback((vec: Float32Array, k = 20) => call<[number, number][]>({ type: 'search', vec, k }), [call])

  return { state, enable, disable, embed, search }
}
