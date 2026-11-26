import { expect, test, type Page } from '@playwright/test'
import type { ChatStreamContent } from 'ym-ui-vapor'

interface CapturedStream {
  request: Request
  controller: ReadableStreamDefaultController<Uint8Array>
  cancelled: boolean
}

declare global {
  interface Window {
    chatStreams: CapturedStream[]
    ChatEngineForTest: typeof import('ym-ui-vapor').ChatEngine
  }
}

const endpoint = '/api/sse-fixture'
const fixture = '/tests/fixture/chat-engine.html'
const assistant = (page: Page) => page.locator('.ym-chatbot [data-role=assistant]').last()

async function send(page: Page, text = '核对送货单') {
  const sender = page.locator('.ym-chat-sender')
  await sender.getByRole('textbox').fill(text)
  await sender.getByRole('button', { name: '发送消息' }).click()
}

// 在浏览器内指定原始字节块的边界，不依赖网络栈合并写入的时机。
async function captureStreams(page: Page) {
  await page.addInitScript(path => {
    const nativeFetch = window.fetch.bind(window)
    window.chatStreams = []
    window.fetch = (input, init) => {
      const request = new Request(input, init)
      if (new URL(request.url).pathname !== path) return nativeFetch(input, init)
      let cancelled = false
      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          window.chatStreams.push({ request, controller, get cancelled() { return cancelled } })
        },
        cancel() { cancelled = true },
      })
      return Promise.resolve(new Response(body, { headers: { 'Content-Type': 'text/event-stream; charset=utf-8' } }))
    }
  }, endpoint)
}

async function write(page: Page, text: string, index = 0) {
  await page.evaluate(({ text, index }) => {
    window.chatStreams[index].controller.enqueue(new TextEncoder().encode(text))
  }, { text, index })
}

function frame(data: unknown) {
  return 'data: ' + JSON.stringify(data) + '\n\n'
}

test('maps only complete SSE frames across individual UTF-8 bytes and all three line endings', async ({ page }) => {
  await captureStreams(page)
  await page.goto(fixture + '?map')
  await send(page)
  await expect.poll(() => page.evaluate(() => window.chatStreams.length)).toBe(1)
  expect(await page.evaluate(async () => {
    const { request } = window.chatStreams[0]
    return [request.headers.get('X-Request-Kind'), await request.json()]
  })).toEqual(['send', { question: '核对送货单' }])
  const payload = '{"piece":\n"到货🌾"}'
  await page.evaluate(() => {
    const wire = '\ufeff: ping\r\nunknown: skipped\r\nid: 7\r\nevent: part\r\ndata: {"piece":\r\ndata: "到货🌾"}\r\n\r\n'
      + 'event: ignore\rdata: hidden\r\rid: bad\0id\ndata:  保留前导空格\n\n'
    const stream = window.chatStreams[0]
    for (const byte of new TextEncoder().encode(wire)) stream.controller.enqueue(Uint8Array.of(byte))
  })
  await expect(page.locator('#frames')).toHaveText(JSON.stringify([
    ['part', '7', { piece: '到货🌾' }, payload],
    ['ignore', '7', 'hidden', 'hidden'],
    ['message', '7', ' 保留前导空格', ' 保留前导空格'],
  ]))
  await expect(assistant(page)).toHaveAttribute('data-status', 'streaming')
  await expect(assistant(page)).toContainText('到货🌾 保留前导空格')
  await write(page, 'data: 最后一个事件缺少空行\n')
  await page.evaluate(() => window.chatStreams[0].controller.close())
  await expect(assistant(page)).toHaveAttribute('data-status', 'complete')
  await expect(assistant(page)).not.toContainText('缺少空行')
  await expect(page.locator('#events')).toHaveText('["complete:send"]')
})

