import { expect, test, type Locator } from '@playwright/test'

async function boxes(cells: Locator) {
  return cells.evaluateAll(elements => elements.map(element => {
    const { left, right, top, bottom, width, height } = element.getBoundingClientRect()
    return { left, right, top, bottom, width, height }
  }))
}

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixture/descriptions.html')
})

test('a description list pairs terms and definitions in two aligned columns by default', async ({ page }) => {
  const list = page.locator('dl#purchase')
  const terms = list.getByRole('term')
  const values = list.getByRole('definition')
  await expect(terms).toHaveText(['供应商', '机构', '日期', '仓库', '采购员'])
  await expect(values.first()).toHaveText('杭州青禾纸业有限公司')
  const [first, second, third] = await boxes(terms)
  const [value, , below] = await boxes(values)
  expect(first.top).toBe(second.top)
  expect(third.top).toBeGreaterThan(first.top)
  expect(third.left).toBe(first.left)
  expect(below.left).toBe(value.left)
  expect(value.width).toBeGreaterThan(first.width)
  expect(Math.abs(value.left - first.right)).toBeLessThanOrEqual(1.1)
  expect(Math.abs(second.left - value.right)).toBeLessThanOrEqual(1.1)
  expect(Math.abs(third.top - first.bottom)).toBeLessThanOrEqual(1.1)
})

test('a spanning item leaves room beside both rows and stays within a changed column count', async ({ page }) => {
  const list = page.locator('#purchase')
  const items = list.locator(':scope > div')
  await expect(items).toHaveCount(5)
  await page.getByLabel('列数', { exact: true }).fill('3')
  await page.getByLabel('占用列数').fill('2')
  await page.getByLabel('占用行数').fill('2')
  const [span, right, underneath, nextRow] = await boxes(items)
  expect(span.top).toBe(right.top)
  expect(right.left).toBe(underneath.left)
  expect(span.left).toBe(nextRow.left)
  expect(underneath.top).toBeGreaterThan(right.top)
  expect(span.bottom).toBe(underneath.bottom)
  expect(nextRow.top).toBeGreaterThan(span.bottom - 0.1)
  expect(Math.abs(span.width - right.width * 2)).toBeLessThan(3)
  const [label, neighbor] = await boxes(list.getByRole('term'))
  expect(Math.abs(label.width - neighbor.width)).toBeLessThan(1.1)

  await page.getByLabel('列数', { exact: true }).fill('1')
  await page.getByLabel('占用列数').fill('10')
  const [fullWidth, following] = await boxes(items)
  expect(fullWidth.width).toBe(following.width)
  expect(fullWidth.left).toBe(following.left)
  expect(following.top).toBeGreaterThan(fullWidth.bottom - 0.1)
  expect(await list.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)

  await page.getByLabel('列数', { exact: true }).fill('0')
  await page.getByLabel('占用列数').fill('-1')
  await page.getByLabel('占用行数').fill('0.5')
  const [reset, sameRow, below] = await boxes(items)
  expect(reset.top).toBe(sameRow.top)
  expect(reset.height).toBe(sameRow.height)
  expect(reset.left).toBe(below.left)
  expect(below.top).toBeGreaterThan(reset.top)
})

test('named and default slots override props and keep their content interactive', async ({ page }) => {
  const list = page.locator('#slots')
  await expect(list.getByRole('term')).toHaveText(['送货次数', '备注', '0'])
  await expect(list.getByRole('definition')).toHaveText(['送货 0', '优先收货', '0'])
  await list.getByRole('button', { name: '送货 0' }).click()
  await expect(list.getByRole('button', { name: '送货 1' })).toBeVisible()
  await expect(list.locator('dt b')).toHaveText('送货次数')
  await expect(list.locator('dd em')).toHaveText('优先收货')
})

test('nested providers update the visible palette, outer radius and density, with a local size override', async ({ page }) => {
  const list = page.locator('#inherited')
  const label = list.getByRole('term')
  const value = list.getByRole('definition')
  const localLabel = page.locator('#local dt')
  await expect(list).toHaveCSS('border-radius', '3px')
  await expect(list).toHaveCSS('border-top-color', 'rgb(168, 120, 74)')
  await expect(label).toHaveCSS('color', 'rgb(81, 45, 35)')
  await expect(value).toHaveCSS('background-color', 'rgb(255, 242, 227)')
  const labelBackground = await label.evaluate(el => getComputedStyle(el).backgroundColor)
  await page.getByLabel('浅色背景').fill('#eddabc')
  await expect(value).toHaveCSS('background-color', 'rgb(237, 218, 188)')
  await expect(label).not.toHaveCSS('background-color', labelBackground)
  await page.getByLabel('深色模式').check()
  await expect(value).toHaveCSS('background-color', 'rgb(42, 52, 64)')
  await expect(value).toHaveCSS('color', 'rgb(244, 237, 229)')
  await expect(list).toHaveCSS('border-top-color', 'rgb(104, 120, 139)')
  await page.getByLabel('直角').check()
  await expect(list).toHaveCSS('border-radius', '0px')

  const localHeight = (await localLabel.boundingBox())!.height
  let previousHeight = 0
  let previousFont = 0
  for (const size of ['extra-small', 'small', 'medium', 'large']) {
    await page.getByLabel('全局尺寸').selectOption(size)
    const height = (await label.boundingBox())!.height
    const font = await label.evaluate(el => parseFloat(getComputedStyle(el).fontSize))
    expect(height).toBeGreaterThan(previousHeight)
    expect(font).toBeGreaterThan(previousFont)
    expect((await localLabel.boundingBox())!.height).toBe(localHeight)
    if (size === 'small') expect(height).toBe(localHeight)
    previousHeight = height
    previousFont = font
  }
})
