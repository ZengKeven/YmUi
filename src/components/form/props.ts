import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { FormProps } from './types'

export default {
  /** 表单数据。 */
  data: { type: Object as PropType<NonNullable<FormProps['data']>>, default: () => ({}) },
  /** 按字段名配置的校验规则。 */
  rules: Object as PropType<FormProps['rules']>,
  /** 自定义规则的默认文案。 */
  errorMessage: Object as PropType<FormProps['errorMessage']>,
  /** 表单布局，默认纵向。 */
  layout: { type: String as PropType<FormProps['layout']>, default: 'vertical', validator: (v: string) => ['vertical', 'inline'].includes(v) },
  /** 标签对齐方式。 */
  labelAlign: { type: String as PropType<FormProps['labelAlign']>, default: 'right', validator: (v: string) => ['left', 'right', 'top'].includes(v) },
  /** 标签宽度。 */
  labelWidth: { type: [String, Number], default: '100px' },
  /** 标签后是否带冒号。 */
  colon: Boolean,
  /** 必填标记是否显示。 */
  requiredMark: { type: Boolean, default: undefined },
  /** 必填标记的位置。 */
  requiredMarkPosition: { type: String as PropType<FormProps['requiredMarkPosition']>, default: 'left' },
  /** 是否显示错误提示。 */
  showErrorMessage: { type: Boolean, default: true },
  /** 是否显示状态图标。 */
  statusIcon: Boolean,
  /** 是否禁用表单。 */
  disabled: Boolean,
  /** 是否只读。 */
  readonly: Boolean,
  /** 重置方式，默认清空。 */
  resetType: { type: String as PropType<NonNullable<FormProps['resetType']>>, default: 'empty', validator: (v: string) => ['empty', 'initial'].includes(v) },
  /** 是否阻止表单的原生默认行为。 */
  preventSubmitDefault: { type: Boolean, default: true },
  /** 首个错误字段的滚动方式。 */
  scrollToFirstError: String as PropType<FormProps['scrollToFirstError']>,
  /** 表单尺寸，默认继承。 */
  size: buttonProps.size,
} satisfies ComponentObjectPropsOptions<FormProps>
