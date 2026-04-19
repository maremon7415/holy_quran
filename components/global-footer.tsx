'use client'

import { ArrowUpRight, Github, Globe, Heart, Mail, MapPin, Phone } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function GlobalFooter() {
  const { t } = useI18n()

  return (
    <footer className="relative overflow-hidden border-t border-primary/10 bg-[linear-gradient(180deg,rgba(36,81,61,0.06),rgba(36,81,61,0.02))]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,81,61,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(36,81,61,0.12),transparent_28%)] opacity-80" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="rounded-3xl border border-primary/10 bg-background/55 p-6 backdrop-blur-sm">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Heart className="h-3.5 w-3.5" />
              Quran Web App
            </div>
            <p className="text-2xl font-semibold text-foreground">Md. Emon Miah</p>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t('built_with_care')}</p>
            <p className="mt-3 text-sm text-primary/90">{t('contribute_invite')}</p>
          </div>

          <div className="rounded-3xl border border-primary/10 bg-background/45 p-6 backdrop-blur-sm">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Contact</p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Dhaka, Bangladesh
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:dev@emon.pro" className="hover:text-primary transition-colors">
                  dev@emon.pro
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+8801785892074" className="hover:text-primary transition-colors">
                  01785892074
                </a>
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-primary/10 bg-background/45 p-6 backdrop-blur-sm">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Links</p>
            <div className="space-y-3">
              <a
                href="http://www.emon.pro/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-primary/10 bg-primary/6 px-4 py-3 text-sm font-medium text-foreground hover:border-primary/30 hover:text-primary transition-all"
              >
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  {t('portfolio')}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {t('visit_site')}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </a>
              <a
                href="https://github.com/maremon7415"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-primary/10 bg-primary/6 px-4 py-3 text-sm font-medium text-foreground hover:border-primary/30 hover:text-primary transition-all"
              >
                <span className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-primary" />
                  {t('github')}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {t('visit_site')}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
