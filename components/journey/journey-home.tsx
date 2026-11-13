'use client'
import { useMemo, useState } from 'react'
import Link from '@/lib/i18n/link'
import { motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { useLang, useMounted, useTx } from '@/lib/lang'
import { useAppStore } from '@/lib/store'
import { useHifz, hifzStreak } from '@/lib/stores/hifz'
import { useJourney } from '@/lib/stores/journey'
import { chapters, surahHref, surahNamesBn } from '@/lib/quran/chapters'
import { achievements } from '@/lib/hifz/achievements'
import { strength } from '@/lib/hifz/srs'
import { UiIcon } from '@/components/ui-icon'
import { Heatmap } from './heatmap'
import { AchievementGrid } from './achievements'
import { KhatamPlanner, Ring } from './khatam-planner'
import { BackupPanel } from './backup'
import { cn } from '@/lib/utils'

const spring = { type: 'spring' as const, stiffness: 380, damping: 30 }
const today = () => new Date().toLocaleDateString('en-CA')

function Section({ title, sub, children, id }: { title: string; sub?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-2xl">{title}</h2>
      {sub && <p className="mb-4 mt-1 text-sm text-muted-foreground">{sub}</p>}
      {!sub && <div className="mb-4" />}
      {children}
    </section>
  )
}

function Tile({ icon, value, label, href }: { icon: string; value: React.ReactNode; label: string; href?: string }) {
  const inner = (
    <div className="card-soft lift flex h-full items-center gap-3 rounded-3xl border border-border bg-card p-4">
      <UiIcon name={icon} size={36} />
      <div className="min-w-0">
        <p className="font-display text-2xl leading-none tabular-nums">{value}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

export function JourneyHome() {
  const t = useTx()
  const lang = useLang()
  const mounted = useMounted()
  const stats = useAppStore((s) => s.readingStats)
  const progress = useAppStore((s) => s.readingProgress)
  const bookmarks = useAppStore((s) => s.importantAyahs)
  const dailyGoal = useAppStore((s) => s.dailyGoal)
  const setDailyGoal = useAppStore((s) => s.setDailyGoal)
  const cards = useHifz((s) => s.cards)
  const hlog = useHifz((s) => s.log)
  const khatams = useJourney((s) => s.khatams)
  const [editGoal, setEditGoal] = useState(false)

  const data = useMemo(() => {
    const m: Record<string, number> = {}
    if (!mounted) return m
    for (const h of stats.readingHistory) m[h.date] = (m[h.date] ?? 0) + h.versesRead
    for (const [d, l] of Object.entries(hlog)) m[d] = (m[d] ?? 0) + l.learned + l.reviewed
    return m
  }, [stats.readingHistory, hlog, mounted])

  const todayCount = mounted ? (stats.readingHistory.find((h) => h.date === today())?.versesRead ?? 0) : 0
  const goal = mounted ? dailyGoal : 7
  const pct = Math.min(100, Math.round((todayCount / Math.max(1, goal)) * 100))
  const streakAlive = mounted && (stats.lastReadDate === today() || stats.lastReadDate === (() => { const y = new Date(); y.setHours(12, 0, 0, 0); y.setDate(y.getDate() - 1); return y.toLocaleDateString('en-CA') })())
  const streak = mounted && streakAlive ? stats.currentStreak : 0
  const completed = mounted ? Object.entries(progress).filter(([, p]) => p?.completed).map(([k]) => +k) : []
  const hifzKnown = mounted ? Object.values(cards).filter((c) => strength(c) > 0).length : 0
  const hifzSurahs = useMemo(() => {
    if (!mounted) return []
    const n = chapters.map(() => 0)
    for (const [k, c] of Object.entries(cards)) if (c.reps > 0) n[+k.split(':')[0] - 1]++
    return chapters.filter((c, i) => n[i] >= c.versesCount).map((c) => c.id)
  }, [cards, mounted])

  const badges = achievements({
    totalVerses: mounted ? stats.totalVersesRead : 0,
    longestStreak: mounted ? stats.longestStreak : 0,
    currentStreak: streak,
    completedSurahs: completed,
    bookmarks: mounted ? bookmarks.length : 0,
    hifzAyahs: hifzKnown,
    hifzStreak: mounted ? hifzStreak(hlog) : 0,
    khatams: mounted ? khatams.filter((k) => k.finishedAt).length : 0,
    hifzSurahs,
  })
  const unlocked = badges.filter((b) => b.value >= b.target).length

  return (
    <div className="space-y-12">
      {/* hero stats */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="card-soft relative flex items-center gap-5 overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="bg-pattern pointer-events-none absolute inset-0" />
          <div className="relative">
            <Ring pct={pct} size={132}>
              <div>
                <p className="font-display text-3xl tabular-nums leading-none">{todayCount}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">/ {goal} {t({ en: 'verses', bn: 'আয়াত', ar: 'آية' })}</p>
              </div>
            </Ring>
          </div>
          <div className="relative min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">{t({ en: "Today's goal", bn: 'আজকের লক্ষ্য', ar: 'هدف اليوم' })}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {pct >= 100 ? t({ en: 'Goal reached — mā shāʾ Allāh!', bn: 'লক্ষ্য পূরণ — মাশাআল্লাহ!', ar: 'تحقق الهدف — ما شاء الله!' }) : t({ en: `${Math.max(0, goal - todayCount)} more to go`, bn: `আরও ${Math.max(0, goal - todayCount)}টি বাকি`, ar: `بقي ${Math.max(0, goal - todayCount)}` })}
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              <button aria-label={t({ en: 'Decrease goal', bn: 'লক্ষ্য কমান', ar: 'إنقاص الهدف' })} onClick={() => setDailyGoal(Math.max(1, goal - (goal > 20 ? 5 : 1)))} className="grid h-8 w-8 place-items-center rounded-full border border-border hover:bg-muted"><Minus className="h-3.5 w-3.5" /></button>
              <button onClick={() => setEditGoal((e) => !e)} className="min-w-14 text-center text-sm font-semibold tabular-nums">{goal}</button>
              <button aria-label={t({ en: 'Increase goal', bn: 'লক্ষ্য বাড়ান', ar: 'زيادة الهدف' })} onClick={() => setDailyGoal(Math.min(500, goal + (goal >= 20 ? 5 : 1)))} className="grid h-8 w-8 place-items-center rounded-full border border-border hover:bg-muted"><Plus className="h-3.5 w-3.5" /></button>
            </div>
            <Link href="/quran" className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">{t({ en: 'Continue reading →', bn: 'পড়া চালিয়ে যান →', ar: 'تابع القراءة ←' })}</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <motion.div whileHover={{ y: -2 }} className="card-soft col-span-2 flex items-center gap-4 rounded-3xl border border-border bg-card p-4 sm:col-span-1">
            <motion.div animate={streak ? { scale: [1, 1.1, 1] } : {}} transition={{ repeat: Infinity, duration: 2.4 }}>
              <UiIcon name="streak" size={52} className={streak ? '' : 'opacity-40 grayscale'} />
            </motion.div>
            <div>
              <p className="font-display text-3xl leading-none tabular-nums">{streak}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t({ en: 'day streak', bn: 'দিনের স্ট্রিক', ar: 'أيام متتالية' })}</p>
              <p className="text-[11px] text-muted-foreground">{t({ en: 'Best', bn: 'সর্বোচ্চ', ar: 'الأفضل' })} {mounted ? stats.longestStreak : 0}</p>
            </div>
          </motion.div>
          <Tile icon="quran" value={(mounted ? stats.totalVersesRead : 0).toLocaleString('en-US')} label={t({ en: 'Verses read', bn: 'আয়াত পড়া হয়েছে', ar: 'آيات مقروءة' })} />
          <Tile icon="crescent" value={`${completed.length}/114`} label={t({ en: 'Surahs completed', bn: 'সূরা সম্পন্ন', ar: 'سور مكتملة' })} />
          <Tile icon="bookmark" value={mounted ? bookmarks.length : 0} label={t({ en: 'Bookmarks', bn: 'বুকমার্ক', ar: 'العلامات' })} href="/saved" />
          <Tile icon="hifz" value={hifzKnown} label={t({ en: 'Ayahs memorised', bn: 'আয়াত মুখস্থ', ar: 'آيات محفوظة' })} href="/hifz" />
          <Tile icon="khatam" value={mounted ? khatams.filter((k) => k.finishedAt).length : 0} label={t({ en: 'Khatams', bn: 'খতম', ar: 'الختمات' })} />
        </div>
      </div>

      <Section title={t({ en: 'Your year in the Quran', bn: 'কুরআনের সাথে আপনার বছর', ar: 'عامك مع القرآن' })} sub={t({ en: 'Every verse read and every ayah practised in Hifz Studio.', bn: 'পড়া প্রতিটি আয়াত ও হিফজে অনুশীলিত প্রতিটি আয়াত।', ar: 'كل آية قرأتها وكل آية تدربت عليها في استوديو الحفظ.' })}>
        <div className="card-soft rounded-3xl border border-border bg-card p-5">{mounted ? <Heatmap data={data} /> : <div className="h-36 lg:h-48" aria-hidden />}</div>
      </Section>

      <Section id="khatam" title={t({ en: 'Khatam planner', bn: 'খতম পরিকল্পনা', ar: 'مخطط الختمة' })} sub={t({ en: 'Complete the whole Quran at a pace that fits your life.', bn: 'আপনার জীবনের সাথে মানানসই গতিতে পুরো কুরআন শেষ করুন।', ar: 'اختم القرآن كاملًا بوتيرة تناسب حياتك.' })}>
        <KhatamPlanner />
      </Section>

      <Section title={t({ en: 'Surahs', bn: 'সূরাসমূহ', ar: 'السور' })} sub={t({ en: 'Filled tiles are completed; the glow shows partial progress. Gold ring = memorised.', bn: 'ভরা ঘর সম্পন্ন; আংশিক অগ্রগতি হালকা রঙে। সোনালি বর্ডার = মুখস্থ।', ar: 'المربعات الممتلئة مكتملة، والتوهج يدل على تقدم جزئي. الحلقة الذهبية = محفوظة.' })}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(2.6rem,1fr))] gap-1.5">
          {chapters.map((c) => {
            const p = mounted ? progress[c.id] : undefined
            const frac = p ? (p.completed ? 1 : Math.min(1, (p.versesRead || 0) / c.versesCount)) : 0
            const mem = hifzSurahs.includes(c.id)
            return (
              <Link
                key={c.id}
                href={surahHref(c.id)}
                title={`${c.id}. ${lang === 'bn' ? surahNamesBn[c.id - 1] : lang === 'ar' ? c.nameArabic : c.nameSimple}`}
                className={cn('grid aspect-square place-items-center rounded-xl text-xs font-medium tabular-nums transition hover:scale-110', frac === 1 ? 'text-primary-foreground' : 'text-muted-foreground', mem && 'ring-2 ring-gold')}
                style={{ background: frac ? `color-mix(in oklab, var(--primary) ${frac === 1 ? 100 : 18 + frac * 60}%, var(--muted))` : 'var(--muted)' }}
              >
                {c.id}
              </Link>
            )
          })}
        </div>
      </Section>

      <Section title={t({ en: 'Achievements', bn: 'অর্জন', ar: 'الإنجازات' })} sub={t({ en: `${unlocked} of ${badges.length} unlocked`, bn: `${badges.length}টির মধ্যে ${unlocked}টি অর্জিত`, ar: `${unlocked} من ${badges.length} مفتوحة` })}>
        <AchievementGrid items={badges} />
      </Section>

      <BackupPanel />
    </div>
  )
}
