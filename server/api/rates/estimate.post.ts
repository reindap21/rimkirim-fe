import type { EstimateRatesRequest, EstimateRatesApiResponse } from "~/types/api";

export default defineEventHandler(async (event) => {
  /**
   * 1️⃣ Client req body
   * (shipment_type, origin, destination)
   */
  const body = await readBody<EstimateRatesRequest>(event);

  if (!body?.shipment_type || !body?.origin || !body?.destination) {
    throw createError({
      statusCode: 400,
      statusMessage: "Shipment type, origin, and destination are required",
    });
  }

  // 1️⃣.1️⃣ Get Config
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // 2️⃣ Fetch API
  try {
    const res = await $fetch<EstimateRatesApiResponse>(`${baseApiUrl}/api/rates/estimate`, {
      method: "POST",
      body,
    });

    /**
     * Expected response: Rate[]
     */
    if (!res?.data) {
      throw createError({
        statusCode: 500,
        statusMessage: "Invalid special rate response", // TODO: Update message ini
      });
    }

    //* 2️⃣ Return response
    return {
      rates: res.data,
    };
  } catch (error: unknown) {
    const e = error as { statusCode?: number; statusMessage?: string; data?: { message?: string } };
    throw createError({
      statusCode: e?.statusCode || 500,
      statusMessage:
        e?.data?.message ||
        e?.statusMessage ||
        "Failed to estimate rate",
    });
  }
});
