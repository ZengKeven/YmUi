import type { HTMLAttributes, StyleValue } from 'vue'
import type { ControlSize } from '../config-provider/types'

export interface InputProps {
  /** 输入类型，默认使用普通文本。 */
  type?: 'text' | 'password'
  /** 输入内容和占位文字的水平对齐方式。 */
  align?: 'left' | 'center' | 'right'
  /** 自动聚焦并选中当前输入内容。 */
  autofocus?: boolean
  /** 隐藏输入框边框。 */
  borderless?: boolean
  /** 有内容且可编辑时显示清空按钮。 */
  clearable?: boolean
  /** 当前字符串，支持 v-model。 */
  modelValue?: string
  /** 受控文本，modelValue 优先。 */
  value?: string
  /** 未绑定文本时的初始值。 */
  defaultValue?: string
  /** 内容为空时的提示文字。 */
  placeholder?: string
  /** 原生表单字段名。 */
  name?: string
  /** 关联的原生表单 ID。 */
  form?: string
  /** 应用于整个输入框的 CSS 类。 */
  class?: HTMLAttributes['class']
  /** 应用于整个输入框的行内样式。 */
  style?: StyleValue
  /** 是否禁用输入框。 */
  disabled?: boolean
  /** 是否只读。 */
  readonly?: boolean
  /** 输入框尺寸，省略时继承全局配置。 */
  size?: ControlSize
}
