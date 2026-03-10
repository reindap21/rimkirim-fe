import { setCookie } from "h3";
import type { LoginRequestBody, AuthTokenResponse, AuthProfileResponse } from "~/types/api";

export default defineEventHandler(async (event) => {
  /**
   * 1️⃣ Client req body
   * (email and password)
   */
  const body = await readBody<LoginRequestBody>(event);

  if (!body?.email || !body?.password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and password are required",
    });
  }

  // 1️⃣.1️⃣ Get Config
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // 2️⃣ Fetch API
  try {
    const res = await $fetch<AuthTokenResponse>(`${baseApiUrl}/api/auth/login`, {
      method: "POST",
      body,
    });

    /**
     * 2️⃣.1️⃣ Expected response:
     * {
     *   message,
     *   data: {
     *     access_token,
     *     token_type,
     *   }
     * }
     */
    if (!res?.data?.access_token) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid login response",
      });
    }

    //* 3️⃣ Set Cookies at Nuxt Server
    const access_token = res.data.access_token;
    setCookie(event, "access_token", access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    });

    // 4️⃣ Fetch API PROFILE
    const resProfile = await $fetch<AuthProfileResponse>(`${baseApiUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    /**
     * 4️⃣.1️⃣ Expected response:
     * {
     *   message,
     *   data: {
     *     id,
     *     name,
     *     email,
     *     email_verified_at,
     *     created_at,
     *     updated_at,
     *   }
     * }
     */
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
  } catch (error: unknown) {
    const e = error as { statusCode?: number; statusMessage?: string; data?: { message?: string } };
    throw createError({
      statusCode: e?.statusCode || 500,
      statusMessage:
        e?.data?.message || e?.statusMessage || "Login failed",
    });
  }
});
