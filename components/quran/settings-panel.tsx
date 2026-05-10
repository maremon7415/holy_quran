'use client'

import { useState } from 'react'
import { Settings, Headphones, Type, Languages, ChevronDown, ChevronRight, Volume2, Repeat, Mic2 } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { Input } from '@/components/ui/input'

const RECITERS = [
  { id: 7, name: 'Mishary Alafasy' },
  { id: 4, name: 'Abu Bakr Al-Shatri' },
  { id: 6, name: 'Mahmoud Khalil Al-Husary' },
  { id: 9, name: 'Minshawi (Murattal)' },
  { id: 1, name: 'Abdul Basit (Mujawwad)' },
  { id: 3, name: 'Abdur-Rahman as-Sudais' },
  { id: 5, name: 'Hani ar-Rifai' },
]

interface SettingsPanelProps {
  surahNumber: number
  currentAyah: number
  totalAyahs: number
}

function AccordionSection({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border/40 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 px-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary/70" />
          <span>{title}</span>
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="pb-4 px-1 space-y-4">{children}</div>}
    </div>
  )
}

export default function SettingsPanel({
  surahNumber,
  currentAyah,
  totalAyahs,
}: SettingsPanelProps) {
  const [tab, setTab] = useState<'reading' | 'audio'>('reading')
  const {
    translationFontSize,
    setTranslationFontSize,
    ayahFontSize,
    setAyahFontSize,
    arabicFont,
    setArabicFont,
    englishFont,
    setEnglishFont,
    banglaFont,
    setBanglaFont,
    audioState,
    setAudioReciter,
    setAudioAutoplay,
    setAudioVolume,
    dailyGoal,
    setDailyGoal,
  } = useAppStore()
  const { t } = useI18n()
  const [showGoalInput, setShowGoalInput] = useState(false)
  const [goalValue, setGoalValue] = useState(dailyGoal.toString())

  const arabicFonts = [
    { name: 'Amiri', value: 'font-amiri' },
    { name: 'Cairo', value: 'font-cairo' },
    { name: 'Lateef', value: 'font-lateef' },
    { name: 'Scheherazade New', value: 'font-scheherazade' },
    { name: 'Noto Naskh Arabic', value: 'font-noto-naskh' },
  ]

  const englishFonts = [
    { name: 'Inter', value: 'font-inter' },
    { name: 'Merriweather', value: 'font-merriweather' },
    { name: 'Outfit', value: 'font-outfit' },
  ]

  const banglaFonts = [
    { name: 'Noto Sans', value: 'font-noto-bengali' },
    { name: 'Hind Siliguri', value: 'font-hind-siliguri' },
    { name: 'Tiro Bangla', value: 'font-tiro-bangla' },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <div className="flex bg-muted/60 rounded-xl p-1">
          {[
            { key: 'reading' as const, label: 'Reading', icon: Settings },
            { key: 'audio' as const, label: 'Audio', icon: Headphones },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                tab === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {tab === 'reading' ? (
          <div>
            <AccordionSection title="Display Settings" icon={Type} defaultOpen>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{t('arabic_verse_text_size')}</span>
                  <span className="text-xs font-bold text-primary">{ayahFontSize}px</span>
                </div>
                <Slider
                  value={[ayahFontSize]}
                  min={18}
                  max={64}
                  step={2}
                  onValueChange={(v) => setAyahFontSize(v[0])}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{t('translation_text_size')}</span>
                  <span className="text-xs font-bold text-primary">{translationFontSize}px</span>
                </div>
                <Slider
                  value={[translationFontSize]}
                  min={12}
                  max={32}
                  step={2}
                  onValueChange={(v) => setTranslationFontSize(v[0])}
                />
              </div>
            </AccordionSection>

            <AccordionSection title="Fonts" icon={Languages} defaultOpen>
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5 block">
                    {t('arabic_font')}
                  </span>
                  <Select value={arabicFont} onValueChange={setArabicFont}>
                    <SelectTrigger className="w-full h-10 rounded-xl bg-muted/50 border-border/50 text-xs font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {arabicFonts.map((f) => (
                        <SelectItem key={f.value} value={f.value} className="text-xs">
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5 block">
                    {t('english_font')}
                  </span>
                  <Select value={englishFont} onValueChange={setEnglishFont}>
                    <SelectTrigger className="w-full h-10 rounded-xl bg-muted/50 border-border/50 text-xs font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {englishFonts.map((f) => (
                        <SelectItem key={f.value} value={f.value} className="text-xs">
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5 block">
                    {t('bangla_font')}
                  </span>
                  <Select value={banglaFont} onValueChange={setBanglaFont}>
                    <SelectTrigger className="w-full h-10 rounded-xl bg-muted/50 border-border/50 text-xs font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {banglaFonts.map((f) => (
                        <SelectItem key={f.value} value={f.value} className="text-xs">
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionSection>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border/40">
              <Mic2 className="w-4 h-4 text-primary/70" />
              <span className="text-sm font-medium text-foreground">Audio Settings</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2 block">
                Default Reciter
              </span>
              <Select 
                value={String(audioState.reciterId)} 
                onValueChange={(v) => setAudioReciter(Number(v))}
              >
                <SelectTrigger className="w-full h-10 rounded-xl bg-muted/50 border-border/50 text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECITERS.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)} className="text-xs">
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Autoplay Next Ayah</span>
              </div>
              <button
                onClick={() => setAudioAutoplay(!audioState.autoplay)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  audioState.autoplay ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  audioState.autoplay ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Default Volume</span>
              </div>
              <div className="w-24">
                <Slider
                  value={[audioState.volume]}
                  max={1}
                  step={0.1}
                  onValueChange={([v]) => setAudioVolume(v)}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border/40">
              <p className="text-xs text-muted-foreground text-center">
                Play audio from any surah to see the global player
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-border/40">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/15 p-4">
          <h3 className="text-sm font-bold text-foreground mb-1">{t('daily_reading_goal')}</h3>
          <p className="text-xs text-muted-foreground mb-2">
            Set a daily reading goal to build consistent habits.
          </p>
          {showGoalInput ? (
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                max={50}
                value={goalValue}
                onChange={(e) => setGoalValue(e.target.value)}
                className="w-20 h-9 text-sm"
              />
              <button
                onClick={() => {
                  const goal = parseInt(goalValue)
                  if (goal > 0) setDailyGoal(goal)
                  setShowGoalInput(false)
                }}
                className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowGoalInput(true)}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              {t('set_daily_goal')} ({dailyGoal} {t('verses')}/day)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
