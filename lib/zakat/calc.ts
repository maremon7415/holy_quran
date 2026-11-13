/** Zakat on wealth — pure maths, no I/O. Nisab thresholds follow the classical weights: 20 mithqal gold, 200 dirham silver. */
export const NISAB_GOLD_G = 87.48
export const NISAB_SILVER_G = 612.36
export const ZAKAT_RATE = 0.025
/** 1 vori (bhori) = 1 tola = 11.664 g in Bangladesh and India (11.6638 g exactly). */
export const GRAMS_PER_VORI = 11.664
export const GRAMS_PER_OUNCE = 31.1034768

export type WeightUnit = 'g' | 'vori' | 'oz'
export const toGrams = (amount: number, unit: WeightUnit) => (unit === 'vori' ? amount * GRAMS_PER_VORI : unit === 'oz' ? amount * GRAMS_PER_OUNCE : amount)

const n = (v: number | undefined) => (Number.isFinite(v) && (v as number) > 0 ? (v as number) : 0)

export interface ZakatInput {
  cash: number
  bank: number
  goldGrams: number
  silverGrams: number
  /** price of 1 gram of gold / silver in the user's currency (entered by the user) */
  goldPrice: number
  silverPrice: number
  /** trade goods / business inventory at market value */
  business: number
  /** money owed to you that you expect to receive */
  receivables: number
  /** shares, funds, other zakatable investments at market value */
  investments: number
  /** debts due now (short-term liabilities) */
  liabilities: number
  basis: 'gold' | 'silver'
}

export interface ZakatResult {
  goldValue: number
  silverValue: number
  /** gold / silver is held but its price was not entered, so it could not be valued */
  missingGoldPrice: boolean
  missingSilverPrice: boolean
  assets: number
  liabilities: number
  net: number
  /** nisab threshold in money, or null while the chosen metal's price is missing */
  nisab: number | null
  nisabGrams: number
  /** wealth reaches nisab (null while it cannot be decided) */
  due: boolean | null
  zakat: number
}

export function calcZakat(i: ZakatInput): ZakatResult {
  const goldValue = n(i.goldGrams) * n(i.goldPrice)
  const silverValue = n(i.silverGrams) * n(i.silverPrice)
  const assets = n(i.cash) + n(i.bank) + goldValue + silverValue + n(i.business) + n(i.receivables) + n(i.investments)
  const liabilities = n(i.liabilities)
  const net = Math.max(0, assets - liabilities)
  const nisabGrams = i.basis === 'gold' ? NISAB_GOLD_G : NISAB_SILVER_G
  const price = i.basis === 'gold' ? n(i.goldPrice) : n(i.silverPrice)
  const nisab = price > 0 ? nisabGrams * price : null
  const due = nisab === null ? null : net >= nisab && net > 0
  return {
    goldValue, silverValue,
    missingGoldPrice: n(i.goldGrams) > 0 && n(i.goldPrice) === 0,
    missingSilverPrice: n(i.silverGrams) > 0 && n(i.silverPrice) === 0,
    assets, liabilities, net, nisab, nisabGrams, due,
    zakat: due ? Math.round(net * ZAKAT_RATE * 100) / 100 : 0,
  }
}
