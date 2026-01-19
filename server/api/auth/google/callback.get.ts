import { setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const code = query.code as string

    if (!code) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Google authorization code not found',
      })
    }

    const config = useRuntimeConfig()
    const baseApiUrl = config.apiBaseUrl

    /**
     * 1️⃣ Call BACKEND GOOGLE LOGIN
     * Backend akan:
     * - exchange code → google token
     * - login / register user
     * - return access_token
     */
    const res: any = await $fetch(
      `${baseApiUrl}/api/auth/google/callback`,
      {
        method: 'POST',
        body: { code },
      }
    )

    /**
     * Expected response:
     * {
     *   message,
     *   data: {
     *     access_token,
     *     token_type
     *   }
     * }
     */
    if (!res?.data?.access_token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid Google login response',
      })
    }

    const access_token = res.data.access_token

    /**
     * 2️⃣ Set Cookie di Nuxt Server
     */
    setCookie(event, 'access_token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 hari
    })

    /**
     * 3️⃣ Fetch Profile (SAMA SEPERTI LOGIN BIASA)
     */
    const resProfile: any = await $fetch(
      `${baseApiUrl}/api/auth/me`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    )

    if (!resProfile?.data?.id) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch profile',
      })
    }

    /**
     * 4️⃣ Return user (untuk frontend page / modal)
     */
    return {
      user: resProfile.data,
    }
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.message ||
        error?.statusMessage ||
        'Google login failed',
    })
  }
})
