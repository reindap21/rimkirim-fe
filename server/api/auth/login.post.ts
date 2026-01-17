import { setCookie } from "h3";

export default defineEventHandler(async (event) => {
  try {
    /**
     * Client req body
     * (email and password)
     */
    const body = await readBody(event);

    if (!body?.email || !body?.password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email and password are required",
      });
    }

    //* SSR
    const config = useRuntimeConfig();
    const baseApiUrl = config.apiBaseUrl;

    //* 1️⃣ Call BACKEND AUTH API
    const res: any = await $fetch(`${baseApiUrl}/api/auth/login`, {
      method: "POST",
      body,
    });

    /**
     * Expected response:
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

    const access_token = res.data.access_token;

    //* 1️⃣.1️⃣ Set Cookies at Nuxt Server
    setCookie(event, "access_token", access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    });

    //* 2️⃣ Call BACKEND PROFILE API
    const resProfile: any = await $fetch(`${baseApiUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    /**
     * Expected response:
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

    //* Return user profile
    return {
      user: resProfile.data,
    };
  } catch (error: any) {
    //* Error handling rapi
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.message || error?.statusMessage || "Login failed",
    });
  }
});
