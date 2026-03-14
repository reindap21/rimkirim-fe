import { test, expect } from './fixtures'
import { mockRatesResponse } from './fixtures/api-mocks'

test.describe('Home page', () => {
  test('has correct page title', async ({ page }) => {
    await page.route('**/api/rates**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRatesResponse) }),
    )
    await page.goto('/')
    await expect(page).toHaveTitle(/Rimkirim/)
  })

  test('shows hero heading', async ({ page }) => {
    await page.route('**/api/rates**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRatesResponse) }),
    )
    await page.goto('/')
    await expect(page.getByText('INTERNATIONAL MOVING ASSISTANT')).toBeVisible()
  })

  test('shows header logo', async ({ page }) => {
    await page.route('**/api/rates**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRatesResponse) }),
    )
    await page.goto('/')
    // The logo is inside a NuxtLink with class "brand-logo"
    await expect(page.locator('.brand-logo')).toBeVisible()
  })

  test('shows Login button when not authenticated', async ({ page }) => {
    await page.route('**/api/rates**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRatesResponse) }),
    )
    // Session returns user: null — same as real endpoint when no auth cookie
    await page.route('**/api/auth/session**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: null, authenticated: false }) }),
    )
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })

  test('loads special rate cards from API mock', async ({ page }) => {
    await page.route('**/api/rates**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRatesResponse) }),
    )
    await page.goto('/')
    // Wait for rate cards to load (skeleton replaced by actual cards)
    await expect(page.getByRole('button', { name: 'Move Now' }).first()).toBeVisible({ timeout: 10000 })
  })

  test('rate cards show price and ETA', async ({ page }) => {
    await page.route('**/api/rates**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRatesResponse) }),
    )
    await page.goto('/')
    await page.waitForSelector('[class*="text-[32px]"]', { timeout: 10000 })
    // Price is formatted as IDR 1,500,000 / Kg
    await expect(page.getByText(/IDR/)).toBeVisible()
    // ETA days shown as "14 - 21D"
    await expect(page.getByText(/14 - 21D/)).toBeVisible()
  })

  test('shows footer', async ({ page }) => {
    await page.route('**/api/rates**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRatesResponse) }),
    )
    await page.goto('/')
    await expect(page.locator('footer')).toBeVisible()
    await expect(page.getByText(/Let's ship more than/)).toBeVisible()
  })

  test('clicking Move Now on rate card opens auth modal when not logged in', async ({ page }) => {
    await page.route('**/api/rates**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRatesResponse) }),
    )
    await page.goto('/')
    // Wait for rate card to be visible
    const moveNowBtn = page.getByRole('button', { name: 'Move Now' }).first()
    await expect(moveNowBtn).toBeVisible({ timeout: 10000 })
    await moveNowBtn.click()
    // Auth modal should open
    await expect(page.locator('#modal-auth')).toBeVisible()
  })
})
