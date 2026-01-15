export default defineEventHandler((event) => {
  // Remove cookie token (with path & name)
  deleteCookie(event, 'access_token', {
    path: '/',
  })

  return {
    success: true,
  }
})