test('POSTs conversation and file metadata and completes on DONE without waiting for EOF', async ({ page }) => {
  await captureStreams(page)
  await page.goto(fixture)
  await page.locator('input[type=file]').setInputFiles({
    name: '回执.txt', mimeType: 'text/plain', buffer: Buffer.from('signed'),
  })
  await send(page)
  await expect.poll(() => page.evaluate(() => window.chatStreams.length)).toBe(1)
  const sent = await page.evaluate(async () => {
    const { request } = window.chatStreams[0]
    return { method: request.method, accept: request.headers.get('accept'), body: await request.json() }
  })
  expect(sent.method).toBe('POST')
  expect(sent.accept).toContain('text/event-stream')
  expect(sent.body).toMatchObject({
    prompt: '核对送货单', trigger: 'send', attachments: [{ name: '回执.txt', size: 6 }],
    messages: [{ role: 'user', content: [{ type: 'text', data: '核对送货单' }, { type: 'attachment', data: [{ name: '回执.txt' }] }] }],
  })
  expect(sent.body.attachments[0]).not.toHaveProperty('raw')
  expect(sent.body.messages[0].content[1].data[0]).not.toHaveProperty('raw')
  await write(page, 'data: 收到\n\ndata: "签收"\n\ndata: {"delta":"记录"}\n\ndata: [DONE]\n\ndata: 迟到的分片\n\n')
  await expect(assistant(page)).toHaveAttribute('data-status', 'complete')
  await expect(assistant(page).locator('.ym-chat-markdown')).toHaveText('收到签收记录')
  expect(await page.evaluate(() => window.chatStreams[0].cancelled)).toBe(true)
  await expect(page.locator('#errors')).toHaveText('[]')
})

test('custom SSE events update sources, merge thinking and Markdown and reveal questions on completion', async ({ page }) => {
  await captureStreams(page)
  await page.goto(fixture + '?map')
  await send(page)
  await expect.poll(() => page.evaluate(() => window.chatStreams.length)).toBe(1)
  const reply = assistant(page)
  const thinking = reply.locator('.ym-chat-thinking')
  const markdown = reply.locator('.ym-chat-markdown')
  const question = reply.getByRole('button', { name: '如何补单？' })
  await write(page, 'event: reasoning\ndata: 先核对\n\n')
  await expect(thinking).toHaveAttribute('data-status', 'streaming')
  await expect(thinking).toContainText('先核对')
  await expect(markdown).toHaveCount(0)
  await write(page, 'event: reasoning\ndata: 收货时间。\n\n')
  await expect(thinking).toContainText('先核对收货时间。')
  await write(page, 'event: catalog\n' + frame(['收货手册']))
  const sources = reply.locator('.ym-chat-search')
  await expect(sources.getByText('收货手册')).toBeVisible()
  await write(page, 'event: catalog\n' + frame([]))
  await expect(sources).toHaveCount(0)
  await write(page, 'event: document\ndata: /checklist.txt\n\n')
  await expect(reply.getByRole('link', { name: '收货清单.txt' })).toHaveAttribute('href', '/checklist.txt')
  await write(page, frame({ piece: '# 安排' }))
  await expect(thinking).toHaveAttribute('data-status', 'complete')
  await expect(markdown.getByRole('heading')).toHaveText('安排')
  await write(page, 'event: question\ndata: 旧的推荐\n\nevent: question\ndata: 如何补单？\n\n'
    + frame({ piece: '\n\n请去北门。' }))
  await expect(markdown).toContainText('请去北门。')
  await expect(markdown).toHaveCount(1)
  await expect(reply).toHaveAttribute('data-status', 'streaming')
  await expect(question).toHaveCount(0)
  await page.evaluate(() => window.chatStreams[0].controller.close())
  await expect(reply).toHaveAttribute('data-status', 'complete')
  await expect(question).toBeVisible()
  await expect(reply.getByRole('button', { name: '旧的推荐' })).toHaveCount(0)
})

