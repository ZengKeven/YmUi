import type { ComponentObjectPropsOptions, PropType } from 'vue'
import inputProps from '../input/props'
import type { TextareaProps } from './types'

const positiveInteger = (n: number) => Number.isInteger(n) && n > 0

export default {
  /** 双向绑定的文本。 */
  modelValue: inputProps.modelValue,
  /** 外部控制的文本，modelValue 优先。 */
  value: inputProps.value,
  /** 非受控模式的初始文本。 */
  defaultValue: inputProps.defaultValue,
  /** 文本的水平对齐方式。 */
  align: inputProps.align,
  /** 自动聚焦并全选已有文本。 */
  autofocus: inputProps.autofocus,
  /** 空值时的占位文字。 */
  placeholder: inputProps.placeholder,
  /** 原生表单字段名。 */
  name: inputProps.name,
  /** 关联的表单 ID。 */
  form: inputProps.form,
  /** 是否只读。 */
  readonly: inputProps.readonly,
  /** 是否禁用。 */
  disabled: inputProps.disabled,
  /** 局部尺寸，默认继承。 */
  size: inputProps.size,
  /** 根元素的类名。 */
  class: inputProps.class,
  /** 原生编辑区的行内样式。 */
  style: inputProps.style,
  /** 未开启高度自适应时的行数。 */
  rows: { type: Number, default: 3, validator: positiveInteger },
  /** 高度自适应及可选的行数范围。 */
  autosize: {
    type: [Boolean, Object] as PropType<TextareaProps['autosize']>, default: false,
    validator: (value: NonNullable<TextareaProps['autosize']>) => typeof value === 'boolean' ||
      ((value.minRows === undefined || positiveInteger(value.minRows)) &&
       (value.maxRows === undefined || positiveInteger(value.maxRows)) &&
       (value.minRows === undefined || value.maxRows === undefined || value.maxRows >= value.minRows)),
  },
  /** 原生长度上限。 */
  maxlength: {
    type: [String, Number] as PropType<TextareaProps['maxlength']>,
    validator: (value: string | number) => String(value).trim() !== '' && Number.isInteger(Number(value)) && Number(value) >= 0,
  },
  /** 加权字符长度上限。 */
  maxcharacter: { type: Number, validator: (n: number) => Number.isInteger(n) && n >= 0 },
  /** 允许超限输入。 */
  allowInputOverMax: Boolean,
  /** 校验状态，默认使用普通边框。 */
  status: {
    type: String as PropType<TextareaProps['status']>, default: 'default',
    validator: (s: string) => ['default', 'success', 'warning', 'error'].includes(s),
  },
  /** 文本框下的提示。 */
  tips: String,
} satisfies ComponentObjectPropsOptions<TextareaProps>
