import { setCookie, readBody, createError } from "h3";
import type { StoreTokenRequestBody, AuthProfileResponse } from "~/types/api";

export default defineEventHandler(async (event) => {
  const body = await readBody<StoreTokenRequestBody>(event);

  if (!body?.access_token) {
    throw createError({
      statusCode: 400,
      statusMessage: "Access token is required",
    });
  }

  const access_token = body.access_token;

  setCookie(event, "access_token", access_token, {
    httpOnly: true,
    secure: true, // wajib true di production (HTTPS)
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 hari
  });

  // 1️⃣.1️⃣ Get Config
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // Fetch API PROFILE
  const resProfile = await $fetch<AuthProfileResponse>(`${baseApiUrl}/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!resProfile?.data?.id) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch profile",
    });
  }

  //* 5️⃣ Return user profile
  return {
    user: resProfile.data,
  };
});
