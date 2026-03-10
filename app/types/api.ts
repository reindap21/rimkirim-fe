import type { PurposeOfShipment, Package } from "./order-hub"
import type { EstimateRatesRequest, Rate } from "./rate"
import type { User } from "./user"

// ─── Request Bodies ───────────────────────────────────────────────────────────

export interface LoginRequestBody {
  email: string
  password: string
}

export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface StoreTokenRequestBody {
  access_token: string
}

export interface BookingRequestBody {
  rate_id: string
  purpose_of_shipment: PurposeOfShipment
}

export interface ItemAndPackageRequestBody {
  bookingCode: string
  currencyCode: string
  packages: Package[]
}

export interface ComplianceDocumentRequestBody {
  bookingCode: string
  [key: string]: unknown
}

export interface PickupDetailRequestBody {
  bookingCode: string
}

export interface EligibilityCheckRequestBody {
  rate_id?: string
  is_personal_belongings?: boolean
  is_indonesian_citizen?: boolean
  has_lived_abroad?: boolean
  has_packing_list?: boolean
  packing_list_code?: string
}

export type { EstimateRatesRequest }

// ─── Backend Response Types ───────────────────────────────────────────────────

export interface AuthTokenResponse {
  message: string
  data: {
    access_token: string
    token_type: string
  }
}

export interface AuthProfileResponse {
  message: string
  data: User
}

export interface BookingApiResponse {
  message: string
  data: {
    booking_code: string
    [key: string]: unknown
  }
}

export interface EstimateRatesApiResponse {
  message: string
  data: Rate[]
}

export interface EligibilityCheckApiResponse {
  message: string
  data: {
    eligible_schemes: unknown
    [key: string]: unknown
  }
}
