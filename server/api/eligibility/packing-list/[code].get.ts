import { getCookie } from "h3";
import type { PackingListValidationResponse } from "~/types/order-hub";

export default defineEventHandler(async (event) => {
  // REQUIRED: Token Check
  const token = getCookie(event, "access_token");
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthenticated",
    });
  }

  // 1️⃣ Get route param
  const code = getRouterParam(event, "code");

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: "Packing list code is required",
    });
  }

  // Get Config
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // Fetch API
  try {
    const res = await $fetch<PackingListValidationResponse>(
      `${baseApiUrl}/api/eligibility/packing-list/${code}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // Return response
    return {
      message: res.message,
      data: res.data,
    };
  } catch (error: any) {
    console.error("[Search Packing List API Error]", error);

    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.message ||
        error?.statusMessage ||
        "Failed to search packing list",
    });
  }
});
