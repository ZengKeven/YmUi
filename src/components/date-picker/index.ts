import type { HTMLAttributes } from 'vue'
import DatePicker from './date-picker.vue'
import type { DatePickerMode, DatePickerProps } from './types'

export type { DatePickerMode, DatePickerProps, DatePickerValue, DateRangeValue } from './types'

type DatePickerComponent = <Mode extends DatePickerMode = 'single'>(
  props: DatePickerProps<NoInfer<Mode>> & { mode?: Mode }
    & Omit<Parameters<typeof DatePicker<Mode>>[0], keyof DatePickerProps>
    & Omit<HTMLAttributes, keyof DatePickerProps | 'onChange'>,
) => ReturnType<typeof DatePicker<Mode>>
export const YmDatePicker = DatePicker as DatePickerComponent
export default YmDatePicker
