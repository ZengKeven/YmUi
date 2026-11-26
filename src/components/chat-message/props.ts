import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { ChatMessageProps } from './types'

export default {
  /** 包含稳定标识与消息字段的对象。 */
  message: Object as PropType<ChatMessageProps['message']>,
  /** 发送者角色，省略时读取 message.role。 */
  role: {
    type: String as PropType<ChatMessageProps['role']>,
    validator: (role: string) => ['user', 'assistant', 'system'].includes(role),
  },
  /** 消息状态，省略时读取 message.status。 */
  status: {
    type: String as PropType<ChatMessageProps['status']>,
    validator: (status: string) => ['pending', 'streaming', 'complete', 'stop', 'error'].includes(status),
  },
  /** 纯文本字符串，或按顺序展示的消息内容块。 */
  content: [String, Array] as PropType<ChatMessageProps['content']>,
  /** 头像地址或图片配置。 */
  avatar: [String, Object] as PropType<ChatMessageProps['avatar']>,
  /** 显示的昵称。 */
  name: String,
  /** 显示的时间。 */
  datetime: String,
  /** 文本、填充或描边气泡。 */
  variant: {
    type: String as PropType<ChatMessageProps['variant']>, default: 'text',
    validator: (variant: string) => ['text', 'base', 'outline'].includes(variant),
  },
  /** 消息和头像对齐的方向。 */
  placement: {
    type: String as PropType<ChatMessageProps['placement']>, default: 'left',
    validator: (placement: string) => ['left', 'right'].includes(placement),
  },
  /** 局部尺寸。 */
  size: buttonProps.size,
} satisfies ComponentObjectPropsOptions<ChatMessageProps>
