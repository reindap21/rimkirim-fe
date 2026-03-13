import { readMultipartFormData } from 'h3'
import type { PackagePhotoUploadResponse } from '~/types/api'

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
  const files = formData.filter(f => f.name === 'files')

  if (!bookingCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Booking code is required',
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
    const res = await $fetch<PackagePhotoUploadResponse>(
      `${baseApiUrl}/api/upload/package-photo`,
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

    return {
      success: true,
      files: res.data,
    }
  } catch (error: unknown) {
    console.error('[UPLOAD PACKAGE PHOTO ERROR]', error)
    const e = error as { statusCode?: number; statusMessage?: string; data?: { message?: string } };
    throw createError({
      statusCode: e?.statusCode || 500,
      statusMessage:
        e?.data?.message ||
        e?.statusMessage ||
        'Failed to upload package photo',
    })
  }
})
