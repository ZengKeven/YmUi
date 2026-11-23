import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixture/')
})

test('a tag renders its label and icon and names the close button after the visible slot', async ({ page }) => {
  const plain = page.locator('#tag-plain')
  await expect(plain).toHaveText('草稿')
  await expect(plain.getByRole('button')).toHaveCount(0)
  const slotted = page.locator('#tag-slot')
  await expect(slotted.locator('strong')).toHaveText('待审核')
  await expect(slotted).not.toContainText('备用文案')
  await expect(slotted.locator('svg[data-name="success"]')).toBeVisible()
  await expect(slotted.getByRole('button')).toHaveAccessibleName(/移除.*待审核/)
  await page.getByLabel('标签文案').fill('已审核')
  await expect(slotted.getByRole('button')).toHaveAccessibleName(/移除.*已审核/)
})

test('closing a tag emits one mouse event, respects disabled and lets its owner remove it', async ({ page }) => {
  const close = page.getByRole('button', { name: '移除库存状态' })
  const events = page.locator('#tag-events')
  await close.click()
  await expect(events).toHaveText('1/0/0')
  await expect(close).toBeVisible()
  await page.getByLabel('禁用库存标签').check()
  await expect(close).toBeDisabled()
  await close.click({ force: true })
  await expect(events).toHaveText('1/0/0')
  await page.getByLabel('禁用库存标签').uncheck()
  await close.press('Space')
  await expect(events).toHaveText('2/0/0')
  await page.getByLabel('关闭时移除库存标签').check()
  await close.press('Enter')
  await expect(events).toHaveText('3/0/0')
  await expect(close).toHaveCount(0)
})

test('tags inherit live size, mode, palette and radius while an explicit size takes precedence', async ({ page }) => {
  const tag = page.locator('#tag-inherited')
  const local = page.locator('#tag-explicit')
  await expect(tag).toHaveCSS('background-color', 'rgb(18, 101, 71)')
  await expect(tag).toHaveCSS('color', 'rgb(249, 243, 238)')
  await expect(tag).toHaveCSS('border-radius', '9px')
  await page.getByLabel('标签浅色主色').fill('#773355')
  await expect(tag).toHaveCSS('background-color', 'rgb(119, 51, 85)')
  await page.getByLabel('标签深色模式').check()
  await expect(tag).toHaveCSS('background-color', 'rgb(154, 190, 239)')
  await expect(tag).toHaveCSS('color', 'rgb(16, 32, 48)')
  await page.getByLabel('标签直角').check()
  await expect(tag).toHaveCSS('border-radius', '0px')
  await expect(local).toHaveCSS('border-radius', '0px')

  const localHeight = await local.evaluate(el => el.getBoundingClientRect().height)
  const heights: number[] = []
  for (const size of ['extra-small', 'small', 'medium', 'large']) {
    await page.getByLabel('标签全局尺寸').selectOption(size)
    heights.push(await tag.evaluate(el => el.getBoundingClientRect().height))
    expect(await local.evaluate(el => el.getBoundingClientRect().height)).toBe(localHeight)
  }
  expect(heights[1]).toBe(localHeight)
  for (let i = 1; i < heights.length; i++) expect(heights[i]).toBeGreaterThan(heights[i - 1])
})
