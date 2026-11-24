import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { CalendarProps } from './types'

export default {
  /** 当前选中的本地日期。 */
  modelValue: String as PropType<CalendarProps['modelValue']>,
  /** 非受控日历的初始日期。 */
  defaultValue: String,
  /** 日历展示样式，默认铺满容器。 */
  theme: {
    type: String as PropType<CalendarProps['theme']>, default: 'full',
    validator: (value: string) => value === 'full' || value === 'card',
  },
  /** 每周的第一天，默认周一。 */
  firstDayOfWeek: {
    type: Number as PropType<CalendarProps['firstDayOfWeek']>, default: 1,
    validator: (value: number) => Number.isInteger(value) && value >= 1 && value <= 7,
  },
  /** 判定指定日期是否禁选。 */
  disabledDate: Function as PropType<CalendarProps['disabledDate']>,
  /** 禁用整个日历。 */
  disabled: Boolean,
  /** 控件尺寸，默认继承最近的 ConfigProvider。 */
  size: buttonProps.size,
} satisfies ComponentObjectPropsOptions<CalendarProps>
