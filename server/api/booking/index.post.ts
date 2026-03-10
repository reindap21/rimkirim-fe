import type { BookingRequestBody, BookingApiResponse } from "~/types/api";

export default defineEventHandler(async (event) => {
  // 0️⃣ REQUIRED; Token Check
  const token = getCookie(event, "access_token");
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthenticated",
    });
  }

  /**
   * 1️⃣ Client req body
   * ...
   */
  const body = await readBody<BookingRequestBody>(event);

  if (!body?.rate_id || !body?.purpose_of_shipment) {
    throw createError({
      statusCode: 400,
      statusMessage: "Rate ID and Purpose of Shipment are required",
    });
  }

  // 1️⃣.1️⃣ Get Config
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // 2️⃣ Fetch API
  try {
    const res = await $fetch<BookingApiResponse>(`${baseApiUrl}/api/bookings`, {
      method: "POST",
      body,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    /**
     * 2️⃣.1️⃣ Expected response: Booking Response
     */
    if (!res?.data?.booking_code) {
      throw createError({
        statusCode: 500,
        statusMessage: "Invalid booking response",
      });
    }

    //* 3️⃣ Return response
    return {
      booking: res.data,
    };
  } catch (error: unknown) {
    const e = error as { statusCode?: number; statusMessage?: string; data?: { message?: string } };
    throw createError({
      statusCode: e?.statusCode || 500,
      statusMessage:
        e?.data?.message || e?.statusMessage || "Booking failed",
    });
  }
});
