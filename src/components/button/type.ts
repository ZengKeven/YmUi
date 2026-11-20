import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'vue'
import type { ControlSize } from '../config-provider/types'
import type { LoadingProps } from '../loading'

type NativeButtonAttributes = AnchorHTMLAttributes & ButtonHTMLAttributes & {
  /** 透传到根元素的自定义数据属性。 */
  [attribute: `data-${string}`]: string | number | boolean | null | undefined
}

export interface ButtonProps extends NativeButtonAttributes {
  /** 是否占满容器宽度。 */
  block?: boolean
  /** 按钮正文，默认插槽优先。 */
  content?: string
  /** 是否禁用按钮。 */
  disabled?: boolean
  /** 关联表单的 ID。 */
  form?: string
  /** 是否使用透明背景。 */
  ghost?: boolean
  /** 链接地址，传入后默认渲染为 a 元素。 */
  href?: string
  /** 显示在正文前的图标文本。 */
  icon?: string
  /** 是否进入加载状态并阻止激活。 */
  loading?: boolean
  /** 传给 YmLoading 的属性。 */
  loadingProps?: LoadingProps
  /** 按钮形状。 */
  shape?: 'rectangle' | 'square' | 'round' | 'circle'
  /** 按钮尺寸，默认继承全局配置。 */
  size?: ControlSize
  /** 显示在正文后的文本。 */
  suffix?: string
  /** 按钮根元素的标签。 */
  tag?: 'button' | 'a' | 'div'
  /** 按钮的主题色。 */
  theme?: 'default' | 'primary' | 'danger' | 'warning' | 'success'
  /** 原生按钮的表单类型。 */
  type?: 'button' | 'submit' | 'reset'
  /** 按钮的外观样式。 */
  variant?: 'base' | 'outline' | 'dashed' | 'text'
  /** 点击时触发，接收原生鼠标事件。 */
  onClick?: (event: MouseEvent) => void
}
