export default defineEventHandler(async (event) => {
  // 1️⃣ Get Token and Config
  const access_token = getCookie(event, "access_token");
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // 2️⃣ Fetch API
  try {
    const res: any = await $fetch(`${baseApiUrl}/api/auth/logout`, {
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
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.message || error?.statusMessage || "Failed to logout",
    });
  }
});
