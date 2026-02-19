import { readMultipartFormData } from 'h3'
import type { UploadDocumentResponse } from '~/types/order-hub'

export default defineEventHandler(async (event) => {
  // 0️⃣ REQUIRED; Token Check
  const token = getCookie(event, 'access_token')
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthenticated',
    })
  }

  // 1️⃣ Read multipart form-data
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No form data received',
    })
  }

  // 2️⃣ Extract fields
  const bookingCode = formData.find(f => f.name === 'booking_code')?.data?.toString()
  const documentType = formData.find(f => f.name === 'document_type')?.data?.toString()
  const files = formData.filter(f => f.name === 'files')

  if (!bookingCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Booking code is required',
    })
  }

    if (!documentType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Document type is required',
    })
  }

  if (!files.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No files uploaded',
    })
  }

  // 3️⃣ Build FormData for upstream API
  const payload = new FormData()
  payload.append('booking_code', bookingCode)
  payload.append('document_type', documentType)

  for (const file of files) {
    payload.append(
      'file',
      new Blob([file.data], { type: file.type }),
      file.filename
    )
  }

  // 4️⃣ Config
  const config = useRuntimeConfig()
  const baseApiUrl = config.apiBaseUrl

  // 5️⃣ Forward to backend
  try {
    const res = await $fetch<UploadDocumentResponse>(
      `${baseApiUrl}/api/upload/compliance-document`,
      {
        method: 'POST',
        body: payload,
        headers: {
          Authorization: `Bearer ${token}`,
          // Content type boundary auto
        },
      }
    )

    if (!res?.data) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Invalid response from upload service',
      })
    }

    // Return backend response data directly
    return res.data
  } catch (error: any) {
    console.error('[UPLOAD DOCUMENT COMPLIANCE ERROR]', error)

    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.message ||
        error?.statusMessage ||
        'Failed to upload document compliance',
    })
  }
})
