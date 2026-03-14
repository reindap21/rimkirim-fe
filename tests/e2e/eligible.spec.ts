import { test, expect } from './fixtures'
import {
  mockEligibilityCheckResponse,
  mockBookingResponse,
  mockOrderHubProgress,
} from './fixtures/api-mocks'

const ELIGIBLE_URL = '/eligible?rateId=rate-001&origin=GB'
const BOOKING_CODE = 'BK-TEST-001'

/** Answer all eligibility questions (no packing list) to enable Continue */
async function answerAllQuestions(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle')
  // Q1: Are you shipping personal belongings to Indonesia? → Yes
  await page.locator('div').filter({ hasText: /Are you shipping personal belongings to Indonesia\?/ }).last().getByRole('button', { name: 'Yes' }).click()
  // Q2: Citizenship → Indonesian
  await page.getByRole('button', { name: 'Indonesian' }).click()
  // Q3: Have you lived abroad 12 months? → Yes
  await page.locator('div').filter({ hasText: /Have you lived in .* at least 12 Months/ }).last().getByRole('button', { name: 'Yes' }).click()
  // Q4: Can apply for SKP? → Yes
  await page.locator('div').filter({ hasText: /apply for SKP/ }).last().getByRole('button', { name: 'Yes' }).click()
  // Q5: Do you have a packing list code? → No
  await page.locator('div').filter({ hasText: /Rimkirim Packing List code/ }).last().getByRole('button', { name: 'No' }).click()
}

test.describe('Eligible page', () => {
  test('page loads with question form', async ({ page }) => {
    await page.goto(ELIGIBLE_URL)
    await expect(page.getByText("Let's start your International Moving!")).toBeVisible()
    await expect(page.getByText('Are you shipping personal belongings to Indonesia?')).toBeVisible()
  })

  test('shows all 5 eligibility questions', async ({ page }) => {
    await page.goto(ELIGIBLE_URL)
    await expect(page.getByText('Are you shipping personal belongings to Indonesia?')).toBeVisible()
    await expect(page.getByText('Which citizenship do you currently hold?')).toBeVisible()
    await expect(page.getByText(/Have you lived in .* at least 12 Months/i)).toBeVisible()
    await expect(page.getByText(/apply for SKP/i)).toBeVisible()
    await expect(page.getByText(/Rimkirim Packing List code/i)).toBeVisible()
  })

  test('Continue button is disabled when no answers are given', async ({ page }) => {
    await page.goto(ELIGIBLE_URL)
    const continueBtn = page.getByRole('button', { name: 'Continue' })
    await expect(continueBtn).toBeVisible()
    await expect(continueBtn).toBeDisabled()
  })

  test('Continue button is enabled after all questions are answered', async ({ page }) => {
    await page.goto(ELIGIBLE_URL)
    await answerAllQuestions(page)
    const continueBtn = page.getByRole('button', { name: 'Continue' })
    await expect(continueBtn).not.toBeDisabled()
  })

  test('submitting questions shows selection step', async ({ page }) => {
    await page.route('**/api/eligibility/check', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockEligibilityCheckResponse),
      }),
    )
    await page.goto(ELIGIBLE_URL)
    await answerAllQuestions(page)
    await page.getByRole('button', { name: 'Continue' }).click()

    // Selection step should be visible
    await expect(page.getByText('You are eligible to choose')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Skema Barang Pindahan')).toBeVisible()
    await expect(page.getByText('Skema Barang Penumpang')).toBeVisible()
  })

  test('selecting purpose creates booking and navigates to order hub', async ({ page }) => {
    await page.route('**/api/eligibility/check', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockEligibilityCheckResponse),
      }),
    )
    await page.route('**/api/booking', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBookingResponse),
      }),
    )
    // Mock progress so the order-hub dashboard doesn't make a real backend call
    // (which would hang the dev server and corrupt subsequent tests)
    await page.route('**/api/order-hub/progress**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOrderHubProgress),
      }),
    )
    await page.goto(ELIGIBLE_URL)
    await answerAllQuestions(page)
    await page.getByRole('button', { name: 'Continue' }).click()

    // Wait for selection step
    await expect(page.getByText('Skema Barang Penumpang')).toBeVisible({ timeout: 5000 })

    // Click Skema Barang Penumpang (always available)
    await page.getByText('Skema Barang Penumpang').click()

    // Should navigate to order hub page
    await expect(page).toHaveURL(new RegExp(`order-hub/${BOOKING_CODE}`), { timeout: 10000 })
  })

  test('API error on eligibility check does not advance step', async ({ page }) => {
    await page.route('**/api/eligibility/check', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server error' }),
      }),
    )
    await page.goto(ELIGIBLE_URL)
    await answerAllQuestions(page)
    await page.getByRole('button', { name: 'Continue' }).click()

    // Should still be on the question step (not selection step)
    await expect(page.getByText('Are you shipping personal belongings to Indonesia?')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('You are eligible to choose')).not.toBeVisible()
  })
})
