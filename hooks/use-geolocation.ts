import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'

export interface GeoLocation {
  latitude: number | null
  longitude: number | null
  city: string | null
  error: string | null
  loading: boolean
}

export function useGeolocation() {
  const { location, setLocation } = useAppStore()
  
  const [state, setState] = useState<GeoLocation>({
    latitude: location.latitude,
    longitude: location.longitude,
    city: location.city,
    error: null,
    loading: false,
  })

  // Synchronize state with store location changes
  useEffect(() => {
    setState(s => ({
      ...s,
      latitude: location.latitude,
      longitude: location.longitude,
      city: location.city,
      loading: location.latitude === null && s.error === null && s.loading
    }))
  }, [location])

  const fetchLocation = () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation is not supported by your browser', loading: false }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
          const data = await res.json()
          
          const city = data.city || data.locality || 'Unknown Location'
          setLocation({ latitude, longitude, city })
          setState(s => ({ ...s, loading: false }))
        } catch (error) {
          setLocation({ latitude, longitude, city: 'Unknown Location' })
          setState(s => ({ ...s, loading: false }))
        }
      },
      (error) => {
        let errorMsg = 'Failed to get location'
        switch(error.code) {
          case 1: errorMsg = 'Permission denied'; break;
          case 2: errorMsg = 'Position unavailable'; break;
          case 3: errorMsg = 'Timeout'; break;
        }
        setState((s) => ({ ...s, error: errorMsg, loading: false }))
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  }

  // Auto fetch if not present in store
  useEffect(() => {
    if (location.latitude === null) {
      fetchLocation()
    }
  }, [])

  return { ...state, retry: fetchLocation }
}
