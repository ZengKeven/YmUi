import type { ComponentObjectPropsOptions, PropType } from 'vue'
import inputProps from '../input/props'
import type { SelectProps, SelectValue } from './types'

const valueType = [String, Number, Array] as PropType<SelectValue>

export default {
  /** 绑定值，单选为标量，多选为数组。 */
  modelValue: valueType,
  /** 非受控选择器的初始值。 */
  defaultValue: valueType,
  /** 可供选择的条目。 */
  options: { type: Array as PropType<NonNullable<SelectProps['options']>>, default: () => [] },
  /** 启用多选。 */
  multiple: Boolean,
  /** 多选时最多可选条数。 */
  max: { type: Number, default: 0, validator: (n: number) => Number.isInteger(n) && n >= 0 },
  /** 允许输入本地过滤关键词。 */
  filterable: Boolean,
  /** 自定义本地过滤函数。 */
  filter: Function as PropType<SelectProps['filter']>,
  /** 远程搜索函数。 */
  remoteMethod: Function as PropType<SelectProps['remoteMethod']>,
  /** 自定义选项浮层的位置及外观。 */
  popupProps: Object as PropType<SelectProps['popupProps']>,
  /** 未选择时的提示文字。 */
  placeholder: { type: String, default: '请选择' },
  /** 原生表单字段名，多选值按同名字段分别提交。 */
  name: inputProps.name,
  /** 关联的原生表单 ID。 */
  form: inputProps.form,
  /** 是否禁用选择器。 */
  disabled: inputProps.disabled,
  /** 是否允许一键清空选择和搜索词。 */
  clearable: Boolean,
  /** 隐藏选择框边框。 */
  borderless: inputProps.borderless,
  /** 尺寸，省略时继承 ConfigProvider。 */
  size: inputProps.size,
  /** 选择器根节点的类名。 */
  class: inputProps.class,
  /** 选择器根节点的样式。 */
  style: inputProps.style,
} satisfies ComponentObjectPropsOptions<SelectProps>
