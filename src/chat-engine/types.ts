import type { ChatAttachmentItem } from '../components/chat-attachments/types'
import type { ChatMarkdownContent, ChatMessageData, ChatSuggestionContent, ChatThinkingContent } from '../components/chat-message/types'

/** 单个 SSE 事件的内容。Markdown 和思考正文为本次增量，推荐问题为一组完整选项。 */
export type ChatStreamContent = ChatMarkdownContent | ChatThinkingContent | ChatSuggestionContent

export interface ChatRequestParams {
  /** 本轮用户输入的原文，仅含附件时为空字符串。 */
  prompt: string
  /** 本轮用户消息携带的附件。 */
  attachments: readonly ChatAttachmentItem[]
  /** 截至本轮用户消息的会话快照。 */
  messages: readonly ChatMessageData[]
  /** 区分新提问与重新生成最后一轮回复。 */
  trigger: 'send' | 'regenerate'
}

export interface ChatEngineRequestContext extends ChatRequestParams {
  /** 中止当前请求及其响应流。 */
  signal: AbortSignal
  /** 未提供 onContent 时接收一段新增的 Markdown 源文。 */
  onChunk: (delta: string) => void
  /** 按到达顺序接收每个内容块，包含普通文本转换成的 Markdown 分片。 */
  onContent?: (block: ChatStreamContent) => void
}

/** 独立使用 ChatEngine 时，可以只通过 onContent 消费所有分片。 */
export interface ChatEngineContentContext extends Omit<ChatEngineRequestContext, 'onChunk'> {
  /** 接收思考、Markdown 和推荐问题的原始分片。 */
  onContent: (block: ChatStreamContent) => void
}

export interface SSEChunkData {
  /** SSE 的 event 字段，默认为 message。 */
  event: string
  /** 最近收到的 SSE 事件标识。 */
  id: string
  /** 合并多行 data 后的原文。 */
  raw: string
  /** data 是合法 JSON 时为解析结果，其他情况为原文。 */
  data: unknown
}

export interface ChatServiceConfig {
  /** 返回 text/event-stream 的请求地址。 */
  endpoint: string
  /** 使用 SSE 流式响应，默认开启。 */
  stream?: true
  /** 自定义请求头、请求体等 fetch 配置。取消信号由本轮请求提供。 */
  onRequest?: (params: ChatRequestParams) => Omit<RequestInit, 'signal'> | void
  /** 将事件映射为字符串或结构化内容块，返回 null 或 undefined 略过该事件。 */
  onMessage?: (chunk: SSEChunkData) => string | ChatStreamContent | null | void
  /** 网络、HTTP、流读取或分片处理失败时接收错误。 */
  onError?: (error: Error) => void | Promise<void>
  /** 本轮请求被主动取消时调用。 */
  onAbort?: () => void | Promise<void>
  /** 成功或主动取消时调用，首个参数表示是否取消。 */
  onComplete?: (isAborted: boolean, params: ChatRequestParams) => void | Promise<void>
}
