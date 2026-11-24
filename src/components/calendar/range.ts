import type { ComputedRef, InjectionKey } from 'vue'

/** 日期选择器为自己的日历提供区间展示，日历仍负责日期格、焦点和导航。 */
export interface CalendarRange {
  selected: (date: string) => boolean
  position: (date: string) => 'start' | 'inside' | 'end' | 'single' | undefined
  preview: (date: string | null) => void
}

export const calendarRangeKey: InjectionKey<ComputedRef<CalendarRange | undefined> | undefined> = Symbol('YmCalendarRange')
