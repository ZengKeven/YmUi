import { expect, test, type Locator } from '@playwright/test'

const stars = (rate: Locator) => rate.locator('.ym-rate__item')

async function point(star: Locator, fraction: number) {
  const { width, height } = (await star.boundingBox())!
  return { x: width * fraction, y: height / 2 }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixture/rate.html')
})

test('whole stars are the default and a half-star preview never emits a change', async ({ page }) => {
  const basic = page.getByRole('slider', { name: '评分', exact: true }).and(page.locator('#basic'))
  await expect(stars(basic)).toHaveCount(5)
  await expect(basic).toHaveAttribute('aria-valuenow', '0')
  const second = stars(basic).nth(1)
  await second.click({ position: await point(second, .25) })
  await expect(basic).toHaveAttribute('aria-valuenow', '2')

  const half = page.locator('#half')
  const third = stars(half).nth(2)
  await third.hover({ position: await point(third, .25) })
  await expect(third).toHaveAttribute('data-fill', 'half')
  await expect(half).toContainText('三星')
  await expect(half).toHaveAttribute('aria-valuenow', '1.5')
  await third.hover({ position: await point(third, .75) })
  await expect(third).toHaveAttribute('data-fill', 'full')
  await page.getByLabel('接受评分').hover()
  await expect(half).toContainText('二星')
  await expect(third).toHaveAttribute('data-fill', 'empty')
  await expect(page.locator('#updates')).toBeEmpty()
  await expect(page.locator('#changes')).toBeEmpty()

  await third.click({ position: await point(third, .25) })
  await expect(half).toHaveAttribute('aria-valuenow', '2.5')
  await third.click({ position: await point(third, .5) })
  await expect(half).toHaveAttribute('aria-valuenow', '3')
  await third.click({ position: await point(third, .75) })
  await expect(half).toHaveAttribute('aria-valuenow', '0')
  await expect(half.locator('[data-fill="empty"]')).toHaveCount(5)
  await expect(page.locator('#updates')).toHaveText('2.5,3,0')
  await expect(page.locator('#changes')).toHaveText('2.5,3,0')
})

test('controlled scores respect the owner, keyboard steps, endpoints and disabled state', async ({ page }) => {
  const rate = page.getByRole('slider', { name: '服务评分' })
  await expect(rate).toHaveAttribute('aria-valuenow', '1.5')
  const third = stars(rate).nth(2)
  await third.click({ position: await point(third, .25) })
  await expect(page.locator('#changes')).toHaveText('2.5')
  await expect(rate).toHaveAttribute('aria-valuenow', '1.5')
  await page.getByLabel('接受评分').check()
  await page.getByRole('button', { name: '外部设为 4.5 分' }).click()
  await expect(rate).toHaveAttribute('aria-valuenow', '4.5')
  await rate.press('ArrowLeft')
  await expect(rate).toHaveAttribute('aria-valuenow', '4')
  await rate.press('ArrowUp')
  await rate.press('Home')
  await rate.press('ArrowDown')
  await rate.press('End')
  await rate.press('ArrowRight')
  await expect(rate).toHaveAttribute('aria-valuenow', '5')
  await expect(page.locator('#changes')).toHaveText('2.5,4,4.5,0,5')
  await page.getByLabel('禁用评分').check()
  await expect(rate).toBeDisabled()
  await third.hover({ position: await point(third, .25) })
  await expect(stars(rate).last()).toHaveAttribute('data-fill', 'full')
  await third.click({ force: true, position: await point(third, .25) })
  await rate.dispatchEvent('keydown', { key: 'Home' })
  await expect(page.locator('#updates')).toHaveText('2.5,4,4.5,0,5')
  await expect(page.locator('#changes')).toHaveText('2.5,4,4.5,0,5')
})

test('custom icons keep their size and colors on both sides of a half star', async ({ page }) => {
  const rate = page.locator('#custom')
  await expect(rate).toHaveAttribute('aria-valuenow', '2.5')
  await expect(stars(rate)).toHaveCount(3)
  const third = stars(rate).last()
  await expect(third).toHaveAttribute('data-fill', 'half')
  await expect(third.locator('.ym-rate__fill')).toHaveCSS('clip-path', 'inset(0px 50% 0px 0px)')
  const filled = third.locator('.ym-rate__fill b')
  const empty = third.locator('.ym-rate__empty b')
  await expect(filled).toHaveText('3')
  await expect(empty).toHaveText('3')
  await expect(filled).toHaveCSS('color', 'rgb(170, 17, 51)')
  await expect(empty).toHaveCSS('color', 'rgb(187, 204, 221)')
  await expect(filled).toHaveCSS('font-size', '30px')
  const firstBox = (await stars(rate).first().boundingBox())!
  const secondBox = (await stars(rate).nth(1).boundingBox())!
  expect(secondBox.x - firstBox.x - firstBox.width).toBeCloseTo(9)
})

test('nested configuration updates the rating palette, focus radius and size', async ({ page }) => {
  const rate = page.locator('#inherited')
  const active = rate.locator('.ym-rate__fill').first()
  const empty = rate.locator('.ym-rate__empty').last()
  const local = page.locator('#local')
  await expect(active).toHaveCSS('color', 'rgb(128, 48, 69)')
  await expect(empty).toHaveCSS('color', 'rgb(149, 166, 183)')
  await page.getByLabel('浅色评分颜色').fill('#592456')
  await expect(active).toHaveCSS('color', 'rgb(89, 36, 86)')
  await page.getByLabel('深色模式').check()
  await expect(active).toHaveCSS('color', 'rgb(243, 167, 101)')
  await expect(empty).toHaveCSS('color', 'rgb(72, 89, 106)')
  await expect(local.locator('.ym-rate__fill').first()).toHaveCSS('color', 'rgb(22, 101, 172)')
  await expect(rate).toHaveCSS('border-radius', '3px')
  await page.getByLabel('直角焦点框').check()
  await expect(rate).toHaveCSS('border-radius', '0px')
  await expect(stars(rate).first()).toHaveCSS('width', '24px')
  const localWidth = (await stars(local).first().boundingBox())!.width
  let previous = 0
  for (const size of ['extra-small', 'small', 'medium', 'large']) {
    await page.getByLabel('全局尺寸').selectOption(size)
    const width = (await stars(rate).first().boundingBox())!.width
    expect(width).toBeGreaterThan(previous)
    expect((await stars(local).first().boundingBox())!.width).toBe(localWidth)
    if (size === 'small') expect(width).toBe(localWidth)
    previous = width
  }
})

test.describe('touch selection', () => {
  test.use({ hasTouch: true })
  test('a tap on the left of the first star commits half a point', async ({ page }) => {
    const rate = page.locator('#half')
    const first = stars(rate).first()
    await first.tap({ position: await point(first, .25) })
    await expect(rate).toHaveAttribute('aria-valuenow', '0.5')
    await expect(page.locator('#changes')).toHaveText('0.5')
  })
})
