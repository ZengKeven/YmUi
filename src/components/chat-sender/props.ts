import type { ComponentObjectPropsOptions, PropType } from 'vue'
import textareaProps from '../textarea/props'
import type { ChatSenderProps } from './types'

export default {
  /** 双向绑定的草稿。 */
  modelValue: textareaProps.modelValue,
  /** 外部控制的草稿。 */
  value: textareaProps.value,
  /** 非受控草稿的初始值。 */
  defaultValue: textareaProps.defaultValue,
  /** 受控附件列表，传入空数组即可开始选择文件。 */
  attachments: Array as PropType<ChatSenderProps['attachments']>,
  /** 优先于内部输入框配置的占位文字。 */
  placeholder: textareaProps.placeholder,
  /** 发送框的禁用状态。 */
  disabled: textareaProps.disabled,
  /** 是否正在生成回复。 */
  loading: Boolean,
  /** 显示停止按钮的兼容属性。 */
  stopDisabled: Boolean,
  /** 是否禁用发送操作。 */
  sendBtnDisabled: Boolean,
  /** 面板及内置控件尺寸。 */
  size: textareaProps.size,
  /** 传给 YmTextarea 的配置。 */
  textareaProps: Object as PropType<ChatSenderProps['textareaProps']>,
} satisfies ComponentObjectPropsOptions<ChatSenderProps>
