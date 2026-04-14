// Load Google Maps API client-side only to avoid SSR hydration mismatch
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const apiKey = config.public.googleMapsApiKey

  if (!apiKey) return

  // Only load in browser
  if (import.meta.server) return

  // Check if already loaded
  if (window.google?.maps) return

  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
  script.async = true
  script.defer = true
  document.head.appendChild(script)
})
