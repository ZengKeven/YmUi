import { expect, test } from '@playwright/test'

test('the built-in SVGs switch offline and only the loading path animates', async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/tests/fixture/')
  const icon = page.locator('svg#test-icon')
  const path = icon.locator('path')
  await expect(icon).toHaveAttribute('viewBox', '0 0 24 24')
  await expect(path).toHaveCSS('animation-name', 'none')
  const add = await path.getAttribute('d') ?? ''
  expect(await path.evaluate(el => (el as SVGPathElement).getTotalLength())).toBeGreaterThan(0)

  await context.setOffline(true)
  const name = page.getByLabel('图标名称')
  await name.selectOption('user')
  await expect(icon).toHaveAttribute('data-name', 'user')
  await expect(path).not.toHaveAttribute('d', add)
  await expect(path).toHaveCSS('animation-name', 'none')
  const userPath = await path.getAttribute('d') ?? ''
  expect(await path.evaluate(el => (el as SVGPathElement).getTotalLength())).toBeGreaterThan(0)

  await name.selectOption('loading')
  await expect(path).not.toHaveAttribute('d', userPath)
  await expect(path).not.toHaveAttribute('d', add)
  await expect(path).toHaveCSS('animation-name', 'ym-icon-spin')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(path).toHaveCSS('animation-name', 'none')
  await name.selectOption('add')
  await expect(path).toHaveAttribute('d', add)

  for (const key of ['notification', 'print', 'approve', 'warehouse', 'dish']) {
    await name.selectOption(key)
    await expect(icon).toHaveAttribute('data-name', key)
    const lengths = await path.evaluateAll(paths => paths.map(el => (el as SVGPathElement).getTotalLength()))
    expect(lengths.length).toBeGreaterThan(0)
    expect(lengths.every(length => length > 0)).toBe(true)
  }
})

test('icons inherit text or global styles, accept explicit sizes and emit one original click', async ({ page }) => {
  await page.goto('/tests/fixture/')
  const inline = page.getByRole('img', { name: '行内加号' })
  await expect(inline).toHaveCSS('width', '20px')
  await expect(inline.locator('path')).toHaveCSS('stroke', 'rgb(52, 86, 120)')

  const icon = page.locator('#test-icon')
  await expect(icon).toHaveAttribute('aria-hidden', 'true')
  await expect(icon).toHaveCSS('width', '24px')
  await expect(icon.locator('path')).toHaveCSS('stroke', 'rgb(255, 255, 255)')
  await page.getByLabel('命名图标').check()
  const named = page.getByRole('img', { name: '操作图标' })
  await named.click()
  await expect(page.locator('#icon-clicks')).toHaveText('1')
  const size = page.getByLabel('图标尺寸')
  await size.selectOption('small')
  await expect(named).toHaveCSS('width', '14px')
  await size.selectOption('28')
  await expect(named).toHaveCSS('height', '28px')
  await size.selectOption('2em')
  await expect(named).toHaveCSS('height', '32px')
  await page.getByLabel('命名图标').uncheck()
  await expect(icon).toHaveAttribute('aria-hidden', 'true')
  await page.getByLabel('图标名称').selectOption('print')
  await expect(icon.locator('[stroke="currentColor"]')).toHaveCSS('stroke', 'rgb(255, 255, 255)')
  await expect(icon.locator('[fill="currentColor"]')).toHaveCSS('fill', 'rgb(255, 255, 255)')
})
