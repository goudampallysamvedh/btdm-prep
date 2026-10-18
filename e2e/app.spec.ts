import { expect, test } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const ROUTES = [
  '', 'progress', 'exam', 'exam/practice?mode=smart&count=5', 'exam/mock', 'cards', 'math', 'math/markup', 'math/six-month-plan',
  'learn', 'learn/guide', 'learn/guide/PM', 'learn/lessons', 'learn/lessons/vendors', 'learn/lessons/risk', 'learn/visual/plc', 'learn/visual/markdown-timing',
  'learn/trends', 'learn/trends/collabs', 'learn/videos', 'learn/playbook', 'learn/pis', 'cards?deck=pi&pif=case', 'cases', 'cases/hallway-threads', 'cases/hallway-threads?tab=plan',
  'cases/hallway-threads?tab=score', 'cases/hallway-threads?tab=timer', 'cases/judge', 'sync', 'sync?tab=me', 'settings',
]

mkdirSync('screenshots', { recursive: true })

for (const theme of ['light', 'dark'] as const) {
  test.describe(`every screen (${theme})`, () => {
    test.use({ colorScheme: theme })
    for (const r of ROUTES) {
      test(`/${r || 'home'}`, async ({ page }, info) => {
        const errors: string[] = []
        page.on('pageerror', (e) => errors.push(e.message))
        page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
        await page.goto(`#/${r}`)
        await expect(page.locator('main h1').first()).toBeVisible({ timeout: 15_000 })
        // No horizontal page scroll at this width.
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(overflow, `horizontal overflow on /${r}`).toBeLessThanOrEqual(1)
        expect(errors, errors.join('\n')).toEqual([])
        if (theme === 'light' || r === '' || r === 'cases/hallway-threads') {
          await page.screenshot({ path: `screenshots/${info.project.name}-${theme}-${(r || 'home').replace(/[/?=&]/g, '_')}.png`, fullPage: !r.startsWith('learn/pis') })
        }
      })
    }
  })
}

test('practice flow produces a report card', async ({ page }) => {
  await page.goto('#/exam/practice?mode=smart&count=3')
  for (let i = 0; i < 3; i++) {
    await page.getByRole('radio').first().click()
    await expect(page.getByRole('status').first()).toBeVisible()
    const btn = i < 2 ? page.getByRole('button', { name: /next/i }) : page.getByRole('button', { name: /see my report/i })
    await btn.click()
  }
  await expect(page.getByRole('heading', { name: /report/i })).toBeVisible()
  await expect(page.getByText(/What you learned and what's next/i)).toBeVisible()
})

test('math generator checks an answer and shows steps', async ({ page }) => {
  await page.goto('#/math/markup')
  await page.getByRole('textbox', { name: /your answer/i }).fill('1')
  await page.getByRole('button', { name: /^check$/i }).click()
  await expect(page.getByText(/The answer is|Correct:/)).toBeVisible()
  await expect(page.locator('ol li').first()).toBeVisible()
})

test('works offline after the first load', async ({ page, context }) => {
  await page.goto('')
  await expect(page.locator('main h1').first()).toBeVisible()
  // Wait for the service worker to install and take control.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 20_000 })
  await context.setOffline(true)
  await page.reload()
  await expect(page.locator('main h1').first()).toBeVisible()
  // Lazy-loaded screens must come from the precache too.
  for (const r of ['cards', 'cases/northline', 'math/otb', 'learn/visual/channels', 'exam']) {
    await page.goto(`#/${r}`)
    await expect(page.locator('main h1').first()).toBeVisible()
  }
  await context.setOffline(false)
})

test('my-devices sync copies progress to a second device', async ({ page, browser }) => {
  // Device 1: answer a short practice set, then make a sync code.
  await page.goto('#/exam/practice?mode=smart&count=2')
  for (let i = 0; i < 2; i++) {
    await page.getByRole('radio').first().click()
    await page.getByRole('button', { name: i < 1 ? /next/i : /see my report/i }).click()
  }
  await expect(page.getByRole('heading', { name: /report/i })).toBeVisible()
  await page.goto('#/sync?tab=me')
  await expect(page.getByText(/holds all your progress: 1 test,/)).toBeVisible()
  await page.getByRole('button', { name: /make my sync code/i }).click()
  const code = await page.getByLabel('Sync code', { exact: true }).inputValue()
  expect(code.startsWith('ST1.')).toBe(true)

  // Device 2: a fresh browser with no progress.
  const other = await browser.newContext()
  const page2 = await other.newPage()
  await page2.goto(page.url())
  await expect(page2.getByText(/holds all your progress: 0 tests,/)).toBeVisible()
  await page2.getByLabel('Paste a sync code').fill(code)
  await page2.getByRole('button', { name: /check code/i }).click()
  await page2.getByRole('button', { name: /combine with this device/i }).click()
  await expect(page2.getByText(/1 test added/)).toBeVisible()
  await page2.waitForTimeout(500)
  await page2.reload()
  await expect(page2.getByText(/holds all your progress: 1 test,/)).toBeVisible()
  await other.close()
})
