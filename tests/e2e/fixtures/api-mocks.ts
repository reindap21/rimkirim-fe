/**
 * Shared mock response data for E2E tests.
 * All network calls to /api/* are intercepted with page.route() so tests
 * run offline and deterministically without a real backend.
 */

export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
}

export const mockRate = {
  id: 'rate-001',
  provider: {
    name: 'RimEx Logistics',
    branding: {
      logo: {
        url: 'https://via.placeholder.com/80x28?text=RimEx',
        alt: 'RimEx Logistics',
      },
    },
  },
  pricing: {
    amount: 1500000,
    currency: 'IDR',
    unit: 'Kg',
    minimum: { value: 10 },
  },
  route: {
    origin: {
      country_code: 'GB',
      country_name: 'United Kingdom',
    },
    destination: {
      country_code: 'ID',
      country_name: 'Indonesia',
    },
    is_direct: true,
  },
  eta: {
    days_from: 14,
    days_to: 21,
  },
  assets: {
    flags: {
      origin: 'https://flagcdn.com/gb.svg',
      destination: 'https://flagcdn.com/id.svg',
    },
  },
  terms: ['Door-to-door service included', 'Insurance available upon request'],
}

export const mockRatesResponse = {
  rates: [mockRate],
}

export const mockEstimateResponse = {
  rates: [
    mockRate,
    {
      ...mockRate,
      id: 'rate-002',
      pricing: { ...mockRate.pricing, amount: 2000000 },
    },
  ],
}

export const mockEligibilityCheckResponse = {
  success: true,
  message: 'Eligible',
}

export const mockBookingResponse = {
  booking: {
    booking_code: 'BK-TEST-001',
  },
}

export const mockOrderHubProgress = {
  booking_code: 'BK-TEST-001',
  purpose_of_shipment: 'moving_goods',
  packing_list_code: 'PKL-001',
  can_download_packing_list: true,
  customer_information: {
    status: 'awaiting_input',
    data: null,
    progress_count: { total: 5, completed: 0 },
  },
  item_and_package: {
    status: 'awaiting_input',
    data: null,
    progress_count: { total: 3, completed: 0 },
  },
  compliance_document: {
    status: 'awaiting_input',
    data: null,
    progress_count: { total: 2, completed: 0 },
  },
  pickup_detail_schedule: {
    status: 'locked',
    data: null,
    progress_count: { total: 1, completed: 0 },
  },
  progress: {
    customer_information: 'awaiting_input',
    item_and_package: 'awaiting_input',
    compliance_document: 'awaiting_input',
    pickup_detail_schedule: 'locked',
  },
}

export const mockOrderHubProgressWithCompleted = {
  ...mockOrderHubProgress,
  customer_information: {
    status: 'completed',
    data: {
      senderContactName: 'John Doe',
      senderEmail: 'john@example.com',
      senderPhoneNumber: '081234567890',
      senderCountry: 'GB',
      senderFullAddress: '123 Baker Street, London',
    },
    progress_count: { total: 5, completed: 5 },
  },
  progress: {
    ...mockOrderHubProgress.progress,
    customer_information: 'completed',
  },
}

export const mockCountries = [
  { name: 'Indonesia', code: 'ID', iso: 'ID' },
  { name: 'United Kingdom', code: 'GB', iso: 'GB' },
  { name: 'Australia', code: 'AU', iso: 'AU' },
  { name: 'Singapore', code: 'SG', iso: 'SG' },
]

export const mockCustomerInfoSaveResponse = {
  success: true,
  message: 'Customer information saved',
  data: {
    bookingCode: 'BK-TEST-001',
  },
}

export const mockSessionResponse = {
  user: mockUser,
}

export const mockLoginResponse = {
  user: mockUser,
}

export const mockRegisterResponse = {
  user: mockUser,
}
