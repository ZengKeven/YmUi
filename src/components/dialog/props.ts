import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { DialogProps } from './types'

export default {
  /** 受控显示状态。 */
  visible: { type: Boolean, default: undefined },
  /** 非受控时的初始显示状态。 */
  defaultVisible: Boolean,
  /** 对话框标题。 */
  header: String,
  /** 对话框正文。 */
  body: String,
  /** 窗口宽度，默认 480 像素。 */
  width: { type: [Number, String], default: 480 },
  /** 在视口中居中或靠上显示，默认居中。 */
  placement: {
    type: String as PropType<DialogProps['placement']>, default: 'center',
    validator: (value: string) => ['center', 'top'].includes(value),
  },
  /** 窗口距视口顶部的距离，优先于 placement。 */
  top: [Number, String],
  /** 挂载元素、选择器或解析函数。 */
  attach: { type: [String, Object, Function] as PropType<DialogProps['attach']>, default: 'body' },
  /** 内容和按钮的尺寸，默认继承配置。 */
  size: buttonProps.size,
  /** 是否显示确认按钮，也可指定按钮文字。 */
  confirmBtn: { type: [Boolean, String], default: true },
  /** 是否显示取消按钮，也可指定按钮文字。 */
  cancelBtn: { type: [Boolean, String], default: true },
  /** 是否显示标题栏关闭按钮并允许 Esc 关闭。 */
  closeBtn: { type: Boolean, default: true },
  /** 是否允许通过点击遮罩关闭。 */
  closeOnOverlayClick: Boolean,
  /** 确认前执行的回调，可返回 Promise。 */
  onConfirm: Function as PropType<DialogProps['onConfirm']>,
  /** 取消或关闭前执行的回调，可返回 Promise。 */
  onCancel: Function as PropType<DialogProps['onCancel']>,
} satisfies ComponentObjectPropsOptions<DialogProps>
