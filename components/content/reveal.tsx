'use client'
import { motion, type HTMLMotionProps } from 'framer-motion'

const spring = { type: 'spring', stiffness: 380, damping: 32 } as const

/** Fade-up entrance when scrolled into view. Wrap server-rendered content. */
export function Reveal({ children, delay = 0, y = 16, className, ...rest }: { delay?: number; y?: number } & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...spring, delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
