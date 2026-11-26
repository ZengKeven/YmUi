import { readFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { json } from 'node:stream/consumers'
import { defineConfig, type Plugin, type ViteDevServer } from 'vite'
import type { ChatStreamContent, ChatSuggestionItem, ChatToolCallMessage } from '../../src'

const documentPrompt = '办理收货需要准备哪些单据？'
const suggestions: ChatSuggestionItem[] = [
  { title: '要带哪些单据？', prompt: documentPrompt },
  { title: '北门登记后怎么走？' },
]

const searchGuide = { title: '对话搜索', site: 'YmUi 文档', url: '/chat-search/' }
const searchReply: ChatStreamContent[] = [
  { type: 'search', data: { references: [{ ...searchGuide, content: '查看来源列表的用法。' }] } },
  { type: 'search', data: { references: [
    { ...searchGuide, content: '查看来源列表、展开收起和链接过滤的用法。' },
    { title: '对话消息', site: 'YmUi 文档', url: '/chat-message/' },
    { title: '归档说明', url: 'file:///archive/search.txt', content: '此来源仅供阅读摘要。' },
  ] } },
  { type: 'markdown', data: '## 搜索来源接入\n\n' },
  { type: 'markdown', data: '1. 在搜索分片中提供来源标题和地址。\n' },
  { type: 'markdown', data: '2. 在来源列表后逐段发送回复正文。' },
]

const attachmentBase = '/api/chat/attachments'
const checklist = '收货清单\n1. 核对送货单与采购单号。\n2. 签收后保留回执。\n'
const attachmentReply: ChatStreamContent[] = [
  { type: 'attachment', data: [
    { id: 'calendar', name: '配送日历.png', fileType: 'image', url: attachmentBase + '/delivery-calendar.png' },
    { id: 'checklist', name: '收货清单.txt', type: 'text/plain', url: attachmentBase + '/checklist.txt' },
    { id: 'archive', name: '内部底图.png', fileType: 'image', url: 'file:///archive/plan.png', description: '仓库留档' },
  ] },
  { type: 'markdown', data: '## 收货资料\n\n' },
  { type: 'markdown', data: '1. 查看配送日历，确认到货日期。\n' },
  { type: 'markdown', data: '2. 按收货清单核对单据。' },
]

function toolCallReply(outcome: 'success' | 'failure'): ChatStreamContent[] {
  const toolCallId = 'receiving-slot-1'
  const start: ChatStreamContent = {
    type: 'toolcall', status: 'executing',
    data: { toolCallId, toolCallName: 'lookup_receiving_slot', args: { warehouse: '北仓' } },
  }
  if (outcome === 'failure') {
    return [start, { type: 'toolcall', status: 'error', data: { toolCallId, result: '预约服务暂时不可用' } }]
  }
  return [
    start,
    { type: 'toolcall', status: 'complete', data: { toolCallId, result: { gate: '北门', slot: '09:00–11:00' } } },
    { type: 'markdown', data: '## 收货时段\n\n' },
    { type: 'markdown', data: '北仓的收货时段为 09:00–11:00。\n\n' },
    { type: 'markdown', data: '到仓后请在北门登记。' },
  ]
}

function confirmReceivingSlot(trigger?: string, message?: ChatToolCallMessage): ChatStreamContent[] {
  const toolCallId = 'receiving-confirm-1'
  const toolCallName = 'confirm_receiving_slot'
  const slots = ['09:00–11:00', '14:00–16:00']
  if (trigger === 'send' || trigger === 'regenerate') {
    return [{
      type: 'toolcall', status: 'awaiting-input', data: { toolCallId, toolCallName, args: { warehouse: '北仓', slots } },
    }]
  }

  const result = message?.result
  if (trigger !== 'tool-response' || message?.toolCallId !== toolCallId || message.toolCallName !== toolCallName ||
    !result || typeof result !== 'object' || !('slot' in result) || typeof result.slot !== 'string' || !slots.includes(result.slot)) {
    throw new Error('收货时段确认无效')
  }
  return [
    { type: 'markdown', data: '## 预约已确认\n\n' },
    { type: 'markdown', data: '已为你预约北仓 ' + result.slot + ' 的收货时段。\n\n' },
    { type: 'markdown', data: '请在预约时段内到北门登记。' },
  ]
}

const files = new Map<string, { type: string; body: Buffer | string }>([
  ['/delivery-calendar.png', { type: 'image/png', body: readFileSync(new URL('../examples/assets/delivery-calendar.png', import.meta.url)) }],
  ['/checklist.txt', { type: 'text/plain; charset=utf-8', body: checklist }],
])

function serveAttachment(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end()
    return
  }
  const file = files.get(new URL(request.url ?? '/', 'http://localhost').pathname)
  if (!file) {
    response.writeHead(404).end()
    return
  }
  response.writeHead(200, { 'Content-Type': file.type }).end(request.method === 'HEAD' ? undefined : file.body)
}

