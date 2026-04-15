import { setCookie } from "h3";
import type { RegisterRequestBody, AuthTokenResponse, AuthProfileResponse } from "~/types/api";

export default defineEventHandler(async (event) => {
  const body = await readBody<RegisterRequestBody>(event);

  if (!body?.name || !body?.email || !body?.password || !body?.password_confirmation) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name, email, password, and confirm password are required",
    });
  }

  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  try {
    const res = await $fetch<AuthTokenResponse>(`${baseApiUrl}/api/auth/register`, {
      method: "POST",
      body,
    });

    if (!res?.data?.access_token) {
      throw createError({ statusCode: 400, statusMessage: "Invalid register response" });
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
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!resProfile?.data?.id) {
      throw createError({ statusCode: 500, statusMessage: "Failed to fetch profile" });
    }

    return { user: resProfile.data };

  } catch (error: unknown) {
    const e = error as {
      statusCode?: number;
      statusMessage?: string;
      data?: {
        message?: string;
        errors?: Record<string, string[]>;
      };
    };

    if (e?.statusCode === 422 && e?.data?.errors) {
      const firstError = Object.values(e.data.errors)[0]?.[0];
      throw createError({
        statusCode: 422,
        statusMessage: firstError || "Validation failed",
      });
    }

    throw createError({
      statusCode: e?.statusCode || 500,
      statusMessage: e?.data?.message || e?.statusMessage || "Register failed",
    });
  }
});
