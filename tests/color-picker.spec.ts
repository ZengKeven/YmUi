import { expect, test, type Locator, type Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixture/color-picker.html')
})

function lastChange(page: Page) {
  return page.locator('#changes').evaluate(el => JSON.parse(el.textContent!).at(-1))
}

async function selectFormat(page: Page, panel: Locator, format: string) {
  await panel.getByRole('combobox', { name: '颜色格式' }).click()
  await page.getByRole('option', { name: format, exact: true }).click()
}

test('the popup edits the bound value, reports the color and source, and clears once', async ({ page }) => {
  const picker = page.locator('#picker')
  const field = picker.getByPlaceholder('输入色值')
  const popup = page.locator('.ym-color-picker__popup:popover-open')
  await expect(field).toHaveValue('#ff0000')
  await field.click()
  await expect(popup.getByRole('radio', { name: '单色' })).toBeChecked()
  await popup.getByRole('button', { name: '#0000ff' }).click()
  await expect(page.locator('#model')).toHaveText('#0000ff')
  expect(await lastChange(page)).toMatchObject({
    value: '#0000ff', trigger: 'preset',
    color: { hex: '#0000ff', hex8: '#0000ffff', rgb: 'rgb(0, 0, 255)', alpha: 1, isGradient: false },
  })
  await expect(page.locator('#updates')).toHaveText('picker-model')
  await page.keyboard.press('Escape')
  await expect(popup).toBeHidden()
  await page.getByRole('button', { name: '设置外部颜色' }).click()
  await expect(field).toHaveValue('green')
  await field.fill('#aabbcc')
  await field.press('Tab')
  await expect(page.locator('#model')).toHaveText('#aabbcc')
  expect(await lastChange(page)).toMatchObject({ trigger: 'input', color: { hex: '#aabbcc' } })
  await field.hover()
  await picker.getByRole('button', { name: '清空颜色' }).click()
  await expect(page.locator('#model')).toBeEmpty()
  await expect(page.locator('#clears')).toHaveText('1')
  await page.getByLabel('禁用颜色选择器').check()
  await expect(field).toBeDisabled()
  await expect(popup).toBeHidden()
  const mono = page.locator('#mono')
  await expect(mono.getByRole('button', { name: '#0000ff' })).toBeDisabled()
  await expect(mono.getByRole('combobox', { name: '颜色格式' })).toBeDisabled()
})

test('a custom trigger opens the configured popup and mode changes follow controlled ownership', async ({ page }) => {
  await page.getByRole('button', { name: '自定义颜色触发器' }).click()
  const panel = page.locator('.custom-color-popup:popover-open')
  await expect(panel).toHaveCSS('padding', '7px')
  await expect(panel.getByRole('combobox', { name: '颜色格式' })).toBeDisabled()
  await expect(panel.getByRole('region', { name: '最近使用' }).getByRole('button', { name: 'purple' })).toBeVisible()
  await expect(panel.getByRole('region', { name: '系统预设' }).getByRole('button')).toHaveCount(40)
  await panel.getByRole('radio', { name: '渐变色' }).check()
  await expect(panel.getByLabel('渐变角度')).toBeVisible()
  await panel.getByRole('radio', { name: '单色' }).check()
  await expect(panel.getByLabel('渐变角度')).toHaveCount(0)
  await page.keyboard.press('Escape')

  const fixed = page.locator('#fixed').getByRole('textbox', { name: '颜色值' })
  await fixed.click()
  await page.locator('.ym-color-picker__popup:popover-open').getByRole('button', { name: 'red', exact: true }).click()
  await expect(fixed).toHaveValue('#123456')
  expect(await lastChange(page)).toMatchObject({ value: '#ff0000', trigger: 'preset' })
  await expect(page.locator('#updates')).toHaveText('alias-value')
  await page.keyboard.press('Escape')

  const optional = page.locator('#optional')
  const empty = optional.getByRole('textbox', { name: '颜色值' })
  await expect(empty).toHaveValue('')
  await empty.click()
  await page.locator('.ym-color-picker__popup:popover-open').getByRole('button', { name: '#0000ff', exact: true }).click()
  await expect(optional.locator('output')).toHaveText('#0000ff')
  await expect(page.locator('#updates')).toHaveText('alias-value')
})

