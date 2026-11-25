import type { IconName } from '../icon'
import type { PopupProps } from '../popup'

export type DropdownTrigger = 'hover' | 'click' | 'focus' | 'context-menu'
export type DropdownItemTheme = 'default' | 'success' | 'warning' | 'error'

export interface DropdownOption {
  /** 操作的唯一标识。 */
  value: string | number
  /** 操作名称。 */
  content: string
  /** 是否禁用此操作。 */
  disabled?: boolean
  /** 在此项下方显示分隔线。 */
  divider?: boolean
  /** 操作名称前的图标。 */
  prefixIcon?: IconName
  /** 操作项的语义色。 */
  theme?: DropdownItemTheme
  /** 是否强调当前操作项。 */
  active?: boolean
}

export interface DropdownProps {
  /** 按显示顺序排列的操作项。 */
  options?: readonly DropdownOption[]
  /** 是否禁用整个菜单。 */
  disabled?: boolean
  /** 打开菜单的方式，默认悬停。 */
  trigger?: DropdownTrigger
  /** 菜单相对触发元素的位置，默认下方靠左。 */
  placement?: PopupProps['placement']
  /** 浮层挂载元素、选择器或获取挂载点的函数。 */
  attach?: PopupProps['attach']
  /** 受控显示状态，支持 v-model:visible。 */
  visible?: boolean
  /** 非受控时是否初始显示。 */
  defaultVisible?: boolean
  /** 菜单字号、行高与内边距，默认继承最近的全局配置。 */
  size?: PopupProps['size']
  /** 执行操作后是否关闭菜单。 */
  hideAfterItemClick?: boolean
  /** 菜单最大高度，单位为像素。 */
  maxHeight?: number
}
