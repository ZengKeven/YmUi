import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { PopupProps } from './types'

export default {
  /** 受控显示状态。 */
  visible: { type: Boolean, default: undefined },
  /** 非受控时是否默认显示。 */
  defaultVisible: Boolean,
  /** 触发方式，默认点击。 */
  trigger: {
    type: String as PropType<PopupProps['trigger']>, default: 'click',
    validator: (value: string) => ['click', 'hover', 'manual', 'focus', 'mousedown', 'context-menu'].includes(value),
  },
  /** 指定浮层挂载位置。 */
  attach: [String, Object, Function] as PropType<PopupProps['attach']>,
  /** 优先展示方向，默认在锚点下方。 */
  placement: {
    type: String as PropType<PopupProps['placement']>, default: 'bottom',
    validator: (value: string) => /^(?:(?:top|bottom)(?:-(?:left|right))?|(?:left|right)(?:-(?:top|bottom))?)$/.test(value),
  },
  /** 未提供 content 插槽时显示的文字。 */
  content: String,
  /** 是否禁用浮层。 */
  disabled: Boolean,
  /** 组件尺寸，省略时继承。 */
  size: {
    type: String as PropType<PopupProps['size']>,
    validator: (value: string) => ['extra-small', 'small', 'medium', 'large'].includes(value),
  },
  /** 自定义面板样式类。 */
  overlayClassName: [String, Array, Object] as PropType<PopupProps['overlayClassName']>,
  /** 自定义面板样式。 */
  overlayStyle: [String, Object, Array, Function] as PropType<PopupProps['overlayStyle']>,
  /** 是否显示定位箭头。 */
  showArrow: Boolean,
  /** 面板的 CSS 层级。 */
  zIndex: Number,
} satisfies ComponentObjectPropsOptions<PopupProps>