test('the panel converts all editing formats, including alpha channels, without changing the selected color', async ({ page }) => {
  const panel = page.locator('#mono')
  await expect(panel.getByRole('radio')).toHaveCount(0)
  await expect(panel.getByRole('slider', { name: '透明度' })).toHaveCount(0)
  await expect(panel.locator('.ym-color-picker__preview')).toHaveCount(0)
  const formats = [
    ['HEX', 'HEX', '#ff0000'], ['RGB', 'R', '255'], ['HSL', 'L', '50'],
    ['HSV', 'V', '100'], ['CMYK', 'M', '100'], ['CSS', 'CSS', 'rgba(255, 0, 0, 1)'],
  ]
  for (const [format, label, expected] of formats) {
    await selectFormat(page, panel, format)
    await expect(panel.getByLabel(label, { exact: true })).toHaveValue(expected)
  }
  await panel.getByLabel('启用透明通道').check()
  await expect(panel.getByRole('slider', { name: '透明度' })).toBeVisible()
  for (const [format, label, expected] of [
    ['HEX8', 'HEX', '#ff0000ff'], ['RGBA', 'R', '255'], ['HSLA', 'L', '50'], ['HSVA', 'V', '100'],
  ]) {
    await selectFormat(page, panel, format)
    await expect(panel.getByLabel(label, { exact: true })).toHaveValue(expected)
    await expect(panel.getByLabel('A', { exact: true })).toHaveValue(/^100%?$/)
  }
  await expect(page.locator('#changes')).toHaveText('[]')
  await panel.getByLabel('A', { exact: true }).fill('50')
  await panel.getByLabel('A', { exact: true }).press('Enter')
  expect(await lastChange(page)).toMatchObject({ value: 'rgba(255, 0, 0, 0.5)', trigger: 'input', color: { alpha: 0.5 } })
  await expect(page.locator('#updates')).toBeEmpty()
})

test('hue, saturation, and alpha controls report their own edit sources', async ({ page }) => {
  const panel = page.locator('#mono')
  const hue = panel.getByRole('slider', { name: '色相', exact: true })
  await hue.press('ArrowRight')
  const change = await lastChange(page)
  expect(change.trigger).toBe('palette-hue-bar')
  expect(await page.locator('#palette').evaluate(el => JSON.parse(el.textContent!))).toEqual(change.color)
  const saturation = panel.getByRole('slider', { name: '饱和度与亮度' })
  const box = (await saturation.boundingBox())!
  await saturation.click({ position: { x: Math.round(box.width / 2), y: Math.round(box.height / 2) } })
  expect((await lastChange(page)).trigger).toBe('palette-saturation-brightness')
  await saturation.press('ArrowLeft')
  expect((await lastChange(page)).trigger).toBe('palette-saturation')
  await saturation.press('ArrowDown')
  expect((await lastChange(page)).trigger).toBe('palette-brightness')
  await panel.getByLabel('启用透明通道').check()
  await panel.getByRole('slider', { name: '透明度' }).press('ArrowLeft')
  expect((await lastChange(page)).trigger).toBe('palette-alpha-bar')
  expect((await lastChange(page)).color.alpha).toBeLessThan(1)
})

test('controlled recent colors can be added, deduplicated, selected and removed', async ({ page }) => {
  const panel = page.locator('#mono')
  const recent = panel.getByRole('region', { name: '最近使用' })
  const add = recent.getByRole('button', { name: '添加最近使用颜色' })
  await add.click()
  await add.click()
  await expect(page.locator('#recent-model')).toHaveText('["rgba(255, 0, 0, 1)","green"]')
  await panel.getByRole('button', { name: '#0000ff' }).click()
  await recent.getByRole('button', { name: 'green', exact: true }).click()
  expect(await lastChange(page)).toMatchObject({ trigger: 'recent', color: { hex: '#008000' } })
  await recent.getByRole('button', { name: '删除最近使用颜色' }).click()
  await expect(page.locator('#recent-model')).toHaveText('["rgba(255, 0, 0, 1)"]')
  await expect(recent.getByRole('button', { name: 'green', exact: true })).toHaveCount(0)
  await panel.getByRole('button', { name: '清空最近色数组' }).click()
  await expect(recent.getByRole('button')).toHaveCount(1)
  await expect(recent.getByRole('button', { name: '添加最近使用颜色' })).toBeVisible()
})

