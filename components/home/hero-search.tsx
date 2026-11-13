'use client'
import { useUi } from '@/lib/stores/ui'
import { useTx } from '@/lib/lang'
import { UiIcon } from '@/components/ui-icon'

export function HeroSearch() {
  const open = useUi((s) => s.setPaletteOpen)
  const t = useTx()
  return (
    <button onClick={() => open(true)} className="group glass mx-auto flex h-14 w-full max-w-xl items-center gap-3 rounded-full border px-5 text-left shadow-[0_20px_50px_-25px_var(--glow)] transition hover:border-primary/40 hover:shadow-[0_20px_60px_-20px_var(--glow)]">
      <UiIcon name="search" size={24} />
      <span className="flex-1 truncate text-muted-foreground">{t({ en: 'Search “Ayatul Kursi”, 36, “patience”, ধৈর্য…', bn: '“আয়াতুল কুরসি”, ৩৬, “ধৈর্য” খুঁজুন…' })}</span>
      <kbd className="hidden rounded-lg border bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground sm:block">⌘K</kbd>
    </button>
  )
}
