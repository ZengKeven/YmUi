import type { ControlSize } from '../config-provider/types'

export interface CalendarCell {
  /** 单元格对应的本地日期。 */
  date: Date
  /** YYYY-MM-DD 格式的日期。 */
  value: string
  /** 是否属于当前展示月。 */
  inMonth: boolean
  /** 是否为今天。 */
  today: boolean
  /** 是否为当前选中日期。 */
  selected: boolean
}

export interface CalendarProps {
  /** 选中的本地日期，格式为 YYYY-MM-DD，null 表示未选。 */
  modelValue?: string | null
  /** 非受控日历的初始选中日期。 */
  defaultValue?: string
  /** 完整月历或可嵌入的紧凑卡片。 */
  theme?: 'full' | 'card'
  /** 每周的第一天，1 为周一，7 为周日。 */
  firstDayOfWeek?: 1 | 2 | 3 | 4 | 5 | 6 | 7
  /** 返回 true 时禁止选中该本地日期。 */
  disabledDate?: (date: Date) => boolean
  /** 禁用日期选择和导航。 */
  disabled?: boolean
  /** 日期和导航控件的尺寸，默认继承全局配置。 */
  size?: ControlSize
}
