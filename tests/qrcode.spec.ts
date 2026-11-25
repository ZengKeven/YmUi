import { createHash } from 'node:crypto'
import { expect, test, type Locator } from '@playwright/test'

// 从屏幕截图取样，Canvas 和 SVG 共用相同的验证方式。
async function sampleCode(image: Locator, modules?: number) {
  const png = await image.screenshot()
  return image.page().evaluate(async ({ src, modules }) => {
    const bitmap = new Image()
    bitmap.src = src
    await bitmap.decode()
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bitmap, 0, 0)
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const colors = new Map<string, number>()
    let first = width
    let last = -1
    let logoWidth = 0
    let logoHeight = 0
    const pixel = (x: number, y: number) => (y * width + x) * 4
    for (let y = 0; y < height; y++) {
      let pink = 0
      for (let x = 0; x < width; x++) {
        const i = pixel(x, y)
        const color = (data[i] << 16 | data[i + 1] << 8 | data[i + 2]).toString(16).padStart(6, '0')
        colors.set(color, (colors.get(color) ?? 0) + 1)
        if (color === 'ff0099') pink++
        if (modules && data[i] < 100) {
          first = Math.min(first, x)
          last = Math.max(last, x)
        }
      }
      if (pink) logoHeight++
      logoWidth = Math.max(logoWidth, pink)
    }
    const rows: string[] = []
    if (modules && first < last) {
      const pitch = (last - first + 1) / modules
      const center = (i: number) => Math.floor(first + (i + .5) * pitch)
      for (let y = 0; y < modules; y++) {
        let row = ''
        for (let x = 0; x < modules; x++) row += data[pixel(center(x), center(y))] < 100 ? '1' : '0'
        rows.push(row)
      }
    }
    const mid = pixel(Math.floor(width / 2), Math.floor(height / 2))
    return { colors: [...colors].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([color]) => color),
      centerRgb: [...data.slice(mid, mid + 3)], rows, first, logoWidth, logoHeight }
  }, { src: 'data:image/png;base64,' + png.toString('base64'), modules })
}

interface NativeBarcodeDetector {
  new (options: { formats: string[] }): { detect(src: HTMLImageElement): Promise<{ rawValue: string }[]> }
  getSupportedFormats(): Promise<string[]>
}

async function scanCode(image: Locator) {
  const png = await image.screenshot()
  return image.page().evaluate(async src => {
    const bitmap = new Image()
    bitmap.src = src
    await bitmap.decode()
    const Detector = (window as Window & { BarcodeDetector: NativeBarcodeDetector }).BarcodeDetector
    const result = await new Detector({ formats: ['qr_code'] }).detect(bitmap)
    return result.map(item => item.rawValue)
  }, 'data:image/png;base64,' + png.toString('base64'))
}

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixture/qrcode.html')
})

test('canvas and SVG render the same known symbol with a four-module quiet zone', async ({ page }) => {
  const code = page.locator('#code')
  await expect(code).toHaveCSS('width', '160px')
  await expect(code.locator('canvas[role="img"]')).toBeVisible()
  for (const type of ['canvas', 'svg']) {
    await page.getByRole('combobox', { name: '渲染方式' }).selectOption(type)
    const image = code.locator(type + '[role="img"]')
    await expect(image).toHaveAccessibleName('采购单二维码')
    const { rows, first } = await sampleCode(image, 21)
    expect(rows).toHaveLength(21)
    expect(rows[0].slice(0, 7)).toBe('1111111')
    expect(first).toBeGreaterThanOrEqual(Math.floor((await image.boundingBox())!.width * 4 / 29) - 1)
    expect(createHash('sha256').update(rows.join('\n')).digest('hex')).toBe('321199e5c859e5761b5c7401a3ce29d8e44c873dfbde48ff7a91e129da571ff2')
  }
  await page.getByRole('textbox', { name: '内容' }).fill('采购采购采购采购采购采购采购采购采购')
  const svg = code.locator('svg[role="img"]')
  await page.getByRole('combobox', { name: '纠错级别' }).selectOption('L')
  const low = await svg.getAttribute('viewBox')
  await page.getByRole('combobox', { name: '纠错级别' }).selectOption('H')
  await expect(svg).not.toHaveAttribute('viewBox', low!)
})

test('a native scanner reads updated text and Chinese from both renderers', async ({ page }) => {
  const supportsQR = await page.evaluate(async () => {
    const Detector = (window as Window & { BarcodeDetector?: NativeBarcodeDetector }).BarcodeDetector
    return Detector && (await Detector.getSupportedFormats()).includes('qr_code')
  })
  test.skip(!supportsQR, '当前浏览器未提供原生二维码解码器')
  for (const type of ['canvas', 'svg']) {
    await page.getByRole('combobox', { name: '渲染方式' }).selectOption(type)
    for (const value of ['YM', '采购单-二〇二六']) {
      await page.getByRole('textbox', { name: '内容' }).fill(value)
      await expect.poll(() => scanCode(page.locator('#code').getByRole('img'))).toEqual([value])
    }
  }
})

