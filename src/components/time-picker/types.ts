import type { InputProps } from '../input'
import type { PopupProps } from '../popup'

/** 时间选择器的选择模式。 */
export type TimePickerMode = 'single' | 'range'
/** 24 小时制的时间格式。 */
export type TimePickerFormat = 'HH:mm:ss' | 'HH:mm'
/** 同一天内的起止时间。 */
export type TimeRangeValue = [start: string, end: string]
/** 确认选择后提交的时间或起止时间对。 */
export type TimePickerValue<Mode extends TimePickerMode = TimePickerMode> =
  Mode extends 'range' ? TimeRangeValue : string

export interface TimePickerProps<Mode extends TimePickerMode = TimePickerMode> extends
  Pick<InputProps, 'placeholder' | 'disabled' | 'borderless' | 'size' | 'name' | 'form' | 'class' | 'style'> {
  /** 选择一个时间或一段时间范围。 */
  mode?: Mode
  /** 显示和提交时间时使用的精度。 */
  format?: TimePickerFormat
  /** 已确认的时间或起止时间，null 表示尚未选择。 */
  modelValue?: TimePickerValue<Mode> | null
  /** 非受控模式下的初始时间或起止时间。 */
  defaultValue?: TimePickerValue<Mode>
  /** 配置时间浮层的位置、挂载容器和外观。 */
  popupProps?: Pick<PopupProps, 'placement' | 'attach' | 'showArrow' | 'zIndex' | 'overlayClassName' | 'overlayStyle'>
}
