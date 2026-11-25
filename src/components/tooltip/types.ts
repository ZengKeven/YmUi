import type { PopupProps } from '../popup'

export type TooltipTheme = 'default' | 'light' | 'primary' | 'success' | 'warning' | 'danger'

export interface TooltipProps extends PopupProps {
  /** 触发方式，默认在悬停或键盘聚焦时显示。 */
  trigger?: PopupProps['trigger']
  /** 提示位置，默认在上方居中。 */
  placement?: PopupProps['placement']
  /** 显示指向触发元素的箭头，默认开启。 */
  showArrow?: boolean
  /** 文字提示的配色，默认使用反色面板。 */
  theme?: TooltipTheme
}
