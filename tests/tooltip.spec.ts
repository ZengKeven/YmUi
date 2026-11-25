import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixture/tooltip.html')
})

test('hover and keyboard focus expose the description on the original button', async ({ page }) => {
  const trigger = page.getByRole('button', { name: '查看订单' })
  const next = page.getByRole('button', { name: '后一个按钮' })
  const tooltip = page.getByRole('tooltip')
  await expect(tooltip).toBeHidden()
  await trigger.hover()
  await expect(tooltip).toHaveText('审批后可以查看物流信息')
  await expect(page.locator('.ym-tooltip__panel')).toHaveAttribute('data-placement', 'top')
  await expect(trigger).toHaveAccessibleDescription(/物流详情.*审批后可以查看物流信息/)
  await tooltip.hover()
  await expect(tooltip).toBeVisible()
  await next.hover()
  await expect(tooltip).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-describedby', 'existing-note')

  await page.getByRole('button', { name: '前一个按钮' }).focus()
  await page.keyboard.press('Tab')
  await expect(trigger).toBeFocused()
  await expect(tooltip).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(tooltip).toBeHidden()
  await expect(trigger).toBeFocused()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(tooltip).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(next).toBeFocused()
  await expect(tooltip).toBeHidden()
})

test('blank text and disabled triggers suppress the panel while slotted content takes precedence', async ({ page }) => {
  const trigger = page.getByRole('button', { name: '查看订单' })
  const tooltip = page.getByRole('tooltip')
  await page.getByLabel('禁用提示').check()
  await trigger.hover()
  await expect(tooltip).toBeHidden()
  await page.getByLabel('禁用提示').uncheck()
  await page.getByLabel('说明文字').fill('')
  await trigger.focus()
  await expect(tooltip).toBeHidden()
  await page.getByLabel('自定义内容').check()
  await trigger.hover()
  await expect(tooltip.locator('strong')).toHaveText('由仓库填写')
  await page.getByLabel('说明文字').fill('后备说明')
  await trigger.hover()
  await expect(tooltip).toHaveText('由仓库填写')
})

test('initial visibility and owner-controlled visibility can be used independently', async ({ page }) => {
  const trigger = page.getByRole('button', { name: '请求审批说明' })
  const tooltip = page.getByRole('tooltip')
  await page.getByLabel('显示初始提示用例').check()
  await expect(tooltip).toHaveText('首次挂载提示')
  await page.keyboard.press('Escape')
  await expect(tooltip).toBeHidden()
  await trigger.click()
  await expect(tooltip).toBeHidden()
  await expect(page.locator('#updates')).toHaveText('true')
  await expect(page.locator('#changes')).toHaveText('true')
  await page.getByLabel('接受请求').check()
  await trigger.click()
  await expect(tooltip).toHaveText('审批说明')
  await page.keyboard.press('Escape')
  await expect(tooltip).toBeHidden()
  await expect(page.locator('#updates')).toHaveText('true,true,false')
  await expect(page.locator('#changes')).toHaveText('true,true,false')
  await page.getByRole('button', { name: '外部切换' }).click()
  await expect(tooltip).toBeVisible()
  await expect(page.locator('#updates')).toHaveText('true,true,false')
})

test('the four main placements center the tooltip and the arrow follows its setting', async ({ page }) => {
  await page.getByLabel('展开定位用例').check()
  const panel = page.locator('.geometry-panel')
  const trigger = page.getByRole('button', { name: '单号' })
  await expect(panel).toHaveAttribute('data-arrow', 'true')
  for (const placement of ['top', 'bottom', 'left', 'right']) {
    await page.getByLabel('方向').selectOption(placement)
    await expect(panel).toHaveAttribute('data-placement', placement)
    const tip = (await panel.boundingBox())!
    const anchor = (await trigger.boundingBox())!
    if (placement === 'top' || placement === 'bottom') {
      expect(Math.abs(tip.x + tip.width / 2 - anchor.x - anchor.width / 2)).toBeLessThan(1)
      if (placement === 'top') expect(tip.y + tip.height).toBeLessThan(anchor.y)
      else expect(tip.y).toBeGreaterThan(anchor.y + anchor.height)
    } else {
      expect(Math.abs(tip.y + tip.height / 2 - anchor.y - anchor.height / 2)).toBeLessThan(1)
      if (placement === 'left') expect(tip.x + tip.width).toBeLessThan(anchor.x)
      else expect(tip.x).toBeGreaterThan(anchor.x + anchor.width)
    }
  }
  await page.getByLabel('定位箭头').uncheck()
  await expect(panel).not.toHaveAttribute('data-arrow')
})

test('all six themes render and attached panels follow source palette, mode, size and radius changes', async ({ page }) => {
  await page.getByLabel('展开配色用例').check()
  const panel = page.locator('#external .inherited-panel')
  const local = page.locator('.local-panel')
  const theme = page.getByRole('combobox', { name: '配色', exact: true })
  await expect(panel).toBeVisible()
  await expect(panel).toHaveCSS('border-radius', '6px')
  for (const [variant, color] of [
    ['primary', 'rgb(51, 68, 85)'], ['success', 'rgb(32, 112, 48)'],
    ['warning', 'rgb(191, 104, 3)'], ['danger', 'rgb(154, 52, 52)'],
  ]) {
    await theme.selectOption(variant)
    await expect(panel).toHaveCSS('background-color', color)
    await expect(panel).toHaveCSS('color', 'rgb(248, 241, 235)')
    await expect.poll(() => panel.evaluate(el => getComputedStyle(el, '::before').backgroundColor)).toBe(color)
  }
  await theme.selectOption('default')
  const defaultColor = await panel.evaluate(el => getComputedStyle(el).backgroundColor)
  await theme.selectOption('light')
  await expect(panel).not.toHaveCSS('background-color', defaultColor)
  await theme.selectOption('primary')
  await page.getByLabel('浅色主色').fill('#426789')
  await expect(panel).toHaveCSS('background-color', 'rgb(66, 103, 137)')
  await page.getByLabel('深色模式').check()
  await expect(panel).toHaveCSS('background-color', 'rgb(170, 187, 204)')
  await expect(panel).toHaveCSS('color', 'rgb(23, 40, 57)')
  await page.getByLabel('直角').check()
  await expect(panel).toHaveCSS('border-radius', '0px')
  const localFont = await local.evaluate(el => getComputedStyle(el).fontSize)
  for (const [size, font] of [['extra-small', '11px'], ['small', '12px'], ['medium', '14px'], ['large', '16px']]) {
    await page.getByLabel('全局尺寸').selectOption(size)
    await expect(panel).toHaveCSS('font-size', font)
    await expect(local).toHaveCSS('font-size', localFont)
    if (size === 'small') await expect(panel).toHaveCSS('font-size', localFont)
  }
})
