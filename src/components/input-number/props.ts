import type { ComponentObjectPropsOptions, PropType } from 'vue'
import inputProps from '../input/props'
import type { InputNumberProps } from './types'

const numericValue = { type: Number as PropType<number | null>, validator: Number.isFinite }

export default {
  /** 双向绑定的数值。 */
  modelValue: numericValue,
  /** 外部控制的数值。 */
  value: numericValue,
  /** 未受控时的初始数值。 */
  defaultValue: numericValue,
  /** 保留的小数位数，支持 0 到 20 位。 */
  decimalPlaces: { type: Number, validator: (n: number) => Number.isInteger(n) && n >= 0 && n <= 20 },
  /** 数值下限。 */
  min: { type: Number, validator: Number.isFinite },
  /** 数值上限。 */
  max: { type: Number, validator: Number.isFinite },
  /** 空值时的提示文字。 */
  placeholder: inputProps.placeholder,
  /** 表单字段名。 */
  name: inputProps.name,
  /** 关联表单的 ID。 */
  form: inputProps.form,
  /** 是否禁用。 */
  disabled: inputProps.disabled,
  /** 是否只读。 */
  readonly: inputProps.readonly,
  /** 输入框尺寸，省略时继承。 */
  size: inputProps.size,
  /** 输入框外层的 CSS 类。 */
  class: inputProps.class,
  /** 输入框外层的行内样式。 */
  style: inputProps.style,
} satisfies ComponentObjectPropsOptions<InputNumberProps>
