import type { ComponentObjectPropsOptions, PropType } from 'vue'
import popupProps from '../popup/props'
import type { DropdownProps } from './types'

export default {
  /** 按显示顺序排列的操作项。 */
  options: { type: Array as PropType<DropdownProps['options']>, default: () => [] },
  /** 是否禁用整个菜单。 */
  disabled: { type: Boolean, default: undefined },
  /** 打开菜单的方式，默认悬停。 */
  trigger: {
    type: String as PropType<DropdownProps['trigger']>, default: 'hover',
    validator: (value: string) => ['hover', 'click', 'focus', 'context-menu'].includes(value),
  },
  /** 菜单首选位置，默认下方靠左。 */
  placement: { ...popupProps.placement, default: 'bottom-left' as const },
  /** 面板挂载位置。 */
  attach: popupProps.attach,
  /** 受控显示状态。 */
  visible: popupProps.visible,
  /** 非受控时是否初始显示。 */
  defaultVisible: popupProps.defaultVisible,
  /** 菜单尺寸。 */
  size: popupProps.size,
  /** 执行操作后自动关闭，默认开启。 */
  hideAfterItemClick: { type: Boolean, default: true },
  /** 菜单最大高度，默认 300 像素。 */
  maxHeight: { type: Number, default: 300, validator: (value: number) => Number.isFinite(value) && value >= 0 },
} satisfies ComponentObjectPropsOptions<DropdownProps>
