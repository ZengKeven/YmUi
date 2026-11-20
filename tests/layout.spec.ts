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