test('search updates one panel in place, rechecks changed URLs and carries the latest sources into history', async ({ page }) => {
  await captureStreams(page)
  await page.goto(fixture)
  await send(page)
  await expect.poll(() => page.evaluate(() => window.chatStreams.length)).toBe(1)
  const reply = assistant(page)
  const id = await reply.getAttribute('data-message-id')
  const panel = reply.locator('.ym-chat-search')
  const toggle = panel.getByRole('button')
  const markdown = reply.locator('.ym-chat-markdown')
  const receipt = panel.getByRole('link', { name: '收货清单' })
  await write(page, frame({ type: 'search', data: { title: '初查', references: [
    { title: '收货清单', url: '/receipts' }, { title: '初版名录' },
  ] } }))
  await expect(receipt).toHaveAttribute('href', '/receipts')
  await expect(markdown).toHaveCount(0)
  await toggle.click()
  await write(page, frame({ type: 'markdown', data: '## 签收' })
    + frame({ type: 'search', status: 'complete', data: { title: '核实后的来源' } }))
  await expect(markdown.getByRole('heading')).toHaveText('签收')
  await expect(toggle).toHaveAccessibleName('核实后的来源')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.click()
  await expect(receipt).toBeVisible()

  const guide = { title: '签收说明', url: './guide?a=1&amp;b=2', site: '仓库' }
  const references = [
    { title: ' ', url: '/hidden' }, { title: '收货清单', url: '//example.test/receipts' },
    guide, { title: '目录', url: 'https://example.test/catalog' },
  ]
  await write(page, frame({ type: 'search', data: { references } }) + frame({ delta: '\n\n请先登记。' }))
  await expect(panel.getByRole('listitem')).toHaveCount(3)
  await expect(panel.getByText('初版名录')).toHaveCount(0)
  await expect(receipt).toHaveCount(0)
  await expect(panel.getByText('收货清单', { exact: true })).toBeVisible()
  await expect(panel.getByRole('link', { name: '目录' })).toHaveAttribute('href', 'https://example.test/catalog')
  const link = panel.getByRole('link', { name: guide.title })
  await expect(link).toHaveAttribute('href', './guide?a=1&b=2')
  await link.click()
  const selection = page.locator('#selected-source')
  await expect(selection).not.toBeEmpty()
  expect(JSON.parse(await selection.innerText())).toEqual(['./guide?a=1&b=2', guide, 2, id, true])
  expect(page.context().pages()).toHaveLength(1)
  await expect(markdown).toHaveCount(1)
  await expect(markdown).toContainText('请先登记。')

  await write(page, 'data: [DONE]\n\n')
  await expect(reply).toHaveAttribute('data-status', 'complete')
  await send(page, '下一批货呢？')
  await expect.poll(() => page.evaluate(() => window.chatStreams.length)).toBe(2)
  const body = await page.evaluate(() => window.chatStreams[1].request.json())
  expect(body.messages[1].content).toEqual([
    { type: 'search', status: 'complete', data: { title: '核实后的来源', references } },
    { type: 'markdown', data: '## 签收\n\n请先登记。' },
  ])
})

test('reply attachments appear before Markdown, update in place and carry the latest list into history', async ({ page }) => {
  await captureStreams(page)
  await page.goto(fixture)
  await send(page)
  await expect.poll(() => page.evaluate(() => window.chatStreams.length)).toBe(1)
  const reply = assistant(page)
  const list = reply.getByRole('list', { name: '附件列表' })
  const markdown = reply.locator('.ym-chat-markdown')
  const photo = { id: 'calendar', name: '日历.png', url: '/playground/examples/assets/delivery-calendar.png' }
  await write(page, frame({ type: 'attachment', data: [photo] }))
  await expect(reply).toHaveAttribute('data-status', 'streaming')
  await expect(markdown).toHaveCount(0)
  await expect(list.getByRole('button', { name: /移除/ })).toHaveCount(0)
  await list.getByRole('button', { name: '预览 日历.png' }).click()
  const preview = page.getByRole('dialog').getByRole('img', { name: photo.name })
  await expect(preview).toBeVisible()
  await write(page, frame({ type: 'markdown', data: '## 收货' }))
  await expect(markdown.getByRole('heading')).toHaveText('收货')
  await expect(preview).toBeVisible()

  await write(page, frame({ type: 'attachment', data: [{ ...photo, url: '//example.test/calendar' }] }))
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(list.getByRole('img')).toHaveCount(0)
  await expect(list.getByText(photo.name)).toBeVisible()
  await write(page, frame({ type: 'attachment', data: [] }))
  await expect(list).toHaveCount(0)

  const files = [{ uid: 2, name: '清单.txt', url: '/checklist.txt', size: 20 }]
  await write(page, frame({ type: 'attachment', data: files }) + frame({ delta: '\n\n请核对清单。' }) + 'data: [DONE]\n\n')
  await expect(reply).toHaveAttribute('data-status', 'complete')
  await expect(list.getByRole('link', { name: '清单.txt' })).toHaveAttribute('href', '/checklist.txt')
  await expect(markdown).toHaveCount(1)
  await expect(markdown).toContainText('请核对清单。')
  await send(page, '继续')
  await expect.poll(() => page.evaluate(() => window.chatStreams.length)).toBe(2)
  const body = await page.evaluate(() => window.chatStreams[1].request.json())
  expect(body.attachments).toEqual([])
  expect(body.messages[1].content).toEqual([
    { type: 'attachment', data: files }, { type: 'markdown', data: '## 收货\n\n请核对清单。' },
  ])
})

