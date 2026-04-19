'use client'

import { useState } from 'react'
import { Bookmark, Share2 } from 'lucide-react'
import { Dua } from '@/lib/dua-data'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner' // Assuming sonner is used in this app based on dependencies

interface DuaCardProps {
  dua: Dua
}

export default function DuaCard({ dua }: DuaCardProps) {
  const { bookmarkedDuas, toggleDuaBookmark, language, arabicFont, fontSize, translationFontSize } = useAppStore()
  const { t } = useI18n()
  
  const isBookmarked = bookmarkedDuas.includes(dua.id)
  
  // Decide which translation to show based on app current language
  // Fallback to english if something goes wrong
  const currentTranslation = language === 'bn' ? dua.translation.bn : dua.translation.en

  const handleShare = async () => {
    const textToShare = `${dua.arabic}\n\n${currentTranslation}\n- ${dua.reference}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Du\'a',
          text: textToShare,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(textToShare)
      toast.success(t('copied', { defaultValue: 'Copied to clipboard' }))
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          {dua.category}
        </div>
        <div className="flex gap-2 text-muted-foreground">
          <button 
            onClick={() => toggleDuaBookmark(dua.id)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'text-primary fill-primary' : ''}`} />
          </button>
          <button 
            onClick={handleShare}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <p 
          className={`text-right text-foreground font-arabic leading-loose`}
          style={{ fontSize: `${fontSize * 1.5}px` }}
          dir="rtl"
        >
          {dua.arabic}
        </p>

        <div className="space-y-2">
          <p className="text-muted-foreground italic text-sm font-medium">
            {dua.transliteration}
          </p>
          <p 
            className="text-foreground leading-relaxed"
            style={{ fontSize: `${translationFontSize}px` }}
          >
            {currentTranslation}
          </p>
        </div>

        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground font-medium">
            {t('reference', { defaultValue: 'Reference' })}: <span className="text-foreground">{dua.reference}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
