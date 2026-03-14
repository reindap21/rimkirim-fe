import { test, expect } from '../fixtures'
import {
  mockCountries,
  mockOrderHubProgress,
  mockCustomerInfoSaveResponse,
} from '../fixtures/api-mocks'

const BOOKING_CODE = 'BK-TEST-001'
const PAGE_URL = `/order-hub/${BOOKING_CODE}/customer-information`

/** Set up required API mocks for the customer information page to load properly */
async function setupPageMocks(page: import('@playwright/test').Page) {
  await page.route('**/api/auth/session**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: null, authenticated: false }) }),
  )
  await page.route('**/api/order-hub/countries', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockCountries),
    }),
  )
  await page.route('**/api/order-hub/progress**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockOrderHubProgress),
    }),
  )
}

test.describe('Order Hub — Customer Information', () => {
  test('page loads with customer information heading', async ({ page }) => {
    await setupPageMocks(page)
    await page.goto(PAGE_URL)
    await expect(page.getByText('CUSTOMER INFORMATION').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows Sender Details section', async ({ page }) => {
    await setupPageMocks(page)
    await page.goto(PAGE_URL)
    await expect(page.getByText('Sender Details').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows Receiver Details section', async ({ page }) => {
    await setupPageMocks(page)
    await page.goto(PAGE_URL)
    await expect(page.getByText('Receiver Details').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows Shipment Owner Information section', async ({ page }) => {
    await setupPageMocks(page)
    await page.goto(PAGE_URL)
    await expect(page.getByText('Shipment Owner Information').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows required form field labels', async ({ page }) => {
    await setupPageMocks(page)
    await page.goto(PAGE_URL)
    // Wait for form to be ready
    await expect(page.getByText('Sender Full Name')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Sender Email Address')).toBeVisible()
    await expect(page.getByText('Sender Phone Number')).toBeVisible()
    await expect(page.getByText('Sender Country').first()).toBeVisible()
    await expect(page.getByText('Receiver Full Name').first()).toBeVisible()
    await expect(page.getByText('Receiver Email Address').first()).toBeVisible()
    await expect(page.getByText('Receiver Phone Number').first()).toBeVisible()
    await expect(page.getByText('Receiver Country').first()).toBeVisible()
    await expect(page.getByText('Package Owner Name').first()).toBeVisible()
    await expect(page.getByText('Package Owner Email Address').first()).toBeVisible()
  })

  test('shows Same as Sender toggle for Receiver', async ({ page }) => {
    await setupPageMocks(page)
    await page.goto(PAGE_URL)
    await expect(page.getByText('Same as Sender').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows Quick Fill buttons for Shipment Owner', async ({ page }) => {
    await setupPageMocks(page)
    await page.goto(PAGE_URL)
    await expect(page.getByRole('button', { name: /Same as Sender/i }).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /Same as Receiver/i })).toBeVisible()
  })

  test('shows Back, Finish Later, and Done buttons', async ({ page }) => {
    await setupPageMocks(page)
    await page.goto(PAGE_URL)
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: 'Finish Later' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Done' })).toBeVisible()
  })

  test('clicking Finish Later shows confirmation popup', async ({ page }) => {
    await setupPageMocks(page)
    await page.goto(PAGE_URL)
    await expect(page.getByRole('button', { name: 'Finish Later' })).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: 'Finish Later' }).click()

    // PrimeVue Dialog popup with "Your progress will be saved" title
    await expect(page.getByText('Your progress will be saved')).toBeVisible({ timeout: 3000 })
    // Popup has Cancel and OK buttons
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'OK' })).toBeVisible()
  })

  test('confirming Finish Later calls API and navigates to dashboard', async ({ page }) => {
    await setupPageMocks(page)
    await page.route('**/api/order-hub/customer-information', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCustomerInfoSaveResponse),
      }),
    )
    // Mock dashboard progress for after navigation
    await page.goto(PAGE_URL)
    await expect(page.getByRole('button', { name: 'Finish Later' })).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: 'Finish Later' }).click()

    await expect(page.getByText('Your progress will be saved')).toBeVisible({ timeout: 3000 })
    await page.getByRole('button', { name: 'OK' }).click()

    // Should navigate back to order hub dashboard
    await expect(page).toHaveURL(new RegExp(`order-hub/${BOOKING_CODE}$`), { timeout: 5000 })
  })

  test('API error on save keeps user on customer-information page', async ({ page }) => {
    await setupPageMocks(page)
    await page.route('**/api/order-hub/customer-information', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Failed to save customer information' }),
      }),
    )
    await page.goto(PAGE_URL)
    await expect(page.getByRole('button', { name: 'Finish Later' })).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: 'Finish Later' }).click()
    await page.getByRole('button', { name: 'OK' }).click()

    // On API error, user stays on the customer-information page (no navigation to dashboard)
    await expect(page).toHaveURL(new RegExp(`order-hub/${BOOKING_CODE}/customer-information`), { timeout: 5000 })
  })

  test('Done submission shows field validation errors for missing required fields', async ({ page }) => {
    await setupPageMocks(page)
    await page.goto(PAGE_URL)
    // Wait for form to be ready
    await expect(page.getByText('Sender Full Name')).toBeVisible({ timeout: 10000 })

    // Submit without filling any fields — PrimeVue should validate and show errors
    await page.getByRole('button', { name: 'Done' }).click()

    // PrimeVue with validate-on-blur fires validation on submit as well;
    // required fields like sender name should show errors
    await expect(page.getByText('Full name is required.').first()).toBeVisible({ timeout: 5000 })
  })
})