test('a suggested turn keeps the draft and stops mid-thought without enabling concurrent follow-ups', async ({ page }) => {
  await captureStreams(page)
  await page.goto(fixture)
  await send(page)
  await expect.poll(() => page.evaluate(() => window.chatStreams.length)).toBe(1)
  await write(page, frame({ type: 'suggestion', data: [{ title: '签收流程' }] }) + 'data: [DONE]\n\n')
  const question = page.getByRole('button', { name: '签收流程' })
  const sender = page.locator('.ym-chat-sender')
  const input = sender.getByRole('textbox')
  await input.fill('我的待发送问题')
  await sender.locator('input[type=file]').setInputFiles({ name: '草稿.txt', mimeType: 'text/plain', buffer: Buffer.from('draft') })
  await question.click()
  await expect.poll(() => page.evaluate(() => window.chatStreams.length)).toBe(2)
  expect(await page.evaluate(() => window.chatStreams[1].request.json())).toMatchObject({ prompt: '签收流程', attachments: [] })
  await expect(input).toHaveValue('我的待发送问题')
  await expect(sender.getByText('草稿.txt', { exact: true })).toBeVisible()
  await expect(question).toBeDisabled()
  await write(page, frame({ type: 'thinking', data: { text: '正在核对签收人。' } }), 1)
  const thinking = assistant(page).locator('.ym-chat-thinking')
  await expect(thinking).toHaveAttribute('data-status', 'streaming')
  await sender.getByRole('button', { name: '停止生成' }).click()
  await expect(assistant(page)).toHaveAttribute('data-status', 'stop')
  await expect(thinking).toHaveAttribute('data-status', 'complete')
  await expect(thinking).toContainText('正在核对签收人。')
  await expect(question).toBeEnabled()
  await expect(page.getByRole('article')).toHaveCount(4)
})

test('a thinking status frame can finish the panel before any Markdown arrives', async ({ page }) => {
  await captureStreams(page)
  await page.goto(fixture)
  await send(page)
  await expect.poll(() => page.evaluate(() => window.chatStreams.length)).toBe(1)
  const reply = assistant(page)
  const thinking = reply.locator('.ym-chat-thinking')
  await write(page, frame({ type: 'thinking', data: { title: '核对中', text: '已扫描。' } }))
  await thinking.getByRole('button', { name: '核对中' }).click()
  await write(page, frame({ type: 'thinking', status: 'complete', data: { title: '核对结束' } }))
  await expect(thinking).toHaveAttribute('data-status', 'complete')
  const toggle = thinking.getByRole('button', { name: '核对结束' })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(reply).toHaveAttribute('data-status', 'streaming')
  await expect(reply.locator('.ym-chat-markdown')).toHaveCount(0)
  await toggle.click()
  await expect(thinking.getByText('已扫描。')).toBeVisible()
  await write(page, 'data: [DONE]\n\n')
  await expect(reply).toHaveAttribute('data-status', 'complete')
})

