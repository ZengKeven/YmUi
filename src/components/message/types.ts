import type { ControlSize } from '../config-provider/types'

export type MessageTheme = 'info' | 'success' | 'warning' | 'error' | 'question' | 'loading'
export type MessagePlacement = 'top' | 'bottom' | 'center' | 'left' | 'right'
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface MessageCloseContext {
  /** 本次关闭来自按钮、计时结束或命令式调用。 */
  trigger: 'close-click' | 'duration-end' | 'api'
  /** 点击关闭按钮时的鼠标事件。 */
  e?: MouseEvent
}

export interface MessageProps {
  /** 提示类型，决定状态图标及其颜色。 */
  theme?: MessageTheme
  /** 提示正文，默认插槽优先。 */
  content?: string
  /** 自动关闭的等待时间，单位为毫秒，0 表示持续显示。 */
  duration?: number
  /** 显示关闭按钮，传入字符串可指定按钮文字。 */
  closeBtn?: boolean | string
  /** 显示状态图标，默认开启。 */
  icon?: boolean
  /** 提示字号和间距，省略时继承全局配置。 */
  size?: ControlSize
}

export interface MessageOptions extends MessageProps {
  /** 命令式提示继承全局配置的来源元素。 */
  source?: HTMLElement
  /** 全局提示在视口中的位置，默认位于顶部中央。 */
  placement?: MessagePlacement
  /** 提示关闭时的回调。 */
  onClose?: (context: MessageCloseContext) => void
  /** 点击关闭按钮时的回调。 */
  onCloseBtnClick?: (context: { e: MouseEvent }) => void
  /** 自动关闭计时结束时的回调。 */
  onDurationEnd?: () => void
}

export interface MessageHandle {
  /** 关闭这条全局提示。 */
  close(): void
}
