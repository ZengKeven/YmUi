import type { ComponentObjectPropsOptions, PropType } from 'vue'
import popupProps from '../popup/props'
import type { TooltipProps, TooltipTheme } from './types'

export default {
  ...popupProps,
  /** 默认通过悬停或键盘聚焦打开。 */
  trigger: { ...popupProps.trigger, default: 'hover' as const },
  /** 默认在触发元素上方居中。 */
  placement: { ...popupProps.placement, default: 'top' as const },
  /** 显示指向触发元素的箭头。 */
  showArrow: { type: Boolean, default: true },
  /** 选择提示面板和箭头使用的配色。 */
  theme: {
    type: String as PropType<TooltipTheme>, default: 'default',
    validator: (value: string) => ['default', 'light', 'primary', 'success', 'warning', 'danger'].includes(value),
  },
} satisfies ComponentObjectPropsOptions<TooltipProps>
