'use client'
import { useRef } from 'react'
import { toast } from 'sonner'
import { useReader, type ArabicFont } from '@/lib/stores/reader'
import { useAppStore } from '@/lib/store'
import { useMounted, useTx } from '@/lib/lang'
import { ThemeSwatches } from '@/components/shell/theme-picker'
import { LanguageToggle } from '@/components/shell/language-toggle'
import { AccountSyncCard } from '@/components/sync/account-card'
import { UiIcon } from '@/components/ui-icon'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { OfflineDownloads } from '@/components/offline/offline-downloads'

const FONTS: { id: ArabicFont; label: string }[] = [
  { id: 'amiri-quran', label: 'Amiri Quran' },
  { id: 'scheherazade', label: 'Scheherazade' },
  { id: 'noto-naskh', label: 'Noto Naskh' },
  { id: 'indopak', label: 'Lateef (IndoPak style)' },
]
const RECITERS = [
  { id: 7, name: 'Mishary Rashid Alafasy' }, { id: 3, name: 'Abdur-Rahman as-Sudais' }, { id: 2, name: 'Abdul Basit (Murattal)' },
  { id: 1, name: 'Abdul Basit (Mujawwad)' }, { id: 6, name: 'Mahmoud Khalil Al-Husary' }, { id: 12, name: 'Al-Husary (Muallim – teaching)' },
  { id: 9, name: 'Al-Minshawi (Murattal)' }, { id: 4, name: 'Abu Bakr al-Shatri' }, { id: 5, name: 'Hani ar-Rifai' }, { id: 10, name: "Sa'ud ash-Shuraym" },
]

