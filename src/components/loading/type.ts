export interface LoadingProps {
  /** 加载提示的挂载位置，接受选择器、元素或返回挂载点的函数。 */
  attach?: string | Element | ((trigger?: HTMLElement) => Element | Document | null | undefined)
  /** 被加载遮罩覆盖的文本。 */
  content?: string
  /** 被加载遮罩覆盖的文本，优先于 content。 */
  default?: string
  /** 显示加载提示前的延迟，单位为毫秒。 */
  delay?: number
  /** 是否显示全屏加载遮罩。 */
  fullscreen?: boolean
  /** 是否显示旋转图标，也可传入文本替换图标。 */
  indicator?: boolean | string
  /** 是否继承父元素的文字颜色。 */
  inheritColor?: boolean
  /** 是否显示加载提示。 */
  loading?: boolean
  /** 全屏加载时是否禁止页面滚动。 */
  preventScrollThrough?: boolean
  /** 是否为局部加载区域显示遮罩背景。 */
  showOverlay?: boolean
  /** 加载图标的尺寸名或 CSS 长度。 */
  size?: string
  /** 显示在加载图标旁的提示文本。 */
  text?: string
  /** 加载提示的堆叠层级。 */
  zIndex?: number
}
