import { expect, test } from '@playwright/test'

test('tabs and the active panel fill the available height in fixed, percentage and flex layouts', async ({ page }) => {
  await page.goto('/tests/fixture/')
  for (const [layout, height] of Object.entries({ fixed: 288, percentage: 320, flex: 284 })) {
    const container = page.locator(`#tabs-fill-${layout}`)
    const card = container.locator('.ym-tabs')
    const panel = card.getByRole('tabpanel')
    for (const name of ['摘要', '明细']) {
      await card.getByRole('tab', { name }).click()
      await expect(panel).toHaveAccessibleName(name)
      const header = (await card.getByRole('tablist').boundingBox())!
      const content = (await panel.boundingBox())!
      const bounds = (await card.boundingBox())!
      expect(bounds.height).toBe(height)
      expect(content.y).toBe(header.y + header.height)
      expect(content.y + content.height).toBe(bounds.y + bounds.height - 1)
    }
    if (layout === 'flex') {
      const bounds = (await container.boundingBox())!
      const cardBounds = (await card.boundingBox())!
      const footer = (await container.locator('footer').boundingBox())!
      expect(cardBounds.y).toBe(bounds.y + 40)
      expect(footer.y).toBe(cardBounds.y + cardBounds.height)
      expect(footer.y + footer.height).toBe(bounds.y + bounds.height)
      await panel.hover()
      await page.mouse.wheel(0, 200)
      await expect.poll(() => panel.evaluate(el => el.scrollTop)).toBeGreaterThan(0)
    }
  }
})

test('unconstrained tabs grow with their content', async ({ page }) => {
  await page.goto('/tests/fixture/')
  const card = page.locator('#tabs-fill-auto .ym-tabs')
  const summaryHeight = (await card.boundingBox())!.height
  await card.getByRole('tab', { name: '明细' }).click()
  const panel = card.getByRole('tabpanel', { name: '明细' })
  expect((await card.boundingBox())!.height).toBeGreaterThan(summaryHeight + 500)
  expect(await panel.evaluate(el => el.scrollHeight === el.clientHeight)).toBe(true)
})

test('each tab renders its own default slot and preserves input when revisited', async ({ page }) => {
  await page.goto('/tests/fixture/')
  const cases = page.locator('#tabs-cases')
  const list = cases.getByRole('tablist')
  const home = list.getByRole('tab', { name: '首页' })
  const panel = cases.getByRole('tabpanel')
  await expect(panel).toHaveCount(1)
  await expect(home.locator('svg[data-name="home"]')).toBeVisible()
  await expect(panel).toHaveAccessibleName('首页')
  await expect(panel.getByRole('heading', { name: '工作台' })).toBeVisible()
  await panel.getByRole('textbox', { name: '未保存草稿' }).fill('下次继续')
  await list.getByRole('tab', { name: '日程' }).click()
  await expect(panel.getByRole('listitem')).toHaveText('采购评审')
  await expect(cases.getByText('工作台')).toBeHidden()
  await list.getByRole('tab', { name: '事项' }).click()
  await panel.getByRole('button', { name: '登记事项' }).click()
  await expect(panel.locator('output')).toHaveText('1')
  await home.click()
  await expect(panel.getByRole('textbox')).toHaveValue('下次继续')
  await home.click()
  const expected = '["calendar","notes",0]'
  await expect(cases.locator('#tabs-updates')).toHaveText(expected)
  await expect(cases.locator('#tabs-changes')).toHaveText(expected)
  await cases.getByRole('button', { name: '外部切换事项' }).click()
  await expect(panel.locator('output')).toHaveText('1')
  await expect(cases.locator('#tabs-changes')).toHaveText(expected)
})

test('only the selected panel supplies the action at the right of the tab header', async ({ page }) => {
  await page.goto('/tests/fixture/')
  const cases = page.locator('#tabs-cases')
  const card = cases.locator('.ym-tabs')
  const list = card.getByRole('tablist')
  const refresh = card.getByRole('button', { name: /刷新首页/ })
  const filter = card.getByRole('textbox', { name: '筛选事项' })
  await expect(refresh).toBeVisible()
  await expect(list.getByRole('button', { name: /刷新首页/ })).toHaveCount(0)
  const bounds = await card.boundingBox()
  const header = await list.boundingBox()
  const button = await refresh.boundingBox()
  expect(button!.x + button!.width).toBeGreaterThan(bounds!.x + bounds!.width - 32)
  expect(button!.y + button!.height / 2).toBeGreaterThanOrEqual(header!.y)
  expect(button!.y + button!.height / 2).toBeLessThanOrEqual(header!.y + header!.height)
  await refresh.click()
  await expect(refresh).toHaveText('刷新首页 1')
  await expect(list.getByRole('tab', { selected: true })).toHaveText('首页')
  await expect(filter).toBeHidden()

  await list.getByRole('tab', { name: '日程' }).click()
  await expect(refresh).toBeHidden()
  await expect(filter).toBeHidden()
  await list.getByRole('tab', { name: '日程' }).press('ArrowRight')
  await expect(list.getByRole('tab', { selected: true })).toHaveText('事项')
  await filter.fill('本周')
  await filter.press('ArrowLeft')
  await expect(filter).toHaveValue('本周')
  await expect(list.getByRole('tab', { selected: true })).toHaveText('事项')

  await list.getByRole('tab', { name: '事项' }).press('Home')
  await expect(refresh).toBeVisible()
  await expect(filter).toBeHidden()
  await cases.getByRole('button', { name: '外部切换事项' }).click()
  await expect(filter).toBeVisible()
  await expect(filter).toHaveValue('本周')
  await expect(refresh).toBeHidden()
  await expect(cases.locator('#tabs-changes')).toHaveText('["calendar","notes",0]')
})

