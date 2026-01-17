import { setCookie } from "h3";

export default defineEventHandler(async (event) => {
  try {
    /**
     * Client req body
     * (name, email, password, password_confirmation)
     */
    const body = await readBody(event);

    if (!body?.name || !body?.email || !body?.password || !body?.password_confirmation) {
      throw createError({
        statusCode: 400,
        statusMessage: "Name, email, password, and confirm password are required",
      });
    }

    //* Runtime config
    const config = useRuntimeConfig();
    const baseApiUrl = config.apiBaseUrl;

    //* 1️⃣ Call BACKEND REGISTER API
    const res: any = await $fetch(`${baseApiUrl}/api/auth/register`, {
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
        statusCode: 400,
        statusMessage: "Invalid register response",
      });
    }

    const access_token = res.data.access_token;

    //* 2️⃣ Set cookie (auto-login after register)
    setCookie(event, "access_token", access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    });

    //* 3️⃣ Fetch user profile
    const resProfile: any = await $fetch(`${baseApiUrl}/api/auth/me`, {
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

    //* 4️⃣ Return user
    return {
      user: resProfile.data,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.message ||
        error?.statusMessage ||
        "Register failed",
    });
  }
});
