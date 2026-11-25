import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { CheckboxGroupProps, CheckboxProps } from './types'

const sizeProp = {
  type: String as PropType<CheckboxProps['size']>,
  validator: (value: string) => ['extra-small', 'small', 'medium', 'large'].includes(value),
}

export default {
  /** 单项的语义色，默认继承分组。 */
  theme: buttonProps.theme,
  /** 单个复选框的选中状态。 */
  modelValue: { type: Boolean, default: undefined },
  /** 未绑定 v-model 时的初始状态。 */
  defaultChecked: Boolean,
  /** 组内选项值及原生表单值。 */
  value: { type: [String, Number, Boolean] as PropType<CheckboxProps['value']>, default: undefined },
  /** 默认插槽省略时显示的文字。 */
  label: String,
  /** 是否显示半选状态。 */
  indeterminate: Boolean,
  /** 是否禁用当前项。 */
  disabled: { type: Boolean, default: undefined },
  /** 表单字段名。 */
  name: String,
  /** 单项尺寸，默认继承。 */
  size: sizeProp,
} satisfies ComponentObjectPropsOptions<CheckboxProps>

export const checkboxGroupProps = {
  /** 组内选项的默认语义色。 */
  theme: { ...buttonProps.theme, default: 'primary' },
  /** 组选中值列表。 */
  modelValue: Array as PropType<CheckboxGroupProps['modelValue']>,
  /** 未绑定 v-model 时的初始选中值。 */
  defaultValue: Array as PropType<CheckboxGroupProps['defaultValue']>,
  /** 无默认插槽时用于生成复选框的选项。 */
  options: Array as PropType<CheckboxGroupProps['options']>,
  /** 是否禁用所有组内选项。 */
  disabled: { type: Boolean, default: undefined },
  /** 组内共用的表单字段名。 */
  name: String,
  /** 分组尺寸，默认继承。 */
  size: sizeProp,
} satisfies ComponentObjectPropsOptions<CheckboxGroupProps>
