import { test, expect } from '../fixtures'
import {
  mockOrderHubProgress,
  mockOrderHubProgressWithCompleted,
} from '../fixtures/api-mocks'

const BOOKING_CODE = 'BK-TEST-001'
const DASHBOARD_URL = `/order-hub/${BOOKING_CODE}`

test.describe('Order Hub Dashboard', () => {
  test('loads dashboard page with booking code visible', async ({ page }) => {
    await page.route('**/api/order-hub/progress**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOrderHubProgress),
      }),
    )
    await page.goto(DASHBOARD_URL)
    // Booking code is shown in the page header pill
    await expect(page.getByText(BOOKING_CODE)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('INTERNATIONAL MOVING ORDER')).toBeVisible()
  })

  test('shows all 4 step cards', async ({ page }) => {
    await page.route('**/api/order-hub/progress**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOrderHubProgress),
      }),
    )
    await page.goto(DASHBOARD_URL)
    await expect(page.getByText('CUSTOMER').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('INFORMATION').first()).toBeVisible()
    await expect(page.getByText('ITEM &').first()).toBeVisible()
    await expect(page.getByText('PACKAGES').first()).toBeVisible()
    await expect(page.getByText('COMPLIANCE').first()).toBeVisible()
    await expect(page.getByText('DOCUMENT').first()).toBeVisible()
    await expect(page.getByText('PICKUP DETAIL &').first()).toBeVisible()
    await expect(page.getByText('SCHEDULE').first()).toBeVisible()
  })

  test('awaiting_input card shows Start button', async ({ page }) => {
    await page.route('**/api/order-hub/progress**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOrderHubProgress),
      }),
    )
    await page.goto(DASHBOARD_URL)
    // Cards with awaiting_input status show "Start →" button
    await expect(page.getByText('AWAITING INPUT').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Start →').first()).toBeVisible()
  })

  test('completed card shows Edit button', async ({ page }) => {
    await page.route('**/api/order-hub/progress**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOrderHubProgressWithCompleted),
      }),
    )
    await page.goto(DASHBOARD_URL)
    await expect(page.getByText('COMPLETED').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Edit →').first()).toBeVisible()
  })

  test('locked card shows wait message', async ({ page }) => {
    await page.route('**/api/order-hub/progress**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOrderHubProgress),
      }),
    )
    await page.goto(DASHBOARD_URL)
    await expect(page.getByText('LOCKED').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Wait for another form/i).first()).toBeVisible()
  })

  test('shows Download Packing List and Book My Order buttons', async ({ page }) => {
    await page.route('**/api/order-hub/progress**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOrderHubProgress),
      }),
    )
    await page.goto(DASHBOARD_URL)
    await expect(page.getByText('Download Packing List')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: 'Book My Order' })).toBeVisible()
  })

  test('Download Packing List is enabled when can_download_packing_list is true', async ({ page }) => {
    await page.route('**/api/order-hub/progress**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...mockOrderHubProgress, can_download_packing_list: true }),
      }),
    )
    await page.goto(DASHBOARD_URL)
    const downloadBtn = page.locator('button', { hasText: 'Download Packing List' })
    await expect(downloadBtn).toBeVisible({ timeout: 10000 })
    // Button should not be disabled when download is allowed
    await expect(downloadBtn).not.toBeDisabled()
  })

  test('clicking active step card navigates to that step page', async ({ page }) => {
    await page.route('**/api/order-hub/progress**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOrderHubProgress),
      }),
    )
    await page.goto(DASHBOARD_URL)
    // Wait for cards to be visible
    await expect(page.getByText('Start →').first()).toBeVisible({ timeout: 10000 })
    // Click "Start →" on the first awaiting_input card (Customer Information)
    await page.getByText('Start →').first().click()
    await expect(page).toHaveURL(new RegExp(`order-hub/${BOOKING_CODE}/customer-information`), { timeout: 5000 })
  })
})
