import type { ComponentObjectPropsOptions, PropType } from 'vue'
import selectProps from '../select/props'
import type { TreeSelectProps } from './types'

export default {
  /** 本地树形选项。 */
  options: { type: Array as PropType<NonNullable<TreeSelectProps['options']>>, default: () => [] },
  /** 受控的选中值。 */
  modelValue: selectProps.modelValue,
  /** 非受控的初始选中值。 */
  defaultValue: selectProps.defaultValue,
  /** 启用节点多选。 */
  multiple: selectProps.multiple,
  /** 启用本地名称过滤。 */
  filterable: selectProps.filterable,
  /** 禁选层级，根节点为第 1 层。 */
  disabledLevels: { type: Array as PropType<readonly number[]>, default: () => [] },
  /** 未选择时的提示文字。 */
  placeholder: selectProps.placeholder,
  /** 禁用整个选择器。 */
  disabled: selectProps.disabled,
  /** 隐藏选择框边框。 */
  borderless: selectProps.borderless,
  /** 控件尺寸，省略时继承全局配置。 */
  size: selectProps.size,
  /** 原生表单字段名，多选值分别提交。 */
  name: selectProps.name,
  /** 关联的原生表单 ID。 */
  form: selectProps.form,
  /** 应用于根节点的类名。 */
  class: selectProps.class,
  /** 应用于根节点的样式。 */
  style: selectProps.style,
} satisfies ComponentObjectPropsOptions<TreeSelectProps>
