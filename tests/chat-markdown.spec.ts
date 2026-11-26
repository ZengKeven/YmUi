import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixture/chat-markdown.html')
})

test('renders semantic blocks and preserves code and raw HTML as literal text', async ({ page }) => {
  const output = page.locator('#standalone')
  const lines = [
    '# 收货计划', '', '###### 负责人', '', '- 北库', '- 南库', '',
    '1. 核验', '2. 签收', '', '> 请带单据', '',
    '<button>字面文本</button>', '', '```html', '<i>第一行</i>', '  - 第二行', '```',
  ]
  await page.getByLabel('源文').fill(lines.join('\n'))
  await expect(output.getByRole('heading', { level: 1, name: '收货计划' })).toBeVisible()
  await expect(output.getByRole('heading', { level: 6, name: '负责人' })).toBeVisible()
  await expect(output.locator('ul > li')).toHaveText(['北库', '南库'])
  await expect(output.locator('ol > li')).toHaveText(['核验', '签收'])
  await expect(output.locator('blockquote')).toHaveText('请带单据')
  await expect(output).toContainText('<button>字面文本</button>')
  await expect(output.getByRole('button')).toHaveCount(0)
  expect(await output.locator('pre > code').textContent()).toMatch(/^<i>第一行<\/i>\n  - 第二行\n?$/)
  await expect(output.locator('pre i, pre li')).toHaveCount(0)
  await page.getByLabel('源文').fill('')
  await expect(output).toHaveText('')
  await expect(output.locator('pre, h1, ul')).toHaveCount(0)
})

test('nested lists keep the starting number and paragraphs inside loose list items', async ({ page }) => {
  await page.getByLabel('源文').fill('3. 北库\n\n   下午到货\n\n   - 单据\n\n4. 南库')
  const list = page.locator('#standalone ol')
  await expect(list).toHaveAttribute('start', '3')
  await expect(list.locator(':scope > li')).toHaveCount(2)
  await expect(list.locator('li').first().locator(':scope > p')).toHaveText(['北库', '下午到货'])
  await expect(list.locator('ul > li')).toHaveText('单据')
})

test('only approved destinations produce links, and rejected labels stay readable', async ({ page }) => {
  const output = page.locator('#standalone')
  const allowed = [
    ['外站', 'https://example.com/notes'], ['订单', '/orders/42'], ['页内', '#details'],
    ['明细', './order'], ['本地服务', 'http://example.com'], ['邮件', 'mailto:ops@example.com'],
    ['电话', 'tel:10086'],
  ]
  const rejected = [
    ['脚本', 'javascript:example'], ['内嵌数据', 'data:,example'], ['文件', 'file:///notes'],
    ['外部域名', '//example.com/notes'], ['反斜杠', 'folder\\notes'],
  ]
  const links = [...allowed, ...rejected].map(([label, href]) => `[${label}](${href})`)
  await page.getByLabel('源文').fill(links.join(' · '))
  await expect(output.getByRole('link')).toHaveCount(allowed.length)
  for (const [label, href] of allowed) {
    await expect(output.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href)
  }
  for (const [label] of rejected) {
    await expect(output).toContainText(label)
    await expect(output.getByRole('link', { name: label })).toHaveCount(0)
  }
  const source = page.getByLabel('源文')
  for (const partial of ['[单据](data:', '[单据](data:,example)']) {
    await source.fill(partial)
    await expect(output).toContainText('单据')
    await expect(output.locator('a')).toHaveCount(0)
  }
  await page.getByLabel('源文').fill('[文档](/guide?a=1&amp;b=2 "A &amp; B") [附件](file&colon;///notes)')
  await expect(output.getByRole('link')).toHaveCount(1)
  await expect(output.getByRole('link', { name: '文档' })).toHaveAttribute('href', '/guide?a=1&b=2')
  await expect(output.getByRole('link', { name: '文档' })).toHaveAttribute('title', 'A & B')
  await expect(output).toContainText('附件')
})

test('chat messages opt into Markdown by block and preserve the order of mixed content', async ({ page }) => {
  const plain = page.locator('#plain .ym-chat-message__bubble')
  await expect(plain).toHaveText('# 标题 [详情](/orders)')
  await expect(plain.locator('h1, a')).toHaveCount(0)
  const mixed = page.locator('#mixed .ym-chat-message__bubble')
  await expect(mixed).toHaveText(/# 原样显示\s*交货明细\s*\[单号\]\(\/orders\)/)
  await expect(mixed.getByRole('heading', { level: 2, name: '交货明细' })).toBeVisible()
  await expect(mixed.locator('h1, a')).toHaveCount(0)
})

test('a streaming Markdown block updates in place across incomplete links and code fences', async ({ page }) => {
  const reply = page.locator('#stream .ym-chat-message')
  const append = page.getByRole('button', { name: '追加一段' })
  await expect(reply.getByRole('status')).toBeVisible()
  await append.click()
  await expect(reply.getByRole('heading', { level: 2, name: '到货' })).toBeVisible()
  await expect(reply.getByRole('status')).toHaveCount(0)
  await expect(reply).toContainText('[单')
  await expect(reply.getByRole('link')).toHaveCount(0)
  await append.click()
  await expect(reply.getByRole('link', { name: '单据' })).toHaveAttribute('href', '/orders/42')
  await append.click()
  await expect(reply.locator('pre > code')).toHaveText('PO-')
  await append.click()
  await expect(reply.locator('pre > code')).toHaveText('PO-42')
  await expect(reply.getByRole('heading')).toHaveCount(1)
  await expect(reply.getByRole('link')).toHaveCount(1)
})

test('Markdown follows nested provider size, theme, mode and radius changes including zero', async ({ page }) => {
  const inherited = page.locator('#inherited .ym-chat-markdown')
  const local = page.locator('#local .ym-chat-markdown')
  await expect(inherited).toHaveCSS('font-size', '16px')
  await expect(local).toHaveCSS('font-size', '12px')
  await expect(inherited).toHaveCSS('color', 'rgb(64, 52, 41)')
  await expect(inherited.locator('pre')).toHaveCSS('border-radius', '9px')
  await page.getByLabel('正文颜色').fill('#445566')
  await expect(inherited).toHaveCSS('color', 'rgb(68, 85, 102)')
  await page.getByLabel('深色模式').check()
  await expect(local).toHaveCSS('color', 'rgb(245, 240, 218)')
  await page.getByLabel('紧凑尺寸').check()
  await expect(inherited).toHaveCSS('font-size', '11px')
  await expect(local).toHaveCSS('font-size', '12px')
  await page.getByLabel('直角代码块').check()
  await expect(inherited.locator('pre')).toHaveCSS('border-radius', '0px')
})
