import type { ControlSize } from '../config-provider/types'

export type CheckboxValue = string | number | boolean

export interface CheckboxProps {
  /** 单独使用时的选中状态，支持 v-model。 */
  modelValue?: boolean
  /** 单独使用且未绑定选中状态时的初始值。 */
  defaultChecked?: boolean
  /** 选项值，用于分组选择和原生表单提交。 */
  value?: CheckboxValue
  /** 标签文字，默认插槽优先。 */
  label?: string
  /** 是否显示半选状态。 */
  indeterminate?: boolean
  /** 是否禁用当前选项。 */
  disabled?: boolean
  /** 表单字段名，默认继承所属分组。 */
  name?: string
  /** 控件尺寸，默认继承。 */
  size?: ControlSize
}

export type CheckboxOption = CheckboxValue | {
  /** 组内唯一的选项值。 */
  value: CheckboxValue
  /** 标签文字，省略时显示选项值。 */
  label?: string
  /** 是否禁用该选项。 */
  disabled?: boolean
}

export interface CheckboxGroupProps {
  /** 已选值列表，支持 v-model。 */
  modelValue?: readonly CheckboxValue[]
  /** 未绑定已选列表时的初始选中值。 */
  defaultValue?: readonly CheckboxValue[]
  /** 通过数据生成选项，默认插槽优先。 */
  options?: readonly CheckboxOption[]
  /** 是否禁用整组复选框。 */
  disabled?: boolean
  /** 组内复选框共用的表单字段名。 */
  name?: string
  /** 组选项和间距的尺寸，默认继承。 */
  size?: ControlSize
}

export interface CheckboxGroupChangeContext {
  /** 引起选中状态变化的原生事件。 */
  e: Event
  /** 本次切换的选项值。 */
  current: CheckboxValue
  /** 本次操作是选中还是取消。 */
  type: 'check' | 'uncheck'
}
