import { expect, test, type Locator } from '@playwright/test'

async function widthFraction(fill: Locator, track: Locator) {
  const [filled, total] = await Promise.all([fill.boundingBox(), track.boundingBox()])
  return filled && total ? filled.width / total.width : 0
}

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixture/progress.html')
})

test('the progressbar exposes and draws the current bounded percentage', async ({ page }) => {
  const initial = page.getByRole('progressbar', { name: '初始进度' })
  await expect(initial).toHaveAttribute('data-theme', 'line')
  await expect(initial).toHaveAttribute('aria-valuemin', '0')
  await expect(initial).toHaveAttribute('aria-valuemax', '100')
  await expect(initial).toHaveAttribute('aria-valuenow', '0')
  await expect(initial).toHaveText('0%')

  const bar = page.getByRole('progressbar', { name: '文件传输' })
  const input = page.getByLabel('百分比', { exact: true })
  const fill = bar.locator('.ym-progress__fill')
  const track = bar.locator('.ym-progress__track')
  for (const [value, bounded] of [['-5', 0], ['62.5', 62.5], ['130', 100], ['75', 75]] as const) {
    await input.fill(value)
    await expect(bar).toHaveAttribute('aria-valuenow', String(bounded))
    await expect(bar.locator('.ym-progress__label')).toHaveText(bounded + '%')
    await expect(bar).toHaveAttribute('data-status', bounded === 100 ? 'success' : 'default')
    await expect.poll(() => widthFraction(fill, track)).toBeCloseTo(bounded / 100, 2)
  }
})

test('themes position their labels beside the line, inside the track or at the center of the ring', async ({ page }) => {
  const bar = page.getByRole('progressbar', { name: '文件传输' })
  const theme = page.getByLabel('样式')
  const label = bar.locator('.ym-progress__label')
  const track = bar.locator('.ym-progress__track')
  await expect(label).toHaveText('35%')
  const line = (await track.boundingBox())!
  expect((await label.boundingBox())!.x).toBeGreaterThanOrEqual(line.x + line.width - 1)

  await theme.selectOption('plump')
  await expect(bar).toHaveAttribute('data-theme', 'plump')
  await expect(label).toHaveText('35%')
  const rail = (await track.boundingBox())!
  const caption = (await label.boundingBox())!
  expect(caption.x).toBeGreaterThanOrEqual(rail.x - 1)
  expect(caption.x + caption.width).toBeLessThanOrEqual(rail.x + rail.width + 1)
  expect(caption.y + caption.height / 2).toBeCloseTo(rail.y + rail.height / 2, 0)

  await theme.selectOption('circle')
  await expect(bar).toHaveAttribute('data-theme', 'circle')
  const gauge = (await bar.locator('svg:not(.ym-icon)').boundingBox())!
  const center = (await label.boundingBox())!
  expect(center.x + center.width / 2).toBeCloseTo(gauge.x + gauge.width / 2, 0)
  expect(center.y + center.height / 2).toBeCloseTo(gauge.y + gauge.height / 2, 0)
  const ring = bar.locator('.ym-progress__ring-fill')
  const dash = () => ring.evaluate(el => {
    const style = getComputedStyle(el)
    return [style.strokeDasharray, style.strokeDashoffset]
  })
  const initial = await dash()
  await page.getByLabel('百分比', { exact: true }).fill('70')
  await expect(label).toHaveText('70%')
  await expect.poll(dash).not.toEqual(initial)
})

