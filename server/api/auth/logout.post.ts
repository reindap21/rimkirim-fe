export default defineEventHandler(async (event) => {
  // 1️⃣ Get Token and Config
  const access_token = getCookie(event, "access_token");
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // 2️⃣ Fetch API
  try {
    const res = await $fetch<{ message: string }>(`${baseApiUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!res) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to logout",
      });
    }

    // 3️⃣ Remove cookie token (with path & name)
    deleteCookie(event, "access_token", {
      path: "/",
    });

    return {
      success: true,
    };
  } catch (error: unknown) {
    const e = error as { statusCode?: number; statusMessage?: string; data?: { message?: string } };
    throw createError({
      statusCode: e?.statusCode || 500,
      statusMessage:
        e?.data?.message || e?.statusMessage || "Failed to logout",
    });
  }
});
