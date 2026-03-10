import type { AddressGeocode } from "~/types/order-hub";
import type { AddressComponent, PlaceResult } from "~/types/google-maps";

/**
 * Extract an address component from Google Places address components.
 *
 * @param components - Address components from Google Places API
 * @param type - The type of component to extract (e.g., 'locality', 'administrative_area_level_1')
 * @param useShort - Whether to use the short name (e.g., ISO code for country)
 * @returns The component value or undefined if not found
 */
export function getAddressComponent(
  components: AddressComponent[],
  type: string,
  useShort = false,
): string | undefined {
  const comp = components.find((c) => c.types.includes(type));
  return useShort ? comp?.short_name : comp?.long_name;
}

/**
 * Format a Google Places result into an AddressGeocode object.
 * This is used by GoogleAddressInput and can be used standalone.
 *
 * @param place - The place result from Google Places Autocomplete
 * @returns Formatted AddressGeocode object
 */
export function formatGooglePlaceToAddressGeocode(
  place: PlaceResult,
): AddressGeocode {
  if (!place.geometry?.location || !place.address_components) {
    throw new Error("Invalid place result: missing geometry or address components");
  }

  // Extract city with fallbacks
  const city =
    getAddressComponent(place.address_components, "locality") ||
    getAddressComponent(place.address_components, "postal_town") ||
    getAddressComponent(place.address_components, "administrative_area_level_2") ||
    getAddressComponent(place.address_components, "administrative_area_level_1") ||
    "";

  // Extract province/state
  const province =
    getAddressComponent(place.address_components, "administrative_area_level_1") ||
    "";

  // Extract postal code with fallback generation
  let postalCode =
    getAddressComponent(place.address_components, "postal_code") || "";

  // Fallback: Generate postal code from city or province if not available
  if (!postalCode) {
    const fallbackSource = city || province || "";
    postalCode = fallbackSource
      ? fallbackSource.replace(/\s/g, "").toUpperCase().substring(0, 10)
      : "";
  }

  // Extract country ISO code
  const country =
    getAddressComponent(place.address_components, "country", true) || ""; // true = use short_name for ISO code

  return {
    address: place.formatted_address || "",
    latitude: place.geometry.location.lat(),
    longitude: place.geometry.location.lng(),
    postal_code: postalCode,
    city,
    province,
    country,
  };
}

/**
 * Create an AddressGeocode object from individual address fields.
 * Useful when you don't have Google Places data.
 *
 * @param addressData - Individual address fields
 * @returns Formatted AddressGeocode object
 */
export function createAddressGeocode(addressData: {
  fullAddress?: string;
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}): AddressGeocode {
  return {
    address: addressData.fullAddress || "",
    city: addressData.city || "",
    province: addressData.province || "",
    country: addressData.country || "",
    postal_code: addressData.postalCode || "",
    latitude: addressData.latitude || 0,
    longitude: addressData.longitude || 0,
  };
}

/**
 * Check if an AddressGeocode object has valid data.
 * Returns true if the object has at least an address.
 *
 * @param geocode - The AddressGeocode object to check
 * @returns true if the geocode has valid data
 */
export function hasValidGeocode(
  geocode: AddressGeocode | Record<string, never> | null | undefined,
): geocode is AddressGeocode {
  return (
    geocode !== null &&
    geocode !== undefined &&
    typeof geocode === "object" &&
    Object.keys(geocode).length > 0 &&
    ("address" in geocode || "city" in geocode)
  );
}

/**
 * Merge address data with existing geocode.
 * Updates only the fields that are provided in the new data.
 *
 * @param existing - Existing AddressGeocode object
 * @param updates - New address data to merge
 * @returns Merged AddressGeocode object
 */
export function mergeAddressGeocode(
  existing: AddressGeocode | Record<string, never>,
  updates: Partial<AddressGeocode>,
): AddressGeocode {
  const base: AddressGeocode = hasValidGeocode(existing)
    ? existing
    : {
        address: "",
        city: "",
        province: "",
        country: "",
        postal_code: "",
        latitude: 0,
        longitude: 0,
      };

  return {
    ...base,
    ...updates,
  };
}
