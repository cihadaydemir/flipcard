import { expect, type Page } from '@playwright/test'
import path from 'node:path'

export async function resetDB(page: Page) {
  // Ensure we are on the origin, then clear IndexedDB used by the app
  await page.goto('/')
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('flipcard-db')
      req.onsuccess = () => resolve()
      req.onerror = () => resolve()
      req.onblocked = () => resolve()
    })
  })
  await page.reload()
}

const FIXTURE_BASE = path.join(process.cwd(), 'e2e', 'fixtures')
const FIXTURES = {
  a: path.join(FIXTURE_BASE, 'side-a.svg'),
  b: path.join(FIXTURE_BASE, 'side-b.svg'),
}

export async function addCard(page: Page, tags: string[] = []) {
  // Ensure we are on Overview to make the card count assertion deterministic
  await page.getByRole('tab', { name: 'Overview' }).click().catch(() => {})
  const deleteButtons = page.getByRole('button', { name: 'Delete card' })
  const beforeCount = await deleteButtons.count()

  await page.getByRole('button', { name: 'Add Card' }).click()
  await page.getByRole('dialog', { name: 'Add a new card' }).waitFor({ state: 'visible' })

  await page.locator('#sideA').setInputFiles(FIXTURES.a)
  await page.locator('#sideB').setInputFiles(FIXTURES.b)

  for (const t of tags) {
    await page.locator('#tags').fill(t)
    await page.getByRole('button', { name: 'Add' }).click()
  }

  await page.getByRole('button', { name: 'Save' }).click()
  await page.getByRole('dialog', { name: 'Add a new card' }).waitFor({ state: 'hidden' })

  // Wait until a new card appears in the grid
  await expect(deleteButtons).toHaveCount(beforeCount + 1)
}
