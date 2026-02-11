export default defineEventHandler(async (event) => {
  // 0️⃣ REQUIRED; Token Check
  const token = getCookie(event, "access_token");
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthenticated",
    });
  }

  /**
   * 1️⃣ Client req body
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

  // 1️⃣.1️⃣ Get Config
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // 2️⃣ Fetch API
  try {
    const res: any = await $fetch(`${baseApiUrl}/api/eligibility/check`, {
      method: "POST",
      body,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    /**
     * 2️⃣.1️⃣ Expected response: eligible_schemes
     */
    if (!res?.data?.eligible_schemes) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid eligible schemes response",
      });
    }

    //* 3️⃣ Return response
    return {
      rates: res.data,
    };
  } catch (error: any) {
    console.error("[Eligibility API Error]", error);

    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.message ||
        error?.statusMessage ||
        "Failed to check eligibility",
    });
  }
});
