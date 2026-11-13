/**
 * Regression tests for the Ask cold start: the first ask_quran on a cold instance downloads the ~210 MB model and
 * could exceed /api/mcp's 30 s maxDuration. Now: maxDuration 60 on /api/mcp and the ask routes, a timeout around
 * model loading that falls back to lexical results with a `fallback` flag, and a once-per-instance warm-up.
 */
import fs from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { _setModelLoader, embedQuery, ModelLoadTimeoutError, warmUpModel } from '@/lib/ask/embed'
import { askApi, askQuran } from '@/lib/ask'
import { GET as askGet } from '@/app/api/ask/route'
import { GET as v1AskGet } from '@/app/api/v1/ask/route'
import { vectorOf } from '../helpers/fake-embedder'

afterEach(() => { _setModelLoader(null); vi.unstubAllEnvs() })

/** A fake model loader that resolves after `ms` (counts how often it is started). */
function slowLoader(ms: number) {
  const calls = { n: 0 }
  _setModelLoader(() => {
    calls.n++
    return new Promise((resolve) => setTimeout(() => resolve(async () => vectorOf('94:6')), ms))
  })
  return calls
}

describe('Ask: model loading timeout → lexical fallback with a flag', () => {
  it('embedQuery rejects with ModelLoadTimeoutError while the model is still loading, and succeeds once loaded', async () => {
    slowLoader(150)
    await expect(embedQuery('q', { loadTimeoutMs: 10 })).rejects.toBeInstanceOf(ModelLoadTimeoutError)
    await new Promise((r) => setTimeout(r, 200))
    expect((await embedQuery('q', { loadTimeoutMs: 10 })).length).toBeGreaterThan(0) // loaded meanwhile: no timeout
  })

  it('askQuran / askApi answer lexically with fallback "model_loading" instead of waiting', async () => {
    vi.stubEnv('ASK_MODEL_TIMEOUT_MS', '20')
    slowLoader(10_000)
    const t0 = Date.now()
    const r = await askQuran('will things get easier after hard times?', { limit: 3 })
    expect(Date.now() - t0).toBeLessThan(5000)
    expect(r.mode).toBe('lexical')
    expect(r.fallback).toBe('model_loading')
    expect(r.note).toMatch(/starting up/)
    const a = await askApi('patience in hardship', { limit: 2 })
    expect(a).toMatchObject({ mode: 'lexical', fallback: 'model_loading' })
  })

  it('the HTTP routes flag it and do not cache a model_loading answer', async () => {
    vi.stubEnv('ASK_MODEL_TIMEOUT_MS', '20')
    slowLoader(10_000)
    const res = await askGet(new Request('http://x/api/ask?q=patience+in+hardship'))
    expect((await res.json()).fallback).toBe('model_loading')
    expect(res.headers.get('cache-control')).toBe('no-store')
    const v1 = await v1AskGet(new Request('http://x/api/v1/ask?q=patience+in+hardship'))
    expect((await v1.json()).fallback).toBe('model_loading')
    expect(v1.headers.get('cache-control')).toBe('no-store')
  })

  it('a model that cannot load is reported as model_unavailable', async () => {
    _setModelLoader(() => Promise.reject(new Error('no network')))
    const r = await askQuran('patience', { limit: 2 })
    expect(r).toMatchObject({ mode: 'lexical', fallback: 'model_unavailable' })
  })
})

describe('Ask: warm-up', () => {
  it('starts loading once per instance; later calls report loading/loaded', async () => {
    const calls = slowLoader(50)
    expect(warmUpModel()).toBe('started')
    expect(warmUpModel()).toBe('loading')
    expect(warmUpModel()).toBe('loading')
    await new Promise((r) => setTimeout(r, 100))
    expect(warmUpModel()).toBe('loaded')
    expect(calls.n).toBe(1)
    await embedQuery('x', { loadTimeoutMs: 1 })
    expect(calls.n).toBe(1)
  })
  it('GET /api/ask?warm=1 kicks it off and answers 202 immediately', async () => {
    const calls = slowLoader(10_000)
    const t0 = Date.now()
    const res = await askGet(new Request('http://x/api/ask?warm=1'))
    expect(res.status).toBe(202)
    expect(await res.json()).toEqual({ model: 'started' })
    expect(Date.now() - t0).toBeLessThan(1000)
    expect(calls.n).toBe(1)
  })
  it('is disabled with ASK_SEMANTIC=off', () => {
    vi.stubEnv('ASK_SEMANTIC', 'off')
    slowLoader(10)
    expect(warmUpModel()).toBe('disabled')
  })
  it('the /ask page asks the server to warm up', () => {
    const src = fs.readFileSync(path.join(__dirname, '../../components/ask/ask-client.tsx'), 'utf8')
    expect(src).toMatch(/\/api\/ask\?warm=1/)
  })
})

describe('maxDuration 60 on the MCP and ask routes', () => {
  it.each(['app/api/mcp/route.ts', 'app/api/ask/route.ts', 'app/api/v1/ask/route.ts'])('%s', (f) => {
    expect(fs.readFileSync(path.join(__dirname, '../..', f), 'utf8')).toMatch(/export const maxDuration = 60\b/)
  })
})
