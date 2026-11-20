import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { MenuProps } from './types'

export default {
  /** 一级节点，可包含一层子项。 */
  items: { type: Array as PropType<NonNullable<MenuProps['items']>>, default: () => [] },
  /** 是否收起为图标菜单。 */
  collapsed: Boolean,
  /** 当前选中的叶项标识。 */
  modelValue: [String, Number] as PropType<MenuProps['modelValue']>,
  /** 展开模式中打开的一级组标识。 */
  expanded: { type: Array as PropType<NonNullable<MenuProps['expanded']>>, default: () => [] },
  /** 菜单行的尺寸，省略时继承 ConfigProvider。 */
  size: {
    type: String as PropType<MenuProps['size']>,
    validator: (value: string) => ['extra-small', 'small', 'medium', 'large'].includes(value),
  },
} satisfies ComponentObjectPropsOptions<MenuProps>
