import { useState, useEffect } from 'react'

function useUserLocation() {
  const [location, setLocation] = useState({ lat: null, long: null })
  const [locationError, setLocationError] = useState(null)
  const [locationLoading, setLocationLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          long: position.coords.longitude,
        })
        setLocationLoading(false)
      },
      (error) => {
        setLocationError('Location access denied')
        setLocationLoading(false)
      }
    )
  }, [])

  return { location, locationError, locationLoading }
}

export default useUserLocation