export function SettingsView() {
  const mounted = useMounted()
  const t = useTx()
  const r = useReader()
  const dailyGoal = useAppStore((s) => s.dailyGoal)
  const setDailyGoal = useAppStore((s) => s.setDailyGoal)
  const fileRef = useRef<HTMLInputElement>(null)

  const exportData = () => {
    const data: Record<string, string | null> = {}
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i)!; if (/^(quran-store|noor-)/.test(k)) data[k] = localStorage.getItem(k) }
    const blob = new Blob([JSON.stringify({ app: 'noor-quran', exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `noor-quran-backup-${new Date().toISOString().slice(0, 10)}.json` })
    a.click(); URL.revokeObjectURL(a.href)
  }
  const importData = async (f: File) => {
    try {
      const json = JSON.parse(await f.text())
      if (json.app !== 'noor-quran' || typeof json.data !== 'object') throw new Error()
      for (const [k, v] of Object.entries(json.data)) if (/^(quran-store|noor-)/.test(k) && typeof v === 'string') localStorage.setItem(k, v)
      toast.success(t({ en: 'Backup restored — reloading…', bn: 'ব্যাকআপ পুনরুদ্ধার হয়েছে…', ar: 'تمت استعادة النسخة الاحتياطية — جارٍ إعادة التحميل…' }))
      setTimeout(() => location.reload(), 800)
    } catch { toast.error(t({ en: 'That file is not a Noor backup.', bn: 'এটি নূর ব্যাকআপ ফাইল নয়।', ar: 'هذا الملف ليس نسخة احتياطية من نور.' })) }
  }

  if (!mounted) return <div className="mx-auto max-w-3xl px-4 py-16"><div className="card-soft h-96 shimmer" /></div>

  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-10 sm:px-6">
      <div className="flex items-center gap-4">
        <UiIcon name="settings" size={56} />
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t({ en: 'Settings', bn: 'সেটিংস', ar: 'الإعدادات' })}</h1>
          <p className="text-muted-foreground">{t({ en: 'Make Noor feel like your own mushaf.', bn: 'নূরকে নিজের মতো সাজিয়ে নিন।', ar: 'اجعل نور كمصحفك الخاص.' })}</p>
        </div>
      </div>

      <Section icon="sun" title={t({ en: 'Appearance', bn: 'চেহারা', ar: 'المظهر' })}>
        <ThemeSwatches />
        <Row label={t({ en: 'Interface language', bn: 'ইন্টারফেসের ভাষা', ar: 'لغة الواجهة' })}><LanguageToggle /></Row>
      </Section>

      <Section icon="quran" title={t({ en: 'Quran text', bn: 'কুরআনের লেখা', ar: 'نص القرآن' })}>
        <div className="rounded-2xl bg-surface-2 p-5 text-center">
          <p className="quran-text" style={{ fontSize: r.arabicSize }}>ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ</p>
          <p data-tr="en" className="mt-2 text-muted-foreground" style={{ fontSize: r.transSize }}>Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.</p>
          <p data-tr="bn" className="mt-1 font-bangla text-muted-foreground" style={{ fontSize: r.transSize }}>আল্লাহ, তিনি ছাড়া কোনো ইলাহ নেই, তিনি চিরঞ্জীব, সবকিছুর ধারক।</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map((f) => (
            <button key={f.id} onClick={() => r.set({ arabicFont: f.id })} className={cn('rounded-2xl border p-3 text-start text-sm transition', r.arabicFont === f.id ? 'border-primary bg-accent' : 'hover:border-primary/40')}>
              {f.label}
            </button>
          ))}
        </div>
        <Row label={`${t({ en: 'Arabic size', bn: 'আরবি আকার', ar: 'حجم الخط العربي' })} · ${r.arabicSize}px`}><Slider className="w-44" min={22} max={60} step={1} value={[r.arabicSize]} onValueChange={([v]) => r.set({ arabicSize: v })} /></Row>
        <Row label={`${t({ en: 'Translation size', bn: 'অনুবাদের আকার', ar: 'حجم الترجمة' })} · ${r.transSize}px`}><Slider className="w-44" min={13} max={26} step={1} value={[r.transSize]} onValueChange={([v]) => r.set({ transSize: v })} /></Row>
        <Row label={t({ en: 'Tajweed colours', bn: 'তাজবীদ রং', ar: 'ألوان التجويد' })}><Switch checked={r.tajweed} onCheckedChange={(v) => r.set({ tajweed: v })} /></Row>
        <Row label={t({ en: 'Word-by-word', bn: 'শব্দে শব্দে অর্থ', ar: 'كلمة بكلمة' })}><Switch checked={r.wordByWord} onCheckedChange={(v) => r.set({ wordByWord: v })} /></Row>
      </Section>

      <Section icon="language" title={t({ en: 'Translations', bn: 'অনুবাদ', ar: 'الترجمات' })}>
        <Row label="English"><Switch checked={r.showEn} onCheckedChange={(v) => r.set({ showEn: v })} /></Row>
        {r.showEn && (
          <div className="flex gap-2">
            {(['sahih', 'haleem'] as const).map((e) => (
              <button key={e} onClick={() => r.set({ enEdition: e })} className={cn('rounded-full border px-4 py-1.5 text-sm transition', r.enEdition === e ? 'border-primary bg-accent' : '')}>{e === 'sahih' ? 'Saheeh International' : 'Abdel Haleem'}</button>
            ))}
          </div>
        )}
        <Row label="বাংলা (তাইসিরুল কুরআন)"><Switch checked={r.showBn} onCheckedChange={(v) => r.set({ showBn: v })} /></Row>
        <Row label={t({ en: 'Transliteration', bn: 'উচ্চারণ (ইংরেজি)', ar: 'النقحرة اللاتينية' })}><Switch checked={r.showTl} onCheckedChange={(v) => r.set({ showTl: v })} /></Row>
      </Section>

      <Section icon="listen" title={t({ en: 'Recitation', bn: 'তিলাওয়াত', ar: 'التلاوة' })}>
        <div className="grid gap-2 sm:grid-cols-2">
          {RECITERS.map((x) => (
            <button key={x.id} onClick={() => r.set({ reciterId: x.id })} className={cn('flex items-center gap-3 rounded-2xl border p-3 text-start text-sm transition', r.reciterId === x.id ? 'border-primary bg-accent' : 'hover:border-primary/40')}>
              <span className="grid size-9 place-items-center rounded-full bg-gold-soft font-semibold">{x.name.replace(/\(.*\)/, '').split(/[\s-]+/).filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).slice(0, 2).join('')}</span>{x.name}
            </button>
          ))}
        </div>
        <Row label={t({ en: 'Follow the recited ayah', bn: 'তিলাওয়াতের সাথে স্ক্রল', ar: 'متابعة الآية المتلوّة' })}><Switch checked={r.autoScroll} onCheckedChange={(v) => r.set({ autoScroll: v })} /></Row>
      </Section>

      <OfflineDownloads />

      <AccountSyncCard />

      <Section icon="journey" title={t({ en: 'Goals & data', bn: 'লক্ষ্য ও তথ্য', ar: 'الأهداف والبيانات' })}>
        <Row label={`${t({ en: 'Daily goal', bn: 'দৈনিক লক্ষ্য', ar: 'الهدف اليومي' })} · ${dailyGoal} ${t({ en: 'ayahs', bn: 'আয়াত', ar: 'آية' })}`}><Slider className="w-44" min={1} max={100} step={1} value={[dailyGoal]} onValueChange={([v]) => setDailyGoal(v)} /></Row>
        <p className="text-sm text-muted-foreground">{t({ en: 'Your bookmarks, notes and progress are stored privately on this device. Back them up or move them to another device:', bn: 'আপনার বুকমার্ক, নোট ও অগ্রগতি এই ডিভাইসেই সংরক্ষিত। ব্যাকআপ নিন বা অন্য ডিভাইসে নিন:', ar: 'علاماتك وملاحظاتك وتقدّمك محفوظة بخصوصية على هذا الجهاز. انسخها احتياطيًا أو انقلها إلى جهاز آخر:' })}</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportData} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">{t({ en: 'Export backup', bn: 'ব্যাকআপ ডাউনলোড', ar: 'تصدير نسخة احتياطية' })}</button>
          <button onClick={() => fileRef.current?.click()} className="rounded-full border px-5 py-2.5 text-sm font-semibold">{t({ en: 'Restore backup', bn: 'ব্যাকআপ রিস্টোর', ar: 'استعادة نسخة احتياطية' })}</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
          <button onClick={() => { r.reset(); toast.success(t({ en: 'Reading preferences reset', bn: 'পড়ার সেটিংস রিসেট হয়েছে', ar: 'أُعيد ضبط تفضيلات القراءة' })) }} className="rounded-full border px-5 py-2.5 text-sm font-semibold text-muted-foreground">{t({ en: 'Reset reading settings', bn: 'সেটিংস রিসেট', ar: 'إعادة ضبط إعدادات القراءة' })}</button>
        </div>
      </Section>
    </div>
  )
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <section className="card-soft mt-6 space-y-5 p-5 sm:p-7">
      <h2 className="flex items-center gap-3 font-display text-xl font-semibold"><UiIcon name={icon} size={30} />{title}</h2>
      {children}
    </section>
  )
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4"><span className="text-sm font-medium">{label}</span>{children}</div>
}
