import { useState, useEffect } from 'react'
import { Qibla, Coordinates } from 'adhan'
import { useGeolocation } from './use-geolocation'

export function useQibla() {
  const { latitude, longitude, loading, error, city } = useGeolocation()
  const [heading, setHeading] = useState<number | null>(null)
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null)
  const [needsPermission, setNeedsPermission] = useState(false)

  // Calculate Qibla Bearing
  useEffect(() => {
    if (latitude && longitude) {
      const coords = new Coordinates(latitude, longitude)
      setQiblaBearing(Qibla(coords))
    }
  }, [latitude, longitude])

  // Compass Heading Listener
  useEffect(() => {
    const handleOrientation = (e: any) => {
      let h
      if (e.webkitCompassHeading) {
        // iOS
        h = e.webkitCompassHeading
      } else if (e.alpha !== null) {
        // Android (alpha usually represents z-axis rotation, needs to be inverted)
        h = 360 - e.alpha
      }

      if (h !== undefined) {
        setHeading(h)
      }
    }

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      // Check if permission API exists (iOS 13+)
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        setNeedsPermission(true)
      } else {
        window.addEventListener('deviceorientationabsolute', handleOrientation, true)
        window.addEventListener('deviceorientation', handleOrientation, true)
      }
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true)
      window.removeEventListener('deviceorientation', handleOrientation, true)
    }
  }, [])

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission()
        if (res === 'granted') {
          setNeedsPermission(false)
          const handleOrientation = (e: any) => {
            const h = e.webkitCompassHeading || (360 - e.alpha)
            if (h !== undefined) setHeading(h)
          }
          window.addEventListener('deviceorientation', handleOrientation, true)
        }
      } catch (err) {
        console.error('Compass permission denied', err)
      }
    }
  }

  return { heading, qiblaBearing, requestPermission, needsPermission, loading, error, city }
}