test('stopping a body read aborts the fetch signal and regenerates the same assistant message', async ({ page }) => {
  await captureStreams(page)
  await page.goto(fixture)
  await send(page)
  const reply = assistant(page)
  await expect(reply).toHaveAttribute('data-status', 'pending')
  const id = await reply.getAttribute('data-message-id')
  await write(page, frame({ type: 'thinking', data: { text: '已查清单。' } })
    + frame({ type: 'search', data: { references: [{ title: '收货记录' }] } })
    + frame({ type: 'attachment', data: [{ name: '已收到.txt' }] })
    + 'data: 已收到的文字\n\n' + frame({ type: 'suggestion', data: [{ title: '过期的追问' }] }) + 'data: 半个')
  await expect(reply).toHaveAttribute('data-status', 'streaming')
  await page.getByRole('button', { name: '停止生成' }).click()
  await expect(reply).toHaveAttribute('data-status', 'stop')
  await expect(reply.locator('.ym-chat-thinking')).toContainText('已查清单。')
  await expect(reply.locator('.ym-chat-search').getByText('收货记录')).toBeVisible()
  await expect(reply.getByText('已收到.txt')).toBeVisible()
  await expect(reply.getByRole('button', { name: '过期的追问' })).toHaveCount(0)
  await expect(reply.locator('.ym-chat-markdown')).toHaveText('已收到的文字')
  await expect.poll(() => page.evaluate(() => {
    const source = window.chatStreams[0]
    return source.request.signal.aborted && source.cancelled
  })).toBe(true)
  await expect(page.locator('#events')).toHaveText('["abort","stopped:send"]')
  await reply.getByRole('button', { name: '重新生成' }).click()
  await expect.poll(() => page.evaluate(() => window.chatStreams.length)).toBe(2)
  expect(await page.evaluate(() => window.chatStreams[1].request.json())).toMatchObject({ trigger: 'regenerate', prompt: '核对送货单' })
  await write(page, 'data: 新的回复\n\nevent: done\ndata: {}\n\ndata: 多余的回复\n\n', 1)
  await expect(reply).toHaveAttribute('data-status', 'complete')
  await expect(reply).toHaveAttribute('data-message-id', id!)
  await expect(reply.locator('.ym-chat-markdown')).toHaveText('新的回复')
  await expect(reply.locator('.ym-chat-thinking')).toHaveCount(0)
  await expect(reply.locator('.ym-chat-search')).toHaveCount(0)
  await expect(reply.getByRole('list', { name: '附件列表' })).toHaveCount(0)
  await expect(reply.getByRole('list', { name: '推荐问题' })).toHaveCount(0)
  await expect(page.getByRole('article')).toHaveCount(2)
  await expect(page.locator('#errors')).toHaveText('[]')
})

test('HTTP, MIME, application and mapping errors leave the same turn available for retry', async ({ page }) => {
  const responses = [
    { status: 503, contentType: 'text/plain', body: '服务暂时不可用' },
    { contentType: 'application/json', body: '{"message":"此响应不是事件流"}' },
    { contentType: 'text/event-stream', body: 'data: 初步结果\n\nevent: error\ndata: 服务端断流\n\n' },
    { contentType: 'text/event-stream', body: 'event: invalid\ndata: 不能转换\n\n' },
    { contentType: 'text/event-stream', body: 'data: 恢复成功\n\n' },
  ]
  let attempt = 0
  await page.route('**' + endpoint, route => route.fulfill(responses[attempt++]))
  await page.goto(fixture + '?map')
  await send(page)
  const reply = assistant(page)
  const errors = page.locator('#errors')
  const id = await reply.getAttribute('data-message-id')
  for (let i = 0; i < responses.length - 1; i++) {
    await expect.poll(async () => JSON.parse(await errors.innerText()).length).toBe(i + 1)
    await expect(reply).toHaveAttribute('data-status', 'error')
    await expect(reply.getByRole('alert')).toBeVisible()
    if (i === 0) await expect(errors).toContainText('503')
    if (i === 2) await expect(reply.locator('.ym-chat-markdown')).toHaveText('初步结果')
    if (i === 3) await expect(errors).toContainText('无法转换此事件')
    await reply.getByRole('button', { name: '重新生成' }).click()
  }
  await expect(reply).toHaveAttribute('data-status', 'complete')
  await expect(reply).toHaveAttribute('data-message-id', id!)
  await expect(reply.locator('.ym-chat-markdown')).toHaveText('恢复成功')
  await expect(page.getByRole('article')).toHaveCount(2)
  await expect(page.locator('#events')).toHaveText('["complete:regenerate"]')
})

test('a transport failure and an unmapped object both report errors instead of appending the event', async ({ page }) => {
  await captureStreams(page)
  await page.goto(fixture)
  await send(page)
  await expect.poll(() => page.evaluate(() => window.chatStreams.length)).toBe(1)
  await write(page, 'data: 先到的片段\n\n')
  await expect(assistant(page)).toHaveAttribute('data-status', 'streaming')
  await page.evaluate(() => window.chatStreams[0].controller.error(new Error('读取连接中断')))
  await expect(assistant(page)).toHaveAttribute('data-status', 'error')
  await expect(assistant(page).locator('.ym-chat-markdown')).toHaveText('先到的片段')
  await expect(page.locator('#errors')).toHaveText('["读取连接中断"]')
  await assistant(page).getByRole('button', { name: '重新生成' }).click()
  await expect.poll(() => page.evaluate(() => window.chatStreams.length)).toBe(2)
  await write(page, 'data: {"other":"未知格式"}\n\n', 1)
  await expect(assistant(page)).toHaveAttribute('data-status', 'error')
  await expect(assistant(page)).not.toContainText('未知格式')
  await expect(page.locator('#errors')).toContainText('onMessage')
  expect(await page.evaluate(() => window.chatStreams[1].cancelled)).toBe(true)
})

