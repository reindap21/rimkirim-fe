export default defineEventHandler(async (event) => {
  try {
    /**
     * Client req body
     * ...
     */
    const body = await readBody(event);

    // Perbaiki if ini
    // if (
    //   !body?.rate_id ||
    //   !body?.is_personal_belongings ||
    //   !body?.is_indonesian_citizen ||
    //   !body?.has_lived_abroad_min_12_months ||
    //   !body?.is_eligible_for_skp ||
    //   !body?.packing_list_code
    // ) {
    //   throw createError({
    //     statusCode: 400,
    //     statusMessage: "All questions are required",
    //   });
    // }

    // Token Cookies
    const token = getCookie(event, "access_token");
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthenticated.",
      });
    }

    //* Runtime config
    const config = useRuntimeConfig();
    const baseApiUrl = config.apiBaseUrl;

    //* 1️⃣ Call BACKEND ELIGIBILITY CHECK API
    const res: any = await $fetch(`${baseApiUrl}/api/eligibility/check`, {
      method: "POST",
      body,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    /**
     * Expected response: eligible_schemes
     */
    if (!res?.data?.eligible_schemes) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid get eligible schemes response",
      });
    }

    //* 2️⃣ Return response
    return {
      rates: res.data,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.message ||
        error?.statusMessage ||
        "Check eligibility failed",
    });
  }
});
