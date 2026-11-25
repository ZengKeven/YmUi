import type { ControlSize } from '../config-provider/types'
import type { PopupProps } from '../popup/types'

export type DialogPlacement = 'center' | 'top'
export type DialogCloseTrigger = 'confirm' | 'cancel' | 'close-btn' | 'esc' | 'overlay'

export interface DialogActionContext {
  /** 发起操作的按钮、快捷键或遮罩。 */
  trigger: DialogCloseTrigger
  /** 触发操作的原始事件。 */
  e: Event
}

export type DialogActionHandler = (context: DialogActionContext) => void | boolean | Promise<void | boolean>

export interface DialogProps {
  /** 受控显示状态，支持 v-model:visible。 */
  visible?: boolean
  /** 非受控模式下是否初始打开。 */
  defaultVisible?: boolean
  /** 对话框标题。 */
  header?: string
  /** 对话框正文。 */
  body?: string
  /** 窗口宽度，数字按像素计算。 */
  width?: number | string
  /** 对话框在视口中的位置。 */
  placement?: DialogPlacement
  /** 距视口顶部的距离，优先于 placement，数字按像素计算。 */
  top?: number | string
  /** 挂载的元素、选择器或解析函数，默认挂载到 body。 */
  attach?: PopupProps['attach']
  /** 内容和按钮尺寸，默认继承最近的全局配置。 */
  size?: ControlSize
  /** 显示确认按钮，可传字符串指定文字。 */
  confirmBtn?: boolean | string
  /** 显示取消按钮，可传字符串指定文字。 */
  cancelBtn?: boolean | string
  /** 显示标题栏关闭按钮，同时允许 Esc 关闭。 */
  closeBtn?: boolean
  /** 点击遮罩时是否执行取消操作。 */
  closeOnOverlayClick?: boolean
  /** 确认回调。等待异步结果，返回 false 或抛出错误时保持打开。 */
  onConfirm?: DialogActionHandler
  /** 取消、关闭按钮、Esc 或遮罩回调，返回 false 或抛出错误时保持打开。 */
  onCancel?: DialogActionHandler
}
