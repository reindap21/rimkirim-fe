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

  // TODO: tambah payload lainnya
  if (
    !body?.bookingCode) {
    throw createError({
      statusCode: 400,
      statusMessage: "Booking code are required",
    });
  }

  // 1️⃣.1️⃣ Get Config
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // 2️⃣ Fetch API
  try {
    const res: any = await $fetch(`${baseApiUrl}/api/order-hub/${body.bookingCode}/item-and-package`, {
      method: "PUT",
      body,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    /**
     * 2️⃣.1️⃣ Expected response: eligible_schemes
     */
    if (!res?.data) {
      throw createError({
        statusCode: 500,
        statusMessage: "Invalid response",
      });
    }

    //* 3️⃣ Return response
    return {
      rates: res.data,
    };
  } catch (error: any) {
    console.error("[PUT Progress Error]", error);

    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.message ||
        error?.statusMessage ||
        "Failed to update customer information",
    });
  }
});
