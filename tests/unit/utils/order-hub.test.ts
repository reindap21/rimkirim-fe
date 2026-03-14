import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import {
  isPassengerGoods,
  isMovingGoods,
  formatAddressGeocode,
  STEP_LABEL,
  MAIN_STEPS,
  hasIncompleteSteps,
  getNextStepDescription,
  fetchBookingProgress,
  navigateToOrderHub,
  navigateToOrderHubPage,
  handleSubmitWithLoadingState,
  downloadFile,
  uploadComplianceDocument,
} from '~/utils/order-hub'
import type { ProgressStatus } from '~/types/order-hub'

// ---------------------------------------------------------------------------
// Hoist mockRouterPush so it is available inside the vi.mock factory.
// vi.mock is hoisted by Vitest before all import statements at runtime.
// ---------------------------------------------------------------------------

const mockRouterPush = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

// ---------------------------------------------------------------------------
// $fetch is a Nuxt global (not an unimport auto-import), stub via globalThis
// ---------------------------------------------------------------------------

const mockFetch = vi.fn()

beforeAll(() => {
  vi.stubGlobal('$fetch', mockFetch)
})

beforeEach(() => {
  mockFetch.mockReset()
  mockRouterPush.mockReset()
})

// ---------------------------------------------------------------------------
// isPassengerGoods
// ---------------------------------------------------------------------------

