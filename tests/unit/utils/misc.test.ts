import { describe, it, expect } from 'vitest'
import {
  isPurposeOfShipmentPassengerGoods,
  isCompleted,
  isLocked,
} from '~/utils/misc'

// ---------------------------------------------------------------------------
// isPurposeOfShipmentPassengerGoods
// ---------------------------------------------------------------------------

describe('isPurposeOfShipmentPassengerGoods', () => {
  it('returns false for empty string', () => {
    expect(isPurposeOfShipmentPassengerGoods('')).toBe(false)
  })

  it('returns true for "passenger_goods"', () => {
    expect(isPurposeOfShipmentPassengerGoods('passenger_goods')).toBe(true)
  })

  it('returns true for "PASSENGER_GOODS" (case-insensitive)', () => {
    expect(isPurposeOfShipmentPassengerGoods('PASSENGER_GOODS')).toBe(true)
  })

  it('returns true for mixed-case "Passenger_Goods"', () => {
    expect(isPurposeOfShipmentPassengerGoods('Passenger_Goods')).toBe(true)
  })

  it('returns false for "moving_goods"', () => {
    expect(isPurposeOfShipmentPassengerGoods('moving_goods')).toBe(false)
  })

  it('returns false for null cast as string', () => {
    expect(isPurposeOfShipmentPassengerGoods(null as unknown as string)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isCompleted
// ---------------------------------------------------------------------------

describe('isCompleted', () => {
  it('returns false for empty string', () => {
    expect(isCompleted('')).toBe(false)
  })

  it('returns false for null cast as string', () => {
    expect(isCompleted(null as unknown as string)).toBe(false)
  })

  it('returns false for number cast as string', () => {
    expect(isCompleted(42 as unknown as string)).toBe(false)
  })

  it('returns true for "completed"', () => {
    expect(isCompleted('completed')).toBe(true)
  })

  it('returns true for "COMPLETED"', () => {
    expect(isCompleted('COMPLETED')).toBe(true)
  })

  it('returns true for "Completed"', () => {
    expect(isCompleted('Completed')).toBe(true)
  })

  it('returns false for "locked"', () => {
    expect(isCompleted('locked')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isLocked
// ---------------------------------------------------------------------------

describe('isLocked', () => {
  it('returns false for empty string', () => {
    expect(isLocked('')).toBe(false)
  })

  it('returns false for null cast as string', () => {
    expect(isLocked(null as unknown as string)).toBe(false)
  })

  it('returns false for number cast as string', () => {
    expect(isLocked(42 as unknown as string)).toBe(false)
  })

  it('returns true for "locked"', () => {
    expect(isLocked('locked')).toBe(true)
  })

  it('returns true for "LOCKED"', () => {
    expect(isLocked('LOCKED')).toBe(true)
  })

  it('returns true for "Locked"', () => {
    expect(isLocked('Locked')).toBe(true)
  })

  it('returns false for "completed"', () => {
    expect(isLocked('completed')).toBe(false)
  })
})

