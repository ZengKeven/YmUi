import { expect, test, type Locator } from '@playwright/test'

const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150"><rect width="300" height="150" fill="teal"/></svg>'
const fontSize = (element: Locator) => element.evaluate(el => parseFloat(getComputedStyle(el).fontSize))

test.beforeEach(async ({ page }) => {
  await page.route('**/image-case/*.svg', route => {
    const broken = /\/(broken|bad-backup|bad-size)\.svg$/.test(route.request().url())
    return route.fulfill({ status: broken ? 404 : 200, contentType: 'image/svg+xml', body: broken ? '' : svg })
  })
  await page.goto('/tests/fixture/image.html')
})

test('an ordinary image becomes keyboard-previewable only when preview is enabled', async ({ page }) => {
  const main = page.locator('#main-image')
  const picture = main.getByRole('img', { name: '送货凭证' })
  const open = main.getByRole('button', { name: '预览 送货凭证' })
  const dialog = page.getByRole('dialog', { name: '图片预览' })
  await expect(page.locator('#events')).toHaveText('load /image-case/main.svg')
  await expect(picture).toHaveAttribute('loading', 'lazy')
  await expect(picture).toHaveAttribute('referrerpolicy', 'no-referrer')
  await expect(picture).toHaveCSS('object-fit', 'cover')
  await expect(picture).toHaveCSS('object-position', '25% 75%')
  await expect(main).toHaveCSS('width', '180px')
  await expect(main).toHaveCSS('height', '96px')
  await expect(open).toHaveCount(0)
  await picture.click()
  await expect(dialog).toHaveCount(0)
  await page.getByLabel('允许预览').check()
  await picture.click()
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: '关闭预览' }).click()
  await expect(open).toBeFocused()
  await open.press('Enter')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('img')).toHaveAttribute('referrerpolicy', 'no-referrer')
  await expect(dialog.getByRole('button', { name: '下一张' })).toHaveCount(0)
  await dialog.getByRole('button', { name: '放大' }).click()
  await expect(dialog.getByText('125%')).toBeVisible()
  await dialog.getByRole('button', { name: '旋转' }).click()
  await expect(dialog.locator('img')).toHaveCSS('transform', 'matrix(0, 1.25, -1.25, 0, 0, 0)')
  await page.keyboard.press('Escape')
  await expect(open).toBeFocused()
  await open.press('Space')
  await expect(dialog.getByText('100%')).toBeVisible()
  // 应用可以在模态层打开时修改图片的预览权限。
  await page.getByLabel('允许预览').evaluate((input: HTMLInputElement) => input.click())
  await expect(dialog).toHaveCount(0)
  await expect(open).toHaveCount(0)
})

test('picture selection and fallback preview the successfully displayed resource', async ({ page }) => {
  const open = page.getByRole('button', { name: '预览 送货凭证' })
  const dialog = page.getByRole('dialog', { name: '图片预览' })
  const thumbnail = page.locator('#main-image img.ym-image__img')
  await page.getByLabel('允许预览').check()
  await page.getByLabel('多格式图片').check()
  await expect.poll(() => thumbnail.evaluate(img => (img as HTMLImageElement).currentSrc)).toMatch(/\/chosen\.svg$/)
  await open.click()
  await expect.poll(() => dialog.locator('img').evaluate(img => (img as HTMLImageElement).currentSrc)).toMatch(/\/chosen\.svg$/)
  await page.keyboard.press('Escape')
  await page.getByLabel('多格式图片').uncheck()
  await page.getByRole('button', { name: '设置备用图' }).click()
  await page.getByRole('button', { name: '坏图', exact: true }).click()
  await expect(page.locator('#events')).toContainText('error /image-case/broken.svg')
  await expect(page.locator('#events')).toContainText('load /image-case/backup.svg')
  await open.click()
  await expect.poll(() => dialog.locator('img').evaluate(img => (img as HTMLImageElement).currentSrc)).toMatch(/\/backup\.svg$/)
  await page.getByText('主图', { exact: true }).dispatchEvent('click')
  await expect(dialog).toHaveCount(0)
  await expect.poll(() => thumbnail.evaluate(img => (img as HTMLImageElement).currentSrc)).toMatch(/\/main\.svg$/)
})

