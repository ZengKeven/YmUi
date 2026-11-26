import { readEventStream, type SSEFrame } from './sse'
import type { ChatEngineRequestContext, ChatRequestParams, ChatServiceConfig, SSEChunkData } from './types'

export type { ChatEngineRequestContext, ChatRequestParams, ChatServiceConfig, SSEChunkData } from './types'

function requestOptions(params: ChatRequestParams, init: RequestInit): RequestInit {
  const headers = new Headers(init.headers)
  if (!headers.has('Accept')) headers.set('Accept', 'text/event-stream')
  const method = (init.method ?? 'POST').toUpperCase()
  let body = init.body
  if (method !== 'GET' && method !== 'HEAD' && body === undefined) {
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
    // 附件的 File 留给自定义上传逻辑，默认 JSON 仅携带附件描述。
    body = JSON.stringify(params, (key, value: unknown) =>
      key === 'raw' && Object.prototype.toString.call(value) === '[object File]' ? undefined : value)
  }
  return { ...init, headers, method, body }
}

function decodeFrame(frame: SSEFrame): SSEChunkData {
  let data: unknown = frame.data
  try { data = JSON.parse(frame.data) } catch { /* SSE 也允许纯文本数据。 */ }
  return { ...frame, data, raw: frame.data }
}

function defaultDelta({ data, raw }: SSEChunkData) {
  if (typeof data === 'string') return data
  if (data === null || typeof data !== 'object') return raw
  if ('delta' in data && typeof data.delta === 'string') return data.delta
  throw new Error('SSE 数据缺少字符串 delta，请使用 onMessage 映射服务分片')
}

async function consume(config: ChatServiceConfig, params: ChatRequestParams, context: ChatEngineRequestContext) {
  const { signal, onChunk } = context
  signal.throwIfAborted()
  const options = requestOptions(params, config.onRequest?.(params) || {})
  signal.throwIfAborted()
  const response = await fetch(config.endpoint, { ...options, signal })
  const mediaType = response.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase()
  if (!response.ok || mediaType !== 'text/event-stream' || !response.body) {
    void response.body?.cancel().catch(() => {})
    if (!response.ok) throw new Error(`对话请求失败（HTTP ${response.status}）`)
    throw new Error('对话服务需要返回含正文的 text/event-stream 响应')
  }

  await readEventStream(response.body, signal, frame => {
    if (frame.event === 'error') {
      const { data } = decodeFrame(frame)
      const message = data && typeof data === 'object' && 'message' in data ? data.message : data
      throw new Error(typeof message === 'string' && message ? message : '对话服务返回了错误事件')
    }
    if (frame.event === 'done' || frame.data.trim() === '[DONE]') return false
    const chunk = decodeFrame(frame)
    const mapped = config.onMessage ? config.onMessage(chunk) : defaultDelta(chunk)
    signal.throwIfAborted()
    if (mapped == null) return
    const delta = typeof mapped === 'string' ? mapped : mapped.data
    if (typeof delta !== 'string' || (typeof mapped !== 'string' && mapped.type !== 'markdown')) {
      throw new Error('onMessage 应返回字符串或 Markdown 内容块')
    }
    if (delta) onChunk(delta)
  })
}

// 已经失败或取消时，通知回调自身的异常不能替换本轮请求的原始原因。
async function notifyAfterFailure(notify: () => void | Promise<void>) {
  try { await notify() } catch { /* 保留原始请求错误。 */ }
}

/** 将一次会话请求发送至 SSE 服务，取消和消息归属使用调用方提供的上下文。 */
export class ChatEngine {
  constructor(private readonly config: ChatServiceConfig) {}

  async send(context: ChatEngineRequestContext): Promise<void> {
    const config = { ...this.config }
    const { prompt, attachments, messages, trigger, signal } = context
    const params = { prompt, attachments, messages, trigger }
    try {
      await consume(config, params, context)
      signal.throwIfAborted()
    } catch (cause) {
      if (signal.aborted) {
        await notifyAfterFailure(() => config.onAbort?.())
        await notifyAfterFailure(() => config.onComplete?.(true, params))
        throw signal.reason
      }
      const error = cause instanceof Error ? cause : new Error(String(cause))
      await notifyAfterFailure(() => config.onError?.(error))
      throw error
    }
    await config.onComplete?.(false, params)
  }
}
