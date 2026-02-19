export default defineEventHandler(async (event) => {
  // 0️⃣ REQUIRED; Token Check
  const token = getCookie(event, 'access_token')
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthenticated',
    })
  }

  // 1️⃣ Get booking code from URL params
  const bookingCode = getRouterParam(event, 'id')

  if (!bookingCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Booking code is required',
    })
  }

  // 2️⃣ Get Config
  const config = useRuntimeConfig()
  const baseApiUrl = config.apiBaseUrl

  // 3️⃣ Forward to backend and get file blob
  try {
    const response = await $fetch<Blob>(
      `${baseApiUrl}/api/order-hub/${bookingCode}/packing-list/download`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob', // Important for binary data
      }
    )

    // 4️⃣ Return the blob directly
    return response
  } catch (error: any) {
    console.error('[DOWNLOAD PACKING LIST ERROR]', error)

    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.message ||
        error?.statusMessage ||
        'Failed to download packing list',
    })
  }
})
