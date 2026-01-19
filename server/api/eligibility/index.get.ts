import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'access_token')

  if (!token) {
    return { user: null }
  }

  // 1️⃣ Get query param
  const query = getQuery(event)
  const rateId = query.rateId

  if (!rateId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'rateId is required'
    })
  }

  const config = useRuntimeConfig()
  const baseApiUrl = config.apiBaseUrl

  // 2️⃣ Fetch API
  try {
    const res: any = await $fetch(`${baseApiUrl}/api/eligibility/${rateId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return {
      eligibility: res.data
    }
  } catch {
    return { eligibility: null }
  }
})