test('pending images expose a loading slot, failed fallbacks settle, and changing src recovers', async ({ page }) => {
  const main = page.locator('#main-image')
  const open = main.getByRole('button', { name: '预览 送货凭证' })
  const events = page.locator('#events')
  const slow = page.waitForRequest('**/image-case/slow.svg')
  let finish!: () => void
  const hold = new Promise<void>(resolve => { finish = resolve })
  await page.route('**/image-case/slow.svg', async route => {
    await hold
    await route.fulfill({ status: 404, body: '' })
  })
  await page.getByLabel('允许预览').check()
  await page.getByRole('button', { name: '慢图' }).click()
  await slow
  try {
    await expect(main.getByText('读取凭证中')).toBeVisible()
    await expect(open).toHaveCount(0)
    await page.getByRole('button', { name: '设置损坏的备用图' }).click()
    await page.getByRole('button', { name: '坏图', exact: true }).click()
    await expect(main.getByText('凭证暂不可用')).toBeVisible()
    await expect(main.getByText('读取凭证中')).toHaveCount(0)
    await expect(open).toHaveCount(0)
    await page.getByRole('button', { name: '缓存图片' }).click()
    await expect(open).toBeVisible()
  } finally {
    finish()
  }
  await page.getByRole('button', { name: '主图', exact: true }).click()
  await expect(events).toHaveText(/load \/image-case\/main\.svg$/)
  await page.getByRole('button', { name: '缓存图片' }).click()
  await expect(events).toHaveText(/load cached$/)
  expect((await events.innerText()).match(/load cached/g)).toHaveLength(2)
  await expect(main.getByText('凭证暂不可用')).toHaveCount(0)
  await expect(events).not.toContainText('/image-case/slow.svg')
})

test('a local file opens using its object URL and replacing it releases the old URL', async ({ page }) => {
  await page.getByLabel('允许预览').check()
  await page.getByLabel('本地图片').setInputFiles({
    name: '签收单.svg', mimeType: 'image/svg+xml', buffer: Buffer.from(svg),
  })
  const thumbnail = page.locator('#main-image img.ym-image__img')
  await expect(thumbnail).toHaveAttribute('src', /^blob:/)
  const blob = (await thumbnail.getAttribute('src'))!
  await page.getByRole('button', { name: '预览 送货凭证' }).click()
  const dialog = page.getByRole('dialog', { name: '图片预览' })
  await expect(dialog.locator('img')).toHaveAttribute('src', blob)
  await expect.poll(() => dialog.locator('img').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBe(300)
  await dialog.getByRole('button', { name: '关闭预览' }).click()
  await page.getByRole('button', { name: '主图', exact: true }).click()
  await expect(thumbnail).toHaveAttribute('src', /\/main\.svg$/)
  await expect.poll(() => page.evaluate(async url => {
    try { return (await fetch(url)).ok } catch { return false }
  }, blob)).toBe(false)
})

test('nested configuration reaches image states and an open viewer while local size and shape win', async ({ page }) => {
  const main = page.locator('#main-image')
  const compact = page.getByText('紧凑提示')
  await expect(compact).toBeVisible()
  await page.getByRole('button', { name: '坏图', exact: true }).click()
  const hint = main.getByText('凭证暂不可用')
  await expect(hint).toBeVisible()
  const localSize = await fontSize(compact)
  let last = 0
  for (const size of ['extra-small', 'small', 'medium', 'large']) {
    await page.getByLabel('全局尺寸').selectOption(size)
    const current = await fontSize(hint)
    expect(current).toBeGreaterThan(last)
    expect(await fontSize(compact)).toBe(localSize)
    if (size === 'small') expect(current).toBe(localSize)
    last = current
  }
  await page.getByRole('button', { name: '主图', exact: true }).click()
  await page.getByLabel('允许预览').check()
  await page.getByRole('button', { name: '预览 送货凭证' }).click()
  const dialog = page.getByRole('dialog', { name: '图片预览' })
  await expect(dialog).toHaveCSS('border-radius', '9px')
  await expect(dialog).toHaveCSS('background-color', 'rgb(240, 244, 248)')
  await page.getByLabel('浅色表面').evaluate((input: HTMLInputElement) => {
    input.value = '#faf4e1'
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await expect(dialog).toHaveCSS('background-color', 'rgb(250, 244, 225)')
  for (const label of ['深色模式', '直角']) {
    await page.getByLabel(label).evaluate((input: HTMLInputElement) => input.click())
  }
  await expect(dialog).toHaveCSS('background-color', 'rgb(33, 50, 64)')
  await expect(dialog).toHaveCSS('color', 'rgb(255, 244, 221)')
  await expect(dialog).toHaveCSS('border-radius', '0px')
  await page.keyboard.press('Escape')
  await page.getByLabel('直角').uncheck()
  await expect(main).toHaveCSS('border-radius', '9px')
  await page.getByLabel('图片形状').selectOption('square')
  await expect(main).toHaveCSS('border-radius', '0px')
  await page.getByLabel('图片形状').selectOption('circle')
  await expect(main).toHaveCSS('border-radius', '50%')
})
