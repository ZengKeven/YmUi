import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixture/')
})

test('a tag renders its label and icon and names the close button after the visible slot', async ({ page }) => {
  const plain = page.locator('#tag-plain')
  await expect(plain).toHaveText('草稿')
  await expect(plain).toHaveCSS('height', '24px')
  await expect(plain).toHaveCSS('font-size', '12px')
  await expect(plain).toHaveCSS('border-radius', '0px')
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

test('max width constrains the whole tag and leaves its icon and close action available', async ({ page }) => {
  const tag = page.locator('#tag-limited')
  await expect(tag).toHaveCSS('width', '120px')
  await page.getByLabel('标签限宽').selectOption({ label: '像素' })
  await expect(tag).toHaveCSS('width', '96px')
  await page.getByLabel('标签限宽').selectOption('75%')
  await expect(tag).toHaveCSS('width', '90px')
  const text = tag.locator('.ym-tag__text')
  await expect(text).toHaveCSS('text-overflow', 'ellipsis')
  expect(await text.evaluate(el => el.clientWidth > 0 && el.scrollWidth > el.clientWidth)).toBe(true)
  await expect(tag.locator('svg[data-name="warehouse"]')).toBeVisible()
  await tag.getByRole('button', { name: '移除库存状态' }).click()
  await expect(page.locator('#tag-events')).toHaveText('1/0/0')
})

test('tag shapes keep their geometry when the provider radius changes', async ({ page }) => {
  const square = page.locator('#tag-inherited')
  const round = page.locator('#tag-round')
  const mark = page.locator('#tag-explicit')
  for (const flat of [false, true]) {
    await page.getByLabel('全局直角', { exact: true }).setChecked(flat)
    await expect(square).toHaveCSS('border-radius', '0px')
    await expect(square.getByRole('button')).toHaveCSS('border-radius', flat ? '0px' : '9px')
    for (const [tag, expected] of [[round, [1, 1, 1, 1]], [mark, [0, 1, 1, 0]]] as const) {
      const corners = await tag.evaluate(el => {
        const style = getComputedStyle(el)
        const radius = el.getBoundingClientRect().height / 2
        return [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius]
          .map(value => Math.min(1, parseFloat(value) / (value.endsWith('%') ? 50 : radius)))
      })
      expect(corners).toEqual(expected)
    }
  }
})

test('tags inherit live size, mode and palette while an explicit size takes precedence', async ({ page }) => {
  const tag = page.locator('#tag-inherited')
  const local = page.locator('#tag-explicit')
  await expect(tag).toHaveCSS('background-color', 'rgb(18, 101, 71)')
  await expect(tag).toHaveCSS('color', 'rgb(249, 243, 238)')
  await page.getByLabel('标签浅色主色').fill('#773355')
  await expect(tag).toHaveCSS('background-color', 'rgb(119, 51, 85)')
  await page.getByLabel('标签深色模式').check()
  await expect(tag).toHaveCSS('background-color', 'rgb(154, 190, 239)')
  await expect(tag).toHaveCSS('color', 'rgb(16, 32, 48)')

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
