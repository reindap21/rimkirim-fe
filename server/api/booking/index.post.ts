export default defineEventHandler(async (event) => {
  try {
    /**
     * Client req body
     * ...
     */
    const body = await readBody(event);

    if (
      !body?.rate_id ||
      !body?.purpose_of_shipment ||
      !body?.packing_list_code
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: "Rate ID, Purpose of Shipment and Packing List Code are required",
      });
    }

    //* Runtime config
    const config = useRuntimeConfig();
    const baseApiUrl = config.apiBaseUrl;

    //* 1️⃣ Call BACKEND BOOKINGS API
    const res: any = await $fetch(`${baseApiUrl}/api/bookings`, {
      method: "POST",
      body,
    });

    /**
     * Expected response: Booking Response
     */
    if (!res?.data?.booking_code) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid get booking response",
      });
    }

    //* 2️⃣ Return response
    return {
      booking: res.data,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.message ||
        error?.statusMessage ||
        "Booking failed",
    });
  }
});