async function streamReply(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'POST') {
    response.writeHead(405, { Allow: 'POST' }).end()
    return
  }

  const params = new URL(request.url ?? '/', 'http://localhost').searchParams
  let chunks: ChatStreamContent[]
  try {
    const { prompt, attachments = [], trigger, toolCallMessage } = await json(request) as {
      prompt: string
      attachments?: { name: string }[]
      trigger?: string
      toolCallMessage?: ChatToolCallMessage
    }
    if (typeof prompt !== 'string' || !Array.isArray(attachments)) throw new Error()
    const toolCall = params.get('toolcall')
    if (toolCall === 'confirm') {
      chunks = confirmReceivingSlot(trigger, toolCallMessage)
    } else if (toolCall === 'success' || toolCall === 'failure') {
      chunks = toolCallReply(toolCall)
    } else if (params.get('attachment') === '1') {
      chunks = attachmentReply
    } else if (params.get('search') === '1') {
      chunks = searchReply
    } else {
      const asksForDocuments = prompt === documentPrompt
      const heading = asksForDocuments ? '## 收货单据' : '## 收货安排'
      const confirmation = trigger === 'regenerate' ? '已重新核对这条消息。' : '已收到你的消息。'
      const details = attachments.length
        ? '\n\n随消息收到的附件有' + attachments.map(file => file.name).join('、') + '。'
        : '\n\n你询问的是「' + prompt + '」。'
      chunks = [
        { type: 'thinking', data: { text: '先核对收货预约。' } },
        { type: 'thinking', data: { text: asksForDocuments ? '\n再查看所需单据。' : '\n再确认登记地点。' } },
        { type: 'markdown', data: heading + '\n\n' + confirmation },
        { type: 'markdown', data: details },
        { type: 'markdown', data: asksForDocuments ? '\n\n请携带送货单和采购单号。' : '\n\n请在北门登记后前往收货区。' },
        { type: 'suggestion', data: suggestions.filter(item => (item.prompt ?? item.title) !== prompt) },
      ]
    }
  } catch {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }).end('无法读取本次提问')
    return
  }
  if (response.destroyed) return

  const fail = params.get('error') === '1'
  response.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform' })
  response.write(': 已连接本地收货助手\n\n')
  let index = 0
  const timer = setInterval(() => {
    if (fail && chunks[index - 1]?.type === 'markdown') {
      response.end('event: error\ndata: {"message":"模拟服务中断"}\n\n')
      return
    }
    if (index === chunks.length) {
      response.end('data: [DONE]\n\n')
      return
    }
    response.write('data: ' + JSON.stringify(chunks[index++]) + '\n\n')
  }, 600)
  response.once('close', () => clearInterval(timer))
}

export function chatService(): Plugin {
  function configure(server: Pick<ViteDevServer, 'middlewares'>) {
    server.middlewares.use('/api/chat/sse', streamReply)
    server.middlewares.use(attachmentBase, serveAttachment)
  }
  return {
    name: 'playground-chat-sse',
    configureServer: configure,
    configurePreviewServer: configure,
  }
}

// 构建后的 Playground 与开发模式使用同一个 SSE 接口。
export default defineConfig({ plugins: [chatService()] })
