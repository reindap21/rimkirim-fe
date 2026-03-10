import type { ItemAndPackageRequestBody } from "~/types/api";
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
  const body = await readBody<ItemAndPackageRequestBody>(event);

  // TODO: tambah payload lainnya
  if (!body?.bookingCode) {
    throw createError({
      statusCode: 400,
      statusMessage: "Booking code are required",
    });
  }

  if (!body?.currencyCode) {
    throw createError({
      statusCode: 400,
      statusMessage: "Currency code is required",
    });
  }

  // 1️⃣.1️⃣ Get Config
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // 2️⃣ Fetch API
  try {
    const res = await $fetch<OrderHubProgressResponse>(
      `${baseApiUrl}/api/order-hub/${body.bookingCode}/item-and-package`,
      {
        method: "PUT",
        body,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    /**
     * 2️⃣.1️⃣ Expected response: OrderHubProgress
     */
    if (!res?.data) {
      throw createError({
        statusCode: 500,
        statusMessage: "Invalid response",
      });
    }

    //* 3️⃣ Return response
    return res.data;
  } catch (error: unknown) {
    console.error("[PUT Progress Error]", error);
    const e = error as { statusCode?: number; statusMessage?: string; data?: { message?: string } };
    throw createError({
      statusCode: e?.statusCode || 500,
      statusMessage:
        e?.data?.message || e?.statusMessage || "Failed to update customer information",
    });
  }
});
