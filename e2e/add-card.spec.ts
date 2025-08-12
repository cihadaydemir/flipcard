import { test, expect } from '@playwright/test'
import { resetDB, addCard } from './utils'

test.describe('Add Card flow', () => {
  test('add, view in overview and single, flip and delete', async ({ page }) => {
    await resetDB(page)
    await page.goto('/')

    // Initially empty
    await expect(page.getByText('No cards yet. Tap "Add Card" to create your first one.')).toBeVisible()

    // Add a card with a tag
    await addCard(page, ['Animals'])

    // Overview view should show one card
    await expect(page.getByRole('button', { name: 'Delete card' })).toHaveCount(1)
    await expect(page.locator('main').getByText('Animals')).toBeVisible()

    // Switch to Single view and verify controls
    await page.getByRole('tab', { name: 'Single' }).click()
    await expect(page.getByRole('button', { name: 'Previous card' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Toggle shuffle' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Next card' })).toBeVisible()

    // Flip card: Side A visible first, then Side B after click
    await expect(page.getByAltText('Side A')).toBeVisible()
    await page.getByAltText('Side A').click()
    await expect(page.getByAltText('Side B')).toBeVisible()

    // Delete
    await page.getByRole('button', { name: 'Delete card' }).click()
    await expect(page.getByText('No cards yet. Tap "Add Card" to create your first one.')).toBeVisible()
  })
})
