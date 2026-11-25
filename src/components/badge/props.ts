import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { BadgeProps } from './types'

export default {
  /** 显示徽标的目标文字。 */
  content: String,
  /** 数量或短文本，默认为零。 */
  count: { type: [Number, String], default: 0 },
  /** 数量的显示上限。 */
  maxCount: { type: Number, default: 99 },
  /** 是否显示零值。 */
  showZero: Boolean,
  /** 是否只显示圆点。 */
  dot: Boolean,
  /** 胶囊形或圆角矩形。 */
  shape: {
    type: String as PropType<BadgeProps['shape']>, default: 'circle',
    validator: (value: string) => ['circle', 'round'].includes(value),
  },
  /** 自定义背景色，默认继承危险色。 */
  color: String,
  /** 水平和垂直偏移，支持数字和 CSS 长度。 */
  offset: Array as unknown as PropType<BadgeProps['offset']>,
  /** 徽标尺寸，默认继承全局配置。 */
  size: buttonProps.size,
} satisfies ComponentObjectPropsOptions<BadgeProps>
