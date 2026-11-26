import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixture/chat-actionbar.html')
})

test('the four actions have native buttons, mutually exclusive votes and one event per activation', async ({ page }) => {
  const bar = page.locator('#default .ym-chat-actionbar')
  const buttons = bar.getByRole('button')
  await expect(buttons).toHaveCount(4)
  for (const [index, name] of ['重新生成', '复制', '点赞', '点踩'].entries()) {
    await expect(buttons.nth(index)).toHaveAccessibleName(name)
  }
  const up = bar.getByRole('button', { name: '点赞' })
  const down = bar.getByRole('button', { name: '点踩' })
  await expect(up).toHaveAttribute('aria-pressed', 'false')
  await expect(down).toHaveAttribute('aria-pressed', 'false')
  await up.press('Enter')
  await expect(up).toHaveAttribute('aria-pressed', 'true')
  await down.press('Space')
  await expect(up).toHaveAttribute('aria-pressed', 'false')
  await expect(down).toHaveAttribute('aria-pressed', 'true')
  await down.click()
  await expect(down).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('#comments')).toHaveText('["good","bad",""]')
  await bar.getByRole('button', { name: '重新生成' }).click()
  await expect(page.locator('#actions')).toHaveText('good,bad,bad,replay')
  await expect(page.locator('#native-click')).toHaveText('true')

  await page.getByLabel('禁用操作').check()
  await expect(bar.locator('button:disabled')).toHaveCount(4)
  await up.dispatchEvent('click')
  await expect(up).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('#actions')).toHaveText('good,bad,bad,replay')
  await page.getByLabel('禁用操作').uncheck()
  await page.getByLabel('复制正文').fill('')
  await expect(bar.getByRole('button', { name: '复制' })).toBeDisabled()
  await expect(bar.locator('button:disabled')).toHaveCount(1)
})

test('custom action order and controlled feedback reflect only the accepted vote', async ({ page }) => {
  const bar = page.locator('#controlled .ym-chat-actionbar')
  const buttons = bar.getByRole('button')
  await expect(buttons).toHaveCount(2)
  await expect(buttons.nth(0)).toHaveAccessibleName('点踩')
  await expect(buttons.nth(1)).toHaveAccessibleName('点赞')
  await expect(buttons.nth(0)).toHaveAttribute('aria-pressed', 'true')
  await buttons.nth(1).click()
  await expect(page.locator('#requested')).toHaveText('good')
  await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'false')
  await page.getByRole('button', { name: '应用评价' }).click()
  await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'true')
  await expect(buttons.nth(0)).toHaveAttribute('aria-pressed', 'false')
  await buttons.nth(1).click()
  await expect(page.locator('#requested')).toHaveText('')
  await page.getByRole('button', { name: '应用评价' }).click()
  await expect(buttons.nth(1)).toHaveAttribute('aria-pressed', 'false')
})

test('the message actionbar slot supplies effective status and copies the source of mixed blocks', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const message = page.locator('#slotted .ym-chat-message')
  const copy = message.getByRole('button', { name: '复制' })
  const source = '订单 42\n## 到货\n\n- 北库'
  await expect(message.getByRole('heading', { name: '到货' })).toBeVisible()
  await expect(message.locator('#slot-values')).toHaveText(JSON.stringify([source, 'complete']))
  await copy.click()
  await expect(message.getByRole('status')).toHaveText('已复制')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(source)
  await page.getByLabel('使用临时正文').check()
  await expect(message.locator('#slot-values')).toHaveText('["临时正文","pending"]')
  await expect(copy).toBeDisabled()
})

test('clipboard denial reports failure and a later successful attempt copies the current content', async ({ page }) => {
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true, value: { writeText: () => Promise.reject(new DOMException('denied', 'NotAllowedError')) },
    })
  })
  const bar = page.locator('#default .ym-chat-actionbar')
  const copy = bar.getByRole('button', { name: '复制' })
  await copy.click()
  await expect(bar.getByRole('status')).toHaveText('复制失败，请重试')
  await expect(page.locator('#actions')).toHaveText('copy')
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
    document.execCommand = command => {
      if (command !== 'copy') return false
      document.body.dataset.copied = window.getSelection()?.toString()
      return true
    }
  })
  await page.getByLabel('复制正文').fill('第二次\n重新复制')
  await copy.click()
  await expect(bar.getByRole('status')).toHaveText('已复制')
  await expect(page.locator('body')).toHaveAttribute('data-copied', '第二次\n重新复制')
  await expect(page.locator('#actions')).toHaveText('copy,copy')
})

test('a late clipboard result belongs to the message that requested it', async ({ page }) => {
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: () => new Promise<void>(resolve => window.addEventListener('finish-copy', () => resolve(), { once: true })),
    } })
  })
  const bar = page.locator('#default .ym-chat-actionbar')
  await bar.getByRole('button', { name: '复制' }).click()
  await page.getByLabel('复制正文').fill('更新后的答复')
  await page.evaluate(() => window.dispatchEvent(new Event('finish-copy')))
  await expect(bar.getByRole('status')).toBeEmpty()
  await expect(page.locator('#actions')).toHaveText('copy')
})

test('action buttons inherit the nested palette, size and radius, with a local size override', async ({ page }) => {
  const inherited = page.locator('#inherited').getByRole('button', { name: '复制' })
  const local = page.locator('#local').getByRole('button', { name: '复制' })
  await expect(inherited).toHaveCSS('height', '40px')
  await expect(local).toHaveCSS('height', '24px')
  await expect(inherited).toHaveCSS('border-radius', '9px')
  // 将主题色和 color-mix 的浏览器表示统一为屏幕上的 RGB 值。
  const color = () => inherited.evaluate(el => {
    const ctx = document.createElement('canvas').getContext('2d')!
    ctx.fillStyle = getComputedStyle(el).color
    ctx.fillRect(0, 0, 1, 1)
    return Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3)
  })
  await expect.poll(color).toEqual([64, 52, 41])
  await page.getByLabel('按钮文字颜色').fill('#445566')
  await expect.poll(color).toEqual([68, 85, 102])
  await page.getByLabel('深色模式').check()
  await expect.poll(color).toEqual([245, 240, 218])
  await page.getByLabel('紧凑尺寸').check()
  await expect(inherited).toHaveCSS('height', '20px')
  await expect(local).toHaveCSS('height', '24px')
  await page.getByLabel('直角按钮').check()
  await expect(local).toHaveCSS('border-radius', '0px')
})