test('invalid structured data fails the stream without losing earlier blocks or publishing questions', async ({ page }) => {
  const invalid = [
    { type: 'thinking', data: { text: 12 } },
    { type: 'markdown', data: ['正文'] },
    { type: 'suggestion', data: [{ title: '如何签收？', prompt: false }] },
    { type: 'search', data: { references: '无效的清单' } },
    { type: 'search', data: { references: [{ title: '无效的地址', url: 7 }] } },
    { type: 'search', status: 'invalid', data: {} },
    { type: 'attachment', data: {} },
    { type: 'attachment', data: [{ name: '  ' }] },
    { type: 'attachment', data: [{ name: '清单.png', raw: { type: 'image/png' } }] },
  ]
  let attempt = 0
  await page.route('**' + endpoint, route => {
    const body = frame({ type: 'thinking', data: { title: '核对清单', text: '共三项。' } })
      + frame({ type: 'search', data: { references: [{ title: '已查到的单据' }] } })
      + frame({ type: 'attachment', data: [{ name: '签收记录.txt' }] })
      + frame({ type: 'markdown', data: '已核对。' })
      + frame({ type: 'suggestion', data: [{ title: '提前到达的推荐' }] })
      + frame(invalid[attempt++]) + 'data: 后续内容\n\ndata: [DONE]\n\n'
    return route.fulfill({ contentType: 'text/event-stream', body })
  })
  await page.goto(fixture)
  await send(page)
  const reply = assistant(page)
  for (let i = 0; i < invalid.length; i++) {
    if (i) await reply.getByRole('button', { name: '重新生成' }).click()
    await expect.poll(async () => JSON.parse(await page.locator('#errors').innerText()).length).toBe(i + 1)
    await expect(reply).toHaveAttribute('data-status', 'error')
    await expect(reply.locator('.ym-chat-thinking')).toContainText('共三项。')
    await expect(reply.locator('.ym-chat-search').getByText('已查到的单据')).toBeVisible()
    await expect(reply.getByText('签收记录.txt')).toBeVisible()
    await expect(reply.locator('.ym-chat-markdown')).toHaveText('已核对。')
    await expect(reply.getByRole('list', { name: '推荐问题' })).toHaveCount(0)
  }
  await expect(page.locator('#events')).toHaveText('[]')
})

test('standalone callbacks receive normalized blocks once and text-only callers keep legacy behavior', async ({ page }) => {
  const thinking: ChatStreamContent = { type: 'thinking', status: 'complete', data: { text: '已核对。' } }
  const markdown: ChatStreamContent = { type: 'markdown', data: '。' }
  const search: ChatStreamContent = { type: 'search', data: { references: [{ title: '签收须知', url: '/guide' }] } }
  const attachment: ChatStreamContent = { type: 'attachment', data: [{ fileType: 'pdf', name: '回执.pdf', url: '/receipt.pdf' }] }
  const suggestion: ChatStreamContent = { type: 'suggestion', data: [{ title: '下一项', prompt: '查看下一项' }] }
  await page.route('**' + endpoint, route => route.fulfill({
    contentType: 'text/event-stream',
    body: 'data: 答\n\n' + frame({ delta: '案' }) + frame(markdown) + frame(attachment) + frame(search) + frame(thinking) + frame(suggestion) + 'data: [DONE]\n\n',
  }))
  await page.goto(fixture)
  const result = await page.evaluate(async () => {
    const engine = new window.ChatEngineForTest({ endpoint: '/api/sse-fixture' })
    const chunks: string[] = []
    const blocks: ChatStreamContent[] = []
    const base = { prompt: '清单', attachments: [], messages: [], trigger: 'send' as const,
      signal: new AbortController().signal }
    const onChunk = (delta: string) => chunks.push(delta)
    const onlyContent: ChatStreamContent[] = []
    await engine.send({ ...base, onContent: block => onlyContent.push(block) })
    await engine.send({ ...base, onChunk, onContent: block => blocks.push(block) })
    const duplicateChunks = chunks.slice()
    try {
      await engine.send({ ...base, onChunk })
    } catch (error) {
      return { blocks, onlyContent, duplicateChunks, chunks, error: (error as Error).message }
    }
  })
  const expected = [{ type: 'markdown', data: '答' }, { type: 'markdown', data: '案' }, markdown, attachment, search, thinking, suggestion]
  expect(result).toEqual({
    blocks: expected, onlyContent: expected,
    duplicateChunks: [], chunks: ['答', '案', '。'], error: expect.stringContaining('onContent'),
  })
})