test('empty and over-capacity values clear the old symbol and a valid value restores it', async ({ page }) => {
  const code = page.locator('#code')
  const input = page.getByRole('textbox', { name: '内容' })
  await input.fill('')
  await expect(code).toContainText('暂无二维码')
  await expect(code.getByRole('img')).toHaveCount(0)
  await page.getByRole('button', { name: '超长内容' }).click()
  await expect(code).toContainText('内容超出二维码容量')
  await expect(code.getByRole('img')).toHaveCount(0)
  await input.fill('已恢复')
  await expect(code.getByRole('img')).toBeVisible()
  await expect(code).not.toContainText('超出')
})

test('a rectangular logo renders at the center and a failed replacement restores all modules', async ({ page }) => {
  const logo = page.getByRole('combobox', { name: '中心图标' })
  const image = page.locator('#code').getByRole('img')
  for (const type of ['canvas', 'svg']) {
    await page.getByRole('combobox', { name: '渲染方式' }).selectOption(type)
    await logo.selectOption({ label: '无' })
    const original = await sampleCode(image, 21)
    await logo.selectOption({ label: '正常' })
    await expect.poll(async () => {
      const { logoWidth, logoHeight } = await sampleCode(image)
      return Math.max(Math.abs(logoWidth - 20), Math.abs(logoHeight - 10))
    }).toBeLessThanOrEqual(1)
    expect((await sampleCode(image)).centerRgb).toEqual([255, 0, 153])
    await logo.selectOption({ label: '损坏' })
    await expect.poll(async () => {
      const { logoWidth, rows } = await sampleCode(image, 21)
      return [logoWidth, rows]
    }).toEqual([0, original.rows])
  }
})

test('status messages, keyboard refresh and scoped status slot follow the supplied state', async ({ page }) => {
  const state = page.getByRole('combobox', { name: '状态' })
  const code = page.locator('#code')
  await expect(page.locator('#passive').getByRole('button')).toHaveCount(0)
  await state.selectOption('expired')
  await expect(code).toContainText('二维码已过期')
  await expect(code.getByRole('img', { name: '采购单二维码' })).toHaveCount(0)
  const refresh = code.getByRole('button', { name: '点击刷新' })
  await refresh.focus()
  await refresh.press('Enter')
  await expect(page.locator('#refreshes')).toHaveText('1')
  await expect(code).toHaveAttribute('data-status', 'expired')
  await page.getByRole('button', { name: '重新生成 expired' }).click()
  await expect(page.locator('#refreshes')).toHaveText('2')
  await state.selectOption('loading')
  await expect(code.locator('.ym-loading')).toBeVisible()
  await expect(page.locator('#slotted .ym-loading')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '重新生成 loading' })).toBeVisible()
  await state.selectOption('scanned')
  await expect(code).toContainText('已扫描')
  await state.selectOption('active')
  await expect(code).not.toContainText('已扫描')
  await expect(page.locator('#slotted button')).toHaveCount(0)
})

test('global size, mode, palette and radius update both renderers while local colors and size win', async ({ page }) => {
  const inherited = page.locator('#inherited')
  const local = page.locator('#local')
  const image = inherited.getByRole('img')
  for (const [size, pixels] of [['extra-small', 100], ['small', 120], ['medium', 160], ['large', 200]] as const) {
    await page.getByRole('combobox', { name: '全局尺寸' }).selectOption(size)
    await expect(inherited).toHaveCSS('width', pixels + 'px')
    await expect(inherited).toHaveCSS('height', pixels + 'px')
    await expect(local).toHaveCSS('width', '144px')
  }
  const square = page.getByRole('checkbox', { name: '直角' })
  await expect(inherited).toHaveCSS('border-top-left-radius', '3px')
  await square.check()
  await expect(inherited).toHaveCSS('border-top-left-radius', '0px')
  for (const type of ['canvas', 'svg']) {
    await page.getByRole('combobox', { name: '渲染方式' }).selectOption(type)
    await page.getByLabel('浅色前景').fill('#123456')
    await page.getByRole('checkbox', { name: '深色模式' }).uncheck()
    await expect.poll(async () => (await sampleCode(image)).colors).toEqual(expect.arrayContaining(['123456', 'fffdee']))
    await page.getByLabel('浅色前景').fill('#374622')
    await expect.poll(async () => (await sampleCode(image)).colors).toContain('374622')
    await page.getByRole('checkbox', { name: '深色模式' }).check()
    await expect.poll(async () => (await sampleCode(image)).colors).toEqual(expect.arrayContaining(['ffddaa', '112233']))
    expect((await sampleCode(local.getByRole('img'))).colors).toEqual(expect.arrayContaining(['760052', 'f4f8fc']))
  }
  const code = page.locator('#code')
  await page.getByRole('checkbox', { name: '无边框' }).check()
  const border = await code.evaluate(el => {
    const style = getComputedStyle(el)
    return style.borderTopColor === 'rgba(0, 0, 0, 0)' || style.borderTopWidth === '0px'
  })
  expect(border).toBe(true)
})
