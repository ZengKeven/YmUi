import type { ComponentObjectPropsOptions, PropType } from 'vue'
import inputNumberProps from '../input-number/props'
import type { StatisticProps } from './types'

export default {
  /** 展示的统计数值。 */
  value: { type: Number, default: 0 },
  /** 数值上方的标题。 */
  title: String,
  /** 数值后方的单位。 */
  unit: String,
  /** 数值前缀。 */
  prefix: String,
  /** 数值和单位之后的后缀。 */
  suffix: String,
  /** 数值下方的说明。 */
  extra: String,
  /** 固定小数位，支持 0 到 20 位。 */
  decimalPlaces: inputNumberProps.decimalPlaces,
  /** 千位分隔符，空字符串表示不分组。 */
  separator: { type: String, default: ',' },
  /** 自定义当前数值的显示格式。 */
  format: Function as PropType<StatisticProps['format']>,
  /** 趋势方向。 */
  trend: { type: String as PropType<StatisticProps['trend']>,
    validator: (value: string) => ['increase', 'decrease'].includes(value) },
  /** 趋势图标显示位置。 */
  trendPlacement: { type: String as PropType<StatisticProps['trendPlacement']>, default: 'left',
    validator: (value: string) => ['left', 'right'].includes(value) },
  /** 数值、单位和前后缀的颜色。 */
  color: String,
  /** 是否处于加载状态。 */
  loading: Boolean,
  /** 统计数值的局部尺寸。 */
  size: inputNumberProps.size,
  /** 数值过渡的起始值和持续毫秒数。 */
  animation: Object as PropType<StatisticProps['animation']>,
  /** 是否自动开始动画。 */
  animationStart: Boolean,
} satisfies ComponentObjectPropsOptions<StatisticProps>
