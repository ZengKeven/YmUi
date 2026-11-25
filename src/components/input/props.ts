import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { InputProps } from './types'

export default {
  /** 原生输入类型，默认为文本。 */
  type: {
    type: String as PropType<InputProps['type']>, default: 'text',
    validator: (type: string) => type === 'text' || type === 'password',
  },
  /** 文本对齐方式，默认靠左。 */
  align: {
    type: String as PropType<InputProps['align']>, default: 'left',
    validator: (align: string) => ['left', 'center', 'right'].includes(align),
  },
  /** 启用时自动聚焦并全选输入内容。 */
  autofocus: Boolean,
  /** 开启无边框模式。 */
  borderless: Boolean,
  /** 有内容且可编辑时显示清空按钮。 */
  clearable: Boolean,
  /** 双向绑定的字符串。 */
  modelValue: String,
  /** 外部控制的字符串，modelValue 优先。 */
  value: String,
  /** 未受控时的初始文本。 */
  defaultValue: { type: String, default: '' },
  /** 空值提示。 */
  placeholder: String,
  /** 表单字段名。 */
  name: String,
  /** 关联的表单 ID。 */
  form: String,
  /** 输入框外层的 CSS 类。 */
  class: [String, Array, Object] as PropType<InputProps['class']>,
  /** 输入框外层的行内样式。 */
  style: [String, Array, Object] as PropType<InputProps['style']>,
  /** 是否禁用编辑及密码切换按钮。 */
  disabled: { type: Boolean, default: undefined },
  /** 是否只读。 */
  readonly: { type: Boolean, default: undefined },
  /** 输入框尺寸，默认继承。 */
  size: {
    type: String as PropType<InputProps['size']>,
    validator: (size: string) => ['extra-small', 'small', 'medium', 'large'].includes(size),
  },
} satisfies ComponentObjectPropsOptions<InputProps>
