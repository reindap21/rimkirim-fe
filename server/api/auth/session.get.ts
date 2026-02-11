import { getCookie } from "h3";

export default defineEventHandler(async (event) => {
  // 0️⃣ REQUIRED; Token Check
  const token = getCookie(event, "access_token");
  if (!token) {
    return {
      user: null,
      authenticated: false
    }
  }

  // 1️⃣.1️⃣ Get Config
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // 2️⃣ Fetch API
  try {
    const res: any = await $fetch(`${baseApiUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    //* 3️⃣ Return response
    return {
      user: res.data,
    };
  } catch (error: any) {
    return {
      user: null,
      authenticated: false
    }
  }
});
