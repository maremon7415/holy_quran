'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Navigation, MapPin, AlertTriangle, RefreshCw, Info } from 'lucide-react'
import { useGeolocation } from '@/hooks/use-geolocation'
import { useI18n } from '@/lib/i18n'

export default function QiblaCompass() {
  const { latitude, longitude, city, error, loading, retry } = useGeolocation()
  const { t } = useI18n()
  const [heading, setHeading] = useState(0)
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
  }, [])

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      const KAABA_LAT = 21.4225 * Math.PI / 180
      const KAABA_LNG = 39.8262 * Math.PI / 180
      const currentLat = latitude * Math.PI / 180
      const currentLng = longitude * Math.PI / 180
      
      const dLng = KAABA_LNG - currentLng
      const y = Math.sin(dLng)
      const x = Math.cos(currentLat) * Math.tan(KAABA_LAT) - Math.sin(currentLat) * Math.cos(dLng)
      
      let qibla = Math.atan2(y, x) * 180 / Math.PI
      setQiblaDirection((qibla + 360) % 360)
    }
  }, [latitude, longitude])

  useEffect(() => {
    const handleOrientation = (e: any) => {
      // Use webkitCompassHeading for iOS if available, otherwise alpha
      const currentHeading = e.webkitCompassHeading !== undefined 
        ? e.webkitCompassHeading 
        : (360 - e.alpha) % 360
      
      setHeading(currentHeading)
    }

    if (permissionGranted || !isIOS) {
      window.addEventListener('deviceorientation', handleOrientation, true)
      // Check for absolute orientation if supported (Chrome/Android)
      window.addEventListener('deviceorientationabsolute', handleOrientation, true)
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
      window.removeEventListener('deviceorientationabsolute', handleOrientation)
    }
  }, [permissionGranted, isIOS])

  const requestPermission = async () => {
    if (isIOS && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission()
        if (response === 'granted') {
          setPermissionGranted(true)
        }
      } catch (err) {
        console.error('Permission request failed', err)
      }
    } else {
      setPermissionGranted(true)
    }
  }

  // Calculate relative angle to the needle
  const relativeQibla = qiblaDirection !== null ? (qiblaDirection - heading + 360) % 360 : 0
  const isAligned = Math.abs(relativeQibla) < 5 || Math.abs(relativeQibla - 360) < 5

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-primary mb-4"
        >
          <Compass className="w-12 h-12" />
        </motion.div>
        <p className="text-muted-foreground animate-pulse">{t('finding_location', { defaultValue: 'Acquiring location...' })}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-destructive/5 border border-destructive/20 text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-bold text-foreground mb-2">{t('location_error', { defaultValue: 'Location Error' })}</h3>
        <p className="text-sm text-muted-foreground mb-6">{error}</p>
        <button 
          onClick={retry}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          {t('retry', { defaultValue: 'Retry' })}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8 py-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
          <MapPin className="w-3 h-3" />
          {city || 'Unknown Location'}
        </div>
        <h2 className="text-2xl font-black text-foreground">
          {qiblaDirection ? `${Math.round(qiblaDirection)}° N` : 'Calculating...'}
        </h2>
        <p className="text-xs text-muted-foreground max-w-[280px] mx-auto">
          {t('qibla_instruction', { defaultValue: 'Place your phone flat on a surface and rotate to find the Qibla.' })}
        </p>
      </div>

      <div className="relative w-72 h-72 sm:w-80 sm:h-80">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-muted/30 shadow-2xl" />
        <div className="absolute inset-4 rounded-full border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent" />
        
        {/* Compass Markers */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {['N', 'E', 'S', 'W'].map((dir, i) => (
            <div 
              key={dir} 
              className="absolute font-black text-xs text-muted-foreground/40"
              style={{ transform: `rotate(${i * 90}deg) translateY(-120px)` }}
            >
              <span style={{ transform: `rotate(-${i * 90}deg)`, display: 'block' }}>{dir}</span>
            </div>
          ))}
        </div>

        {/* The Needle/Rose */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: -heading }}
          transition={{ type: 'spring', damping: 20, stiffness: 60 }}
        >
          {/* Compass Face Ticks */}
          {[...Array(72)].map((_, i) => (
            <div 
              key={i} 
              className={`absolute w-0.5 rounded-full ${i % 18 === 0 ? 'h-4 bg-primary/40' : i % 2 === 0 ? 'h-2 bg-muted-foreground/20' : 'h-1 bg-muted-foreground/10'}`}
              style={{ transform: `rotate(${i * 5}deg) translateY(-135px)` }}
            />
          ))}

          {/* Qibla Indicator Needle */}
          <motion.div 
            className="absolute flex flex-col items-center"
            style={{ 
              transform: `rotate(${qiblaDirection}deg)`,
              height: '100%' 
            }}
          >
            <div className="absolute top-10 flex flex-col items-center gap-2">
              <motion.div
                animate={{ 
                  scale: isAligned ? [1, 1.2, 1] : 1,
                  filter: isAligned ? 'drop-shadow(0 0 10px rgba(110, 231, 183, 0.8))' : 'none'
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-primary shadow-xl border-2 border-white/20 text-white z-20`}
              >
                <div className="text-xl">🕋</div>
              </motion.div>
              <div className="w-1.5 h-32 bg-gradient-to-b from-primary to-transparent rounded-full" />
            </div>
          </motion.div>

          {/* North Pin */}
          <div className="absolute -top-2 w-1.5 h-6 bg-destructive rounded-full" />
        </motion.div>

        {/* Center Hub */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-background border-4 border-primary shadow-lg z-30" />
        </div>

        {/* Alignment Glow */}
        <AnimatePresence>
          {isAligned && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-full border-4 border-primary shadow-[0_0_50px_rgba(110,231,183,0.3)] pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-sm px-6">
        {isIOS && !permissionGranted ? (
          <button
            onClick={requestPermission}
            className="w-full py-4 rounded-3xl bg-primary text-primary-foreground font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Navigation className="w-5 h-5" />
            Enable Compass Sensors
          </button>
        ) : (
          <div className={`p-6 rounded-3xl border transition-all duration-500 text-center ${
            isAligned 
              ? 'bg-primary/10 border-primary/30 text-primary shadow-lg' 
              : 'bg-muted/30 border-border/50 text-muted-foreground'
          }`}>
            <p className="text-sm font-black uppercase tracking-widest mb-1">
              {isAligned ? t('aligned', { defaultValue: 'Aligned!' }) : t('rotate_device', { defaultValue: 'Rotate Device' })}
            </p>
            <p className="text-[11px] opacity-80">
              {isAligned 
                ? t('facing_kaaba', { defaultValue: 'You are facing the Kaaba' }) 
                : t('finding_qibla', { defaultValue: 'Target direction is marked by the Kaaba icon' })
              }
            </p>
          </div>
        )}

        <div className="mt-8 p-4 rounded-2xl bg-muted/20 border border-border/30 flex items-start gap-3">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Note: Calibration is required for accurate readings. Move your device in a figure-8 pattern and stay away from large metal objects or magnetic fields.
          </p>
        </div>
      </div>
    </div>
  )
}
