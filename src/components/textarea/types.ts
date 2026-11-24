import type { InputProps } from '../input'

export interface TextareaAutosize {
  /** 自适应高度的最少行数，默认一行。 */
  minRows?: number
  /** 自适应高度的最多行数，超过后可滚动。 */
  maxRows?: number
}

export interface TextareaProps extends Pick<InputProps,
  'modelValue' | 'value' | 'defaultValue' | 'align' | 'autofocus' | 'placeholder' |
  'name' | 'form' | 'readonly' | 'disabled' | 'size' | 'class'> {
  /** 原生 textarea 的行内样式，可设置编辑区的宽高。 */
  style?: InputProps['style']
  /** 固定行数模式的初始可见行数。 */
  rows?: number
  /** 随内容调整高度，可指定最少和最多行数。 */
  autosize?: boolean | TextareaAutosize
  /** 按原生 UTF-16 长度限制输入并显示计数。 */
  maxlength?: number | string
  /** 按 ASCII 码点计一、其他码点计二限制输入，优先于 maxlength。 */
  maxcharacter?: number
  /** 允许继续输入超出限制的文本，并提示超限。 */
  allowInputOverMax?: boolean
  /** 边框和提示文字的校验状态。 */
  status?: 'default' | 'success' | 'warning' | 'error'
  /** 编辑区下方的提示文字，同名插槽优先。 */
  tips?: string
}
