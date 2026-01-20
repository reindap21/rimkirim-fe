import { getCookie } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const baseApiUrl = config.apiBaseUrl;

    // 2️⃣ Forward ke Backend API
    const res = await $fetch(`${baseApiUrl}/api/rates`);

    return {
      rates: res.data,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.message ||
        error?.statusMessage ||
        "Get special rate failed",
    });
  }
});
