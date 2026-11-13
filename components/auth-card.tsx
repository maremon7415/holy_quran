'use client'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { UiIcon } from '@/components/ui-icon'

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} className="card-soft w-full max-w-md rounded-[2rem] p-7 sm:p-9">
      <div className="mb-7 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-surface-2"><UiIcon name="crescent" size={44} /></span>
        <h1 className="mt-4 font-display text-3xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
      <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
    </motion.div>
  )
}

export const fieldCls = 'h-12 w-full rounded-2xl border bg-background px-4 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20'
export const btnCls = 'flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground shadow-[0_14px_30px_-14px_var(--glow)] transition active:scale-[0.98] disabled:opacity-60'

export const labelCls = 'mb-1.5 block text-sm font-medium'

/** Shown instead of the forms when the deployment has no account database. */
export function AccountsOff({ t }: { t: (v: { en: string; bn: string }) => string }) {
  return (
    <AuthCard
      title={t({ en: 'Accounts not enabled', bn: 'অ্যাকাউন্ট চালু নেই' })}
      subtitle={t({ en: 'Everything works without an account. Your data stays on this device.', bn: 'অ্যাকাউন্ট ছাড়াই সবকিছু কাজ করে। আপনার তথ্য এই ডিভাইসে থাকে।' })}
      footer={<a href="/" className="font-semibold text-primary hover:underline">{t({ en: 'Back to home', bn: 'হোমে ফিরুন' })}</a>}
    >
      <p className="text-center text-sm text-muted-foreground">{t({ en: 'Sign-in appears here once the site owner connects a database.', bn: 'সাইট মালিক ডাটাবেস যুক্ত করলে এখানে সাইন ইন আসবে।' })}</p>
    </AuthCard>
  )
}

export function GoogleButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="flex h-12 w-full items-center justify-center gap-2 rounded-full border bg-card font-semibold transition hover:border-primary/40 active:scale-[0.98]">
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.4z" /><path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21.5 7.5 24 12 24z" /><path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6v-3H1.8a12 12 0 0 0 0 10.6z" /><path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.9 11.9 0 0 0 12 0C7.5 0 3.7 2.5 1.8 6.1l3.8 3c.9-2.7 3.400-4.300 6.400-4.300z" /></svg>
      {label}
    </button>
  )
}

export function OrDivider({ label }: { label: string }) {
  return <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />{label}<span className="h-px flex-1 bg-border" /></div>
}

/** 0–4 password strength score with a small meter. */
export function passwordScore(p: string): number {
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++
  return p.length < 8 ? Math.min(s, 1) : s
}
export function PasswordMeter({ value, t }: { value: string; t: (v: { en: string; bn: string }) => string }) {
  if (!value) return <p className="mt-1.5 text-xs text-muted-foreground">{t({ en: 'At least 8 characters. A longer phrase is stronger.', bn: 'কমপক্ষে ৮ অক্ষর। লম্বা বাক্য আরও নিরাপদ।' })}</p>
  const s = passwordScore(value)
  const labels = [t({ en: 'Too short', bn: 'খুব ছোট' }), t({ en: 'Weak', bn: 'দুর্বল' }), t({ en: 'Okay', bn: 'মোটামুটি' }), t({ en: 'Good', bn: 'ভালো' }), t({ en: 'Strong', bn: 'শক্তিশালী' })]
  const tone = s <= 1 ? 'bg-destructive' : s === 2 ? 'bg-gold' : 'bg-primary'
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">{[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= s ? tone : 'bg-muted'}`} />)}</div>
      <p className="mt-1 text-xs text-muted-foreground">{labels[s]}</p>
    </div>
  )
}
