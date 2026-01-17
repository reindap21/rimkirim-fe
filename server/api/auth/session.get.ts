import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'access_token')

  if (!token) {
    return { user: null }
  }

  const config = useRuntimeConfig()
  const baseApiUrl = config.apiBaseUrl

  try {
    const res: any = await $fetch(`${baseApiUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return {
      user: res.data
    }
  } catch {
    return { user: null }
  }
})
