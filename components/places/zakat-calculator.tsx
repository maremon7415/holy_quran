'use client'
import { useEffect, useMemo, useState } from 'react'
import { useLang, useTx } from '@/lib/lang'
import { bnDigits } from '@/lib/places/dates'
import { calcZakat, GRAMS_PER_VORI, NISAB_GOLD_G, NISAB_SILVER_G, toGrams, type WeightUnit } from '@/lib/zakat/calc'
import { cn } from '@/lib/utils'

const CURRENCIES = ['BDT', 'USD', 'GBP', 'EUR', 'SAR', 'AED', 'QAR', 'KWD', 'MYR', 'SGD', 'INR', 'PKR', 'CAD', 'AUD'] as const
const STORE = 'noor-zakat-prices'

const input = 'h-11 w-full rounded-2xl border bg-background px-3 text-sm tabular-nums outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20'

function Num({ label, hint, value, onChange, id }: { label: string; hint?: string; value: string; onChange: (v: string) => void; id: string }) {
  return (
    <label htmlFor={id} className="block text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      <input id={id} type="number" inputMode="decimal" min="0" step="any" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" className={input} />
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  )
}
const num = (s: string) => { const v = parseFloat(s); return Number.isFinite(v) && v > 0 ? v : 0 }

export function ZakatCalculator({ defaultCurrency = 'USD' }: { defaultCurrency?: string }) {
  const t = useTx()
  const lang = useLang()
  const [cur, setCur] = useState<string>(defaultCurrency)
  const [f, setF] = useState({ cash: '', bank: '', business: '', receivables: '', investments: '', liabilities: '', goldW: '', silverW: '', goldP: '', silverP: '' })
  const [gUnit, setGUnit] = useState<WeightUnit>(defaultCurrency === 'BDT' ? 'vori' : 'g')
  const [sUnit, setSUnit] = useState<WeightUnit>(defaultCurrency === 'BDT' ? 'vori' : 'g')
  const [basis, setBasis] = useState<'gold' | 'silver'>('silver')
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }))

  // remember the metal prices (and currency) on this device only
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) ?? 'null')
      if (s) { setCur(s.cur ?? defaultCurrency); setF((x) => ({ ...x, goldP: s.goldP ?? '', silverP: s.silverP ?? '' })) }
    } catch {}
  }, [defaultCurrency])
  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify({ cur, goldP: f.goldP, silverP: f.silverP })) } catch {}
  }, [cur, f.goldP, f.silverP])

  const r = useMemo(() => calcZakat({
    cash: num(f.cash), bank: num(f.bank), business: num(f.business), receivables: num(f.receivables), investments: num(f.investments), liabilities: num(f.liabilities),
    goldGrams: toGrams(num(f.goldW), gUnit), silverGrams: toGrams(num(f.silverW), sUnit),
    // prices are entered per gram
    goldPrice: num(f.goldP), silverPrice: num(f.silverP), basis,
  }), [f, gUnit, sUnit, basis])

  const money = (v: number) => {
    try { return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : lang === 'ar' ? 'en-US' : 'en-US', { style: 'currency', currency: cur, maximumFractionDigits: 2 }).format(v) } catch { return `${cur} ${v.toFixed(2)}` }
  }
  const nb = (v: string) => (lang === 'bn' ? bnDigits(v) : v)
  const unitLabel = (u: WeightUnit) => (u === 'g' ? t({ en: 'grams', bn: 'গ্রাম', ar: 'غرام' }) : u === 'vori' ? t({ en: 'vori / tola', bn: 'ভরি / তোলা', ar: 'ভরি' }) : t({ en: 'troy oz', bn: 'আউন্স', ar: 'أونصة' }))
  const UnitSel = ({ v, on, id }: { v: WeightUnit; on: (u: WeightUnit) => void; id: string }) => (
    <select aria-label={t({ en: 'Weight unit', bn: 'ওজনের একক', ar: 'وحدة الوزن' })} id={id} value={v} onChange={(e) => on(e.target.value as WeightUnit)} className={cn(input, 'w-auto min-w-28')}>
      {(['g', 'vori', 'oz'] as const).map((u) => <option key={u} value={u}>{unitLabel(u)}</option>)}
    </select>
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()} aria-label={t({ en: 'Zakat calculator', bn: 'যাকাত ক্যালকুলেটর', ar: 'حاسبة الزكاة' })}>
        <fieldset className="card-soft rounded-3xl p-5">
          <legend className="font-display px-1 text-lg font-semibold">1. {t({ en: 'Currency & metal prices', bn: 'মুদ্রা ও ধাতুর দাম', ar: 'العملة وأسعار المعادن' })}</legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <label className="block text-sm"><span className="mb-1.5 block font-medium">{t({ en: 'Currency', bn: 'মুদ্রা', ar: 'العملة' })}</span>
              <select value={cur} onChange={(e) => setCur(e.target.value)} className={input}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></label>
            <Num id="z-gp" label={t({ en: 'Gold price per gram', bn: 'প্রতি গ্রাম সোনার দাম', ar: 'سعر غرام الذهب' })} value={f.goldP} onChange={set('goldP')} />
            <Num id="z-sp" label={t({ en: 'Silver price per gram', bn: 'প্রতি গ্রাম রুপার দাম', ar: 'سعر غرام الفضة' })} value={f.silverP} onChange={set('silverP')} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t({
            en: `Enter today’s price per gram in your currency — it is not fetched automatically. 1 vori (tola) = ${GRAMS_PER_VORI} g, so a price per vori ÷ ${GRAMS_PER_VORI} gives the price per gram. Prices are saved only on this device.`,
            bn: `আজকের প্রতি গ্রাম দাম নিজে লিখুন — স্বয়ংক্রিয়ভাবে আনা হয় না। ১ ভরি (তোলা) = ${nb(String(GRAMS_PER_VORI))} গ্রাম; ভরিপ্রতি দামকে ${nb(String(GRAMS_PER_VORI))} দিয়ে ভাগ করলে গ্রামপ্রতি দাম পাবেন। দাম শুধু আপনার ডিভাইসে সংরক্ষিত থাকে।`,
            ar: 'أدخل سعر اليوم للغرام بعملتك؛ لا يُجلب تلقائيًا. تُحفظ الأسعار على جهازك فقط.',
          })}</p>
        </fieldset>

        <fieldset className="card-soft rounded-3xl p-5">
          <legend className="font-display px-1 text-lg font-semibold">2. {t({ en: 'Your assets', bn: 'আপনার সম্পদ', ar: 'أصولك' })}</legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Num id="z-cash" label={t({ en: 'Cash in hand', bn: 'হাতে নগদ টাকা', ar: 'النقد' })} value={f.cash} onChange={set('cash')} />
            <Num id="z-bank" label={t({ en: 'Bank / savings / mobile wallet', bn: 'ব্যাংক / সঞ্চয় / মোবাইল ব্যাংকিং', ar: 'الحسابات المصرفية' })} value={f.bank} onChange={set('bank')} />
            <div>
              <label htmlFor="z-gw" className="mb-1.5 block text-sm font-medium">{t({ en: 'Gold you own (weight)', bn: 'আপনার সোনা (ওজন)', ar: 'الذهب (الوزن)' })}</label>
              <div className="flex gap-2"><input id="z-gw" type="number" inputMode="decimal" min="0" step="any" value={f.goldW} onChange={(e) => set('goldW')(e.target.value)} placeholder="0" className={input} /><UnitSel id="z-gu" v={gUnit} on={setGUnit} /></div>
            </div>
            <div>
              <label htmlFor="z-sw" className="mb-1.5 block text-sm font-medium">{t({ en: 'Silver you own (weight)', bn: 'আপনার রুপা (ওজন)', ar: 'الفضة (الوزن)' })}</label>
              <div className="flex gap-2"><input id="z-sw" type="number" inputMode="decimal" min="0" step="any" value={f.silverW} onChange={(e) => set('silverW')(e.target.value)} placeholder="0" className={input} /><UnitSel id="z-su" v={sUnit} on={setSUnit} /></div>
            </div>
            <Num id="z-biz" label={t({ en: 'Business inventory (market value)', bn: 'ব্যবসার পণ্য (বাজারমূল্য)', ar: 'عروض التجارة' })} value={f.business} onChange={set('business')} />
            <Num id="z-rec" label={t({ en: 'Money owed to you (expected to be repaid)', bn: 'পাওনা টাকা (ফেরত পাওয়ার সম্ভাবনা আছে)', ar: 'الديون المستحقة لك' })} value={f.receivables} onChange={set('receivables')} />
            <Num id="z-inv" label={t({ en: 'Shares, funds & other investments', bn: 'শেয়ার, ফান্ড ও অন্যান্য বিনিয়োগ', ar: 'الأسهم والاستثمارات' })} value={f.investments} onChange={set('investments')} />
          </div>
          {(r.missingGoldPrice || r.missingSilverPrice) && (
            <p role="alert" className="mt-3 rounded-2xl bg-gold-soft/60 p-3 text-xs">{t({ en: 'Enter the price per gram above so your gold / silver can be valued — it is not counted until then.', bn: 'সোনা/রুপার মূল্য ধরতে ওপরে গ্রামপ্রতি দাম লিখুন — তার আগে তা হিসাবে ধরা হচ্ছে না।', ar: 'أدخل سعر الغرام ليُحتسب الذهب/الفضة.' })}</p>
          )}
        </fieldset>

        <fieldset className="card-soft rounded-3xl p-5">
          <legend className="font-display px-1 text-lg font-semibold">3. {t({ en: 'Liabilities & nisab', bn: 'দেনা ও নিসাব', ar: 'الديون والنصاب' })}</legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Num id="z-debt" label={t({ en: 'Debts due now', bn: 'এখনই পরিশোধযোগ্য দেনা', ar: 'الديون الحالّة' })} hint={t({ en: 'Short-term debts and bills due, deducted from your assets.', bn: 'স্বল্পমেয়াদি দেনা ও বকেয়া বিল — সম্পদ থেকে বাদ যাবে।', ar: 'تُخصم من أصولك.' })} value={f.liabilities} onChange={set('liabilities')} />
            <div role="radiogroup" aria-label={t({ en: 'Nisab basis', bn: 'নিসাবের ভিত্তি', ar: 'أساس النصاب' })}>
              <span className="mb-1.5 block text-sm font-medium">{t({ en: 'Nisab threshold based on', bn: 'নিসাব নির্ধারণ হবে', ar: 'النصاب بحسب' })}</span>
              <div className="grid gap-2">
                {([['silver', t({ en: `Silver — ${NISAB_SILVER_G} g (lower threshold)`, bn: `রুপা — ${nb(String(NISAB_SILVER_G))} গ্রাম (কম সীমা)`, ar: `الفضة — ${NISAB_SILVER_G} غ` })], ['gold', t({ en: `Gold — ${NISAB_GOLD_G} g (higher threshold)`, bn: `সোনা — ${nb(String(NISAB_GOLD_G))} গ্রাম (বেশি সীমা)`, ar: `الذهب — ${NISAB_GOLD_G} غ` })]] as const).map(([k, label]) => (
                  <label key={k} className={cn('flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm transition', basis === k ? 'border-primary bg-accent' : 'border-border hover:bg-muted/60')}>
                    <input type="radio" name="basis" checked={basis === k} onChange={() => setBasis(k)} className="accent-[var(--primary)]" /> {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </fieldset>
      </form>

      <aside className="lg:sticky lg:top-24 lg:self-start" aria-live="polite" aria-label={t({ en: 'Zakat result', bn: 'যাকাতের ফলাফল', ar: 'النتيجة' })}>
        <div className="card-soft relative overflow-hidden rounded-3xl p-6" data-testid="zakat-result">
          <div aria-hidden className="bg-pattern pointer-events-none absolute -end-10 -top-10 size-44 rounded-full [mask-image:radial-gradient(circle,#000,transparent_70%)]" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t({ en: 'Zakat due (2.5%)', bn: 'প্রদেয় যাকাত (২.৫%)', ar: 'الزكاة المستحقة (٢٫٥٪)' })}</p>
          <p className="font-display mt-1 text-4xl font-semibold tabular-nums text-primary" data-testid="zakat-amount">{money(r.zakat)}</p>
          <p className="mt-2 text-sm" data-testid="zakat-status">
            {r.due === null
              ? t({ en: `Enter the ${basis} price per gram to compare with the nisab.`, bn: `নিসাবের সাথে মিলাতে ${basis === 'gold' ? 'সোনার' : 'রুপার'} গ্রামপ্রতি দাম লিখুন।`, ar: 'أدخل سعر الغرام لمقارنة النصاب.' })
              : r.due
                ? t({ en: 'Your net wealth reaches the nisab.', bn: 'আপনার নিট সম্পদ নিসাবে পৌঁছেছে।', ar: 'بلغ مالك النصاب.' })
                : t({ en: 'Your net wealth is below the nisab, so zakat is not due on it.', bn: 'আপনার নিট সম্পদ নিসাবের কম, তাই এর উপর যাকাত ফরজ নয়।', ar: 'مالك دون النصاب فلا زكاة.' })}
          </p>
          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            {([
              [t({ en: 'Total assets', bn: 'মোট সম্পদ', ar: 'إجمالي الأصول' }), money(r.assets)],
              [t({ en: 'Gold value', bn: 'সোনার মূল্য', ar: 'قيمة الذهب' }), money(r.goldValue)],
              [t({ en: 'Silver value', bn: 'রুপার মূল্য', ar: 'قيمة الفضة' }), money(r.silverValue)],
              [t({ en: 'Less: debts due', bn: 'বাদ: দেনা', ar: 'ناقص: الديون' }), money(r.liabilities)],
              [t({ en: 'Net zakatable wealth', bn: 'যাকাতযোগ্য নিট সম্পদ', ar: 'صافي المال' }), money(r.net)],
              [t({ en: `Nisab (${r.nisabGrams} g ${basis})`, bn: `নিসাব (${nb(String(r.nisabGrams))} গ্রাম ${basis === 'gold' ? 'সোনা' : 'রুপা'})`, ar: 'النصاب' }), r.nisab === null ? '—' : money(r.nisab)],
            ] as const).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium tabular-nums">{v}</dd></div>
            ))}
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t({ en: 'A guide only. Scholars differ on several points; consult a trusted local scholar for your situation.', bn: 'এটি শুধু একটি সহায়িকা। কয়েকটি বিষয়ে আলেমদের মতভেদ আছে; আপনার নির্দিষ্ট অবস্থার জন্য নির্ভরযোগ্য স্থানীয় আলেমের পরামর্শ নিন।', ar: 'للاسترشاد فقط؛ استفت أهل العلم في حالتك.' })}</p>
        </div>
      </aside>
    </div>
  )
}
