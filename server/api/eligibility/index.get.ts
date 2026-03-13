import { getCookie } from "h3";
import type { EligibilityDetailResponse } from "~/types/api";

export default defineEventHandler(async (event) => {
  // 0️⃣ REQUIRED; Token Check
  const token = getCookie(event, "access_token");
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthenticated",
    });
  }

  // 1️⃣ Get query param
  const query = getQuery(event);
  const rateId = query.rateId?.toString();

  if (!rateId) {
    throw createError({
      statusCode: 400,
      statusMessage: "rateId is required",
    });
  }

  // 1️⃣.1️⃣ Get Config
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // 2️⃣ Fetch API
  try {
    const res = await $fetch<EligibilityDetailResponse>(`${baseApiUrl}/api/eligibility/${rateId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    //* 3️⃣ Return response
    return {
      eligibility: res.data,
    };
  } catch (error: unknown) {
    console.error("[Eligibility API Error]", error);
    const e = error as { statusCode?: number; statusMessage?: string; data?: { message?: string } };
    throw createError({
      statusCode: e?.statusCode || 404,
      statusMessage:
        e?.data?.message || e?.statusMessage || "Eligibility not found",
    });
  }
});