test('gradients support angle editing and draggable, keyboard-removable stops', async ({ page }) => {
  const panel = page.locator('#gradient')
  const stops = panel.getByRole('slider', { name: /渐变色标/ })
  const track = panel.locator('.ym-color-picker__gradient-track')
  await expect(stops).toHaveCount(2)
  await expect(panel.getByRole('region', { name: /最近使用|系统预设/ })).toHaveCount(0)
  await panel.getByLabel('渐变角度').fill('120')
  await panel.getByLabel('渐变角度').press('Enter')
  await expect(page.locator('#gradient-model')).toHaveText(/^linear-gradient\(120deg,/)
  await expect(page.locator('#updates')).toHaveText('panel-model')
  expect(await lastChange(page)).toMatchObject({ trigger: 'input', color: { isGradient: true } })
  await track.scrollIntoViewIfNeeded()
  const box = (await track.boundingBox())!
  await track.click({ position: { x: Math.round(box.width / 2), y: Math.round(box.height / 2) } })
  await expect(stops).toHaveCount(3)
  const middle = stops.nth(1)
  const handle = (await middle.boundingBox())!
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * .7, box.y + box.height / 2, { steps: 3 })
  await page.mouse.up()
  await expect(page.locator('#gradient-model')).toHaveText(/\b(?:69|70|71)(?:\.\d+)?%/)
  await middle.press('Delete')
  await expect(stops).toHaveCount(2)
  await stops.first().press('Backspace')
  await expect(stops).toHaveCount(2)
  await panel.getByLabel('可增加渐变色标').uncheck()
  await track.click()
  await expect(stops).toHaveCount(2)
  await panel.getByLabel('显示混合色样').check()
  for (const name of ['系统预设', '最近使用']) {
    const swatches = panel.getByRole('region', { name })
    await expect(swatches.getByRole('button', { name: 'red', exact: true })).toHaveCount(0)
    await expect(swatches.getByRole('button', { name: /^linear-gradient/ })).toBeVisible()
  }
})

test('the trigger and its popup follow nested size, mode, palette and radius settings', async ({ page }) => {
  const globals = page.locator('#globals')
  const trigger = globals.locator('#global-inherited .ym-color-picker__trigger')
  const field = trigger.getByRole('textbox')
  const local = globals.locator('#global-local .ym-color-picker__trigger')
  await expect(trigger).toHaveCSS('height', '40px')
  await expect(trigger).toHaveCSS('border-radius', '12px')
  await expect(local).toHaveCSS('height', '24px')
  await field.click()
  const panel = page.locator('.ym-color-picker__popup:popover-open .ym-color-picker__panel')
  await expect(panel).toHaveCSS('background-color', 'rgb(245, 240, 224)')
  await expect(panel).toHaveCSS('border-radius', '12px')
  await page.keyboard.press('Escape')
  await globals.getByLabel('浅色背景').fill('#decafe')
  await field.click()
  await expect(panel).toHaveCSS('background-color', 'rgb(222, 202, 254)')
  await page.keyboard.press('Escape')
  await globals.getByLabel('深色模式').check()
  await globals.getByLabel('紧凑尺寸和直角').check()
  await expect(trigger).toHaveCSS('height', '20px')
  await expect(trigger).toHaveCSS('border-radius', '0px')
  await expect(local).toHaveCSS('height', '24px')
  await field.click()
  await expect(panel).toHaveCSS('border-radius', '0px')
  await expect(panel).toHaveCSS('background-color', 'rgb(41, 64, 89)')
  await expect(panel).toHaveCSS('color', 'rgb(204, 221, 238)')
})

test('an attached context menu keeps the source palette and supports a custom format popup', async ({ page }) => {
  const globals = page.locator('#globals')
  const field = page.locator('#global-attached').getByRole('textbox', { name: '颜色值' })
  const panel = page.locator('#color-overlay-target').getByRole('dialog', { name: '选择颜色' })
  await field.click()
  await expect(panel).toBeHidden()
  await field.click({ button: 'right' })
  await expect(panel).toBeVisible()
  await expect(panel).toHaveCSS('background-color', 'rgb(245, 240, 224)')
  await expect(panel).toHaveCSS('font-size', '16px')
  await expect(panel).toHaveCSS('border-radius', '12px')

  const format = panel.getByRole('combobox', { name: '颜色格式' })
  await format.click()
  const options = page.locator('.color-format-list:popover-open')
  await options.getByRole('option', { name: 'HEX', exact: true }).click()
  await expect(panel.getByLabel('HEX', { exact: true })).toHaveValue('#ff0000')
  await expect(options).toBeHidden()

  await globals.getByLabel('浅色背景').fill('#decafe')
  await expect(panel).toHaveCSS('background-color', 'rgb(222, 202, 254)')
  // 从键盘切换源 Provider，保持右键打开的面板可见。
  await globals.getByLabel('深色模式').press('Space')
  await globals.getByLabel('紧凑尺寸和直角').press('Space')
  await expect(panel).toHaveCSS('font-size', '11px')
  await expect(panel).toHaveCSS('background-color', 'rgb(41, 64, 89)')
  await expect(panel).toHaveCSS('color', 'rgb(204, 221, 238)')
  await expect(panel).toHaveCSS('border-radius', '0px')
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
})
