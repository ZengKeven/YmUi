import type { AriaAttributes } from 'vue'
import type { ControlSize } from '../config-provider/types'
import type { TextareaProps } from '../textarea'

export interface ChatSenderProps {
  /** 当前草稿，支持 v-model。 */
  modelValue?: string
  /** 受控草稿，支持 v-model:value，modelValue 优先。 */
  value?: string
  /** 非受控模式的初始草稿。 */
  defaultValue?: string
  /** 输入框的占位文字。 */
  placeholder?: string
  /** 禁用编辑、发送和停止。 */
  disabled?: boolean
  /** 显示停止操作。 */
  loading?: boolean
  /** 显示停止操作的兼容属性，推荐使用 loading。 */
  stopDisabled?: boolean
  /** 禁用发送，允许继续编辑。 */
  sendBtnDisabled?: boolean
  /** 面板和内置控件的尺寸，省略时继承。 */
  size?: ControlSize
  /** 内部多行输入框的配置及可访问性属性。 */
  textareaProps?: Omit<TextareaProps, 'modelValue' | 'value' | 'defaultValue'> & AriaAttributes & { id?: string }
}
