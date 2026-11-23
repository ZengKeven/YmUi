import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixture/')
})

test('a named switch toggles by mouse, Space and Enter without submitting its form', async ({ page }) => {
  const toggle = page.getByRole('switch', { name: '到货提醒' })
  const events = page.locator('#switch-events')
  await expect(toggle).not.toBeChecked()
  await expect(toggle).toHaveText('关')
  await toggle.click()
  await expect(toggle).toBeChecked()
  await expect(toggle).toHaveText('开')
  await expect(events).toHaveText('update/true change/true/true')
  await toggle.press('Space')
  await expect(toggle).not.toBeChecked()
  await toggle.press('Enter')
  await expect(toggle).toBeChecked()
  await expect(events).toHaveText('update/true change/true/true update/false change/false/true update/true change/true/true')
  await expect(page.locator('#switch-submits')).toHaveText('0')
})

test('uncontrolled switches preserve custom value types and expose state to the label slot', async ({ page }) => {
  const toggle = page.getByRole('switch', { name: '自定义开关值' })
  await expect(toggle).not.toBeChecked()
  await expect(toggle).toHaveText('string/0/false')
  await toggle.click()
  await expect(toggle).toBeChecked()
  await expect(toggle).toHaveText('number/0/true')
  await toggle.click()
  await expect(toggle).toHaveText('string/0/false')
  const initialOn = page.getByRole('switch', { name: '初始开启' })
  await expect(initialOn).toBeChecked()
  await initialOn.click()
  await expect(initialOn).not.toBeChecked()
  await expect(initialOn).toHaveText('通知')
})

test('modelValue takes precedence and both controlled bindings wait for the parent update', async ({ page }) => {
  const model = page.getByRole('switch', { name: '固定开关值' })
  const alias = page.getByRole('switch', { name: '通过 value 控制' })
  for (const toggle of [model, alias]) {
    await expect(toggle).toBeChecked()
    await toggle.click()
    await expect(toggle).toBeChecked()
  }
  await expect(page.locator('#switch-requests')).toHaveText('["off"]')
  await page.getByRole('button', { name: '外部关闭开关' }).click()
  await expect(model).not.toBeChecked()
  await expect(alias).not.toBeChecked()
})

test('the guard allows one request at a time and recovers after cancellation or rejection', async ({ page }) => {
  const toggle = page.getByRole('switch', { name: '审批开关' })
  const log = page.locator('#switch-approvals')
  await toggle.click()
  await toggle.dispatchEvent('click')
  await expect(log).toHaveText('1 / []')
  await expect(toggle).not.toBeChecked()
  await page.getByRole('button', { name: '取消切换' }).click()
  await toggle.click()
  await page.getByRole('button', { name: '审批失败' }).click()
  await expect(log).toHaveText('2 / []')
  await toggle.click()
  await page.getByRole('button', { name: '批准切换' }).click()
  await expect(toggle).toBeChecked()
  await expect(log).toHaveText('3 / [true]')
})

test('disabled and loading switches ignore activation and a pending approval cannot change a disabled switch', async ({ page }) => {
  const toggle = page.getByRole('switch', { name: '审批开关' })
  const disabled = page.getByLabel('暂停审批开关')
  const loading = page.getByLabel('审批开关加载中')
  const log = page.locator('#switch-approvals')
  await loading.check()
  await expect(toggle).toBeDisabled()
  await expect(toggle.locator('.ym-loading__spinner')).toBeVisible()
  await toggle.dispatchEvent('click')
  await expect(log).toHaveText('0 / []')
  await loading.uncheck()
  await toggle.click()
  await disabled.check()
  await expect(toggle).toBeDisabled()
  await page.getByRole('button', { name: '批准切换' }).click()
  await toggle.dispatchEvent('click')
  await expect(toggle).not.toBeChecked()
  await expect(log).toHaveText('1 / []')
  await disabled.uncheck()
  await toggle.click()
  await page.getByRole('button', { name: '批准切换' }).click()
  await expect(log).toHaveText('2 / [true]')
})

test('the track responds to provider size, radius, mode and theme while a local size takes precedence', async ({ page }) => {
  const inherited = page.getByRole('switch', { name: '继承配置的开关' })
  const local = page.getByRole('switch', { name: '局部尺寸的开关' })
  const localHeight = await local.evaluate(el => el.getBoundingClientRect().height)
  expect(localHeight).toBeGreaterThan(0)
  let previousHeight = 0
  for (const size of ['extra-small', 'small', 'medium', 'large']) {
    await page.getByLabel('开关全局尺寸').selectOption(size)
    const height = await inherited.evaluate(el => el.getBoundingClientRect().height)
    expect(height).toBeGreaterThan(previousHeight)
    if (size === 'small') expect(height).toBe(localHeight)
    expect(await local.evaluate(el => el.getBoundingClientRect().height)).toBe(localHeight)
    previousHeight = height
  }
  for (const toggle of [inherited, local]) {
    await expect(toggle).toHaveCSS('background-color', 'rgb(36, 104, 84)')
    await expect(toggle).not.toHaveCSS('border-top-left-radius', '0px')
  }
  await page.getByLabel('开关浅色主题色').fill('#6e375f')
  await expect(inherited).toHaveCSS('background-color', 'rgb(110, 55, 95)')
  await page.getByLabel('开关深色模式').check()
  await page.getByLabel('开关直角').check()
  for (const toggle of [inherited, local]) {
    await expect(toggle).toHaveCSS('background-color', 'rgb(170, 204, 238)')
    await expect(toggle).toHaveCSS('border-top-left-radius', '0px')
  }
})
