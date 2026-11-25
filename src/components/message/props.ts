import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { MessageProps, MessageTheme } from './types'

export default {
  /** 提示类型，默认使用普通信息样式。 */
  theme: {
    type: String as PropType<MessageTheme>, default: 'info',
    validator: (value: string) => ['info', 'success', 'warning', 'error', 'question', 'loading'].includes(value),
  },
  /** 未传入默认插槽时显示的正文。 */
  content: String,
  /** 自动关闭的等待时间，默认 3000 毫秒，0 表示持续显示。 */
  duration: { type: Number, default: 3000, validator: (value: number) => Number.isFinite(value) && value >= 0 },
  /** 是否显示关闭按钮，也可指定按钮文字。 */
  closeBtn: { type: [Boolean, String], default: false },
  /** 是否显示提示类型图标。 */
  icon: { type: Boolean, default: true },
  /** 提示尺寸，默认继承 ConfigProvider。 */
  size: buttonProps.size,
} satisfies ComponentObjectPropsOptions<MessageProps>
