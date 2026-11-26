import { expect, test, type Page } from '@playwright/test'

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

test('stopping a body read aborts the fetch signal and regenerates the same assistant message', async ({ page }) => {
  await captureStreams(page)
  await page.goto(fixture)
  await send(page)
  const reply = assistant(page)
  await expect(reply).toHaveAttribute('data-status', 'pending')
  const id = await reply.getAttribute('data-message-id')
  await write(page, 'data: 已收到的文字\n\ndata: 半个')
  await expect(reply).toHaveAttribute('data-status', 'streaming')
  await page.getByRole('button', { name: '停止生成' }).click()
  await expect(reply).toHaveAttribute('data-status', 'stop')
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
