import { test, expect } from '@playwright/test'
import { resetDB } from './utils'

// Basic smoke + a11y-friendly locators
// Uses official Playwright locators and roles

test.describe('Home', () => {
  test('renders header, tabs and empty state', async ({ page }) => {
    await resetDB(page)
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Flipcard' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add Card' })).toBeVisible()

    // Tabs
    const tablist = page.getByRole('tablist')
    await expect(tablist).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Single' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible()

    // Empty state
    await expect(
      page.getByText('No cards yet. Tap "Add Card" to create your first one.')
    ).toBeVisible()
  })
})
