import type { InputProps } from '../input'

export interface InputNumberProps extends Pick<InputProps, 'align' | 'autofocus' | 'borderless' | 'placeholder' | 'name' | 'form' | 'disabled' | 'readonly' | 'size' | 'class' | 'style'> {
  /** 当前数值，支持 v-model，null 表示空值。 */
  modelValue?: number | null
  /** 受控数值，modelValue 优先。 */
  value?: number | null
  /** 未绑定数值时的初始值。 */
  defaultValue?: number | null
  /** 保留的小数位数，省略时保留原数值的精度。 */
  decimalPlaces?: number
  /** 允许的最小值。 */
  min?: number
  /** 允许的最大值。 */
  max?: number
}
