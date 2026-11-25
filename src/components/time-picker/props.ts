import type { ComponentObjectPropsOptions, PropType } from 'vue'
import inputProps from '../input/props'
import type { TimePickerProps } from './types'

export default {
  /** 选择模式，默认为单个时间。 */
  mode: {
    type: String as PropType<NonNullable<TimePickerProps['mode']>>, default: 'single',
    validator: (value: string) => value === 'single' || value === 'range',
  },
  /** 24 小时制格式，默认精确到秒。 */
  format: {
    type: String as PropType<NonNullable<TimePickerProps['format']>>, default: 'HH:mm:ss',
    validator: (value: string) => value === 'HH:mm:ss' || value === 'HH:mm',
  },
  /** 已确认的时间或时间范围。 */
  modelValue: [String, Array] as PropType<TimePickerProps['modelValue']>,
  /** 非受控模式下的初始值。 */
  defaultValue: [String, Array] as PropType<TimePickerProps['defaultValue']>,
  /** 时间为空时显示的文字。 */
  placeholder: inputProps.placeholder,
  /** 禁用时间选择器。 */
  disabled: inputProps.disabled,
  /** 隐藏输入框边框。 */
  borderless: inputProps.borderless,
  /** 输入框和面板控件的尺寸，默认继承。 */
  size: inputProps.size,
  /** 原生表单字段名。 */
  name: inputProps.name,
  /** 关联的表单 ID。 */
  form: inputProps.form,
  /** 根节点的 CSS 类。 */
  class: inputProps.class,
  /** 根节点的行内样式。 */
  style: inputProps.style,
  /** 浮层的位置、挂载目标和外观。 */
  popupProps: Object as PropType<TimePickerProps['popupProps']>,
} satisfies ComponentObjectPropsOptions<TimePickerProps>
