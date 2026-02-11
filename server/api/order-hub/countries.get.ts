import { getCookie } from "h3";

export default defineEventHandler(async (event) => {
  // 0️⃣ REQUIRED; Token Check
  const token = getCookie(event, "access_token");
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthenticated",
    });
  }

  // 1️⃣ Get Config
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // 2️⃣ Fetch API
  try {
    const res: any = await $fetch(`${baseApiUrl}/api/countries`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    //* 3️⃣ Return response
    return res.data;
  } catch (error: any) {
    console.error("[FETCH COUNTRIES API Error]", error);

    throw createError({
      statusCode: error?.statusCode || 404,
      statusMessage:
        error?.data?.message || error?.statusMessage,
    });
  }
});
