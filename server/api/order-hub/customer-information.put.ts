import type { OrderHubProgressResponse } from "~/types/order-hub";

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

  // TODO: tambah payload lainnya
  if (
    !body?.bookingCode) {
    throw createError({
      statusCode: 400,
      statusMessage: "Booking code are required",
    });
  }

  // 1️⃣.1️⃣ Get Config
  const config = useRuntimeConfig();
  const baseApiUrl = config.apiBaseUrl;

  // 2️⃣ Prepare payload
  const data = { ...body };
  delete data.bookingCode;

  // Add receiverSameAsSender flag
  data.receiverSameAsSender = body.receiverSameAsSender || false;

  // 2️⃣ Fetch API
  try {
    const res = await $fetch<OrderHubProgressResponse>(`${baseApiUrl}/api/order-hub/${body.bookingCode}/customer-information`, {
      method: "PUT",
      body: data, // ✅ Use real form data instead of DUMMY
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    /**
     * 2️⃣.1️⃣ Expected response: OrderHubProgress
     */
    if (!res?.data) {
      throw createError({
        statusCode: 500,
        statusMessage: "Invalid response",
      });
    }

    //* 3️⃣ Return full response
    return res.data;
  } catch (error: any) {
    console.error("[PUT CUSTOMMER INFORMATION API Error]", error);

    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage:
        error?.data?.message ||
        error?.statusMessage ||
        "Failed to update customer information",
    });
  }
});

const DUMMY = {
    "shipperFullName": "John Doe",
    "shipperEmail": "john.doe@example.com",
    "shipperOriginPhoneNumber": "+628123456789",
    "shipperDestinationPhoneNumber": "+628123456789",
    "shipmentOwnerSameAs": "sender",
    "senderContactName": "John Doe",
    "senderPhoneNumber": "+628123456789",
    "senderEmail": "sender@example.com",
    "senderCountry": "Malaysia",
    "senderProvince": "Perak",
    "senderCity": "Kamunting",
    "senderFullAddress": "Jalan Sarawak, Taman Rakyat, Kamunting, Perak, Malaysia",
    "senderPostalCode": "34600",
    "senderAddressGeocode": {
        "addressComponents": [
            {
                "long_name": "Jalan Sarawak",
                "short_name": "Jalan Sarawak",
                "types": [
                    "route"
                ]
            },
            {
                "long_name": "Taman Rakyat",
                "short_name": "Taman Rakyat",
                "types": [
                    "political",
                    "sublocality",
                    "sublocality_level_1"
                ]
            },
            {
                "long_name": "Kamunting",
                "short_name": "Kamunting",
                "types": [
                    "locality",
                    "political"
                ]
            },
            {
                "long_name": "Perak",
                "short_name": "Perak",
                "types": [
                    "administrative_area_level_1",
                    "political"
                ]
            },
            {
                "long_name": "Malaysia",
                "short_name": "MY",
                "types": [
                    "country",
                    "political"
                ]
            },
            {
                "long_name": "34600",
                "short_name": "34600",
                "types": [
                    "postal_code"
                ]
            }
        ],
        "route": "Jalan Sarawak",
        "provinceOrRegion": "Perak",
        "country": "Malaysia",
        "postalCode": "34600"
    },
    "receiverSameAsSender": false,
    "receiverContactName": "Jane Smith",
    "receiverPhoneNumber": "+628987654321",
    "receiverEmail": "jane.smith@example.com",
    "receiverCountry": "Indonesia",
    "receiverProvince": "Jakarta",
    "receiverCity": "South Jakarta City",
    "receiverFullAddress": "RT 10 RW 07, Srengseng Sawah, Jagakarsa, South Jakarta City, Jakarta, Indonesia",
    "receiverPostalCode": "12640",
    "receiverAddressGeocode": {
        "addressComponents": [
            {
                "long_name": "12640",
                "short_name": "12640",
                "types": [
                    "postal_code"
                ]
            },
            {
                "long_name": "RT 10",
                "short_name": "RT 10",
                "types": [
                    "administrative_area_level_7",
                    "political"
                ]
            },
            {
                "long_name": "RW 07",
                "short_name": "RW 07",
                "types": [
                    "administrative_area_level_6",
                    "political"
                ]
            },
            {
                "long_name": "Srengseng Sawah",
                "short_name": "Srengseng Sawah",
                "types": [
                    "administrative_area_level_4",
                    "political"
                ]
            },
            {
                "long_name": "Jagakarsa",
                "short_name": "Jagakarsa",
                "types": [
                    "administrative_area_level_3",
                    "political"
                ]
            },
            {
                "long_name": "South Jakarta City",
                "short_name": "South Jakarta City",
                "types": [
                    "administrative_area_level_2",
                    "political"
                ]
            },
            {
                "long_name": "Jakarta",
                "short_name": "Jakarta",
                "types": [
                    "administrative_area_level_1",
                    "political"
                ]
            },
            {
                "long_name": "Indonesia",
                "short_name": "ID",
                "types": [
                    "country",
                    "political"
                ]
            }
        ],
        "postalCode": "12640",
        "administrative_area_level_7": "RT 10",
        "administrative_area_level_6": "RW 07",
        "urbanVillage": "Srengseng Sawah",
        "subDistrict": "Jagakarsa",
        "cityOrDistrict": "South Jakarta City",
        "provinceOrRegion": "Jakarta",
        "country": "Indonesia"
    }
}