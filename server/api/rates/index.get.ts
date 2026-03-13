export default defineEventHandler(async () => {
  // 1️⃣ Get Config
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // 2️⃣ Fetch API
  try {
    const res = await $fetch<{ data: unknown }>(`${baseApiUrl}/api/rates`);

    //* 3️⃣ Return response
    return {
      rates: res.data,
    };
  } catch (error: unknown) {
    const e = error as { statusCode?: number; statusMessage?: string; data?: { message?: string } };
    throw createError({
      statusCode: e?.statusCode || 500,
      statusMessage:
        e?.data?.message || e?.statusMessage || "Failed to get rates",
    });
  }
});
