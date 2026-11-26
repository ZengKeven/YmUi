import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixture/chat-search.html')
})

test('approved destinations are native links and rejected sources keep their text', async ({ page }) => {
  const search = page.locator('#destinations .ym-chat-search')
  const toggle = search.getByRole('button', { name: '来源地址' })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.click()
  const links = search.getByRole('link')
  const allowed = [
    ['本地文档', '/tests/fixture/chat-markdown.html'],
    ['站内相对路径', './chat-message.html'],
    ['本页', '#basic'],
    ['查询', '?order=42'],
    ['带参数的单据', '/orders?warehouse=3&page=2'],
    ['外部文档', 'https://example.com/guide'],
    ['本地服务', 'http://example.test/docs'],
  ]
  for (const [name, href] of allowed) {
    await expect(search.getByRole('link', { name, exact: true })).toHaveAttribute('href', href)
  }
  await expect(links).toHaveCount(allowed.length)
  for (const name of ['内嵌数据', '本地文件', '无协议外站', '反斜杠路径', '控制字符', '脚本协议', '邮箱', '电话', '缺少地址']) {
    await expect(search.getByText(name, { exact: true })).toBeVisible()
    await expect(search.getByRole('link', { name, exact: true })).toHaveCount(0)
  }
  const local = search.getByRole('link', { name: '本地文档' })
  await expect(local).toHaveAttribute('target', '_blank')
  expect((await local.getAttribute('rel'))?.split(/\s+/)).toEqual(expect.arrayContaining(['noopener', 'noreferrer']))
  const [opened] = await Promise.all([page.waitForEvent('popup'), local.press('Enter')])
  await expect(opened).toHaveURL(/\/tests\/fixture\/chat-markdown\.html$/)
})

test('keyboard disclosure controls its own panel and reports both state changes', async ({ page }) => {
  const search = page.locator('#basic .ym-chat-search')
  const toggle = search.getByRole('button')
  await expect(toggle).toHaveAccessibleName('搜索结果（2）')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  const id = await toggle.getAttribute('aria-controls')
  expect(id).toBeTruthy()
  const panel = search.locator(`[id="${id}"]`)
  await expect(search.locator('ol > li')).toHaveCount(2)
  await expect(panel.getByRole('link')).toHaveText(['收货单', '签收记录'])
  const last = panel.getByRole('listitem').last()
  await expect(last).toContainText('单据中心')
  await expect(last).toContainText('2026-11-26')
  await expect(last).toContainText('<em>核对签收数量</em>')
  await expect(last.locator('em')).toHaveCount(0)
  const item = panel.getByRole('link', { name: '收货单' })
  await expect(item).toBeVisible()
  await toggle.press('Enter')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(panel).toBeHidden()
  await expect(page.locator('#changes')).toHaveText('[true]')
  await toggle.press('Space')
  await expect(toggle).toBeFocused()
  await expect(item).toBeVisible()
  await expect(page.locator('#changes')).toHaveText('[true,false]')
  const other = page.locator('#controlled .ym-chat-search').getByRole('button')
  expect(await other.getAttribute('aria-controls')).not.toBe(id)
  await expect(other).toHaveAttribute('aria-expanded', 'false')
  await page.getByLabel('清空来源').check()
  await expect(toggle).toBeHidden()
})

test('controlled disclosure waits for the parent to accept a requested change', async ({ page }) => {
  const search = page.locator('#controlled .ym-chat-search')
  const toggle = search.getByRole('button')
  const link = search.getByRole('link', { name: '收货单' })
  const accept = page.getByRole('button', { name: '应用折叠请求' })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.click()
  await expect(page.locator('#requests')).toHaveText('[false]')
  await expect(link).toBeHidden()
  await accept.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(link).toBeVisible()
  await toggle.click()
  await expect(page.locator('#requests')).toHaveText('[false,true]')
  await expect(link).toBeVisible()
  await accept.click()
  await expect(link).toBeHidden()
})

