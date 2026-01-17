export default defineEventHandler(async (event) => {
  //* Runtime config
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;
  const access_token = getCookie(event, "access_token");

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

  // Remove cookie token (with path & name)
  deleteCookie(event, "access_token", {
    path: "/",
  });

  return {
    success: true,
  };
});
