import { describe, it, expect } from 'vitest'
import {
  isPurposeOfShipmentPassengerGoods,
  isCompleted,
  isLocked,
  hasIncompleteSteps,
  getNextStepDescription,
} from '~/utils/misc'
import type { OrderHubStep } from '~/types/order-hub'

type Progress = Parameters<typeof hasIncompleteSteps>[1]

function makeProgress(overrides: Partial<Progress> = {}): Progress {
  return {
    customer_information: 'completed',
    item_and_package: 'completed',
    compliance_document: 'completed',
    pickup_detail_schedule: 'completed',
    ...overrides,
  }
}

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

// ---------------------------------------------------------------------------
// hasIncompleteSteps (misc version)
// ---------------------------------------------------------------------------

describe('hasIncompleteSteps (misc)', () => {
  it('returns true when progress is null', () => {
    expect(hasIncompleteSteps('customer_information' as OrderHubStep, null as unknown as Progress)).toBe(true)
  })

  it('returns [] when all non-current steps are completed', () => {
    const progress = makeProgress({ customer_information: 'awaiting_input' })
    const result = hasIncompleteSteps('customer_information', progress)
    expect(result).toEqual([])
  })

  it('returns the label of one awaiting_input step', () => {
    const progress = makeProgress({ item_and_package: 'awaiting_input' })
    const result = hasIncompleteSteps('customer_information', progress)
    expect(result).toEqual(['Item & Packages Information'])
  })

  it('returns labels for two incomplete steps', () => {
    const progress = makeProgress({
      item_and_package: 'awaiting_input',
      compliance_document: 'awaiting_input',
    })
    const result = hasIncompleteSteps('customer_information', progress)
    expect(result).toEqual(['Item & Packages Information', 'Compliance Document'])
  })

  it('excludes locked steps from the result', () => {
    const progress = makeProgress({
      item_and_package: 'awaiting_input',
      pickup_detail_schedule: 'locked',
    })
    const result = hasIncompleteSteps('customer_information', progress)
    expect(result).toEqual(['Item & Packages Information'])
  })
})

// ---------------------------------------------------------------------------
// getNextStepDescription (misc version)
// ---------------------------------------------------------------------------

describe('getNextStepDescription (misc)', () => {
  it('returns "" when currentStep is null', () => {
    expect(getNextStepDescription(null, makeProgress())).toBe('')
  })

  it('returns "" when all steps are completed (incompleteSteps.length === 0)', () => {
    const progress = makeProgress({ customer_information: 'awaiting_input' })
    expect(getNextStepDescription('customer_information', progress)).toBe('')
  })

  it('returns "Finish  to schedule..." path when progress is null (formatStepList non-array branch)', () => {
    // hasIncompleteSteps returns boolean true when progress is falsy,
    // which causes formatStepList to hit the !Array.isArray branch → ""
    const result = getNextStepDescription(
      'customer_information',
      null as unknown as Progress,
    )
    expect(result).toBe('Finish  to schedule your move.')
  })

  it('builds message for 1 incomplete step (formatStepList length===1 branch)', () => {
    const progress = makeProgress({ item_and_package: 'awaiting_input' })
    const result = getNextStepDescription('customer_information', progress)
    expect(result).toBe('Finish Item & Packages Information to schedule your move.')
  })

  it('builds message for 2 incomplete steps (formatStepList length===2 branch)', () => {
    const progress = makeProgress({
      item_and_package: 'awaiting_input',
      compliance_document: 'awaiting_input',
    })
    const result = getNextStepDescription('customer_information', progress)
    expect(result).toBe(
      'Finish Item & Packages Information and Compliance Document to schedule your move.',
    )
  })

  it('builds message for 3 incomplete steps (formatStepList length>2 branch)', () => {
    const progress = makeProgress({
      item_and_package: 'awaiting_input',
      compliance_document: 'awaiting_input',
      pickup_detail_schedule: 'awaiting_input',
    })
    const result = getNextStepDescription('customer_information', progress)
    expect(result).toBe(
      'Finish Item & Packages Information, Compliance Document, and Pickup Detail Schedule to schedule your move.',
    )
  })
})
