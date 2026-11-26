import type { ChatAttachmentItem } from '../chat-attachments'
import type { ChatMessageData } from '../chat-message'
import type { ControlSize } from '../config-provider/types'

export interface ChatbotSendOptions {
  /** 用户输入的文本，可以只发送附件。 */
  prompt?: string
  /** 随本次提问发送的附件。 */
  attachments?: readonly ChatAttachmentItem[]
}

export interface ChatbotRequestContext {
  /** 本轮用户输入的原文，仅含附件时为空字符串。 */
  prompt: string
  /** 本轮用户消息携带的附件。 */
  attachments: readonly ChatAttachmentItem[]
  /** 截至本轮用户消息的会话快照，供服务生成回复。 */
  messages: readonly ChatMessageData[]
  /** 区分新提问与重新生成最后一轮回复。 */
  trigger: 'send' | 'regenerate'
  /** 停止、清空或组件卸载时中止，可传给底层请求。 */
  signal: AbortSignal
  /** 追加一段 Markdown 源文。 */
  onChunk: (delta: string) => void
}

export interface ChatbotProps {
  /** 生成一轮回复，返回的 Promise 完成时结束接收。 */
  request: (context: ChatbotRequestContext) => void | Promise<void>
  /** 按会话顺序排列的初始历史，只在创建时读取。 */
  defaultMessages?: readonly ChatMessageData[]
  /** 发送框占位文字。 */
  placeholder?: string
  /** 列表、消息和发送框的局部尺寸，省略时继承全局配置。 */
  size?: ControlSize
}

export interface ChatbotInstance {
  /** 发送一轮文字或附件，返回的 Promise 在本轮结束或中止后完成。 */
  sendUserMessage: (input: ChatbotSendOptions) => Promise<void>
  /** 使用最后一轮原有的提问和附件重新生成回复。 */
  regenerate: () => Promise<void>
  /** 停止当前生成，保留已收到的回复。 */
  abortChat: () => void
  /** 清空历史并取消当前生成。 */
  clearMessages: () => void
}
