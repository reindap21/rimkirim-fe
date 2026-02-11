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
  const body = await readBody(event);

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
    const res: any = await $fetch(`${baseApiUrl}/api/bookings`, {
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
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.message || error?.statusMessage || "Booking failed",
    });
  }
});
