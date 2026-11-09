'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

function useIsDesktop() {
  const [d, setD] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(min-width: 768px)')
    const on = () => setD(m.matches)
    on()
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return d
}

const spring = { type: 'spring', stiffness: 380, damping: 36, mass: 0.9 } as const

/**
 * Responsive sheet: swipeable bottom sheet on phones, side panel on ≥ md.
 * Springy enter/exit via framer-motion; accessible via Radix Dialog.
 */
export function Panel({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  wide = false,
  className,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
  className?: string
}) {
  const desktop = useIsDesktop()
  const drag = useDragControls()
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="reader-chrome fixed inset-0 z-[80] bg-black/40 backdrop-blur-[3px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount onOpenAutoFocus={(e) => e.preventDefault()}>
              <motion.div
                className={cn(
                  'reader-chrome fixed z-[81] flex flex-col overflow-hidden border bg-popover text-popover-foreground shadow-[0_30px_80px_-20px_rgb(var(--shadow-color)/0.45)] outline-none',
                  desktop
                    ? cn('inset-y-3 right-3 rounded-[1.75rem]', wide ? 'w-[min(560px,calc(100vw-1.5rem))]' : 'w-[min(420px,calc(100vw-1.5rem))]')
                    : 'inset-x-0 bottom-0 max-h-[90dvh] rounded-t-[2rem] pb-[env(safe-area-inset-bottom)]',
                  className
                )}
                initial={desktop ? { x: '105%', opacity: 0.6 } : { y: '100%' }}
                animate={desktop ? { x: 0, opacity: 1 } : { y: 0 }}
                exit={desktop ? { x: '105%', opacity: 0.6 } : { y: '100%' }}
                transition={spring}
                drag={desktop ? false : 'y'}
                dragControls={drag}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.6 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 110 || info.velocity.y > 600) onOpenChange(false)
                }}
              >
                {!desktop && (
                  <div className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-3 active:cursor-grabbing" onPointerDown={(e) => drag.start(e)}>
                    <span className="h-1.5 w-12 rounded-full bg-muted-foreground/25" />
                  </div>
                )}
                <div
                  className={cn('flex shrink-0 items-start justify-between gap-3 px-5 pb-3', desktop ? 'pt-5' : 'pt-1')}
                  onPointerDown={(e) => !desktop && drag.start(e)}
                  style={{ touchAction: desktop ? undefined : 'none' }}
                >
                  <div className="min-w-0">
                    <Dialog.Title className="font-display text-xl font-semibold tracking-tight">{title}</Dialog.Title>
                    {description ? <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{typeof title === 'string' ? title : 'Panel'}</Dialog.Description>}
                  </div>
                  <Dialog.Close className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition hover:text-foreground active:scale-90" aria-label="Close">
                    <X className="size-4" />
                  </Dialog.Close>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">{children}</div>
                {footer && <div className="shrink-0 border-t bg-popover/80 px-5 py-3">{footer}</div>}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
