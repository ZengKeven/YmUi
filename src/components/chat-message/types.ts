import type { ControlSize } from '../config-provider/types'
import type { ChatSuggestionItem, ChatSuggestionSelectContext } from '../chat-suggestion/types'
import type { ChatThinkingData, ChatThinkingStatus } from '../chat-thinking/types'

export type ChatMessageRole = 'user' | 'assistant' | 'system'
export type ChatMessageStatus = 'pending' | 'streaming' | 'complete' | 'stop' | 'error'

export interface ChatTextContent {
  /** 纯文本内容块的类型。 */
  type: 'text'
  /** 保留空白和换行的文本。 */
  data: string
}

export interface ChatMarkdownContent {
  /** 按 Markdown 排版的消息块。 */
  type: 'markdown'
  /** 截至当前收到的完整 Markdown 源文。 */
  data: string
}

export interface ChatThinkingContent {
  /** 可展开的思考过程块。 */
  type: 'thinking'
  /** 思考过程的标题和正文。 */
  data: ChatThinkingData
  /** 思考块自身的状态，可在消息仍接收回复时单独完成。 */
  status?: ChatThinkingStatus
}

export interface ChatSuggestionContent {
  /** 回复完成后可点击追问的问题列表。 */
  type: 'suggestion'
  /** 按显示顺序排列的推荐项。 */
  data: readonly ChatSuggestionItem[]
  /** 推荐块的状态，省略时以消息状态为准。 */
  status?: ChatMessageStatus
}

export type ChatMessageContent = ChatTextContent | ChatMarkdownContent | ChatThinkingContent | ChatSuggestionContent

export interface ChatMessageAvatar {
  /** 头像的图片地址。 */
  src: string
  /** 头像的替代文本。 */
  alt?: string
  /** 原图加载失败时使用的备用地址。 */
  fallback?: string
}

export interface ChatMessageData {
  /** 列表及流式更新使用的稳定消息标识。 */
  id: string
  /** 消息发送者的角色，默认是助手。 */
  role?: ChatMessageRole
  /** 当前消息状态，默认已完成。 */
  status?: ChatMessageStatus
  /** 消息正文，可传纯文本字符串或按显示顺序排列的内容块。 */
  content?: string | readonly ChatMessageContent[]
  /** 头像的地址或图片配置。 */
  avatar?: string | ChatMessageAvatar
  /** 发送者的显示名称。 */
  name?: string
  /** 按原文显示的发送时间。 */
  datetime?: string
}

export interface ChatMessageProps extends Omit<ChatMessageData, 'id'> {
  /** 完整消息对象，单独传入的属性优先。 */
  message?: ChatMessageData
  /** 气泡样式，默认直接展示文本。 */
  variant?: 'text' | 'base' | 'outline'
  /** 头像及气泡的位置，默认居左。 */
  placement?: 'left' | 'right'
  /** 消息的局部尺寸，省略时继承最近的 ConfigProvider。 */
  size?: ControlSize
}

export interface ChatMessageSuggestionContext extends ChatSuggestionSelectContext {
  /** 产生此次追问的消息，通过 message 属性提供时可用。 */
  message?: ChatMessageData
}
