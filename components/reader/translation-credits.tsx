/** One-line attribution for the translations shown (instead of repeating it under every ayah). */
export function TranslationCredits({ className = '' }: { className?: string }) {
  return (
    <p className={`hide-in-mushaf flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80 ${className}`}>
      <span data-tr="en" data-ed="sahih">Saheeh International</span>
      <span data-tr="en" data-ed="haleem">M.A.S. Abdel Haleem</span>
      <span data-tr="bn" className="font-bangla normal-case tracking-normal">· তাইসীরুল কুরআন</span>
      <span data-tr="tl">· Transliteration</span>
    </p>
  )
}
