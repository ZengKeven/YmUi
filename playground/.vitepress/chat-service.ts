import type { IncomingMessage, ServerResponse } from 'node:http'
import { json } from 'node:stream/consumers'
import { defineConfig, type Plugin } from 'vite'

async function streamReply(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'POST') {
    response.writeHead(405, { Allow: 'POST' }).end()
    return
  }

  let chunks: string[]
  try {
    const { prompt, attachments = [], trigger } = await json(request) as {
      prompt: string
      attachments?: { name: string }[]
      trigger?: string
    }
    if (typeof prompt !== 'string' || !Array.isArray(attachments)) throw new Error()
    chunks = [
      trigger === 'regenerate' ? '已重新核对这条消息。' : '已收到你的消息。',
      attachments.length
        ? '\n\n随消息收到的附件有' + attachments.map(file => file.name).join('、') + '。'
        : '\n\n你询问的是「' + prompt + '」。',
      '\n\n请在北门登记后前往收货区。',
    ]
  } catch {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }).end('无法读取本次提问')
    return
  }
  if (response.destroyed) return

  const fail = new URL(request.url ?? '/', 'http://localhost').searchParams.get('error') === '1'
  response.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform' })
  response.write(': 已连接本地收货助手\n\n')
  let index = 0
  const timer = setInterval(() => {
    if (fail && index === 1) {
      response.end('event: error\ndata: {"message":"模拟服务中断"}\n\n')
      return
    }
    response.write('data: ' + JSON.stringify({ delta: chunks[index++] }) + '\n\n')
    if (index === chunks.length) response.end('data: [DONE]\n\n')
  }, 600)
  response.once('close', () => clearInterval(timer))
}

export function chatService(): Plugin {
  return {
    name: 'playground-chat-sse',
    configureServer(server) { server.middlewares.use('/api/chat/sse', streamReply) },
    configurePreviewServer(server) { server.middlewares.use('/api/chat/sse', streamReply) },
  }
}

// 构建后的 Playground 与开发模式使用同一个 SSE 接口。
export default defineConfig({ plugins: [chatService()] })