test('plump labels move across the fill edge when the percentage or available width changes', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 800 })
  await page.getByLabel('样式').selectOption('plump')
  await page.getByRole('combobox', { name: '标签', exact: true }).selectOption({ label: '自定义' })
  const bar = page.getByRole('progressbar', { name: '文件传输' })
  const input = page.getByLabel('百分比', { exact: true })
  const labelPosition = () => bar.evaluate(el => {
    const fill = el.querySelector('.ym-progress__fill')!.getBoundingClientRect()
    const label = el.querySelector('.ym-progress__label')!.getBoundingClientRect()
    if (label.left >= fill.right) return 'outside'
    if (label.left >= fill.left && label.right <= fill.right) return 'inside'
    return 'overlapping'
  })

  await input.fill('1')
  await expect.poll(labelPosition).toBe('outside')
  await input.fill('5')
  await expect.poll(labelPosition).toBe('inside')
  await page.setViewportSize({ width: 320, height: 800 })
  await expect(bar).toHaveAttribute('aria-valuenow', '5')
  await expect.poll(labelPosition).toBe('outside')
  await page.setViewportSize({ width: 1400, height: 800 })
  await expect.poll(labelPosition).toBe('inside')
})

test('explicit statuses override completion and provide status icons for line and circle', async ({ page }) => {
  const bar = page.getByRole('progressbar', { name: '文件传输' })
  const status = page.getByLabel('状态')
  const label = bar.locator('.ym-progress__label')
  await page.getByLabel('百分比', { exact: true }).fill('100')
  for (const theme of ['line', 'circle', 'plump']) {
    await page.getByLabel('样式').selectOption(theme)
    await status.selectOption('active')
    await expect(bar).toHaveAttribute('data-status', 'active')
    await expect(label).toHaveText('100%')
    for (const value of ['warning', 'error', 'success']) {
      await status.selectOption(value)
      await expect(bar).toHaveAttribute('data-status', value)
      if (theme === 'plump') await expect(label).toHaveText('100%')
      else await expect(label.locator('svg.ym-icon')).toBeVisible()
    }
  }
})

test('custom labels override status icons, scoped slots take priority and false hides every label', async ({ page }) => {
  const bar = page.getByRole('progressbar', { name: '文件传输' })
  const scoped = page.getByRole('progressbar', { name: '自定义进度' })
  const label = page.getByRole('combobox', { name: '标签', exact: true })
  await expect(scoped.locator('strong')).toHaveText('35 / default')
  await page.getByLabel('百分比', { exact: true }).fill('150')
  await expect(scoped.locator('strong')).toHaveText('100 / success')
  await page.getByLabel('状态').selectOption('warning')
  await label.selectOption({ label: '自定义' })
  await expect(bar.locator('.ym-progress__label')).toHaveText('已接收')
  await expect(bar.locator('.ym-icon')).toHaveCount(0)
  await expect(scoped.locator('strong')).toHaveText('100 / warning')
  for (const theme of ['line', 'circle', 'plump']) {
    await page.getByLabel('样式').selectOption(theme)
    await label.selectOption({ label: '隐藏' })
    await expect(bar.locator('.ym-progress__label')).toBeHidden()
    await expect(scoped.locator('strong')).toBeHidden()
    await expect(bar).toHaveAttribute('aria-valuenow', '100')
    await label.selectOption({ label: '百分比' })
    await expect(scoped.locator('strong')).toBeVisible()
  }
})

