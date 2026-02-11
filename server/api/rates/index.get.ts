export default defineEventHandler(async (event) => {
  // 1️⃣ Get Config
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // 2️⃣ Fetch API
  try {
    const res = await $fetch(`${baseApiUrl}/api/rates`);

    //* 3️⃣ Return response
    return {
      rates: res.data,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.message || error?.statusMessage || "Failed to get rates",
    });
  }
});
