import type { ControlSize } from '../config-provider/types'

export type SwiperChangeSource = 'autoplay' | 'click' | 'hover' | 'keyboard' | 'touch'

export interface SwiperNavigation {
  /** 指示器样式，默认显示短条。 */
  type?: 'bars' | 'dots' | 'dots-bar' | 'fraction'
  /** 导航器在视口内侧或外侧。 */
  placement?: 'inside' | 'outside'
  /** 翻页按钮的显示时机。 */
  showSlideBtn?: 'always' | 'hover' | 'never'
  /** 单独指定导航控件尺寸。 */
  size?: ControlSize
}

export interface SwiperProps {
  /** 受控的当前项下标，从 0 开始。 */
  current?: number
  /** 非受控时的初始项下标。 */
  defaultCurrent?: number
  /** 是否自动播放。 */
  autoplay?: boolean
  /** 自动播放间隔，单位为毫秒。 */
  interval?: number
  /** 是否允许首尾循环。 */
  loop?: boolean
  /** 鼠标悬停时是否暂停自动播放。 */
  stopOnHover?: boolean
  /** 水平或垂直切换。 */
  direction?: 'horizontal' | 'vertical'
  /** 普通模式下的切换动效。 */
  animation?: 'slide' | 'fade'
  /** 动画时长，单位为毫秒。 */
  duration?: number
  /** 普通或卡片模式。 */
  type?: 'default' | 'card'
  /** 相邻卡片相对于当前卡片的缩放比例。 */
  cardScale?: number
  /** 视口高度，数字表示像素。 */
  height?: number | string
  /** 指示器使用鼠标悬停或点击切换。 */
  trigger?: 'hover' | 'click'
  /** 自定义内置导航，设置为 false 可隐藏。 */
  navigation?: false | SwiperNavigation
  /** 导航尺寸，默认继承全局配置。 */
  size?: ControlSize
  /** 切换请求的目标下标和来源。 */
  onChange?: (current: number, context: { source: SwiperChangeSource }) => void
}
