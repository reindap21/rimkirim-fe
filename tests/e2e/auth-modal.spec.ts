import { test, expect } from './fixtures'
import { mockLoginResponse, mockRegisterResponse, mockRatesResponse } from './fixtures/api-mocks'

/** Open the auth modal via the Login button in the header */
async function openAuthModal(page: import('@playwright/test').Page) {
  await page.route('**/api/rates**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRatesResponse) }),
  )
  await page.goto('/')
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page.locator('#modal-auth')).toBeVisible()
}

test.describe('Auth modal', () => {
  test('modal is closed by default', async ({ page }) => {
    await page.route('**/api/rates**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRatesResponse) }),
    )
    await page.goto('/')
    await expect(page.locator('#modal-auth')).not.toBeVisible()
  })

  test('opens in login mode when Login button is clicked', async ({ page }) => {
    await openAuthModal(page)
    await expect(page.locator('#login')).toBeVisible()
    await expect(page.locator('#signup')).not.toBeVisible()
  })

  test('switches to signup mode via Sign Up link', async ({ page }) => {
    await openAuthModal(page)
    await page.getByText("Sign Up").click()
    await expect(page.locator('#signup')).toBeVisible()
    await expect(page.locator('#login')).not.toBeVisible()
  })

  test('switches back to login mode from signup via Login link', async ({ page }) => {
    await openAuthModal(page)
    // Go to signup first
    await page.locator('#login').getByText('Sign Up').click()
    await expect(page.locator('#signup')).toBeVisible()
    // Then switch back
    await page.locator('#signup').getByText('Login').click()
    await expect(page.locator('#login')).toBeVisible()
    await expect(page.locator('#signup')).not.toBeVisible()
  })

  test('login form shows validation errors on empty submit', async ({ page }) => {
    await openAuthModal(page)
    // Click submit without filling in
    await page.locator('#login').getByRole('button', { name: 'Login' }).click()
    // PrimeVue validate-on-submit — error messages should appear
    await expect(page.locator('#login').getByText(/required/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('login success closes modal and shows user name', async ({ page }) => {
    await page.route('**/api/rates**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRatesResponse) }),
    )
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockLoginResponse) }),
    )
    await page.goto('/')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.locator('#modal-auth')).toBeVisible()

    // Fill in credentials
    await page.locator('[name="email"]').fill('test@example.com')
    await page.locator('[name="password"]').fill('password123')
    await page.locator('#login').getByRole('button', { name: 'Login' }).click()

    // Modal should close
    await expect(page.locator('#modal-auth')).not.toBeVisible({ timeout: 5000 })
    // User's first name should appear in the header
    await expect(page.getByText('Test')).toBeVisible()
  })

  test('login error shows error message', async ({ page }) => {
    await page.route('**/api/rates**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRatesResponse) }),
    )
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      }),
    )
    await page.goto('/')
    await page.getByRole('button', { name: 'Login' }).click()

    await page.locator('[name="email"]').fill('wrong@example.com')
    await page.locator('[name="password"]').fill('wrongpassword')
    await page.locator('#login').getByRole('button', { name: 'Login' }).click()

    // Error message should appear
    await expect(page.locator('#login').getByText('Invalid credentials')).toBeVisible({ timeout: 5000 })
  })

  test('signup form shows validation errors on empty submit', async ({ page }) => {
    await openAuthModal(page)
    // Switch to signup
    await page.locator('#login').getByText('Sign Up').click()
    // Click submit without filling in
    await page.locator('#signup').getByRole('button', { name: 'Sign Up' }).click()
    // Validation errors should appear
    await expect(page.locator('#signup').getByText(/required|minimum/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('signup success closes modal', async ({ page }) => {
    await page.route('**/api/rates**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRatesResponse) }),
    )
    await page.route('**/api/auth/register', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRegisterResponse) }),
    )
    await page.goto('/')
    await page.getByRole('button', { name: 'Login' }).click()
    // Switch to signup
    await page.locator('#login').getByText('Sign Up').click()

    await page.locator('[name="name"]').fill('Test User')
    await page.locator('[name="email"]').fill('test@example.com')
    await page.locator('[name="password"]').nth(0).fill('password123')
    await page.locator('[name="password_confirmation"]').fill('password123')
    await page.locator('#signup').getByRole('button', { name: 'Sign Up' }).click()

    await expect(page.locator('#modal-auth')).not.toBeVisible({ timeout: 5000 })
  })

  test('close button dismisses modal', async ({ page }) => {
    await openAuthModal(page)
    // Find button that is not Login or Google-related — the X button is right after the logo
    await page.locator('#modal-auth > div > div > div button').click()
    await expect(page.locator('#modal-auth')).not.toBeVisible({ timeout: 3000 })
  })

  test('Google OAuth button is visible in login form', async ({ page }) => {
    await openAuthModal(page)
    await expect(page.locator('#login').getByRole('button', { name: /Login with Google/i })).toBeVisible()
  })

  test('Google OAuth button is visible in signup form', async ({ page }) => {
    await openAuthModal(page)
    await page.locator('#login').getByText('Sign Up').click()
    await expect(page.locator('#signup').getByRole('button', { name: /Sign Up with Google/i })).toBeVisible()
  })
})
