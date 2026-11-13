import type { WuduDiagram } from '@/data/learn/wudu'

/**
 * Simple line diagrams for the wudu steps (decorative: the step text carries the meaning).
 * Drawn with currentColor so they follow every theme; accents use the gold token via `text-gold`.
 */
const drop = 'M0 -7 C4 -1 6 2 6 5 A6 6 0 0 1 -6 5 C-6 2 -4 -1 0 -7z'

function Drops({ at }: { at: [number, number][] }) {
  return <>{at.map(([x, y], i) => <path key={i} d={drop} transform={`translate(${x} ${y}) scale(.62)`} className="text-gold" fill="currentColor" stroke="none" />)}</>
}

const art: Record<WuduDiagram, React.ReactNode> = {
  niyyah: (
    <>
      <path d="M48 78 C20 58 14 40 24 29 C32 21 44 24 48 33 C52 24 64 21 72 29 C82 40 76 58 48 78z" fill="currentColor" fillOpacity=".14" />
      <path d="M40 46 L46 52 L58 38" />
      <path d="M78 14 v10 M73 19 h10 M16 74 v8 M12 78 h8" className="text-gold" />
    </>
  ),
  hands: (
    <>
      <path d="M34 80 V46 a5 5 0 0 1 10 0 V34 a5 5 0 0 1 10 0 V34 a5 5 0 0 1 10 0 V44 a5 5 0 0 1 10 0 V66 C74 78 66 86 54 86 C44 86 38 84 34 80z" fill="currentColor" fillOpacity=".14" />
      <path d="M44 46 V60 M54 34 V58 M64 34 V58" />
      <path d="M26 72 H82" strokeDasharray="3 4" className="text-gold" />
      <Drops at={[[22, 34], [16, 52], [84, 30]]} />
    </>
  ),
  mouth: (
    <>
      <path d="M18 48 C30 30 40 34 48 38 C56 34 66 30 78 48 C66 68 30 68 18 48z" fill="currentColor" fillOpacity=".14" />
      <path d="M18 48 C34 54 62 54 78 48" />
      <path d="M40 38 C44 41 52 41 56 38" />
      <Drops at={[[48, 80], [70, 74], [28, 72]]} />
    </>
  ),
  nose: (
    <>
      <path d="M48 14 C46 34 44 46 38 60 C32 64 32 72 40 72 C44 72 46 70 48 70 C50 70 52 72 56 72 C64 72 64 64 58 60 C52 46 50 34 48 14z" fill="currentColor" fillOpacity=".14" />
      <circle cx="41" cy="67" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="55" cy="67" r="2.5" fill="currentColor" stroke="none" />
      <Drops at={[[24, 80], [72, 80]]} />
      <path d="M24 66 C30 70 34 72 36 70 M72 66 C66 70 62 72 60 70" className="text-gold" />
    </>
  ),
  face: (
    <>
      <path d="M48 12 C28 12 22 32 22 50 C22 72 34 86 48 86 C62 86 74 72 74 50 C74 32 68 12 48 12z" fill="currentColor" fillOpacity=".14" />
      <path d="M38 46 h0.01 M58 46 h0.01" strokeWidth="5" />
      <path d="M40 66 C44 70 52 70 56 66" />
      <path d="M22 30 H74" strokeDasharray="3 4" className="text-gold" />
      <path d="M48 12 V86" strokeDasharray="3 4" className="text-gold" opacity=".5" />
      <path d="M12 52 H20 M76 52 H84 M16 48 l-4 4 l4 4 M80 48 l4 4 l-4 4" className="text-gold" />
    </>
  ),
  arms: (
    <>
      <rect x="14" y="40" width="58" height="18" rx="9" fill="currentColor" fillOpacity=".14" />
      <path d="M72 44 C78 38 84 40 84 46 V52 C84 58 78 60 72 56" />
      <circle cx="22" cy="49" r="7" className="text-gold" />
      <path d="M62 49 h-8 M58 45 l-4 4 l4 4" />
      <path d="M22 24 V34 M14 24 V32 M30 24 V32" className="text-gold" opacity=".6" />
      <Drops at={[[38, 24], [52, 22], [46, 74], [60, 80]]} />
    </>
  ),
  head: (
    <>
      <path d="M48 14 C28 14 22 34 22 50 C22 70 32 82 48 82 C64 82 74 70 74 50 C74 34 68 14 48 14z" fill="currentColor" fillOpacity=".14" />
      <path d="M26 40 C30 24 40 18 48 18 C58 18 68 24 72 40" />
      <path d="M32 34 C44 26 58 26 66 34" className="text-gold" strokeDasharray="3 4" />
      <path d="M30 28 C42 20 56 20 66 28 M60 24 l6 4 l-8 2" className="text-gold" />
    </>
  ),
  ears: (
    <>
      <path d="M24 56 C14 40 20 20 34 18 C46 16 52 28 46 40 C42 48 38 50 38 58 C38 66 32 70 28 66" fill="currentColor" fillOpacity=".14" />
      <path d="M72 56 C82 40 76 20 62 18 C50 16 44 28 50 40 C54 48 58 50 58 58 C58 66 64 70 68 66" fill="currentColor" fillOpacity=".14" />
      <path d="M32 30 C38 26 42 32 38 38 M64 30 C58 26 54 32 58 38" />
      <path d="M26 80 H70" strokeDasharray="3 4" className="text-gold" />
    </>
  ),
  feet: (
    <>
      <path d="M26 16 C20 16 18 24 20 34 C22 48 22 60 22 66 C22 74 28 80 36 80 C44 80 44 72 42 64 C40 54 38 44 36 32 C34 22 32 16 26 16z" fill="currentColor" fillOpacity=".14" />
      <path d="M62 16 C56 16 54 24 56 34 C58 48 58 60 58 66 C58 74 64 80 72 80 C80 80 80 72 78 64 C76 54 74 44 72 32 C70 22 68 16 62 16z" fill="currentColor" fillOpacity=".14" />
      <circle cx="26" cy="64" r="5" className="text-gold" />
      <circle cx="62" cy="64" r="5" className="text-gold" />
      <Drops at={[[12, 40], [86, 44], [48, 88]]} />
    </>
  ),
  dua: (
    <>
      <path d="M20 58 C20 70 32 82 48 82 C64 82 76 70 76 58 L68 40 L48 52 L28 40z" fill="currentColor" fillOpacity=".14" />
      <path d="M20 58 L28 40 M76 58 L68 40 M48 52 V70" />
      <path d="M48 12 l3 8 l8 1 l-6 6 l2 9 l-7 -5 l-7 5 l2 -9 l-6 -6 l8 -1z" className="text-gold" fill="currentColor" fillOpacity=".25" />
    </>
  ),
}

export function WuduDiagramSvg({ id, className = 'size-24' }: { id: WuduDiagram; className?: string }) {
  return (
    <svg viewBox="0 0 96 96" aria-hidden focusable="false" className={`text-primary ${className}`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {art[id]}
    </svg>
  )
}
