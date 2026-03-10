import { getCookie } from "h3";
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

  // 1️⃣ Get query param
  const query = getQuery(event);
  const bookingCode = query.bookingCode?.toString();

  if (!bookingCode) {
    throw createError({
      statusCode: 400,
      statusMessage: "Booking number is required",
    });
  }

  // 1️⃣.1️⃣ Get Config
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // 2️⃣ Fetch API
  try {
    const res = await $fetch<OrderHubProgressResponse>(`${baseApiUrl}/api/order-hub/${bookingCode}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    //* 3️⃣ Return response
    return res.data;
  } catch (error: unknown) {
    console.error("[SHOw ORDER PROGRESS API Error]", error);
    const e = error as { statusCode?: number; statusMessage?: string; data?: { message?: string } };
    throw createError({
      statusCode: e?.statusCode || 404,
      statusMessage:
        e?.data?.message || e?.statusMessage || "Booking number not found",
    });
  }
});
