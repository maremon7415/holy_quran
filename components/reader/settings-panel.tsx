'use client'
import { useReader, arabicFontVar, isBtOn, type ArabicFont } from '@/lib/stores/reader'
import { useUi } from '@/lib/stores/ui'
import { useReaderUi } from '@/lib/reader/ui-store'
import { useLang, useTx } from '@/lib/lang'
import { cn } from '@/lib/utils'
import { UiIcon } from '@/components/ui-icon'
import { ThemeSwatches } from '@/components/shell/theme-picker'
import { Panel } from './panel'
import { RangeRow, SectionTitle, Segmented, SwitchRow } from './controls'
import { TajweedLegend } from './tajweed-legend'
import { TranslationPicker } from './translation-picker'

const FONTS: { id: ArabicFont; name: string }[] = [
  { id: 'amiri-quran', name: 'Amiri Quran' },
  { id: 'scheherazade', name: 'Scheherazade' },
  { id: 'noto-naskh', name: 'Noto Naskh' },
  { id: 'indopak', name: 'Lateef' },
]

export function SettingsPanel() {
  const t = useTx()
  const lang = useLang()
  const open = useReaderUi((s) => s.settingsOpen)
  const setOpen = useReaderUi((s) => s.setSettingsOpen)
  const p = useReader()
  const set = p.set

  return (
    <Panel
      open={open}
      onOpenChange={setOpen}
      title={t({ en: 'Reading settings', bn: 'পড়ার সেটিংস', ar: 'إعدادات القراءة' })}
      footer={
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => p.reset()} className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground">
            {t({ en: 'Reset', bn: 'রিসেট', ar: 'إعادة ضبط' })}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); useUi.getState().setImmersive(true) }}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition active:scale-95"
          >
            <UiIcon name="focus" size={20} /> {t({ en: 'Focus mode', bn: 'ফোকাস মোড', ar: 'وضع التركيز' })}
          </button>
        </div>
      }
    >
      {/* live preview */}
      <div className="relative overflow-hidden rounded-3xl border bg-surface-2 px-4 py-4">
        <div className="bg-pattern pointer-events-none absolute inset-0" />
        <p className="quran-text relative text-center text-[length:var(--quran-size,34px)] leading-[2]" lang="ar">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </p>
        <p data-tr="bt" lang="bn" className="tr-bt relative mt-1 text-center">বিসমিল্লা-হির রাহমা-নির রাহীম</p>
        <p data-tr="tl" className="relative mt-1 text-center text-[length:calc(var(--trans-size,17px)*0.9)] italic text-muted-foreground">Bismillāhir-raḥmānir-raḥīm</p>
        <p data-tr="en" className="relative mt-1 text-center text-[length:var(--trans-size,17px)] text-foreground/85">In the name of Allah, the Entirely Merciful, the Especially Merciful.</p>
        <p data-tr="bn" className="relative mt-1 text-center font-bangla text-[length:var(--trans-size,17px)] text-foreground/85">পরম করুণাময় অসীম দয়ালু আল্লাহর নামে</p>
      </div>

      <SectionTitle>{t({ en: 'Layout', bn: 'বিন্যাস', ar: 'التخطيط' })}</SectionTitle>
      <Segmented
        value={p.mode}
        onChange={(mode) => set({ mode })}
        options={[
          { value: 'translation', label: t({ en: 'Translation', bn: 'অনুবাদসহ', ar: 'الترجمة' }) },
          { value: 'reading', label: t({ en: 'Mushaf flow', bn: 'মুসহাফ', ar: 'عرض المصحف' }) },
        ]}
      />

      <SectionTitle>{t({ en: 'Translations', bn: 'অনুবাদ', ar: 'الترجمات' })}</SectionTitle>
      <div className="divide-y rounded-3xl border bg-card px-3">
        <SwitchRow title="English" hint={p.enEdition === 'haleem' ? 'Abdel Haleem' : 'Saheeh International'} checked={p.showEn} onChange={(showEn) => set({ showEn })} />
        <SwitchRow title="বাংলা" hint="তাইসীরুল কুরআন" checked={p.showBn} onChange={(showBn) => set({ showBn })} />
        <SwitchRow
          title={t({ en: 'Bangla pronunciation', bn: 'বাংলা উচ্চারণ', ar: 'النطق البنغالي' })}
          hint={t({ en: 'Auto-generated pronunciation guide · বাংলা উচ্চারণ', bn: 'স্বয়ংক্রিয়ভাবে তৈরি উচ্চারণ নির্দেশিকা — তিলাওয়াত শিখতে অডিও শুনুন', ar: 'دليل نطق مُولَّد آليًا · বাংলা উচ্চারণ' })}
          checked={isBtOn(p.showBt, lang)}
          onChange={(v) => set({ showBt: v })}
        />
        <SwitchRow title={t({ en: 'Transliteration', bn: 'উচ্চারণ (ইংরেজি)', ar: 'النقحرة اللاتينية' })} checked={p.showTl} onChange={(showTl) => set({ showTl })} />
      </div>
      <TranslationPicker />
      <div className={cn('mt-3 transition-opacity', !p.showEn && 'pointer-events-none opacity-40')}>
        <Segmented
          value={p.enEdition}
          onChange={(enEdition) => set({ enEdition })}
          options={[
            { value: 'sahih', label: 'Saheeh Intl.' },
            { value: 'haleem', label: 'Abdel Haleem' },
          ]}
        />
      </div>

      <SectionTitle>{t({ en: 'Arabic script', bn: 'আরবি লিপি', ar: 'الخط العربي' })}</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {FONTS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => set({ arabicFont: f.id })}
            className={cn(
              'rounded-2xl border px-3 pb-2 pt-1 text-center transition-all duration-300 active:scale-95',
              p.arabicFont === f.id ? 'border-primary bg-accent shadow-[0_0_0_3px_var(--glow)]' : 'bg-card hover:border-primary/40'
            )}
          >
            <span className="block text-[26px] leading-[1.9] text-arabic" style={{ fontFamily: arabicFontVar[f.id] }} lang="ar">ٱلْحَمْدُ لِلَّهِ</span>
            <span className="block text-xs font-semibold text-muted-foreground">{f.name}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-3xl border bg-card px-4 py-2">
        <RangeRow label={t({ en: 'Arabic size', bn: 'আরবি আকার', ar: 'حجم الخط العربي' })} value={p.arabicSize} min={22} max={64} onChange={(arabicSize) => set({ arabicSize })} />
        <RangeRow label={t({ en: 'Translation size', bn: 'অনুবাদের আকার', ar: 'حجم الترجمة' })} value={p.transSize} min={13} max={28} onChange={(transSize) => set({ transSize })} />
      </div>

      <SectionTitle>{t({ en: 'Study tools', bn: 'অধ্যয়ন', ar: 'أدوات الدراسة' })}</SectionTitle>
      <div className="divide-y rounded-3xl border bg-card px-3">
        <SwitchRow icon={<UiIcon name="tajweed" size={24} />} title={t({ en: 'Tajweed colours', bn: 'তাজবীদ রং', ar: 'ألوان التجويد' })} hint={t({ en: 'Colour-coded recitation rules', bn: 'তিলাওয়াতের নিয়ম রঙে', ar: 'أحكام التلاوة بالألوان' })} checked={p.tajweed} onChange={(tajweed) => set({ tajweed })} />
        <SwitchRow icon={<UiIcon name="word" size={24} />} title={t({ en: 'Word by word', bn: 'শব্দে শব্দে', ar: 'كلمة بكلمة' })} hint={t({ en: 'Tap a word to hear it', bn: 'শব্দে ট্যাপ করে শুনুন', ar: 'اضغط على الكلمة لسماعها' })} checked={p.wordByWord} onChange={(wordByWord) => set({ wordByWord })} />
        <SwitchRow icon={<UiIcon name="listen" size={24} />} title={t({ en: 'Follow recitation', bn: 'তিলাওয়াতের সাথে স্ক্রল', ar: 'متابعة التلاوة' })} hint={t({ en: 'Auto-scroll to the ayah being recited', bn: 'চলমান আয়াতে স্বয়ংক্রিয় স্ক্রল', ar: 'تمرير تلقائي إلى الآية المتلوّة' })} checked={p.autoScroll} onChange={(autoScroll) => set({ autoScroll })} />
      </div>
      {p.tajweed && <TajweedLegend className="mt-3" />}
      <div className="mt-3 flex items-center justify-between gap-3 px-1">
        <span className="text-sm font-semibold">{t({ en: 'Word meanings in', bn: 'শব্দার্থের ভাষা', ar: 'معاني الكلمات بـ' })}</span>
        <Segmented className="w-40" value={p.wbwLang} onChange={(wbwLang) => set({ wbwLang })} options={[{ value: 'en', label: 'EN' }, { value: 'bn', label: 'বাং' }]} />
      </div>

      <SectionTitle>{t({ en: 'Theme', bn: 'থিম', ar: 'السمة' })}</SectionTitle>
      <ThemeSwatches />

      <SectionTitle>{t({ en: 'Keyboard', bn: 'কীবোর্ড', ar: 'لوحة المفاتيح' })}</SectionTitle>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-1 text-xs text-muted-foreground">
        {[
          ['J / K', t({ en: 'Next / previous ayah', bn: 'পরের / আগের আয়াত', ar: 'الآية التالية / السابقة' })],
          ['Space', t({ en: 'Play / pause', bn: 'চালু / বিরতি', ar: 'تشغيل / إيقاف مؤقت' })],
          ['B', t({ en: 'Bookmark', bn: 'বুকমার্ক', ar: 'علامة حفظ' })],
          ['T', t({ en: 'Tafsir', bn: 'তাফসীর', ar: 'التفسير' })],
          ['F', t({ en: 'Focus mode', bn: 'ফোকাস মোড', ar: 'وضع التركيز' })],
          ['/', t({ en: 'Search', bn: 'খুঁজুন', ar: 'بحث' })],
        ].map(([k, d]) => (
          <span key={k} className="flex items-center gap-2"><kbd className="min-w-10 rounded-md border bg-muted px-1.5 py-0.5 text-center font-sans text-[10px] font-bold text-foreground">{k}</kbd>{d}</span>
        ))}
      </div>
    </Panel>
  )
}