test('a custom event mapper can attach a local File from another window', async ({ page }) => {
  await page.route('**' + endpoint, route => route.fulfill({
    contentType: 'text/event-stream', body: 'event: report\ndata: 收货记录\n\ndata: [DONE]\n\n',
  }))
  await page.goto(fixture)
  const result = await page.evaluate(async () => {
    const iframe = document.createElement('iframe')
    document.body.append(iframe)
    const child = iframe.contentWindow as Window & typeof globalThis
    const file = new child.File(['三个包裹'], '记录.txt', { type: 'text/plain' })
    const engine = new window.ChatEngineForTest({
      endpoint: '/api/sse-fixture',
      onMessage: () => ({ type: 'attachment', data: [{ name: file.name, raw: file }] }),
    })
    let received = false
    await engine.send({ prompt: '收货记录', messages: [], attachments: [], trigger: 'send',
      signal: new AbortController().signal,
      onContent: block => { received = block.type === 'attachment' && block.data[0].raw === file },
    })
    iframe.remove()
    return received
  })
  expect(result).toBe(true)
})

test('the public engine rejects a pre-aborted request with its reason and never opens a connection', async ({ page }) => {
  await captureStreams(page)
  await page.goto(fixture)
  const result = await page.evaluate(async () => {
    const controller = new AbortController()
    const reason = new DOMException('本轮取消', 'AbortError')
    controller.abort(reason)
    const chunks: string[] = []
    const lifecycle: string[] = []
    const engine = new window.ChatEngineForTest({
      endpoint: '/api/sse-fixture',
      onAbort() {
        lifecycle.push('abort')
        throw new Error('取消通知自身失败')
      },
      onComplete(aborted) { lifecycle.push('complete:' + aborted) },
    })
    try {
      await engine.send({ prompt: '已取消', attachments: [], messages: [], trigger: 'send', signal: controller.signal,
        onChunk: delta => chunks.push(delta) })
      return { same: false, chunks }
    } catch (error) {
      return { same: error === reason, chunks, lifecycle, requests: window.chatStreams.length }
    }
  })
  expect(result).toEqual({ same: true, chunks: [], lifecycle: ['abort', 'complete:true'], requests: 0 })
})

test('the public engine preserves the original HTTP error if its error callback rejects', async ({ page }) => {
  await page.route('**' + endpoint, route => route.fulfill({ status: 503, body: '服务暂时不可用' }))
  await page.goto(fixture)
  const result = await page.evaluate(async () => {
    let reported: Error | undefined
    const engine = new window.ChatEngineForTest({
      endpoint: '/api/sse-fixture',
      async onError(error) {
        reported = error
        throw new Error('错误通知自身失败')
      },
    })
    try {
      await engine.send({ prompt: '获取回执', attachments: [], messages: [], trigger: 'send',
        signal: new AbortController().signal, onChunk() {} })
    } catch (error) {
      return { same: error === reported, message: reported?.message }
    }
  })
  expect(result).toEqual({ same: true, message: expect.stringContaining('503') })
})

test('a custom request takes precedence while a bot without either transport cannot send', async ({ page }) => {
  await captureStreams(page)
  await page.goto(fixture + '?legacy')
  await send(page)
  await expect(assistant(page).locator('.ym-chat-markdown')).toHaveText('自定义请求')
  expect(await page.evaluate(() => window.chatStreams.length)).toBe(0)
  await page.goto(fixture + '?missing')
  await page.getByRole('textbox').fill('缺少服务')
  await expect(page.getByRole('button', { name: '发送消息' })).toBeDisabled()
  await page.getByRole('textbox').press('Enter')
  await expect(page.getByRole('article')).toHaveCount(0)
})
