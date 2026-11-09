'use client'
import { motion } from 'framer-motion'

export interface ArcMark { key: string; label: string; time: number; active?: boolean }

const W = 400, H = 190, X0 = 24, X1 = 376, HOR = 138, AMP = 104

/** Sun path of the day: altitude curve zero at sunrise & sunset, dipping below the horizon at night. */
export function SunArc({ now, sunrise, sunset, start, end, marks }: { now: number; sunrise: number; sunset: number; start: number; end: number; marks: ArcMark[] }) {
  const xOf = (t: number) => X0 + ((t - start) / (end - start)) * (X1 - X0)
  const yOf = (t: number) => HOR - AMP * Math.sin((Math.PI * (t - sunrise)) / (sunset - sunrise)) * (t >= sunrise && t <= sunset ? 1 : 0.28)
  const pts = (to: number) => {
    const n = 80, out: string[] = []
    for (let i = 0; i <= n; i++) {
      const t = start + ((to - start) * i) / n
      if (t < start) continue
      out.push(`${i ? 'L' : 'M'}${xOf(t).toFixed(1)},${yOf(t).toFixed(1)}`)
    }
    return out.join(' ')
  }
  const clamped = Math.min(Math.max(now, start), end)
  const full = pts(end)
  const done = pts(clamped)
  const day = now >= sunrise && now <= sunset
  const sx = xOf(clamped), sy = yOf(clamped)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" role="img" aria-label="Sun path through the day with prayer times">
      <defs>
        <clipPath id="above"><rect x="0" y="0" width={W} height={HOR} /></clipPath>
        <linearGradient id="skyfill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--gold)" stopOpacity="0.28" /><stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${full} L${X1},${HOR} L${X0},${HOR} Z`} clipPath="url(#above)" fill="url(#skyfill)" />
      <line x1="0" x2={W} y1={HOR} y2={HOR} className="stroke-border" strokeWidth="1" />
      <path d={full} fill="none" className="stroke-muted-foreground/40" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
      <path d={done} fill="none" className="stroke-gold" strokeWidth="3" strokeLinecap="round" />
      {marks.map((m) => {
        const x = xOf(m.time), y = yOf(m.time)
        return (
          <g key={m.key}>
            <circle cx={x} cy={y} r={m.active ? 5.5 : 4} className={m.active ? 'fill-primary stroke-card' : m.time < now ? 'fill-gold stroke-card' : 'fill-card stroke-gold'} strokeWidth="2" />
            <text x={x} y={HOR + 20} textAnchor="middle" className={`text-[10px] font-semibold ${m.active ? 'fill-primary' : 'fill-muted-foreground'}`}>{m.label}</text>
          </g>
        )
      })}
      <motion.g initial={false} animate={{ x: sx, y: sy }} transition={{ type: 'spring', stiffness: 380, damping: 30 }}>
        <circle r="18" className={day ? 'fill-gold/25' : 'fill-primary/15'}>
          <animate attributeName="r" values="16;22;16" dur="3s" repeatCount="indefinite" />
        </circle>
        <image href={`/icons/ui/${day ? 'sun' : 'moon'}.png`} x="-14" y="-14" width="28" height="28" />
      </motion.g>
    </svg>
  )
}
