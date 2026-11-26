import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { ChatbotProps } from './types'

export default {
  /** 接收用户提问并逐段返回回复的函数。 */
  request: Function as PropType<ChatbotProps['request']>,
  /** 对话服务地址和 SSE 分片处理回调。 */
  chatServiceConfig: Object as PropType<ChatbotProps['chatServiceConfig']>,
  /** 组件创建时载入的历史消息。 */
  defaultMessages: { type: Array as PropType<ChatbotProps['defaultMessages']>, default: () => [] },
  /** 消息编辑区的占位文字。 */
  placeholder: { type: String, default: '输入消息' },
  /** 组件局部尺寸，默认继承最近的 ConfigProvider。 */
  size: buttonProps.size,
} as const satisfies ComponentObjectPropsOptions<ChatbotProps>
