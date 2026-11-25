import type { HTMLAttributes } from 'vue'
import TimePicker from './time-picker.vue'
import type { TimePickerMode, TimePickerProps } from './types'

export type { TimePickerFormat, TimePickerMode, TimePickerProps, TimePickerValue, TimeRangeValue } from './types'

type TimePickerComponent = <Mode extends TimePickerMode = 'single'>(
  props: TimePickerProps<NoInfer<Mode>> & { mode?: Mode }
    & Omit<Parameters<typeof TimePicker<Mode>>[0], keyof TimePickerProps>
    & Omit<HTMLAttributes, keyof TimePickerProps | 'onChange'>,
) => ReturnType<typeof TimePicker<Mode>>
export const YmTimePicker = TimePicker as TimePickerComponent
export default YmTimePicker
