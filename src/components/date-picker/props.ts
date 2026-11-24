import type { ComponentObjectPropsOptions, PropType } from 'vue'
import calendarProps from '../calendar/props'
import inputProps from '../input/props'
import type { DatePickerProps } from './types'

export default {
  /** 选择模式，默认为单个日期。 */
  mode: {
    type: String as PropType<NonNullable<DatePickerProps['mode']>>, default: 'single',
    validator: (value: string) => value === 'single' || value === 'range',
  },
  /** 选中的本地日期或按起止顺序排列的日期对。 */
  modelValue: [String, Array] as PropType<DatePickerProps['modelValue']>,
  /** 非受控选择器的初始日期或日期对。 */
  defaultValue: [String, Array] as PropType<DatePickerProps['defaultValue']>,
  /** 空值时的提示文字。 */
  placeholder: String,
  /** 在日期下方显示农历。 */
  showLunar: calendarProps.showLunar,
  /** 在卡片日历中显示节名和休班角标。 */
  showHoliday: calendarProps.showHoliday,
  /** 每周首日，默认周一。 */
  firstDayOfWeek: calendarProps.firstDayOfWeek,
  /** 判定本地日期是否禁选。 */
  disabledDate: calendarProps.disabledDate,
  /** 禁用选择器。 */
  disabled: calendarProps.disabled,
  /** 以无边框样式显示输入框。 */
  borderless: inputProps.borderless,
  /** 输入框和日历的尺寸，默认继承全局配置。 */
  size: calendarProps.size,
  /** 原生表单字段名。 */
  name: inputProps.name,
  /** 关联的原生表单 ID。 */
  form: inputProps.form,
  /** 选择器根节点的类名。 */
  class: inputProps.class,
  /** 选择器根节点的样式。 */
  style: inputProps.style,
  /** 日历浮层的位置、挂载目标及外观。 */
  popupProps: Object as PropType<DatePickerProps['popupProps']>,
} satisfies ComponentObjectPropsOptions<DatePickerProps>
