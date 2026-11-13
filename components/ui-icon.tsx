import { cn } from '@/lib/utils'

/** Custom illustrated PNG icon from /public/icons/ui. Works in server & client components. */
export function UiIcon({ name, size = 24, className, alt = '' }: { name: string; size?: number; className?: string; alt?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/icons/ui/${name}.png`}
      width={size}
      height={size}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable={false}
      decoding="async"
      className={cn('inline-block shrink-0 select-none object-contain', className)}
      style={{ width: size, height: size }}
    />
  )
}
