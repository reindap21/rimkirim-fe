export default defineEventHandler(async (event) => {
  try {
    /**
     * Client req body
     * (shipment_type, origin, destination)
     */
    const body = await readBody(event);

    if (!body?.shipment_type || !body?.origin || !body?.destination) {
      throw createError({
        statusCode: 400,
        statusMessage: "Shipment type, origin, and destination are required",
      });
    }

    //* Runtime config
    const config = useRuntimeConfig();
    const baseApiUrl = config.apiBaseUrl;

    //* 1️⃣ Call BACKEND REGISTER API
    const res: any = await $fetch(`${baseApiUrl}/api/rates/estimate`, {
      method: "POST",
      body,
    });

    /**
     * Expected response: Rate[]
     */
    if (!res?.data) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid get special rate response",
      });
    }

    //* 2️⃣ Return response
    return {
      rates: res.data
    }
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.message ||
        error?.statusMessage ||
        "Get special rate failed",
    });
  }
});
