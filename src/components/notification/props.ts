import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { NotificationProps } from './types'

export default {
  /** 通知标题。 */
  title: String,
  /** 通知正文。 */
  content: String,
  /** 底部文字。 */
  footer: String,
  /** 通知类型，默认为普通信息。 */
  theme: {
    type: String as PropType<NotificationProps['theme']>, default: 'info',
    validator: (value: string) => ['info', 'success', 'warning', 'error'].includes(value),
  },
  /** 是否显示类型图标。 */
  icon: { type: Boolean, default: true },
  /** 关闭按钮，默认为图标，传入字符串可显示按钮文字。 */
  closeBtn: { type: [Boolean, String], default: true },
  /** 自动关闭前的毫秒数，设为 0 时持续显示。 */
  duration: { type: Number, default: 3000, validator: (value: number) => Number.isFinite(value) && value >= 0 },
  /** 卡片尺寸，默认继承 ConfigProvider。 */
  size: buttonProps.size,
} satisfies ComponentObjectPropsOptions<NotificationProps>
