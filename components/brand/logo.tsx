import Link from '@/lib/i18n/link'
import { cn } from '@/lib/utils'
import { site } from '@/lib/site'

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn('group flex items-center gap-2.5', className)} aria-label={`${site.name} home`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo.svg" alt="" width={36} height={36} className="size-9 transition-transform duration-700 ease-[var(--ease-soft)] group-hover:rotate-45" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[1.15rem] font-semibold tracking-tight">Noor <span className="text-gradient-gold">Quran</span></span>
          <span className="mt-0.5 font-arabic text-[0.7rem] text-muted-foreground">نُورُ القُرْآن</span>
        </span>
      )}
    </Link>
  )
}
