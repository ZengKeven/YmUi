import { expect, test, type Locator } from '@playwright/test'

async function expectAreas(layout: Locator, asideWidth: number, headerHeight: number) {
  const aside = layout.locator('aside')
  await expect(aside).toHaveCSS('width', `${asideWidth}px`)

  const { x, y, width, height } = (await layout.boundingBox())!
  expect(await aside.boundingBox()).toEqual({ x, y, width: asideWidth, height })
  expect(await aside.locator('.ym-layout__brand').boundingBox()).toMatchObject({ y, height: headerHeight })
  expect(await layout.locator('header').boundingBox()).toEqual({
    x: x + asideWidth, y, width: width - asideWidth, height: headerHeight,
  })
  expect(await layout.locator('main').boundingBox()).toEqual({
    x: x + asideWidth, y: y + headerHeight, width: width - asideWidth, height: height - headerHeight,
  })
}

test('the sidebar collapses to its configured width and the content fills the remaining space', async ({ page }) => {
  await page.goto('/tests/fixture/')
  const layout = page.locator('#layout')
  const aside = layout.locator('aside')
  const logo = aside.locator('img')
  const name = aside.getByText('库存管理', { exact: true })
  const button = aside.getByRole('button')
  await expect(layout).toHaveCSS('width', '800px')
  await expect(layout).toHaveCSS('height', '300px')
  await expectAreas(layout, 232, 48)
  await expect(logo).toBeVisible()
  await expect(name).toBeVisible()
  await expect(aside.getByText('完整导航')).toBeVisible()
  await expect(layout.locator('header')).toHaveText('工作台')
  await expect(layout.locator('main')).toHaveText('库存清单')
  await expect(button).toHaveAccessibleName('收起侧栏')
  await expect(button).toHaveAttribute('aria-expanded', 'true')
  const side = (await aside.boundingBox())!
  const toggle = (await button.boundingBox())!
  const rightGap = side.x + side.width - toggle.x - toggle.width
  const bottomGap = side.y + side.height - toggle.y - toggle.height
  expect(rightGap).toBeGreaterThanOrEqual(0)
  expect(rightGap).toBeLessThanOrEqual(toggle.width)
  expect(bottomGap).toBeGreaterThanOrEqual(0)
  expect(bottomGap).toBeLessThanOrEqual(toggle.height)

  await button.click()
  await expectAreas(layout, 56, 48)
  await expect(logo).toBeVisible()
  await expect(name).toBeHidden()
  await expect(aside.getByText('简洁导航')).toBeVisible()
  await expect(button).toHaveAccessibleName('展开侧栏')
  await expect(button).toHaveAttribute('aria-expanded', 'false')

  await button.press('Enter')
  await expectAreas(layout, 232, 48)
  await expect(name).toBeVisible()
  await expect(aside.getByText('完整导航')).toBeVisible()
})

test('a controlled sidebar requests each change once and follows its parent and custom dimensions', async ({ page }) => {
  await page.goto('/tests/fixture/')
  const layout = page.locator('#controlled-layout')
  const button = layout.getByRole('button')
  const parentControl = page.getByLabel('外部收起侧栏')
  const requests = page.locator('#layout-requests')

  await expectAreas(layout, 48, 64)
  await button.click()
  await expect(requests).toHaveText('false')
  await expect(button).toHaveAttribute('aria-expanded', 'false')

  await parentControl.uncheck()
  await expectAreas(layout, 260, 64)
  await expect(button).toHaveAttribute('aria-expanded', 'true')
  await button.press('Space')
  await expect(requests).toHaveText('false,true')
  await expect(button).toHaveAttribute('aria-expanded', 'true')
  await parentControl.check()
  await expectAreas(layout, 48, 64)
  await expect(requests).toHaveText('false,true')
})

test('watermarks support live multiline text, literal special characters and a system-name fallback', async ({ page }) => {
  await page.goto('/tests/fixture/')
  const watermark = page.locator('#controlled-layout .ym-layout__watermark')
  const lines = watermark.locator('pattern tspan')
  const toggle = page.getByLabel('内容区水印')
  await expect(page.locator('#layout .ym-layout__watermark')).toHaveCount(0)
  await expect(watermark).toHaveCount(0)
  await toggle.check()
  await expect(lines).toHaveText(['采购管理'])
  await expect(watermark).toHaveAttribute('aria-hidden', 'true')
  await page.getByLabel('水印系统名称').fill('')
  await expect(lines).toHaveText(['内部使用'])

  const field = page.getByLabel('自定义水印')
  await field.fill('验收记录\n经手人 王一')
  await expect(lines).toHaveText(['验收记录', '经手人 王一'])
  await page.getByRole('button', { name: '使用数组水印' }).click()
  await expect(lines).toHaveText(['内部资料', '仓库 <A> & B'])
  const baselines = await lines.evaluateAll(nodes =>
    nodes.map(node => (node as SVGTSpanElement).getStartPositionOfChar(0).y))
  expect(baselines[1]).toBeGreaterThan(baselines[0])
  await toggle.uncheck()
  await expect(watermark).toHaveCount(0)
  await toggle.check()
  await expect(lines).toHaveText(['内部资料', '仓库 <A> & B'])
  await field.fill('')
  await expect(watermark).toHaveCount(0)
})

test('the watermark stays over the main viewport during scrolling and lets content receive input', async ({ page }) => {
  await page.goto('/tests/fixture/')
  const layout = page.locator('#controlled-layout')
  const main = layout.getByRole('main')
  const watermark = layout.locator('.ym-layout__watermark')
  await page.getByLabel('内容区水印').check()
  await expect(watermark).toBeVisible()
  await expect(watermark).toHaveCSS('pointer-events', 'none')
  expect(await watermark.boundingBox()).toEqual(await main.boundingBox())
  const field = main.getByLabel('库存筛选')
  await field.click()
  await expect(field).toBeFocused()
  await page.keyboard.type('ITEM-01')
  await expect(field).toHaveValue('ITEM-01')

  const offsets = await main.evaluate(el => {
    el.scrollTo(160, 200)
    return [el.scrollLeft, el.scrollTop]
  })
  expect(offsets).toEqual([160, 200])
  expect(await watermark.boundingBox()).toEqual(await main.boundingBox())
  await page.getByLabel('外部收起侧栏').uncheck()
  await expectAreas(layout, 260, 64)
  expect(await watermark.boundingBox()).toEqual(await main.boundingBox())
  await page.getByLabel('内容区水印').uncheck()
  expect(await main.evaluate(el => [el.scrollLeft, el.scrollTop])).toEqual(offsets)
  await expect(field).toHaveValue('ITEM-01')
})
