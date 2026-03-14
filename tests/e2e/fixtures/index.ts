import { test as base } from '@playwright/test'

type MockApiOptions = {
  status?: number
  headers?: Record<string, string>
}

type MockApiFn = (
  path: string,
  body: unknown,
  options?: MockApiOptions,
) => Promise<void>

/**
 * Extended test fixture with a shared `mockApi` helper.
 *
 * Usage:
 *   import { test, expect } from '../fixtures'
 *   test('my test', async ({ page, mockApi }) => {
 *     await mockApi('rates', { rates: [] })
 *     await page.goto('/')
 *   })
 */
export const test = base.extend<{ mockApi: MockApiFn }>({
  mockApi: async ({ page }, use) => {
    await use(async (path, body, options = {}) => {
      const { status = 200, headers = {} } = options
      await page.route(`**/api/${path}`, (route) =>
        route.fulfill({
          status,
          contentType: 'application/json',
          headers,
          body: JSON.stringify(body),
        }),
      )
    })
  },
})

export { expect } from '@playwright/test'