test('solid colors and gradient stops paint both linear bars and SVG rings', async ({ page }) => {
  const bar = page.getByRole('progressbar', { name: '文件传输' })
  const color = page.getByRole('combobox', { name: '颜色', exact: true })
  const theme = page.getByLabel('样式')
  const fill = bar.locator('.ym-progress__fill')
  await color.selectOption({ label: '单色' })
  await expect(fill).toHaveCSS('background-color', 'rgb(51, 102, 153)')
  await expect(bar.locator('.ym-progress__track')).toHaveCSS('background-color', 'rgb(219, 222, 239)')
  await theme.selectOption('circle')
  const ring = bar.locator('.ym-progress__ring-fill')
  await expect(ring).toHaveCSS('stroke', 'rgb(51, 102, 153)')
  await expect(bar.locator('.ym-progress__ring-track')).toHaveCSS('stroke', 'rgb(219, 222, 239)')

  for (const [palette, offsets] of [['色带', [0, 0.5, 1]], ['色标', [0, 0.25, 1]], ['起止色', [0, 1]]] as const) {
    await theme.selectOption('line')
    await color.selectOption({ label: palette })
    await expect(fill).toHaveCSS('background-image', /linear-gradient\(.*rgb\(255, 0, 0\).*rgb\(0, 0, 255\)/)
    await theme.selectOption('circle')
    const gradient = bar.locator('linearGradient')
    const stops = gradient.locator('stop')
    await expect(stops).toHaveCount(offsets.length)
    expect(await stops.evaluateAll(nodes => nodes.map(el => (el as SVGStopElement).offset.baseVal))).toEqual(offsets)
    await expect(stops.first()).toHaveCSS('stop-color', 'rgb(255, 0, 0)')
    await expect(stops.last()).toHaveCSS('stop-color', 'rgb(0, 0, 255)')
    expect(await ring.evaluate(el => getComputedStyle(el).stroke)).toContain('#' + await gradient.getAttribute('id'))
  }
})

test('custom dimensions set the track thickness and circular diameter', async ({ page }) => {
  const track = page.getByRole('progressbar', { name: '自定义线宽' }).locator('.ym-progress__track')
  await expect(track).toHaveCSS('height', '12px')
  for (const [name, diameter, stroke] of [['自定义圆环', 124, 8], ['字符串尺寸', 96, 4]] as const) {
    const progress = page.getByRole('progressbar', { name })
    const svg = progress.locator('svg:not(.ym-icon)')
    await expect(svg).toHaveCSS('width', diameter + 'px')
    await expect(svg).toHaveCSS('height', diameter + 'px')
    await expect(progress.locator('.ym-progress__ring-track')).toHaveCSS('stroke-width', stroke + 'px')
    await expect(progress.locator('.ym-progress__ring-fill')).toHaveCSS('stroke-width', stroke + 'px')
  }
})

test('nested providers change rendered dimensions, palette, mode and radius, with local size overrides', async ({ page }) => {
  const bar = page.getByRole('progressbar', { name: '全局线条' })
  const track = bar.locator('.ym-progress__track')
  const fill = bar.locator('.ym-progress__fill')
  const label = bar.locator('.ym-progress__label')
  const ring = page.getByRole('progressbar', { name: '全局圆环' }).locator('svg')
  const local = page.getByRole('progressbar', { name: '局部线条' }).locator('.ym-progress__track')
  const localRing = page.getByRole('progressbar', { name: '局部圆环' }).locator('svg')
  const localHeight = await local.evaluate(el => getComputedStyle(el).height)
  let previousHeight = 0
  let previousFont = 0
  for (const [size, diameter] of [['extra-small', 48], ['small', 72], ['medium', 112], ['large', 160]] as const) {
    await page.getByLabel('全局尺寸').selectOption(size)
    await expect(ring).toHaveCSS('width', diameter + 'px')
    const height = await track.evaluate(el => el.getBoundingClientRect().height)
    const font = await label.evaluate(el => parseFloat(getComputedStyle(el).fontSize))
    expect(height).toBeGreaterThan(previousHeight)
    expect(font).toBeGreaterThan(previousFont)
    previousHeight = height
    previousFont = font
    await expect(local).toHaveCSS('height', localHeight)
    await expect(localRing).toHaveCSS('width', '72px')
  }
  await expect(fill).toHaveCSS('background-color', 'rgb(0, 68, 136)')
  await expect(label).toHaveCSS('color', 'rgb(40, 57, 68)')
  await page.getByLabel('浅色主题色').fill('#336655')
  await expect(fill).toHaveCSS('background-color', 'rgb(51, 102, 85)')
  await page.getByLabel('深色模式').check()
  await expect(fill).toHaveCSS('background-color', 'rgb(153, 204, 255)')
  await expect(label).toHaveCSS('color', 'rgb(228, 237, 245)')
  await expect(track).toHaveCSS('border-top-left-radius', '3px')
  await page.getByLabel('直角').check()
  await expect(track).toHaveCSS('border-top-left-radius', '0px')
})
