/**
 * Google Maps TypeScript Definitions
 *
 * These types provide proper TypeScript support for Google Maps JavaScript API
 * without needing to install @types/google.maps
 */

import type { AddressGeocode } from './order-hub';

/**
 * LatLng representation with getter methods
 */
export interface LatLng {
  lat(): number;
  lng(): number;
}

/**
 * Geometry information for a place
 */
export interface Geometry {
  location?: LatLng;
}

/**
 * Individual address component from Google Places API
 */
export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

/**
 * Complete place result from Google Places Autocomplete
 */
export interface PlaceResult {
  geometry?: Geometry;
  address_components?: AddressComponent[];
  formatted_address?: string;
  name?: string;
  place_id?: string;
}

/**
 * Component restrictions for autocomplete
 */
export interface ComponentRestrictions {
  country?: string | string[];
}

/**
 * Options for configuring Autocomplete
 */
export interface AutocompleteOptions {
  types?: string[];
  componentRestrictions?: ComponentRestrictions;
  fields?: string[];
  strictBounds?: boolean;
}

/**
 * Google Places Autocomplete instance
 */
export interface Autocomplete {
  addListener(event: string, handler: () => void): void;
  getPlace(): PlaceResult;
  setComponentRestrictions(restrictions: ComponentRestrictions): void;
  setFields(fields: string[]): void;
  setTypes(types: string[]): void;
  bindTo(field: string, target: unknown): void;
  unbind(field: string): void;
  unbindAll(): void;
}

/**
 * Constructor for Autocomplete
 */
export interface AutocompleteConstructor {
  new (input: HTMLInputElement | null, options?: AutocompleteOptions): Autocomplete;
}

/**
 * Google Maps event listener types
 */
export interface MapsEventListener {
  remove(): void;
}

/**
 * Google Maps event object
 */
export interface MapsEvent {
  addListener(
    instance: Autocomplete | unknown,
    eventName: string,
    handler: (...args: unknown[]) => void
  ): MapsEventListener;
  addListenerOnce(
    instance: unknown,
    eventName: string,
    handler: (...args: unknown[]) => void
  ): MapsEventListener;
  clearInstanceListeners(instance: Autocomplete | unknown): void;
  clearListeners(instance: unknown, eventName: string): void;
  removeListener(listener: MapsEventListener): void;
}

/**
 * Google Places namespace
 */
export interface PlacesLibrary {
  Autocomplete: AutocompleteConstructor;
}

/**
 * Google Maps event namespace
 */
export interface EventLibrary {
  clearInstanceListeners: (instance: Autocomplete | unknown) => void;
}

/**
 * Main Google Maps namespace declaration
 */
export interface GoogleMaps {
  maps: {
    places: PlacesLibrary;
    event: EventLibrary;
    LatLng: new (lat: number, lng: number, noWrap?: boolean) => LatLng;
  };
}

/**
 * LatLng literal representation
 */
export interface LatLngLiteral {
  lat: number;
  lng: number;
}

/**
 * Extend the global Window interface with Google Maps
 */
declare global {
  interface Window {
    google: GoogleMaps;
  }
}

/**
 * Props for GoogleAddressInput component
 */
export interface GoogleAddressInputProps {
  name?: string;
  modelValue?: string;
  placeholder?: string;
  country?: string; // ISO code in lowercase, ex: "id", "jp"
  disabled?: boolean;
  required?: boolean;
}

/**
 * Emitted events from GoogleAddressInput component
 */
export interface GoogleAddressInputEmits {
  (e: 'update:modelValue', value: string): void;
  (e: 'select', place: AddressGeocode): void;
  (e: 'error', error: Error): void;
}

export type { AddressGeocode } from "./order-hub"
