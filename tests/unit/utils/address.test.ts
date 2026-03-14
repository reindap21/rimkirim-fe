import { describe, it, expect } from 'vitest'
import {
  getAddressComponent,
  formatGooglePlaceToAddressGeocode,
  createAddressGeocode,
  hasValidGeocode,
  mergeAddressGeocode,
} from '~/utils/address'
import type { AddressComponent, PlaceResult } from '~/types/google-maps'
import type { AddressGeocode } from '~/types/order-hub'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeComponent(type: string, longName: string, shortName: string): AddressComponent {
  return { types: [type], long_name: longName, short_name: shortName }
}

function makePlace(overrides: Partial<PlaceResult> = {}): PlaceResult {
  return {
    geometry: {
      location: { lat: () => 1.3521, lng: () => 103.8198 },
    },
    address_components: [
      makeComponent('locality', 'Singapore', 'SG-LOCALITY'),
      makeComponent('administrative_area_level_1', 'Singapore', 'SG'),
      makeComponent('country', 'Singapore', 'SG'),
      makeComponent('postal_code', '018956', '018956'),
    ],
    formatted_address: '1 Raffles Pl, Singapore 048616',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// getAddressComponent
// ---------------------------------------------------------------------------

describe('getAddressComponent', () => {
  const components: AddressComponent[] = [
    makeComponent('locality', 'Jakarta', 'JKT'),
    makeComponent('administrative_area_level_1', 'DKI Jakarta', 'DKI'),
  ]

  it('returns long_name by default when type is found', () => {
    expect(getAddressComponent(components, 'locality')).toBe('Jakarta')
  })

  it('returns short_name when useShort=true', () => {
    expect(getAddressComponent(components, 'locality', true)).toBe('JKT')
  })

  it('returns long_name when useShort=false explicitly', () => {
    expect(getAddressComponent(components, 'locality', false)).toBe('Jakarta')
  })

  it('returns undefined when type is not found', () => {
    expect(getAddressComponent(components, 'country')).toBeUndefined()
  })

  it('returns undefined for an empty array', () => {
    expect(getAddressComponent([], 'locality')).toBeUndefined()
  })

  it('matches a component that has multiple types', () => {
    const multi: AddressComponent[] = [
      { types: ['locality', 'political'], long_name: 'Jakarta', short_name: 'JKT' },
    ]
    expect(getAddressComponent(multi, 'political')).toBe('Jakarta')
  })
})

// ---------------------------------------------------------------------------
// formatGooglePlaceToAddressGeocode
// ---------------------------------------------------------------------------

describe('formatGooglePlaceToAddressGeocode', () => {
  it('throws when geometry is missing', () => {
    expect(() =>
      formatGooglePlaceToAddressGeocode({ address_components: [] } as PlaceResult),
    ).toThrow('Invalid place result')
  })

  it('throws when geometry.location is missing', () => {
    expect(() =>
      formatGooglePlaceToAddressGeocode({
        geometry: {},
        address_components: [],
      } as PlaceResult),
    ).toThrow('Invalid place result')
  })

  it('throws when address_components is missing', () => {
    expect(() =>
      formatGooglePlaceToAddressGeocode({
        geometry: { location: { lat: () => 1, lng: () => 1 } },
      } as PlaceResult),
    ).toThrow('Invalid place result')
  })

  it('uses locality as city', () => {
    const result = formatGooglePlaceToAddressGeocode(makePlace())
    expect(result.city).toBe('Singapore')
  })

  it('falls back to postal_town when locality is absent', () => {
    const result = formatGooglePlaceToAddressGeocode(
      makePlace({
        address_components: [
          makeComponent('postal_town', 'Postal Town', 'PT'),
          makeComponent('country', 'GB', 'GB'),
        ],
      }),
    )
    expect(result.city).toBe('Postal Town')
  })

  it('falls back to administrative_area_level_2 when locality and postal_town are absent', () => {
    const result = formatGooglePlaceToAddressGeocode(
      makePlace({
        address_components: [
          makeComponent('administrative_area_level_2', 'Bandung Regency', 'BR'),
          makeComponent('country', 'ID', 'ID'),
        ],
      }),
    )
    expect(result.city).toBe('Bandung Regency')
  })

  it('falls back to administrative_area_level_1 when all city fallbacks are absent', () => {
    const result = formatGooglePlaceToAddressGeocode(
      makePlace({
        address_components: [
          makeComponent('administrative_area_level_1', 'Bali', 'BA'),
          makeComponent('country', 'ID', 'ID'),
        ],
      }),
    )
    expect(result.city).toBe('Bali')
  })

  it('sets city to "" when no city component is present', () => {
    const result = formatGooglePlaceToAddressGeocode(
      makePlace({
        address_components: [makeComponent('country', 'ID', 'ID')],
      }),
    )
    expect(result.city).toBe('')
  })

  it('uses postal_code directly when present', () => {
    const result = formatGooglePlaceToAddressGeocode(makePlace())
    expect(result.postal_code).toBe('018956')
  })

  it('generates postal_code from city when postal_code is absent', () => {
    const result = formatGooglePlaceToAddressGeocode(
      makePlace({
        address_components: [
          makeComponent('locality', 'Los Angeles County', 'LAC'),
          makeComponent('country', 'US', 'US'),
        ],
      }),
    )
    // "Los Angeles County" → remove spaces → "LosAngelesCounty" → uppercase → "LOSANGELESCOUNTY" → first 10 → "LOSANGELES"
    expect(result.postal_code).toBe('LOSANGELES')
  })

  it('generates postal_code from province when city is absent', () => {
    const result = formatGooglePlaceToAddressGeocode(
      makePlace({
        address_components: [
          makeComponent('administrative_area_level_1', 'West Java', 'WJ'),
          makeComponent('country', 'ID', 'ID'),
        ],
      }),
    )
    // "West Java" → remove spaces → "WestJava" → uppercase → "WESTJAVA"
    expect(result.postal_code).toBe('WESTJAVA')
  })

  it('sets postal_code to "" when no city, province, or postal_code are present', () => {
    const result = formatGooglePlaceToAddressGeocode(
      makePlace({
        address_components: [makeComponent('country', 'ID', 'ID')],
      }),
    )
    expect(result.postal_code).toBe('')
  })

  it('uses country short_name for ISO code', () => {
    const result = formatGooglePlaceToAddressGeocode(makePlace())
    expect(result.country).toBe('SG')
  })

  it('sets country to "" when no country component is present', () => {
    const result = formatGooglePlaceToAddressGeocode(
      makePlace({
        address_components: [
          makeComponent('locality', 'Singapore', 'SG-LOCALITY'),
          makeComponent('postal_code', '018956', '018956'),
        ],
      }),
    )
    expect(result.country).toBe('')
  })

  it('uses formatted_address for address field', () => {
    const result = formatGooglePlaceToAddressGeocode(makePlace())
    expect(result.address).toBe('1 Raffles Pl, Singapore 048616')
  })

  it('uses "" for address when formatted_address is absent', () => {
    const result = formatGooglePlaceToAddressGeocode(makePlace({ formatted_address: undefined }))
    expect(result.address).toBe('')
  })

  it('reads lat and lng from location getter functions', () => {
    const result = formatGooglePlaceToAddressGeocode(makePlace())
    expect(result.latitude).toBe(1.3521)
    expect(result.longitude).toBe(103.8198)
  })
})

// ---------------------------------------------------------------------------
// createAddressGeocode
// ---------------------------------------------------------------------------

describe('createAddressGeocode', () => {
  it('maps all provided fields correctly', () => {
    const result = createAddressGeocode({
      fullAddress: '123 Main St',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      country: 'ID',
      postalCode: '10110',
      latitude: -6.2,
      longitude: 106.8,
    })
    expect(result).toEqual({
      address: '123 Main St',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      country: 'ID',
      postal_code: '10110',
      latitude: -6.2,
      longitude: 106.8,
    })
  })

  it('defaults all fields to "" or 0 when called with an empty object', () => {
    expect(createAddressGeocode({})).toEqual({
      address: '',
      city: '',
      province: '',
      country: '',
      postal_code: '',
      latitude: 0,
      longitude: 0,
    })
  })

  it('handles partial fields', () => {
    const result = createAddressGeocode({ city: 'Bandung', postalCode: '40111' })
    expect(result.city).toBe('Bandung')
    expect(result.postal_code).toBe('40111')
    expect(result.address).toBe('')
    expect(result.latitude).toBe(0)
  })

  it('preserves latitude of 0 (falsy numeric value)', () => {
    // 0 || 0 === 0, so explicit 0 should stay 0
    const result = createAddressGeocode({ latitude: 0 })
    expect(result.latitude).toBe(0)
  })

  it('preserves negative longitude', () => {
    const result = createAddressGeocode({ longitude: -73.5 })
    expect(result.longitude).toBe(-73.5)
  })
})

// ---------------------------------------------------------------------------
// hasValidGeocode
// ---------------------------------------------------------------------------

describe('hasValidGeocode', () => {
  it('returns false for null', () => {
    expect(hasValidGeocode(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(hasValidGeocode(undefined)).toBe(false)
  })

  it('returns false for an empty object', () => {
    expect(hasValidGeocode({})).toBe(false)
  })

  it('returns true when object has address field', () => {
    expect(hasValidGeocode({ address: '123 Main St' } as AddressGeocode)).toBe(true)
  })

  it('returns true when object has city field', () => {
    expect(hasValidGeocode({ city: 'Jakarta' } as AddressGeocode)).toBe(true)
  })

  it('returns false when object has neither address nor city', () => {
    expect(hasValidGeocode({ latitude: 1.3 } as unknown as AddressGeocode)).toBe(false)
  })

  it('returns true for a fully populated AddressGeocode', () => {
    const geocode: AddressGeocode = {
      address: '1 Raffles Pl',
      city: 'Singapore',
      province: 'Singapore',
      country: 'SG',
      postal_code: '048616',
      latitude: 1.3521,
      longitude: 103.8198,
    }
    expect(hasValidGeocode(geocode)).toBe(true)
  })

  it('returns false for a non-object primitive', () => {
    expect(hasValidGeocode(42 as unknown as AddressGeocode)).toBe(false)
  })

  it('returns false for an empty array', () => {
    expect(hasValidGeocode([] as unknown as AddressGeocode)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// mergeAddressGeocode
// ---------------------------------------------------------------------------

describe('mergeAddressGeocode', () => {
  const base: AddressGeocode = {
    address: '123 Main St',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    country: 'ID',
    postal_code: '10110',
    latitude: -6.2,
    longitude: 106.8,
  }

  it('merges updates into a valid existing geocode', () => {
    const result = mergeAddressGeocode(base, { city: 'Bandung', postal_code: '40111' })
    expect(result.city).toBe('Bandung')
    expect(result.postal_code).toBe('40111')
    expect(result.address).toBe('123 Main St')
  })

  it('uses blank defaults when existing is an empty object (invalid geocode)', () => {
    const result = mergeAddressGeocode({}, { city: 'Surabaya' })
    expect(result.city).toBe('Surabaya')
    expect(result.address).toBe('')
    expect(result.latitude).toBe(0)
  })

  it('uses blank defaults when existing is cast from null', () => {
    const result = mergeAddressGeocode(null as unknown as AddressGeocode, { city: 'Medan' })
    expect(result.city).toBe('Medan')
    expect(result.address).toBe('')
  })

  it('returns existing fields unchanged when updates is empty', () => {
    const result = mergeAddressGeocode(base, {})
    expect(result).toEqual(base)
  })

  it('allows updates to override all fields', () => {
    const updates: AddressGeocode = {
      address: 'New Address',
      city: 'New City',
      province: 'New Province',
      country: 'JP',
      postal_code: '100-0001',
      latitude: 35.68,
      longitude: 139.69,
    }
    const result = mergeAddressGeocode(base, updates)
    expect(result).toEqual(updates)
  })

  it('allows updates to override only some fields', () => {
    const result = mergeAddressGeocode(base, { country: 'JP', latitude: 35.68 })
    expect(result.country).toBe('JP')
    expect(result.latitude).toBe(35.68)
    expect(result.city).toBe('Jakarta')
  })
})
