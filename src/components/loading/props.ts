import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { LoadingProps } from './type'

export default {
  /** 加载提示的挂载位置，接受选择器、元素或返回挂载点的函数。 */
  attach: [String, Object, Function] as PropType<LoadingProps['attach']>,
  /** 被加载遮罩覆盖的文本。 */
  content: String,
  /** 被加载遮罩覆盖的文本，优先于 content。 */
  default: String,
  /** 显示加载提示前的延迟，单位为毫秒。 */
  delay: { type: Number, default: 0 },
  /** 是否显示全屏加载遮罩。 */
  fullscreen: Boolean,
  /** 是否显示旋转图标，也可传入文本替换图标。 */
  indicator: { type: [Boolean, String] as PropType<LoadingProps['indicator']>, default: true },
  /** 是否继承父元素的文字颜色。 */
  inheritColor: { type: Boolean, default: true },
  /** 是否显示加载提示。 */
  loading: { type: Boolean, default: true },
  /** 全屏加载时是否禁止页面滚动。 */
  preventScrollThrough: { type: Boolean, default: true },
  /** 是否为局部加载区域显示遮罩背景。 */
  showOverlay: { type: Boolean, default: true },
  /** 加载图标的尺寸名或 CSS 长度。 */
  size: String,
  /** 显示在加载图标旁的提示文本。 */
  text: String,
  /** 加载提示的堆叠层级。 */
  zIndex: Number,
} satisfies ComponentObjectPropsOptions<LoadingProps>
