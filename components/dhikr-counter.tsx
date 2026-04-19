'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Volume2, VolumeX, ListRestart } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'

const PRESETS = [
  { label: 'SubhanAllah', target: 33, arabic: 'سُبْحَانَ ٱللَّٰهِ' },
  { label: 'Alhamdulillah', target: 33, arabic: 'ٱلْحَمْدُ لِلَّٰهِ' },
  { label: 'AllahuAkbar', target: 34, arabic: 'ٱللَّٰهُ أَكْبَرُ' },
  { label: 'Astaghfirullah', target: 100, arabic: 'أَسْتَغْفِرُ اللّٰهَ' },
  { label: 'La hawla wa la quwwata...', target: 10, arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ' },
  { label: 'Subhanallahi Wa Bihamdihi', target: 100, arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ' },
  { label: 'La ilaha illallah', target: 100, arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ' },
  { label: 'Custom', target: 0, arabic: 'ذِكْر' },
]

export default function DhikrCounter() {
  const [count, setCount] = useState(0)
  const [target, setTarget] = useState(33)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [activePreset, setActivePreset] = useState(0)
  const [showPresets, setShowPresets] = useState(false)
  
  const { addDhikrSession } = useAppStore()
  const { t } = useI18n()

  const handleTap = () => {
    setCount(prev => prev + 1)
    
    // Vibration feedback (pattern: tick)
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    // Audio feedback using Web Audio API instead of a file
    if (soundEnabled) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
          
          gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
        }
      } catch (e) {}
    }

    // Complete session
    if (target > 0 && count + 1 === target) {
      if (navigator.vibrate) {
        navigator.vibrate([100, 100, 100]) // distinct pattern for completion
      }
      addDhikrSession(target)
    }
  }

  const handleReset = () => {
    if (count > 0 && count < target) {
      addDhikrSession(count) // save partial session
    }
    setCount(0)
  }

  const handlePresetSelect = (idx: number) => {
    handleReset()
    setActivePreset(idx)
    setTarget(PRESETS[idx].target)
    setShowPresets(false)
  }

  const progress = target > 0 ? Math.min((count / target) * 100, 100) : 100
  const isComplete = target > 0 && count >= target

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-12 relative z-10">
          <button 
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted rounded-full transition-colors text-sm font-medium"
          >
            <ListRestart className="w-4 h-4" />
            {PRESETS[activePreset].label}
          </button>

          <div className="flex gap-2">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 bg-muted/50 hover:bg-muted rounded-full text-muted-foreground transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button 
              onClick={handleReset}
              className="p-2 bg-muted/50 hover:bg-muted rounded-full text-muted-foreground transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Presets Dropdown */}
        <AnimatePresence>
          {showPresets && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-20 left-6 right-6 bg-background border border-border rounded-2xl shadow-xl z-20 overflow-hidden"
            >
              {PRESETS.map((preset, idx) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetSelect(idx)}
                  className={`w-full flex justify-between items-center text-left px-5 py-4 hover:bg-muted transition-colors ${activePreset === idx ? 'bg-primary/5 text-primary' : 'text-foreground'}`}
                >
                  <span className="font-medium">{preset.label}</span>
                  <span className="text-sm border border-border px-2 py-0.5 rounded-full">
                    {preset.target > 0 ? preset.target : '∞'}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Counter Area */}
        <div className="flex flex-col items-center justify-center relative z-10">
          <p className="text-3xl font-arabic text-primary/80 mb-8" dir="rtl">
            {PRESETS[activePreset].arabic}
          </p>

          <div className="relative w-64 h-64 mb-8">
            {/* Progress Ring */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-muted/30"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={`${progress * 2.83} 283`}
                className={`transition-all duration-300 ease-out ${isComplete ? 'text-green-500' : 'text-primary'}`}
                strokeLinecap="round"
              />
            </svg>

            {/* Tap Button */}
            <button
              onClick={handleTap}
              className={`absolute inset-4 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 ${
                isComplete 
                  ? 'bg-green-500/10 text-green-500 border-2 border-green-500/50 hover:bg-green-500/20' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              <span className="text-6xl font-bold font-mono tracking-tighter">
                {count}
              </span>
              {target > 0 && (
                <span className="text-sm opacity-80 font-medium">
                  / {target}
                </span>
              )}
            </button>
          </div>

          <p className="text-muted-foreground text-sm font-medium animate-pulse">
            {isComplete ? 'Target Reached!' : 'Tap center to count'}
          </p>
        </div>
      </div>
    </div>
  )
}