describe('isPassengerGoods', () => {
  it('returns true for "passenger_goods" (strict equality)', () => {
    expect(isPassengerGoods('passenger_goods')).toBe(true)
  })

  it('returns false for "moving_goods"', () => {
    expect(isPassengerGoods('moving_goods')).toBe(false)
  })

  it('returns false for null', () => {
    expect(isPassengerGoods(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isPassengerGoods(undefined)).toBe(false)
  })

  it('returns false for uppercase (strict ===, no toLowerCase)', () => {
    expect(isPassengerGoods('PASSENGER_GOODS')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isMovingGoods
// ---------------------------------------------------------------------------

describe('isMovingGoods', () => {
  it('returns true for "moving_goods"', () => {
    expect(isMovingGoods('moving_goods')).toBe(true)
  })

  it('returns false for "passenger_goods"', () => {
    expect(isMovingGoods('passenger_goods')).toBe(false)
  })

  it('returns false for null', () => {
    expect(isMovingGoods(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isMovingGoods(undefined)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// formatAddressGeocode
// ---------------------------------------------------------------------------

describe('formatAddressGeocode', () => {
  it('maps all fields correctly', () => {
    expect(
      formatAddressGeocode({
        fullAddress: '123 Main St',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        country: 'ID',
        postalCode: '10110',
        latitude: -6.2,
        longitude: 106.8,
      }),
    ).toEqual({
      address: '123 Main St',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      country: 'ID',
      postal_code: '10110',
      latitude: -6.2,
      longitude: 106.8,
    })
  })

  it('defaults all optional fields to "" or 0', () => {
    expect(formatAddressGeocode({})).toEqual({
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
    const result = formatAddressGeocode({ city: 'Bandung', postalCode: '40111' })
    expect(result.city).toBe('Bandung')
    expect(result.postal_code).toBe('40111')
    expect(result.address).toBe('')
  })

  it('preserves latitude of 0', () => {
    expect(formatAddressGeocode({ latitude: 0 }).latitude).toBe(0)
  })

  it('preserves negative longitude', () => {
    expect(formatAddressGeocode({ longitude: -73.5 }).longitude).toBe(-73.5)
  })
})

// ---------------------------------------------------------------------------
// STEP_LABEL
// ---------------------------------------------------------------------------

describe('STEP_LABEL', () => {
  it('contains all 4 step keys with correct labels', () => {
    expect(STEP_LABEL.customer_information).toBe('Customer Information')
    expect(STEP_LABEL.item_and_package).toBe('Item & Packages Information')
    expect(STEP_LABEL.compliance_document).toBe('Compliance Document')
    expect(STEP_LABEL.pickup_detail_schedule).toBe('Pickup Detail & Schedule')
  })
})

// ---------------------------------------------------------------------------
// MAIN_STEPS
// ---------------------------------------------------------------------------

describe('MAIN_STEPS', () => {
  it('has exactly 3 entries', () => {
    expect(MAIN_STEPS).toHaveLength(3)
  })

  it('excludes pickup_detail_schedule', () => {
    expect(MAIN_STEPS).not.toContain('pickup_detail_schedule')
  })

  it('is in correct order', () => {
    expect(MAIN_STEPS).toEqual([
      'customer_information',
      'item_and_package',
      'compliance_document',
    ])
  })
})

// ---------------------------------------------------------------------------
// hasIncompleteSteps (order-hub version)
// ---------------------------------------------------------------------------

describe('hasIncompleteSteps (order-hub)', () => {
  it('returns undefined when currentStep is null', () => {
    expect(hasIncompleteSteps(null, {})).toBeUndefined()
  })

  it('returns undefined when progress is null', () => {
    expect(
      hasIncompleteSteps('customer_information', null as unknown as Record<string, ProgressStatus>),
    ).toBeUndefined()
  })

  it('returns false when all non-current MAIN_STEPS are completed', () => {
    const result = hasIncompleteSteps('customer_information', {
      customer_information: 'awaiting_input',
      item_and_package: 'completed',
      compliance_document: 'completed',
    })
    expect(result).toBe(false)
  })

  it('returns true when one non-current MAIN_STEP is not completed', () => {
    const result = hasIncompleteSteps('customer_information', {
      item_and_package: 'awaiting_input',
      compliance_document: 'completed',
    })
    expect(result).toBe(true)
  })

  it('checks all MAIN_STEPS when currentStep is pickup_detail_schedule (not in MAIN_STEPS)', () => {
    const result = hasIncompleteSteps('pickup_detail_schedule', {
      customer_information: 'completed',
      item_and_package: 'completed',
      compliance_document: 'completed',
    })
    expect(result).toBe(false)
  })

  it('returns true for an empty progress object', () => {
    expect(hasIncompleteSteps('customer_information', {})).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// getNextStepDescription (order-hub version)
// ---------------------------------------------------------------------------

describe('getNextStepDescription (order-hub)', () => {
  it('returns the 3/3 message when all steps are complete', () => {
    const result = getNextStepDescription('customer_information', {
      customer_information: 'completed',
      item_and_package: 'completed',
      compliance_document: 'completed',
    })
    expect(result).toContain('3/3')
  })

  it('builds message for 1 incomplete step', () => {
    const result = getNextStepDescription('customer_information', {
      item_and_package: 'completed',
      compliance_document: 'awaiting_input',
    })
    expect(result).toBe('Finish Compliance Document to schedule your move.')
  })

  it('builds message for 2 incomplete steps joined with "and"', () => {
    const result = getNextStepDescription('customer_information', {
      item_and_package: 'awaiting_input',
      compliance_document: 'awaiting_input',
    })
    expect(result).toBe(
      'Finish Item & Packages Information and Compliance Document to schedule your move.',
    )
  })

  it('uses default empty progress when no progress argument is provided', () => {
    const result = getNextStepDescription('customer_information')
    expect(result).toContain('Finish')
    expect(result).toContain('to schedule your move.')
  })

  it('uses pickup_detail_schedule as currentStep (all MAIN_STEPS are checked)', () => {
    const result = getNextStepDescription('pickup_detail_schedule', {
      customer_information: 'completed',
      item_and_package: 'completed',
      compliance_document: 'completed',
    })
    expect(result).toContain('3/3')
  })
})

// ---------------------------------------------------------------------------
// fetchBookingProgress
// ---------------------------------------------------------------------------

describe('fetchBookingProgress', () => {
  it('resolves with data on success', async () => {
    const data = { id: '1', booking_code: 'ABC123' }
    mockFetch.mockResolvedValue(data)

    const result = await fetchBookingProgress('ABC123')
    expect(result).toEqual(data)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/order-hub/progress',
      expect.objectContaining({ method: 'GET', params: { bookingCode: 'ABC123' } }),
    )
  })

  it('returns null when $fetch resolves to null', async () => {
    mockFetch.mockResolvedValue(null)
    expect(await fetchBookingProgress('ABC123')).toBeNull()
  })

  it('calls router.push("/") and returns null on 401 error', async () => {
    mockFetch.mockRejectedValue({ statusCode: 401 })
    const result = await fetchBookingProgress('ABC123')
    expect(result).toBeNull()
    expect(mockRouterPush).toHaveBeenCalledWith('/')
  })

  it('returns null without calling router.push on non-401 error', async () => {
    mockFetch.mockRejectedValue({ statusCode: 500 })
    const result = await fetchBookingProgress('ABC123')
    expect(result).toBeNull()
    expect(mockRouterPush).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// navigateToOrderHub / navigateToOrderHubPage
// ---------------------------------------------------------------------------

describe('navigateToOrderHub', () => {
  it('calls router.push with the correct order-hub path', () => {
    navigateToOrderHub('BOOK001')
    expect(mockRouterPush).toHaveBeenCalledWith({ path: '/order-hub/BOOK001' })
  })
})

describe('navigateToOrderHubPage', () => {
  it('calls router.push with booking code and page appended', () => {
    navigateToOrderHubPage('BOOK001', 'customer-information')
    expect(mockRouterPush).toHaveBeenCalledWith({
      path: '/order-hub/BOOK001/customer-information',
    })
  })
})

// ---------------------------------------------------------------------------
// handleSubmitWithLoadingState
// ---------------------------------------------------------------------------

describe('handleSubmitWithLoadingState', () => {
  it('returns early without changes when valid=false', async () => {
    const loadingRef = ref(false)
    const errorRef = ref('')
    await handleSubmitWithLoadingState({
      loadingRef,
      errorRef,
      valid: false,
      submitOperation: vi.fn(),
    })
    expect(loadingRef.value).toBe(false)
  })

  it('returns early when loadingRef is already true', async () => {
    const loadingRef = ref(true)
    const errorRef = ref('')
    const submitOperation = vi.fn()
    await handleSubmitWithLoadingState({ loadingRef, errorRef, valid: true, submitOperation })
    expect(submitOperation).not.toHaveBeenCalled()
  })

  it('sets loading to true during the operation and false after', async () => {
    const loadingRef = ref(false)
    const errorRef = ref('')
    let loadingDuring = false
    const submitOperation = vi.fn(async () => {
      loadingDuring = loadingRef.value
      return 'ok'
    })
    const onSuccess = vi.fn()

    await handleSubmitWithLoadingState({ loadingRef, errorRef, valid: true, submitOperation, onSuccess })

    expect(loadingDuring).toBe(true)
    expect(loadingRef.value).toBe(false)
    expect(onSuccess).toHaveBeenCalledWith('ok')
  })

  it('calls onSuccess with the response', async () => {
    const loadingRef = ref(false)
    const errorRef = ref('')
    const onSuccess = vi.fn()
    await handleSubmitWithLoadingState({
      loadingRef,
      errorRef,
      valid: true,
      submitOperation: vi.fn().mockResolvedValue({ id: 42 }),
      onSuccess,
    })
    expect(onSuccess).toHaveBeenCalledWith({ id: 42 })
  })

  it('does not throw when onSuccess is omitted', async () => {
    const loadingRef = ref(false)
    const errorRef = ref('')
    await expect(
      handleSubmitWithLoadingState({
        loadingRef,
        errorRef,
        valid: true,
        submitOperation: vi.fn().mockResolvedValue('ok'),
      }),
    ).resolves.toBeUndefined()
  })

  it('sets errorRef to data.message on failure', async () => {
    const loadingRef = ref(false)
    const errorRef = ref('')
    await handleSubmitWithLoadingState({
      loadingRef,
      errorRef,
      valid: true,
      submitOperation: vi.fn().mockRejectedValue({ data: { message: 'Bad request' } }),
    })
    expect(errorRef.value).toBe('Bad request')
    expect(loadingRef.value).toBe(false)
  })

  it('falls back to "Error submitting form" when data.message is absent', async () => {
    const loadingRef = ref(false)
    const errorRef = ref('')
    await handleSubmitWithLoadingState({
      loadingRef,
      errorRef,
      valid: true,
      submitOperation: vi.fn().mockRejectedValue({}),
    })
    expect(errorRef.value).toBe('Error submitting form')
  })

  it('calls onError with the thrown error', async () => {
    const loadingRef = ref(false)
    const errorRef = ref('')
    const onError = vi.fn()
    const err = { data: { message: 'Oops' } }
    await handleSubmitWithLoadingState({
      loadingRef,
      errorRef,
      valid: true,
      submitOperation: vi.fn().mockRejectedValue(err),
      onError,
    })
    expect(onError).toHaveBeenCalledWith(err)
  })

  it('does not throw when onError is omitted', async () => {
    const loadingRef = ref(false)
    const errorRef = ref('')
    await expect(
      handleSubmitWithLoadingState({
        loadingRef,
        errorRef,
        valid: true,
        submitOperation: vi.fn().mockRejectedValue({ data: {} }),
      }),
    ).resolves.toBeUndefined()
  })

  it('clears errorRef at the start so a retry starts clean', async () => {
    const loadingRef = ref(false)
    const errorRef = ref('previous error')
    await handleSubmitWithLoadingState({
      loadingRef,
      errorRef,
      valid: true,
      submitOperation: vi.fn().mockResolvedValue(null),
    })
    expect(errorRef.value).toBe('')
  })
})

// ---------------------------------------------------------------------------
// downloadFile
// ---------------------------------------------------------------------------

describe('downloadFile', () => {
  const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url')
  const mockRevokeObjectURL = vi.fn()
  let anchorClickSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    mockCreateObjectURL.mockReturnValue('blob:mock-url')
    Object.defineProperty(global.URL, 'createObjectURL', {
      value: mockCreateObjectURL,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(global.URL, 'revokeObjectURL', {
      value: mockRevokeObjectURL,
      writable: true,
      configurable: true,
    })
    anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    mockCreateObjectURL.mockClear()
    mockRevokeObjectURL.mockClear()
    anchorClickSpy.mockClear()
  })

  afterEach(() => {
    anchorClickSpy.mockRestore()
  })

  it('calls createObjectURL, clicks the link, and revokes the URL on success', async () => {
    const fakeBlob = new Blob(['data'])
    mockFetch.mockResolvedValue(fakeBlob)

    await downloadFile({ url: '/api/file', fileName: 'report.pdf' })

    expect(mockCreateObjectURL).toHaveBeenCalledWith(fakeBlob)
    expect(anchorClickSpy).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('uses "download" as default fileName when fileName is not provided', async () => {
    mockFetch.mockResolvedValue(new Blob())
    const appendSpy = vi.spyOn(document.body, 'appendChild')

    await downloadFile({ url: '/api/file' })

    const anchor = appendSpy.mock.calls[0]?.[0] as HTMLAnchorElement
    expect(anchor.download).toBe('download')
    appendSpy.mockRestore()
  })

  it('uses the provided fileName', async () => {
    mockFetch.mockResolvedValue(new Blob())
    const appendSpy = vi.spyOn(document.body, 'appendChild')

    await downloadFile({ url: '/api/file', fileName: 'invoice.pdf' })

    const anchor = appendSpy.mock.calls[0]?.[0] as HTMLAnchorElement
    expect(anchor.download).toBe('invoice.pdf')
    appendSpy.mockRestore()
  })

  it('passes credentials="same-origin" when credentials=false', async () => {
    mockFetch.mockResolvedValue(new Blob())
    await downloadFile({ url: '/api/file', credentials: false })
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/file',
      expect.objectContaining({ credentials: 'same-origin' }),
    )
  })

  it('passes credentials="include" when credentials=true (default)', async () => {
    mockFetch.mockResolvedValue(new Blob())
    await downloadFile({ url: '/api/file', credentials: true })
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/file',
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('re-throws the error when $fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    await expect(downloadFile({ url: '/api/file' })).rejects.toThrow('Network error')
  })
})

// ---------------------------------------------------------------------------
// uploadComplianceDocument
// ---------------------------------------------------------------------------

describe('uploadComplianceDocument', () => {
  it('throws when files array is empty', async () => {
    await expect(
      uploadComplianceDocument({ files: [], documentType: 'ktp', bookingCode: 'B001' }),
    ).rejects.toThrow('No file provided')
  })

  it('resolves with camelCase-transformed fields on success', async () => {
    const file = new File(['content'], 'id.pdf', { type: 'application/pdf' })
    mockFetch.mockResolvedValue({
      local_path: '/uploads/id.pdf',
      document_type: 'ktp',
      name: 'id.pdf',
      size: 1024,
      mime_type: 'application/pdf',
    })

    const result = await uploadComplianceDocument({
      files: [file],
      documentType: 'ktp',
      bookingCode: 'B001',
    })

    expect(result).toEqual({
      localPath: '/uploads/id.pdf',
      documentType: 'ktp',
      name: 'id.pdf',
      size: 1024,
      mimeType: 'application/pdf',
    })
  })

  it('calls $fetch with the correct URL and POST method', async () => {
    const file = new File(['x'], 'test.pdf', { type: 'application/pdf' })
    mockFetch.mockResolvedValue({
      local_path: '/p',
      document_type: 'ktp',
      name: 'test.pdf',
      size: 1,
    })

    await uploadComplianceDocument({ files: [file], documentType: 'ktp', bookingCode: 'B001' })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/upload/compliance-document',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('handles undefined mime_type (mimeType is undefined in result)', async () => {
    const file = new File(['x'], 'test.pdf')
    mockFetch.mockResolvedValue({
      local_path: '/p',
      document_type: 'ktp',
      name: 'test.pdf',
      size: 1,
      mime_type: undefined,
    })

    const result = await uploadComplianceDocument({
      files: [file],
      documentType: 'ktp',
      bookingCode: 'B001',
    })

    expect(result.mimeType).toBeUndefined()
  })
})
