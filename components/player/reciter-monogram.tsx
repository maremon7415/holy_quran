import { cn } from '@/lib/utils'
import { monogram } from '@/lib/audio/reciters'

/** Portrait-free reciter avatar: initials inside an eight-pointed star (two rotated squares). */
export function ReciterMonogram({ name, size = 48, active, className }: { name: string; size?: number; active?: boolean; className?: string }) {
  const sq = size * 0.7
  const frame = cn('absolute rounded-[22%] border transition-colors', active ? 'border-primary bg-primary/10' : 'border-gold/45 bg-gold-soft/50')
  return (
    <span className={cn('relative inline-grid shrink-0 place-items-center', className)} style={{ width: size, height: size }} aria-hidden>
      <span className={frame} style={{ width: sq, height: sq }} />
      <span className={frame} style={{ width: sq, height: sq, transform: 'rotate(45deg)' }} />
      <span className={cn('relative font-display font-semibold uppercase tracking-tight', active ? 'text-accent-foreground' : 'text-foreground')} style={{ fontSize: size * 0.3 }}>
        {monogram(name)}
      </span>
    </span>
  )
}
