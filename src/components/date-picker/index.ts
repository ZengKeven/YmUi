import type { HTMLAttributes } from 'vue'
import DatePicker from './date-picker.vue'

export type { DatePickerProps } from './types'

type Props = Parameters<typeof DatePicker>[0]
type WithFieldAttrs = (props: Props & Omit<HTMLAttributes, keyof Props>) => ReturnType<typeof DatePicker>
export const YmDatePicker: typeof DatePicker & WithFieldAttrs = DatePicker
export default YmDatePicker
