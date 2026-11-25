import type { ControlSize } from '../config-provider/types'

export type NotificationTheme = 'info' | 'success' | 'warning' | 'error'
export type NotificationPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface NotificationProps {
  /** 通知标题，可通过 title 插槽自定义。 */
  title?: string
  /** 通知正文，默认插槽优先于 content 插槽和此属性。 */
  content?: string
  /** 底部文字，可通过 footer 插槽放置操作按钮。 */
  footer?: string
  /** 通知类型，决定状态图标及其颜色。 */
  theme?: NotificationTheme
  /** 是否显示类型图标。 */
  icon?: boolean
  /** 是否显示关闭按钮，传入字符串可指定按钮文字。 */
  closeBtn?: boolean | string
  /** 自动关闭前的毫秒数，0 表示常驻。 */
  duration?: number
  /** 卡片字号和间距，省略时继承全局尺寸。 */
  size?: ControlSize
}

export interface NotificationCloseContext {
  /** 关闭来自按钮、计时结束或命令式调用。 */
  trigger: 'close-click' | 'duration-end' | 'api'
  /** 点击关闭按钮时的原始事件。 */
  e?: MouseEvent
}

export interface NotificationOptions extends NotificationProps {
  /** 命令式通知在视口中的位置，默认右上角。 */
  placement?: NotificationPlacement
  /** 命令式通知继承主题的来源元素。 */
  source?: HTMLElement
  /** 通知关闭时的回调。 */
  onClose?: (context: NotificationCloseContext) => void
  /** 用户点击关闭按钮时的回调。 */
  onCloseBtnClick?: (context: { e: MouseEvent }) => void
  /** 自动关闭计时结束时的回调。 */
  onDurationEnd?: () => void
}

export interface NotificationHandle {
  /** 关闭当前通知。 */
  close(): void
}
