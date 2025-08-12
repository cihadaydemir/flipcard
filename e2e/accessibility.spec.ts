import { test, expect } from '@playwright/test'
import { resetDB, addCard } from './utils'

// Accessibility-focused smoke checks using Playwright roles and AX snapshot

test.describe('Accessibility', () => {
  test('key controls are named and images are labeled', async ({ page }) => {
    await resetDB(page)
    await page.goto('/')

    // Header landmarks
    await expect(page.getByRole('heading', { name: 'Flipcard' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add Card' })).toBeVisible()

    // Tabs
    await expect(page.getByRole('tablist')).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Single' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible()

    // Add one card to validate image alt names
    await addCard(page, ['A11y'])

    // Go to Single view to ensure a single card is visible
    await page.getByRole('tab', { name: 'Single' }).click()

    // Ensure images have accessible names (from alt)
    await expect(page.getByAltText('Side A')).toBeVisible()
    await page.getByAltText('Side A').click()
    await expect(page.getByAltText('Side B')).toBeVisible()

    // AX snapshot checks: no image nodes with empty names
    const axTree = await page.accessibility.snapshot()
    function anyImgWithoutName(node: any): boolean {
      if (!node) return false
      const hasIssue = node.role === 'img' && (!node.name || String(node.name).trim() === '')
      return (
        hasIssue ||
        (Array.isArray(node.children) && node.children.some((c: any) => anyImgWithoutName(c)))
      )
    }
    expect(anyImgWithoutName(axTree)).toBeFalsy()
  })
})
