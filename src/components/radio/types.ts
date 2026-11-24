import type { ButtonProps } from '../button'
import type { ControlSize } from '../config-provider/types'

export type RadioValue = string | number | boolean

export interface RadioProps {
  /** 选项的语义色，默认继承分组，独立使用时为 primary。 */
  theme?: ButtonProps['theme']
  /** 独立使用时的选中状态，支持 v-model。 */
  modelValue?: boolean
  /** 未绑定选中状态时的初始状态。 */
  defaultChecked?: boolean
  /** 组内唯一的选项值，同时用作原生表单值。 */
  value?: RadioValue
  /** 标签文字，默认插槽优先。 */
  label?: string
  /** 是否禁用当前项。 */
  disabled?: boolean
  /** 独立使用时的表单字段名。 */
  name?: string
  /** 单项尺寸，省略时继承。 */
  size?: ControlSize
}

export type RadioOption = RadioValue | {
  /** 此选项的语义色，省略时继承分组。 */
  theme?: RadioProps['theme']
  /** 组内唯一的选项值。 */
  value: RadioValue
  /** 标签文字，默认显示选项值。 */
  label?: string
  /** 是否禁用此选项。 */
  disabled?: boolean
}

export interface RadioGroupProps {
  /** 组内选项的默认语义色。 */
  theme?: RadioProps['theme']
  /** 当前选项值，支持 v-model。 */
  modelValue?: RadioValue
  /** 未绑定选项值时的初始选择。 */
  defaultValue?: RadioValue
  /** 用于生成单选项的数据，默认插槽优先。 */
  options?: readonly RadioOption[]
  /** 组内共用的原生字段名，省略时自动生成。 */
  name?: string
  /** 是否禁用整组。 */
  disabled?: boolean
  /** 各选项的排列方向。 */
  direction?: 'horizontal' | 'vertical'
  /** 组选项和间距的尺寸，省略时继承。 */
  size?: ControlSize
}
