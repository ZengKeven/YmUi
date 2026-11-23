import type { ControlSize } from '../config-provider/types'

export type PopupPlacement = 'top' | 'bottom' | 'left' | 'right'
export type PopupTrigger = 'click' | 'hover' | 'manual'

export interface PopupProps {
  /** 控制浮层的显示状态，可使用 v-model:visible。 */
  visible?: boolean
  /** 未受控时的初始显示状态。 */
  defaultVisible?: boolean
  /** 打开浮层的方式，hover 同时支持键盘聚焦。 */
  trigger?: PopupTrigger
  /** 优先展示的方向，空间不足时自动调整。 */
  placement?: PopupPlacement
  /** 浮层文字，content 插槽优先。 */
  content?: string
  /** 禁用浮层。 */
  disabled?: boolean
  /** 浮层尺寸，默认继承最近的全局配置。 */
  size?: ControlSize
  /** 附加到浮层面板的 CSS 类名。 */
  overlayClassName?: string
}
