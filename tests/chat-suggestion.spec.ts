import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixture/chat-suggestion.html')
})

test('questions keep their order, original indices and prompt text on keyboard selection', async ({ page }) => {
  const list = page.locator('#standalone').getByRole('list', { name: '推荐问题' })
  const questions = list.getByRole('button')
  await expect(questions).toHaveText(['核对单据', '核对单据', '仓库地址？', '到货时间？'])
  await questions.nth(1).press('Enter')
  await questions.nth(2).press('Space')
  await questions.nth(3).click()
  await expect(page.locator('#picks li')).toHaveText([
    JSON.stringify([' 出库前需要核对哪些单据？ ', '核对单据', 2, true, null]),
    JSON.stringify(['仓库地址？', '仓库地址？', 3, true, null]),
    JSON.stringify(['到货时间？', '到货时间？', 4, true, null]),
  ])
  await page.getByLabel('禁用追问').check()
  await expect(list.locator('button:disabled')).toHaveCount(4)
  await questions.first().dispatchEvent('click')
  await expect(page.locator('#picks li')).toHaveCount(3)
  await page.getByLabel('清空问题').check()
  await expect(page.locator('#standalone').getByRole('button')).toHaveCount(0)
})

test('message and block must both finish before suggestions appear, and copy contains only the answer', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const message = page.locator('#message article')
  const suggestions = message.getByRole('list', { name: '推荐问题' })
  const copy = message.getByRole('button', { name: '复制' })
  const status = page.getByLabel('消息状态')
  const blockStatus = page.getByLabel('问题块状态')
  await expect(suggestions).toHaveCount(0)
  await expect(copy).toBeDisabled()
  await status.selectOption('streaming')
  await expect(message.getByText('加载中', { exact: true })).toBeVisible()
  await blockStatus.selectOption('complete')
  for (const value of ['streaming', 'stop', 'error']) {
    await status.selectOption(value)
    await expect(suggestions).toHaveCount(0)
  }
  await status.selectOption('complete')
  await expect(suggestions).toBeVisible()
  await expect(copy).toBeDisabled()
  for (const value of ['pending', 'streaming', 'stop', 'error']) {
    await blockStatus.selectOption(value)
    await expect(suggestions).toHaveCount(0)
  }
  await blockStatus.selectOption({ label: '跟随消息' })
  await page.getByLabel('含有回复正文').check()
  await expect(message.getByRole('heading', { name: '收货清单' })).toBeVisible()
  await suggestions.getByRole('button', { name: '仓库地址？' }).click()
  await expect(page.locator('#picks li')).toHaveText([JSON.stringify(['仓库地址？', '仓库地址？', 3, true, 'single'])])
  await copy.click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('## 收货清单')
})

test('a reversed chat list forwards the question and the originating message exactly once', async ({ page }) => {
  const rows = page.locator('#history').getByRole('article')
  await expect(rows.first()).toHaveAttribute('data-message-id', 'second')
  await rows.first().getByRole('button', { name: '仓库地址？' }).click()
  await rows.last().getByRole('button', { name: '核对单据' }).first().click()
  await expect(page.locator('#picks li')).toHaveText([
    JSON.stringify(['仓库地址？', '仓库地址？', 3, true, 'second']),
    JSON.stringify(['入库前需要核对哪些单据？', '核对单据', 0, true, 'first']),
  ])
})

test('question buttons inherit nested size, palette, mode and radius and respect a local size', async ({ page }) => {
  const inherited = page.locator('#inherited').getByRole('button').first()
  const local = page.locator('#local').getByRole('button').first()
  await expect(inherited).toHaveCSS('font-size', '16px')
  await expect(local).toHaveCSS('font-size', '12px')
  await expect(inherited).toHaveCSS('border-radius', '9px')
  const color = () => inherited.evaluate(el => {
    const ctx = document.createElement('canvas').getContext('2d')!
    ctx.fillStyle = getComputedStyle(el).color
    ctx.fillRect(0, 0, 1, 1)
    return Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3)
  })
  await expect.poll(color).toEqual([64, 52, 41])
  await page.getByLabel('问题文字颜色').fill('#445566')
  await expect.poll(color).toEqual([68, 85, 102])
  await page.getByLabel('深色模式').check()
  await expect.poll(color).toEqual([245, 240, 218])
  await page.getByLabel('紧凑尺寸').check()
  await expect(inherited).toHaveCSS('font-size', '11px')
  await expect(local).toHaveCSS('font-size', '12px')
  await page.getByLabel('直角问题按钮').check()
  await expect(local).toHaveCSS('border-radius', '0px')
})
