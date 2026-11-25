import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { RadioGroupProps, RadioProps } from './types'

const valueProp = { type: [String, Number, Boolean] as PropType<RadioProps['value']>, default: undefined }
const sizeProp = {
  type: String as PropType<RadioProps['size']>,
  validator: (value: string) => ['extra-small', 'small', 'medium', 'large'].includes(value),
}

export default {
  /** 单项的语义色，默认继承分组。 */
  theme: buttonProps.theme,
  /** 独立使用时的选中状态。 */
  modelValue: { type: Boolean, default: undefined },
  /** 未绑定选中状态时的初始值。 */
  defaultChecked: Boolean,
  /** 分组选项值及表单提交值。 */
  value: valueProp,
  /** 默认插槽省略时的标签文字。 */
  label: String,
  /** 是否禁用此项。 */
  disabled: { type: Boolean, default: undefined },
  /** 独立使用时的表单字段名。 */
  name: String,
  /** 单项尺寸，默认继承。 */
  size: sizeProp,
} satisfies ComponentObjectPropsOptions<RadioProps>

export const radioGroupProps = {
  /** 组内选项的默认语义色。 */
  theme: { ...buttonProps.theme, default: 'primary' },
  /** 当前选中的选项值。 */
  modelValue: valueProp,
  /** 未绑定时的初始选项值。 */
  defaultValue: valueProp,
  /** 没有默认插槽时生成选项的数据。 */
  options: Array as PropType<RadioGroupProps['options']>,
  /** 所有组内选项共用的表单字段名。 */
  name: String,
  /** 是否禁用全部选项。 */
  disabled: { type: Boolean, default: undefined },
  /** 组内选项的排列方向。 */
  direction: {
    type: String as PropType<RadioGroupProps['direction']>, default: 'horizontal',
    validator: (value: string) => ['horizontal', 'vertical'].includes(value),
  },
  /** 分组尺寸，默认继承。 */
  size: sizeProp,
} satisfies ComponentObjectPropsOptions<RadioGroupProps>
