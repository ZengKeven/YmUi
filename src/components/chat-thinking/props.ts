import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { ChatThinkingProps } from './types'

export default {
  /** 自定义标题及分段累积的正文。 */
  content: Object as PropType<ChatThinkingProps['content']>,
  /** 等待或接收时显示思考中，完成时显示思考完成。 */
  status: {
    type: String as PropType<ChatThinkingProps['status']>, default: 'pending',
    validator: (value: string) => ['pending', 'streaming', 'complete'].includes(value),
  },
  /** 外部控制是否收起，省略时由组件维护。 */
  collapsed: { type: Boolean, default: undefined },
  /** 非受控的初始收起状态。 */
  defaultCollapsed: Boolean,
  /** 局部尺寸，默认继承全局配置。 */
  size: buttonProps.size,
} satisfies ComponentObjectPropsOptions<ChatThinkingProps>
