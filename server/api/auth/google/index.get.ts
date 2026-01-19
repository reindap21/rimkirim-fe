export default defineEventHandler((event) => {
  const config = useRuntimeConfig()

  const redirectUri = `${config.apiBaseUrl}/oauth/google/callback`

  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent'
  })

  return sendRedirect(
    event,
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  )
})
