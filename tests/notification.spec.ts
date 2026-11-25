import { expect, test } from '@playwright/test'

const fixture = '/tests/fixture/notification.html'
const stack = '.ym-notification__stack'

test('notification slots override props and footer actions remain usable until closed', async ({ page }) => {
  await page.goto(fixture)
  const warning = page.locator('#slots').getByRole('alert')
  await expect(warning.locator('strong')).toHaveText('收货异常')
  await expect(warning.getByText('实收数量少于订单数量。')).toBeVisible()
  await expect(warning.getByText('!', { exact: true })).toBeVisible()
  await expect(warning).not.toContainText('后备')
  await warning.getByRole('button', { name: '查看差异' }).press('Enter')
  await expect(page.locator('#actions')).toHaveText('1')
  await warning.getByRole('button', { name: '已阅' }).press('Enter')
  await expect(warning).toBeHidden()
  expect((await page.locator('#events').innerText()).split(',').sort()).toEqual(['click', 'close-click'])

  const plain = page.locator('#slots').getByRole('status')
  await expect(plain).toHaveText('仅正文插槽')
  await expect(plain.locator('svg')).toHaveCount(0)
  await expect(plain.getByRole('button')).toHaveCount(0)
})

test('the default three-second timeout restarts when pointer and keyboard focus both leave', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') })
  await page.goto(fixture)
  await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'))
  const launch = page.getByRole('button', { name: '显示计时通知' })
  const notice = page.locator('#timed').getByRole('status')
  await launch.click()
  await page.clock.runFor(1500)
  await notice.hover()
  await page.clock.runFor(3100)
  await expect(notice).toBeVisible()
  await notice.getByRole('button', { name: '关闭通知' }).focus()
  await launch.hover()
  await page.clock.runFor(3100)
  await expect(notice).toBeVisible()
  await launch.focus()
  await page.clock.runFor(2900)
  await expect(notice).toBeVisible()
  await page.clock.runFor(200)
  await expect(notice).toBeHidden()
  expect((await page.locator('#events').innerText()).split(',').sort()).toEqual(['duration-end', 'timeout'])
  await expect(page.getByText('仅正文插槽')).toBeVisible()
})

test('shortcuts stack at the four viewport corners and clear independently of global messages', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(fixture)
  await page.getByRole('button', { name: '发布四角通知' }).click()
  const viewport = page.viewportSize()!
  for (const placement of ['top-right', 'top-left', 'bottom-right', 'bottom-left']) {
    const corner = page.locator(`${stack}[data-placement="${placement}"]`)
    const first = corner.locator('.ym-notification').first()
    await expect(first).toBeVisible()
    const box = (await first.boundingBox())!
    const gapX = placement.endsWith('left') ? box.x : viewport.width - box.x - box.width
    const gapY = placement.startsWith('top') ? box.y : viewport.height - box.y - box.height
    for (const gap of [gapX, gapY]) {
      expect(gap).toBeGreaterThanOrEqual(0)
      expect(gap).toBeLessThan(60)
    }
  }
  const top = page.locator(`${stack}[data-placement="top-right"]`)
  const first = top.getByRole('status').filter({ hasText: '等待收货' })
  const second = top.getByRole('status').filter({ hasText: '核对完成' })
  const firstBox = (await first.boundingBox())!
  expect((await second.boundingBox())!.y).toBeGreaterThanOrEqual(firstBox.y + firstBox.height)
  await expect(page.locator(stack).getByRole('alert')).toHaveCount(2)
  await expect(page.locator(`${stack}[data-placement="bottom-right"]`)).toContainText('仓库 A')
  const close = page.getByRole('button', { name: '关闭第一条通知' })
  await close.press('Enter')
  await close.press('Enter')
  await expect(first).toBeHidden()
  await expect(second).toBeVisible()
  await expect(page.locator('#events')).toHaveText('api')
  await page.getByRole('button', { name: '关闭全部通知' }).press('Enter')
  await expect(page.locator(stack)).toHaveCount(0)
  const message = page.getByText('独立的全局提示', { exact: true })
  await expect(message).toBeVisible()
  const shortcut = page.getByRole('button', { name: '快捷通知' })
  await shortcut.press('Enter')
  const notice = top.getByRole('status')
  await expect(notice).toHaveText('ad')
  await expect(shortcut).toBeFocused()
  await expect(notice).toHaveCSS('border-radius', '7px')
  await page.getByRole('button', { name: '关闭全局提示' }).press('Enter')
  await expect(message).toBeHidden()
  await expect(notice).toBeVisible()
})

test('command callbacks fire once and release the host after button or timeout dismissal', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-01T12:00:00Z') })
  await page.goto(fixture)
  await page.clock.pauseAt(new Date('2026-01-01T12:01:00Z'))
  const launch = page.getByRole('button', { name: '发布限时通知' })
  const close = page.locator(stack).getByRole('button', { name: '知道了' })
  await launch.click()
  await expect(close).toBeVisible()
  await page.clock.runFor(550)
  await expect(page.locator(stack)).toHaveCount(0)
  await launch.click()
  await close.press('Enter')
  await expect(page.locator(stack)).toHaveCount(0)
  await page.getByRole('button', { name: '关闭第一条通知' }).press('Enter')
  await page.clock.runFor(550)
  expect((await page.locator('#events').innerText()).split(',').sort()).toEqual(['click', 'close-click', 'duration-end', 'timeout'])
})

test('detached notifications track live nested provider settings and honor a local size', async ({ page }) => {
  await page.goto(fixture)
  await page.getByRole('button', { name: '从指定区域发布' }).click()
  const inline = page.locator('#source .ym-notification')
  const external = page.locator(`${stack} .ym-notification`).filter({ hasText: '来源通知' })
  const local = page.locator(`${stack} .ym-notification`).filter({ hasText: '单独尺寸' })
  await expect(external).toBeVisible()
  expect(await external.evaluate(el => el.closest('#app') === null)).toBe(true)
  for (const card of [inline, external]) {
    await expect(card).toHaveCSS('border-radius', '7px')
    await expect(card).toHaveCSS('background-color', 'rgb(252, 248, 238)')
    await expect(card).toHaveCSS('color', 'rgb(48, 68, 98)')
  }
  await page.getByLabel('浅色表面').fill('#e8edd3')
  await expect(external).toHaveCSS('background-color', 'rgb(232, 237, 211)')
  await page.getByLabel('深色模式').check()
  await page.getByLabel('直角').check()
  for (const card of [inline, external]) {
    await expect(card).toHaveCSS('border-radius', '0px')
    await expect(card).toHaveCSS('background-color', 'rgb(43, 54, 71)')
    await expect(card).toHaveCSS('color', 'rgb(243, 241, 234)')
  }
  for (const [size, font] of [['extra-small', '11px'], ['small', '12px'], ['medium', '14px'], ['large', '16px']]) {
    await page.getByLabel('通知尺寸').selectOption(size)
    await expect(inline).toHaveCSS('font-size', font)
    await expect(external).toHaveCSS('font-size', font)
    await expect(local).toHaveCSS('font-size', '12px')
  }
})
