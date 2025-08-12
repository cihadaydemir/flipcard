import { test, expect } from '@playwright/test'
import { resetDB, addCard } from './utils'

// Covers tag filtering via header badges and editing tags via card dialog

test.describe('Filtering and editing tags', () => {
  test('filter by tag from header and clear', async ({ page }) => {
    await resetDB(page)
    await page.goto('/')

    // Add two cards with different tags
    await addCard(page, ['Animals'])
    await addCard(page, ['Food'])

    // Ensure we are in Overview view and see two cards
    await page.getByRole('tab', { name: 'Overview' }).click()
    await expect(page.getByRole('button', { name: 'Delete card' })).toHaveCount(2)

    // Filter by "Animals" using header badge
    await page.locator('header').getByText('Animals').click()
    await expect(page.getByRole('button', { name: 'Delete card' })).toHaveCount(1)

    // Clear filter
    await page.getByRole('button', { name: 'Clear' }).click()
    await expect(page.getByRole('button', { name: 'Delete card' })).toHaveCount(2)
  })

  test('edit tags in card dialog', async ({ page }) => {
    await resetDB(page)
    await page.goto('/')

    await addCard(page, ['Alpha'])

    // Open edit dialog on the card (Overview view)
    await page.getByRole('tab', { name: 'Overview' }).click()
    await page.getByRole('button', { name: 'Edit tags' }).click()

    const dialog = page.getByRole('dialog', { name: 'Edit tags' })
    await expect(dialog).toBeVisible()

    await dialog.getByPlaceholder('Add a tag').fill('NewTag')
    await dialog.getByRole('button', { name: 'Add' }).click()
    await dialog.getByRole('button', { name: 'Save' }).click()

    // Header should now include NewTag badge
    await expect(page.locator('header').getByText('NewTag')).toBeVisible()

    // Card overlay badges should also show the tag (case-sensitive match)
    await expect(page.locator('main').getByText('NewTag')).toBeVisible()
  })
})
