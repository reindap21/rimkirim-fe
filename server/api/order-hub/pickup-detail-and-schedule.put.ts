import type { PickupDetailRequestBody } from "~/types/api";
import type { OrderHubProgressResponse } from "~/types/order-hub";

export default defineEventHandler(async (event) => {
  // 0️⃣ Token Check
  const token = getCookie(event, "access_token");
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: "Unauthenticated" });
  }

  // 1️⃣ Read body
  const body = await readBody<PickupDetailRequestBody>(event);

  if (!body?.bookingCode) {
    throw createError({ statusCode: 400, statusMessage: "Booking code is required" });
  }

  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // 2️⃣ Build payload — forward all fields except bookingCode
  const { bookingCode, ...pickupFields } = body;

  try {
    const res = await $fetch<OrderHubProgressResponse>(
      `${baseApiUrl}/api/order-hub/${bookingCode}/pickup-detail-schedule`,
      {
        method: "PUT",
        body: pickupFields,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res?.data) {
      throw createError({ statusCode: 500, statusMessage: "Invalid response" });
    }

    return { data: res.data };
  } catch (error: unknown) {
    console.error("[PUT PICKUP DETAIL SCHEDULE Error]", error);
    const e = error as { statusCode?: number; statusMessage?: string; data?: { message?: string } };
    throw createError({
      statusCode: e?.statusCode || 500,
      statusMessage: e?.data?.message || e?.statusMessage || "Failed to update pickup detail and schedule",
    });
  }
});
