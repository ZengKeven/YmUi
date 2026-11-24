import type { ClassValue, StyleValue } from 'vue'
import type { ControlSize } from '../config-provider/types'

export type PopupPlacement = 'top' | 'bottom' | 'left' | 'right'
  | `${'top' | 'bottom'}-${'left' | 'right'}` | `${'left' | 'right'}-${'top' | 'bottom'}`
export type PopupTrigger = 'click' | 'hover' | 'manual' | 'focus' | 'mousedown' | 'context-menu'

export interface PopupProps {
  /** 控制浮层的显示状态，可使用 v-model:visible。 */
  visible?: boolean
  /** 未受控时的初始显示状态。 */
  defaultVisible?: boolean
  /** 打开浮层的方式，hover 同时支持键盘聚焦。 */
  trigger?: PopupTrigger
  /** 浮层挂载节点、选择器或返回节点的函数。省略时保留在触发器旁。 */
  attach?: string | HTMLElement | ((trigger: HTMLElement) => Element | string | null | undefined)
  /** 优先展示的方向，空间不足时自动调整。 */
  placement?: PopupPlacement
  /** 浮层文字，content 插槽优先。 */
  content?: string
  /** 禁用浮层。 */
  disabled?: boolean
  /** 浮层尺寸，默认继承最近的全局配置。 */
  size?: ControlSize
  /** 附加到浮层面板的 CSS 类名。 */
  overlayClassName?: ClassValue
  /** 设置浮层面板的行内样式。 */
  overlayStyle?: StyleValue | ((trigger: HTMLElement, panel: HTMLElement) => StyleValue)
  /** 显示指向触发器的箭头。 */
  showArrow?: boolean
  /** 设置浮层面板的 CSS 层级。 */
  zIndex?: number
}
