// composables/useGooglePlaces.ts
export const useGooglePlaces = () => {
  const config = useRuntimeConfig()

  const loadScript = () => {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).google?.maps?.places) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.public.googleMapsApiKey}&libraries=places`
      script.async = true
      script.defer = true

      script.onload = () => resolve()
      script.onerror = reject

      document.head.appendChild(script)
    })
  }

  return { loadScript }
}
