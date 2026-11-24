import type { CalendarProps } from '../calendar'
import type { InputProps } from '../input'
import type { PopupProps } from '../popup'

export interface DatePickerProps extends
  Pick<CalendarProps, 'modelValue' | 'defaultValue' | 'showLunar' | 'showHoliday' | 'firstDayOfWeek' | 'disabledDate' | 'disabled' | 'size'>,
  Pick<InputProps, 'placeholder' | 'borderless' | 'name' | 'form' | 'class' | 'style'> {
  /** 允许清空已选日期，清空时返回 null。 */
  clearable?: boolean
  /** 配置日历浮层的位置、挂载容器和外观。 */
  popupProps?: Pick<PopupProps, 'placement' | 'attach' | 'showArrow' | 'zIndex' | 'overlayClassName' | 'overlayStyle'>
}
