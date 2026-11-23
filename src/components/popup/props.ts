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
    validator: (value: string) => ['click', 'hover', 'manual'].includes(value),
  },
  /** 优先展示方向，默认在锚点下方。 */
  placement: {
    type: String as PropType<PopupProps['placement']>, default: 'bottom',
    validator: (value: string) => ['top', 'bottom', 'left', 'right'].includes(value),
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
  overlayClassName: String,
} satisfies ComponentObjectPropsOptions<PopupProps>
