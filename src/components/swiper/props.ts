import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { SwiperProps } from './types'

export default {
  /** 受控的当前项下标。 */
  current: Number,
  /** 初始显示的轮播项。 */
  defaultCurrent: { type: Number, default: 0 },
  /** 是否自动播放。 */
  autoplay: { type: Boolean, default: true },
  /** 自动播放间隔，单位为毫秒。 */
  interval: { type: Number, default: 5000 },
  /** 是否允许首尾相接。 */
  loop: { type: Boolean, default: true },
  /** 悬停时暂停播放。 */
  stopOnHover: { type: Boolean, default: true },
  /** 轮播方向。 */
  direction: { type: String as PropType<SwiperProps['direction']>, default: 'horizontal',
    validator: (v: string) => ['horizontal', 'vertical'].includes(v) },
  /** 切换动效。 */
  animation: { type: String as PropType<SwiperProps['animation']>, default: 'slide',
    validator: (v: string) => ['slide', 'fade'].includes(v) },
  /** 动画时长，单位为毫秒。 */
  duration: { type: Number, default: 300 },
  /** 普通或卡片模式。 */
  type: { type: String as PropType<SwiperProps['type']>, default: 'default',
    validator: (v: string) => ['default', 'card'].includes(v) },
  /** 相邻卡片的缩放比例。 */
  cardScale: { type: Number, default: 210 / 332, validator: (v: number) => v >= 0 && v <= 1 },
  /** 数字像素或 CSS 高度。 */
  height: [Number, String] as PropType<SwiperProps['height']>,
  /** 鼠标切换指示器的方式。 */
  trigger: { type: String as PropType<SwiperProps['trigger']>, default: 'hover',
    validator: (v: string) => ['hover', 'click'].includes(v) },
  /** 导航配置，设为 false 可隐藏。 */
  navigation: { type: [Object, Boolean] as PropType<SwiperProps['navigation']>, default: undefined },
  /** 导航按钮及指示器的尺寸。 */
  size: buttonProps.size,
  /** 请求切换时触发。 */
  onChange: Function as PropType<SwiperProps['onChange']>,
} satisfies ComponentObjectPropsOptions<SwiperProps>
