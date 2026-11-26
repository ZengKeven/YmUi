import type { ControlSize } from '../config-provider/types'

export type ChatMessageRole = 'user' | 'assistant' | 'system'
export type ChatMessageStatus = 'pending' | 'streaming' | 'complete' | 'stop' | 'error'

export interface ChatTextContent {
  /** 纯文本内容块的类型。 */
  type: 'text'
  /** 保留空白和换行的文本。 */
  data: string
}

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
  /** 消息正文，可传字符串或按显示顺序排列的文本块。 */
  content?: string | readonly ChatTextContent[]
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
