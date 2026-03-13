import { getCookie } from "h3";
import type { ApiResponse } from "~/types/service";
import type { CountryOption } from "~/types/common";

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
    const res = await $fetch<ApiResponse<CountryOption[]>>(`${baseApiUrl}/api/countries`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    //* 3️⃣ Return response
    return res.data;
  } catch (error: unknown) {
    console.error("[FETCH COUNTRIES API Error]", error);
    const e = error as { statusCode?: number; statusMessage?: string; data?: { message?: string } };
    throw createError({
      statusCode: e?.statusCode || 404,
      statusMessage:
        e?.data?.message || e?.statusMessage,
    });
  }
});
