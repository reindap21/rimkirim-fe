export interface CurrencyOption {
  name: string
  code: string
}

export interface CountryOption {
  name: string
  code: string
  flag?: string
}

export type BuildingType = {
  label: string
  value: string
}

export interface EligibilityFormPayload {
  shippingToIndonesia: boolean | null
  citizenship: 'indonesian' | 'foreigner' | null
  livedInOriginCountry: boolean | null
  canApplySKP: boolean | null
  packingListCode: string | null
}
