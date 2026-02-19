import type { OrderHubProgressResponse } from "~/types/order-hub";

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

  const data = {...body};
  delete data.bookingCode;

  // 2️⃣ Fetch API
  try {
    const res = await $fetch<OrderHubProgressResponse>(`${baseApiUrl}/api/order-hub/${body.bookingCode}/compliance-document`, {
      method: "PUT",
      body: data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    /**
     * 2️⃣.1️⃣ Expected response: OrderHubProgress
     */
    if (!res?.data) {
      throw createError({
        statusCode: 500,
        statusMessage: "Invalid response",
      });
    }

    //* 3️⃣ Return full backend response (OrderHubProgress)
    return res.data;
  } catch (error: any) {
    console.error("[PUT Progress Error]", error);

    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.message ||
        error?.statusMessage ||
        "Failed to update compliance document",
    });
  }
});