test('source clicks carry the original index and the owning message, and can cancel navigation', async ({ page }) => {
  const selected = page.locator('#selected')
  for (const [selector, messageId] of [
    ['#basic', null],
    ['#message article', 'single'],
    ['#history [data-message-id="second"]', 'second'],
    ['#history [data-message-id="first"]', 'first'],
  ] as const) {
    await page.locator(selector).getByRole('link', { name: '签收记录' }).click()
    await expect(selected).toHaveText(JSON.stringify(['./history?day=2', '签收记录', 2, true, messageId]))
    expect(page.context().pages()).toHaveLength(1)
  }
})

test('a message keeps source order and disclosure while the answer arrives, and copies only its body', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const message = page.locator('#message article')
  const toggle = message.locator('.ym-chat-search').getByRole('button')
  const copy = message.getByRole('button', { name: '复制' })
  await expect(message).toHaveAttribute('data-status', 'streaming')
  await expect(message.getByRole('link', { name: '收货单' })).toBeVisible()
  await expect(message.getByText('加载中', { exact: true })).toHaveCount(0)
  await expect(copy).toBeDisabled()
  await toggle.click()
  await page.getByRole('button', { name: '追加正文' }).click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(message.getByRole('heading', { name: '签收安排' })).toBeVisible()
  await toggle.click()
  await expect(message.locator('.ym-chat-message__bubble')).toContainText(/收货单[\s\S]*已核对\s*签收安排/)
  await copy.click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('已核对\n## 签收安排')
})

test('search panels inherit live theme, mode, size and nested radius with a local size override', async ({ page }) => {
  const inherited = page.locator('#inherited .ym-chat-search')
  const local = page.locator('#local .ym-chat-search')
  const link = inherited.getByRole('link', { name: '收货单' })
  await expect(inherited).toHaveCSS('font-size', '16px')
  await expect(local).toHaveCSS('font-size', '12px')
  await expect(inherited).toHaveCSS('border-radius', '9px')
  await expect(link).toHaveCSS('color', 'rgb(64, 52, 41)')
  await page.getByLabel('链接颜色').fill('#445566')
  await expect(link).toHaveCSS('color', 'rgb(68, 85, 102)')
  await page.getByLabel('深色模式').check()
  await expect(link).toHaveCSS('color', 'rgb(245, 240, 218)')
  await page.getByLabel('紧凑尺寸').check()
  await expect(inherited).toHaveCSS('font-size', '11px')
  await expect(local).toHaveCSS('font-size', '12px')
  await page.getByLabel('直角面板').check()
  await expect(local).toHaveCSS('border-radius', '0px')
})

test('a streaming message reveals incoming sources and rechecks their URLs after in-place updates', async ({ page }) => {
  const message = page.locator('#incremental [data-message-id="incoming"]')
  const loading = message.getByText('加载中', { exact: true })
  const search = message.locator('.ym-chat-search')
  const toggle = search.getByRole('button')
  await expect(message).toHaveAttribute('data-status', 'streaming')
  await expect(loading).toBeVisible()
  await expect(search).toHaveCount(0)

  await page.getByRole('button', { name: '收到首条来源' }).click()
  await expect(loading).toHaveCount(0)
  await expect(toggle).toHaveAccessibleName('搜索结果（1）')
  const first = search.getByRole('link', { name: '到货记录' })
  await expect(first).toHaveAttribute('href', '/receipts/2')
  await first.click()
  await expect(page.locator('#selected')).toHaveText(JSON.stringify(['/receipts/2', '到货记录', 1, true, 'incoming']))
  await toggle.click()
  await page.getByRole('button', { name: '更新并追加来源' }).click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(toggle).toHaveAccessibleName('搜索结果（2）')
  await toggle.click()
  await expect(search.getByText('到货记录', { exact: true })).toBeVisible()
  await expect(first).toHaveCount(0)
  await expect(search.getByRole('link')).toHaveCount(1)
  await expect(search.getByRole('link', { name: '签收说明' })).toHaveAttribute('href', '/receipts/guide')
})
