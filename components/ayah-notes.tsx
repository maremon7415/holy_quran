'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, StickyNote, Edit2, Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

interface AyahNotesProps {
  surahNumber: number
  ayahNumber: number
  surahName: string
  isOpen: boolean
  onClose: () => void
}

export interface AyahNote {
  id: string
  surahNumber: number
  ayahNumber: number
  surahName: string
  content: string
  createdAt: string
  updatedAt: string
}

// Helper to safely access localStorage
const getNotesFromStorage = (): AyahNote[] => {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem('quran-notes')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const saveNotesToStorage = (notes: AyahNote[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('quran-notes', JSON.stringify(notes))
  } catch (e) {
    console.error('Failed to save notes:', e)
  }
}

export default function AyahNotes({
  surahNumber,
  ayahNumber,
  surahName,
  isOpen,
  onClose,
}: AyahNotesProps) {
  const [noteContent, setNoteContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [hasExistingNote, setHasExistingNote] = useState(false)
  const { t } = useI18n()

  // Load note when modal opens
  useEffect(() => {
    if (isOpen) {
      const notes = getNotesFromStorage()
      const existingNote = notes.find(
        (n) => n.surahNumber === surahNumber && n.ayahNumber === ayahNumber
      )
      if (existingNote) {
        setNoteContent(existingNote.content)
        setHasExistingNote(true)
        setIsEditing(false)
      } else {
        setNoteContent('')
        setHasExistingNote(false)
        setIsEditing(true)
      }
    }
  }, [isOpen, surahNumber, ayahNumber])

  const handleSave = useCallback(() => {
    const trimmedContent = noteContent.trim()
    const notes = getNotesFromStorage()
    const existingIndex = notes.findIndex(
      (n) => n.surahNumber === surahNumber && n.ayahNumber === ayahNumber
    )

    const now = new Date().toISOString()

    if (existingIndex >= 0) {
      if (trimmedContent) {
        // Update existing
        notes[existingIndex] = {
          ...notes[existingIndex],
          content: trimmedContent,
          updatedAt: now,
        }
      } else {
        // Delete if empty
        notes.splice(existingIndex, 1)
      }
    } else if (trimmedContent) {
      // Create new
      notes.push({
        id: `${surahNumber}-${ayahNumber}-${Date.now()}`,
        surahNumber,
        ayahNumber,
        surahName,
        content: trimmedContent,
        createdAt: now,
        updatedAt: now,
      })
    }

    saveNotesToStorage(notes)
    setHasExistingNote(!!trimmedContent)
    setIsEditing(false)
  }, [noteContent, surahNumber, ayahNumber, surahName])

  const handleDelete = useCallback(() => {
    const notes = getNotesFromStorage()
    const filtered = notes.filter(
      (n) => !(n.surahNumber === surahNumber && n.ayahNumber === ayahNumber)
    )
    saveNotesToStorage(filtered)
    setNoteContent('')
    setHasExistingNote(false)
    setIsEditing(true)
  }, [surahNumber, ayahNumber])

  const handleClose = useCallback(() => {
    setNoteContent('')
    setIsEditing(false)
    setHasExistingNote(false)
    onClose()
  }, [onClose])

  // Handle textarea input properly
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(e.target.value)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <StickyNote className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    {hasExistingNote && !isEditing 
                      ? t('edit_note', { defaultValue: 'Edit Note' }) 
                      : t('add_note', { defaultValue: 'Add Note' })}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {surahName} - {t('ayah', { defaultValue: 'Ayah' })} {ayahNumber}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={noteContent}
                  onChange={handleTextareaChange}
                  placeholder={t('write_note_placeholder', { defaultValue: 'Write your note here...' })}
                  className="w-full min-h-[150px] px-3 py-2 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (hasExistingNote) {
                        setIsEditing(false)
                        // Restore original content
                        const notes = getNotesFromStorage()
                        const existing = notes.find(
                          (n) => n.surahNumber === surahNumber && n.ayahNumber === ayahNumber
                        )
                        setNoteContent(existing?.content || '')
                      } else {
                        handleClose()
                      }
                    }}
                  >
                    {t('cancel', { defaultValue: 'Cancel' })}
                  </Button>
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    {t('save', { defaultValue: 'Save' })}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-xl min-h-[100px]">
                  <p className="text-foreground whitespace-pre-wrap">{noteContent}</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleDelete} className="gap-2 text-destructive">
                    <Trash2 className="w-4 h-4" />
                    {t('delete_note', { defaultValue: 'Delete' })}
                  </Button>
                  <Button onClick={() => setIsEditing(true)} className="gap-2">
                    <Edit2 className="w-4 h-4" />
                    {t('edit_note', { defaultValue: 'Edit' })}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Helper function to get all notes
export function getAllNotes(): AyahNote[] {
  return getNotesFromStorage()
}
