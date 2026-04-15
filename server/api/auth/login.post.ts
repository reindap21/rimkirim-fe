import { setCookie } from "h3";
import type { LoginRequestBody, AuthTokenResponse, AuthProfileResponse } from "~/types/api";

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginRequestBody>(event);

  if (!body?.email || !body?.password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and password are required",
    });
  }

  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  try {
    const res = await $fetch<AuthTokenResponse>(`${baseApiUrl}/api/auth/login`, {
      method: "POST",
      body,
    });

    if (!res?.data?.access_token) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid login response",
      });
    }

    const access_token = res.data.access_token;
    setCookie(event, "access_token", access_token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

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

    return {
      user: resProfile.data,
    };
  } catch (error: unknown) {
    const e = error as { statusCode?: number; statusMessage?: string; data?: { message?: string } };
    throw createError({
      statusCode: e?.statusCode || 500,
      statusMessage:
        e?.data?.message || e?.statusMessage || "Login failed",
    });
  }
});
