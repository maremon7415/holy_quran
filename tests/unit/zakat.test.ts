import { describe, it, expect } from 'vitest'
import { calcZakat, GRAMS_PER_VORI, NISAB_GOLD_G, NISAB_SILVER_G, toGrams, type ZakatInput } from '@/lib/zakat/calc'

const base: ZakatInput = { cash: 0, bank: 0, goldGrams: 0, silverGrams: 0, goldPrice: 0, silverPrice: 0, business: 0, receivables: 0, investments: 0, liabilities: 0, basis: 'silver' }

describe('zakat math', () => {
  it('uses the classical nisab weights and vori conversion', () => {
    expect(NISAB_GOLD_G).toBe(87.48)
    expect(NISAB_SILVER_G).toBe(612.36)
    expect(toGrams(1, 'vori')).toBeCloseTo(11.664, 3)
    expect(toGrams(7.5, 'vori')).toBeCloseTo(87.48, 2) // 87.48 g ≈ 7.5 vori
    expect(toGrams(10, 'g')).toBe(10)
    expect(GRAMS_PER_VORI * 52.5).toBeCloseTo(612.36, 2) // silver nisab = 52.5 vori
  })

  it('charges 2.5% when net wealth reaches the silver nisab', () => {
    const r = calcZakat({ ...base, silverPrice: 100, cash: 100_000, bank: 50_000 }) // nisab = 61,236
    expect(r.nisab).toBeCloseTo(61_236, 0)
    expect(r.due).toBe(true)
    expect(r.zakat).toBe(3750)
  })

  it('charges nothing below the nisab', () => {
    const r = calcZakat({ ...base, silverPrice: 100, cash: 61_000 })
    expect(r.due).toBe(false)
    expect(r.zakat).toBe(0)
  })

  it('treats wealth exactly at the nisab as due', () => {
    const r = calcZakat({ ...base, goldPrice: 1, basis: 'gold', cash: NISAB_GOLD_G })
    expect(r.nisab).toBeCloseTo(87.48)
    expect(r.due).toBe(true)
    expect(r.zakat).toBeCloseTo(2.19, 2)
  })

  it('subtracts debts and values gold and silver by weight × price', () => {
    const r = calcZakat({ ...base, basis: 'gold', goldPrice: 10_000, goldGrams: toGrams(10, 'vori'), silverGrams: 100, silverPrice: 100, cash: 200_000, business: 100_000, receivables: 50_000, investments: 25_000, liabilities: 80_000 })
    expect(r.goldValue).toBeCloseTo(1_166_400)
    expect(r.silverValue).toBe(10_000)
    expect(r.assets).toBeCloseTo(1_551_400)
    expect(r.net).toBeCloseTo(1_471_400)
    expect(r.nisab).toBeCloseTo(874_800)
    expect(r.zakat).toBeCloseTo(36_785, 0)
  })

  it('a different nisab basis changes the verdict', () => {
    const wealth = { ...base, goldPrice: 10_000, silverPrice: 100, cash: 100_000 }
    expect(calcZakat({ ...wealth, basis: 'silver' }).due).toBe(true) // 100,000 ≥ 61,236
    expect(calcZakat({ ...wealth, basis: 'gold' }).due).toBe(false) // 100,000 < 874,800
  })

  it('cannot decide without the metal price and flags unvalued metals', () => {
    const r = calcZakat({ ...base, goldGrams: 50, cash: 1000 })
    expect(r.nisab).toBeNull()
    expect(r.due).toBeNull()
    expect(r.zakat).toBe(0)
    expect(r.missingGoldPrice).toBe(true)
  })

  it('ignores negative / invalid entries and never goes negative', () => {
    const r = calcZakat({ ...base, silverPrice: 1, cash: -500, liabilities: 1000, bank: Number.NaN })
    expect(r.assets).toBe(0)
    expect(r.net).toBe(0)
    expect(r.zakat).toBe(0)
  })
})
