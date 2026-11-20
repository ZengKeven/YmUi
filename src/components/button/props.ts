import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { ButtonProps } from './type'

export default {
  /** 是否占满容器宽度。 */
  block: Boolean,
  /** 按钮正文，默认插槽优先。 */
  content: {
    type: String as PropType<ButtonProps['content']>,
  },
  /** 是否禁用按钮。 */
  disabled: {
    type: Boolean,
    default: undefined,
  },
  /** 关联表单的 ID。 */
  form: String,
  /** 是否使用透明背景。 */
  ghost: Boolean,
  /** 链接地址，传入后默认渲染为 a 元素。 */
  href: {
    type: String,
    default: '',
  },
  /** 显示在正文前的图标文本。 */
  icon: String,
  /** 是否进入加载状态并阻止激活。 */
  loading: Boolean,
  /** 传给 YmLoading 的属性。 */
  loadingProps: Object as PropType<ButtonProps['loadingProps']>,
  /** 按钮形状。 */
  shape: {
    type: String as PropType<ButtonProps['shape']>,
    default: 'rectangle',
    validator: (value: string) => ['rectangle', 'square', 'round', 'circle'].includes(value),
  },
  /** 按钮尺寸，默认继承全局配置。 */
  size: {
    type: String as PropType<ButtonProps['size']>,
    validator: (value: string) => ['extra-small', 'small', 'medium', 'large'].includes(value),
  },
  /** 显示在正文后的文本。 */
  suffix: String,
  /** 按钮根元素的标签。 */
  tag: {
    type: String as PropType<ButtonProps['tag']>,
    validator: (value: string) => ['button', 'a', 'div'].includes(value),
  },
  /** 按钮的主题色，默认根据外观样式选择。 */
  theme: {
    type: String as PropType<ButtonProps['theme']>,
    validator: (value: string) => ['default', 'primary', 'danger', 'warning', 'success'].includes(value),
  },
  /** 原生按钮的表单类型。 */
  type: {
    type: String as PropType<ButtonProps['type']>,
    default: 'button',
    validator: (value: string) => ['button', 'submit', 'reset'].includes(value),
  },
  /** 按钮的外观样式。 */
  variant: {
    type: String as PropType<ButtonProps['variant']>,
    default: 'base',
    validator: (value: string) => ['base', 'outline', 'dashed', 'text'].includes(value),
  },
  /** 点击时触发，接收原生鼠标事件。 */
  onClick: Function as PropType<ButtonProps['onClick']>,
} satisfies ComponentObjectPropsOptions<ButtonProps>
