import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixture/badge.html')
})

test('zero, capped numeric strings and text update the visible badge', async ({ page }) => {
  const anchor = page.locator('#messages')
  const mark = anchor.locator('.ym-badge__mark')
  const count = page.getByLabel('徽标内容')
  await expect(page.locator('#default-badge')).toHaveText('收件箱')
  await expect(anchor.getByRole('button', { name: '消息' })).toBeVisible()
  await expect(mark).toHaveCount(0)
  await count.fill('99')
  await expect(mark).toHaveText('99')
  await count.fill('100')
  await expect(mark).toHaveText('99+')
  await page.getByLabel('封顶值').fill('9')
  await expect(mark).toHaveText('9+')
  await count.fill('售罄')
  await expect(mark).toHaveText('售罄')
  await count.fill('0')
  await expect(mark).toHaveCount(0)
  await page.getByLabel('显示零值').check()
  await expect(mark).toHaveText('0')
  await page.getByLabel('圆点模式').check()
  await expect(mark).toBeVisible()
  await expect(mark).toBeEmpty()
  const { width, height } = (await mark.boundingBox())!
  expect(width).toBe(height)
  await page.getByLabel('显示零值').uncheck()
  await expect(mark).toHaveCount(0)
})

test('anchor and count slots take priority, and a standalone badge occupies space', async ({ page }) => {
  const named = page.locator('#content-slot')
  await expect(named.locator('b')).toHaveText('待办')
  await expect(named).not.toContainText('属性正文')
  await expect(named.locator('.ym-badge__mark')).toHaveText('99+')
  const custom = page.locator('#count-slot')
  await expect(custom.getByRole('button', { name: '审批' })).toBeVisible()
  await expect(custom).not.toContainText('备用正文')
  await expect(custom).not.toContainText('属性正文')
  await expect(custom.locator('.ym-badge__mark strong')).toHaveText('待处理')
  await page.getByLabel('圆点模式').check()
  await expect(custom.locator('.ym-badge__mark')).toBeVisible()
  await expect(custom.locator('.ym-badge__mark')).toBeEmpty()
  const standalone = page.locator('#standalone .ym-badge')
  await expect(standalone).toHaveText('NEW')
  const { width, height } = (await standalone.boundingBox())!
  expect(width).toBeGreaterThan(0)
  expect(height).toBeGreaterThan(0)
})

test('the badge sits on the top right of its anchor and respects both offset units', async ({ page }) => {
  await page.getByLabel('徽标内容').fill('1')
  const host = page.locator('#messages')
  const mark = host.locator('.ym-badge__mark')
  for (const shifted of [false, true]) {
    await page.getByLabel('移动角标').setChecked(shifted)
    const anchor = (await host.boundingBox())!
    const badge = (await mark.boundingBox())!
    expect(badge.x + badge.width / 2).toBeCloseTo(anchor.x + anchor.width - (shifted ? 10 : 0), 1)
    expect(badge.y + badge.height / 2).toBeCloseTo(anchor.y - (shifted ? 8 : 0), 1)
  }
})

test('nested badge palettes, rounding and size react without resizing the anchor', async ({ page }) => {
  const mark = page.locator('#inherited .ym-badge__mark')
  const local = page.locator('#local .ym-badge__mark')
  await expect(mark).toHaveCSS('background-color', 'rgb(165, 23, 57)')
  await expect(mark).toHaveCSS('color', 'rgb(255, 248, 239)')
  await expect(mark).toHaveCSS('border-radius', '3px')
  await page.getByLabel('浅色警示色').fill('#3b315d')
  await expect(mark).toHaveCSS('background-color', 'rgb(59, 49, 93)')
  await page.getByLabel('深色模式').check()
  await expect(mark).toHaveCSS('background-color', 'rgb(239, 154, 171)')
  await expect(mark).toHaveCSS('color', 'rgb(36, 19, 32)')
  await page.getByLabel('直角').check()
  await expect(mark).toHaveCSS('border-radius', '0px')
  await expect(local).toHaveCSS('background-color', 'rgb(40, 85, 160)')
  await expect(local).not.toHaveCSS('border-radius', '0px')

  const localHeight = (await local.boundingBox())!.height
  let previous = 0
  for (const size of ['extra-small', 'small', 'medium', 'large']) {
    await page.getByLabel('全局尺寸').selectOption(size)
    const inheritedHeight = (await mark.boundingBox())!.height
    expect(inheritedHeight).toBeGreaterThan(previous)
    expect((await local.boundingBox())!.height).toBe(localHeight)
    if (size === 'small') expect(inheritedHeight).toBe(localHeight)
    const inheritedButton = (await page.getByRole('button', { name: '继承尺寸' }).boundingBox())!
    const slottedButton = (await page.getByRole('button', { name: '局部尺寸' }).boundingBox())!
    expect(slottedButton.height).toBe(inheritedButton.height)
    previous = inheritedHeight
  }
})
