export type PackageItem = {
  description: string
  quantity: number
  valuePerItem: number
}

export type Package = {
  id: string
  packagingType?: string,
  weightInKgs: number
  dimensionInCcLength: number
  dimensionInCcWidth: number
  dimensionInCcHeight: number
  totalItem: number
  totalValue: number
  chargeableWeight: number
  items: PackageItem[]
  uploadedFiles?: {
    local_path: string
    name: string
    size: number
  }[]
}
