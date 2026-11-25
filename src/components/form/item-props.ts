import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { FormItemProps } from './types'

export default {
  /** 表单模型中的字段路径。 */
  name: { type: String, default: '' },
  /** 标签关联的控件 ID。 */
  for: String,
  /** 字段标签，label 插槽优先。 */
  label: String,
  /** 标签对齐方式，省略时继承表单。 */
  labelAlign: String as PropType<FormItemProps['labelAlign']>,
  /** 标签列宽度，数值按像素计算。 */
  labelWidth: [String, Number],
  /** 字段独立的校验规则。 */
  rules: Array as PropType<FormItemProps['rules']>,
  /** 是否显示必填标记。 */
  requiredMark: { type: Boolean, default: undefined },
  /** 是否展示校验错误信息。 */
  showErrorMessage: { type: Boolean, default: undefined },
  /** 外部指定的反馈状态。 */
  status: String as PropType<FormItemProps['status']>,
  /** 是否显示状态图标，省略时继承表单。 */
  statusIcon: { type: Boolean, default: undefined },
  /** 校验成功时是否为输入控件显示成功色边框。 */
  successBorder: Boolean,
  /** 控件下方的帮助文字。 */
  help: String,
  /** 跟随状态展示的自定义提示文字。 */
  tips: String,
} satisfies ComponentObjectPropsOptions<FormItemProps>
