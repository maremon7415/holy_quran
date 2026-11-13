import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(__dirname, '../..')
const chapters: { id: number; versesCount: number }[] = JSON.parse(fs.readFileSync(path.join(root, 'data/quran/chapters.json'), 'utf8'))
const uccharon = (n: number): string[] => JSON.parse(fs.readFileSync(path.join(root, `data/quran/uccharon/${n}.json`), 'utf8'))

describe('Bangla uccharon data (data/quran/uccharon/*.json)', () => {
  it('has one file per surah with exactly the surah’s ayah count', () => {
    expect(fs.readdirSync(path.join(root, 'data/quran/uccharon')).filter((f) => f.endsWith('.json'))).toHaveLength(114)
    for (const c of chapters) expect(uccharon(c.id), `surah ${c.id}`).toHaveLength(c.versesCount)
  })

  it('has 6,236 non-empty strings written in Bangla script (no Latin letters, no Arabic)', () => {
    let total = 0
    const bad: string[] = []
    for (const c of chapters) {
      uccharon(c.id).forEach((s, i) => {
        total++
        if (typeof s !== 'string' || !s.trim() || !/[ঀ-৿]/.test(s) || /[A-Za-z]/.test(s) || /[؀-ۿ]/.test(s)) bad.push(`${c.id}:${i + 1}`)
      })
    }
    expect(total).toBe(6236)
    expect(bad).toEqual([])
  })

  it('has no stray whitespace or control characters', () => {
    for (const c of chapters) {
      for (const s of uccharon(c.id)) {
        expect(s).toBe(s.trim())
        expect(s).not.toMatch(/\s{2,}|[\u0000-\u001f]/)
      }
    }
  })

  it('opens the Quran with the Bismillah', () => {
    expect(uccharon(1)[0]).toBe('বিসমিল্লা-হির রাহমা-নির রাহীম')
  })
})

// --- fixtures: hand-checked reference spellings, scored exactly like `scripts/build-bn-uccharon.mjs --check`
function lev(a: string, b: string) {
  const x = [...a], y = [...b]
  let prev = Array.from({ length: y.length + 1 }, (_, j) => j)
  for (let i = 1; i <= x.length; i++) {
    const cur = [i]
    for (let j = 1; j <= y.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1))
    prev = cur
  }
  return prev[y.length]
}
const sim = (a: string, b: string) => 1 - lev(a, b) / Math.max([...a].length, [...b].length, 1)
const loose = (s: string) => s.replace(/[\s\-'’]/g, '')

describe('uccharon fixtures (scripts/uccharon-fixtures.json)', () => {
  const fx: Record<string, string> = JSON.parse(fs.readFileSync(path.join(root, 'scripts/uccharon-fixtures.json'), 'utf8'))
  const rows = Object.entries(fx).map(([key, ref]) => {
    const [s, a] = key.split(':').map(Number)
    let out = uccharon(s)[a - 1]
    let r = ref
    if (ref.endsWith('…')) {
      // fixture covers only the beginning of a long ayah: compare against the same number of leading tokens
      r = ref.slice(0, -1).trim()
      let o = ''
      for (const t of out.split(' ')) {
        if (loose(o).length >= loose(r).length) break
        o += (o ? ' ' : '') + t
      }
      out = o
    }
    return { key, exact: sim(out, r), lax: sim(loose(out), loose(r)) }
  })

  it('covers a meaningful sample', () => {
    expect(rows.length).toBeGreaterThanOrEqual(20)
  })
  it('scores a mean similarity ≥ 0.95 against the generated data', () => {
    const mean = rows.reduce((t, r) => t + r.exact, 0) / rows.length
    expect(mean).toBeGreaterThanOrEqual(0.95)
  })
  it('scores ≥ 0.98 when spaces, hyphens and apostrophes are ignored', () => {
    const mean = rows.reduce((t, r) => t + r.lax, 0) / rows.length
    expect(mean).toBeGreaterThanOrEqual(0.98)
  })
  it('no single fixture falls below 0.8', () => {
    expect(rows.filter((r) => r.exact < 0.8).map((r) => `${r.key}: ${r.exact.toFixed(2)}`)).toEqual([])
  })
})