test('keyboard selection moves focus and exposes the selected panel relationship', async ({ page }) => {
  await page.goto('/tests/fixture/')
  const cases = page.locator('#tabs-cases')
  const list = cases.getByRole('tablist')
  const home = list.getByRole('tab', { name: '首页' })
  await expect(home).toHaveAttribute('tabindex', '0')
  await home.focus()
  for (const [key, name] of [
    ['ArrowRight', '日程'], ['End', '事项'], ['ArrowRight', '首页'],
    ['ArrowLeft', '事项'], ['Home', '首页'],
  ]) {
    await page.keyboard.press(key)
    const active = list.getByRole('tab', { selected: true })
    const panel = cases.getByRole('tabpanel', { name })
    await expect(active).toHaveAccessibleName(name)
    await expect(active).toBeFocused()
    await expect(active).toHaveAttribute('aria-controls', (await panel.getAttribute('id'))!)
    await expect(panel).toHaveAttribute('aria-labelledby', (await active.getAttribute('id'))!)
  }
  await expect(cases.locator('#tabs-model')).toHaveText('0')
})

test('nested tab panels keep independent selection even with the same values', async ({ page }) => {
  await page.goto('/tests/fixture/')
  const cases = page.locator('#tabs-nested')
  const outer = cases.getByRole('tabpanel', { name: '概览', exact: true })
  await expect(outer.getByRole('tabpanel', { name: '本周' })).toHaveText('本周统计')
  await outer.getByRole('tab', { name: '上周' }).click()
  await expect(outer.getByRole('tabpanel', { name: '上周' })).toHaveText('上周统计')
  await cases.getByRole('tab', { name: '操作记录' }).click()
  await expect(cases.getByRole('tabpanel', { name: '操作记录' })).toHaveText('编辑记录')
  await expect(cases.getByRole('tablist')).toHaveCount(1)
  await cases.getByRole('tab', { name: '概览' }).click()
  await expect(outer.getByRole('tab', { selected: true })).toHaveAccessibleName('上周')
})

test('tab headers inherit live provider palette, mode, radius and size with a local size override', async ({ page }) => {
  await page.goto('/tests/fixture/')
  const cases = page.locator('#tabs-cases')
  const card = cases.locator('.ym-tabs')
  await expect(card).toHaveCSS('border-width', '1px')
  await expect(card).toHaveCSS('border-style', 'solid')
  await expect(card).toHaveCSS('border-color', 'rgb(187, 195, 206)')
  const active = cases.getByRole('tab', { selected: true })
  await expect(active).toHaveCSS('height', '52px')
  await expect(active).toHaveCSS('font-size', '18px')
  const tabs = cases.getByRole('tab')
  await expect(tabs.first()).toHaveCSS('border-radius', '13px 0px 0px')
  await expect(tabs.last()).toHaveCSS('border-radius', '0px 13px 0px 0px')
  await tabs.nth(1).click()
  await expect(active).toHaveCSS('border-radius', '0px')
  await expect(active).toHaveCSS('color', 'rgb(35, 101, 71)')
  await cases.getByLabel('选项卡浅色主色').fill('#773355')
  await expect(active).toHaveCSS('color', 'rgb(119, 51, 85)')
  await cases.getByLabel('选项卡深色模式').check()
  await expect(card).toHaveCSS('border-color', 'rgb(89, 99, 113)')
  await expect(active).toHaveCSS('color', 'rgb(153, 187, 221)')
  await cases.getByLabel('选项卡紧凑配置').check()
  await expect(active).toHaveCSS('height', '36px')
  await expect(tabs.first()).toHaveCSS('border-radius', '0px')
  await expect(tabs.last()).toHaveCSS('border-radius', '0px')
  await cases.getByLabel('选项卡局部尺寸').check()
  await expect(active).toHaveCSS('height', '32px')
})
