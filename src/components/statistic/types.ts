import type { ControlSize } from '../config-provider/types'

export interface StatisticAnimation {
  /** 每次数值过渡的时长，单位为毫秒。 */
  duration?: number
  /** 首次播放和手动重播的起始数值。 */
  valueFrom?: number
}

export interface StatisticInstance {
  /** 从配置的起始值重新播放至当前目标值。 */
  start(): void
}

export interface StatisticProps {
  /** 统计数值，也是动画的目标值。 */
  value?: number
  /** 统计标题，可通过 title 插槽替换。 */
  title?: string
  /** 数值的单位，可通过 unit 插槽替换。 */
  unit?: string
  /** 数值前缀，优先于左侧趋势图标。 */
  prefix?: string
  /** 单位后的后缀，优先于右侧趋势图标。 */
  suffix?: string
  /** 数值下方的补充说明，可通过 extra 插槽替换。 */
  extra?: string
  /** 固定显示的小数位数，取值为 0 到 20。 */
  decimalPlaces?: number
  /** 千位分隔符，传空字符串可取消分组。 */
  separator?: string
  /** 自定义数值文本，接收当前显示的数值。 */
  format?: (value: number) => string | number
  /** 显示上升或下降的趋势图标。 */
  trend?: 'increase' | 'decrease'
  /** 趋势图标的位置，默认在数值左侧。 */
  trendPlacement?: 'left' | 'right'
  /** 数值行颜色，支持预设颜色名及 CSS 颜色。 */
  color?: string
  /** 显示数值区域的加载占位。 */
  loading?: boolean
  /** 控制文字、图标和间距，默认继承全局尺寸。 */
  size?: ControlSize
  /** 配置数值动画的起点和时长。 */
  animation?: StatisticAnimation
  /** 自动播放动画，并在目标值更新时继续过渡。 */
  animationStart?: boolean
}
