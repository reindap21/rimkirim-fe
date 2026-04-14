// Rate Card
export interface Rate {
  id: string,
  assets: {
    flags: {
      destination: string;
      origin: string;
    }
  },
  eta: {
    days_from: string;
    days_to: string;
  },
  is_special_rate: boolean;
  pricing: {
    amount: number;
    currency: string;
    unit: string;
    minimum: {
      value: number;
      unit: string;
    }
  },
  provider: {
    id: string,
    code: string,
    name: string,
    service: {
      code: string,
      name: string
    },
    branding: {
      logo: {
        url: string,
        alt: string
      }
    }
  },
  route: {
    origin: {
      country_code: string,
      country_name: string
    },
    destination: {
      country_code: string,
      country_name: string
    },
    is_direct: true
  }
  terms: string[]
  meta?: {
    chargeable_weight: number | null
  }
}

export type ShipmentType = 'back_for_good' | 'moving_abroad'

export interface LocationPayload {
  address: string
  latitude: number
  longitude: number
  postal_code: string
  city: string
  province: string
  country: string // ISO-2 (ID, GB, US, etc)
}

export interface PackageDimensions {
  length: number | null
  width: number | null
  height: number | null
}

export type WeightUnit = 'kg' | 'lb'
export type DimensionUnit = 'cm' | 'inch'

export interface PackagePayload {
  weight: number | null
  weight_unit: WeightUnit
  dimensions: PackageDimensions
  dimension_unit: DimensionUnit
  quantity: number | null
}

export interface EstimateRatesRequest {
  shipment_type: ShipmentType
  origin: LocationPayload
  destination: LocationPayload
  packages?: PackagePayload[]
}

export interface UIRateCardProps {
  price: number
  currency?: string
  unit?: string
  minWeight?: number
  badge?: string
  provider: {
    url: string
    alt: string
  }
  originCountry: string
  originFlag: string
  destinationCountry: string
  destinationFlag: string
  eta?: {
    days_from: string
    days_to: string
  }
  isDirect?: boolean
  terms?: string[]
  collapsible?: boolean
  loading?: boolean
}
