import type { CalendarProps } from '../calendar'
import type { InputProps } from '../input'
import type { PopupProps } from '../popup'

/** 日期选择器的选择模式。 */
export type DatePickerMode = 'single' | 'range'

/** 起始和结束日期，均以本地 YYYY-MM-DD 字符串表示。 */
export type DateRangeValue = [start: string, end: string]

/** 选择完成后提交的值。 */
export type DatePickerValue<Mode extends DatePickerMode = DatePickerMode> =
  Mode extends 'range' ? DateRangeValue : string

export interface DatePickerProps<Mode extends DatePickerMode = DatePickerMode> extends
  Pick<CalendarProps, 'showLunar' | 'showHoliday' | 'firstDayOfWeek' | 'disabledDate' | 'disabled' | 'size'>,
  Pick<InputProps, 'placeholder' | 'borderless' | 'name' | 'form' | 'class' | 'style'> {
  /** 选择单个日期或起止日期，默认为单选。 */
  mode?: Mode
  /** 当前日期或起止日期，null 表示尚未选择。 */
  modelValue?: DatePickerValue<Mode> | null
  /** 非受控模式下的初始日期或起止日期。 */
  defaultValue?: DatePickerValue<Mode>
  /** 配置日历浮层的位置、挂载容器和外观。 */
  popupProps?: Pick<PopupProps, 'placement' | 'attach' | 'showArrow' | 'zIndex' | 'overlayClassName' | 'overlayStyle'>
}
