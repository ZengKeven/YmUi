import type { ControlSize } from '../config-provider/types'
import type { UploadFile } from '../upload/types'

export interface ChatAttachmentItem extends UploadFile {
  /** 上游发送框使用的稳定标识，未提供 id 时可用。 */
  key?: string | number
  /** 上游附件列表使用的稳定标识。 */
  uid?: string | number
  /** 消息附件的类别，例如 image、doc 或 pdf。 */
  fileType?: string
  /** 显示在文件名下方的说明，优先于文件大小。 */
  description?: string
}

export interface ChatAttachmentsProps {
  /** 按显示顺序排列的附件，支持 v-model:items。 */
  items?: readonly ChatAttachmentItem[]
  /** 是否显示移除按钮，默认开启。 */
  removable?: boolean
  /** 图片加载成功后能否打开大图预览，默认开启。 */
  imageViewer?: boolean
  /** 卡片、缩略图与按钮的局部尺寸，省略时继承最近的 ConfigProvider。 */
  size?: ControlSize
}

export interface ChatAttachmentRemoveContext {
  /** 此次移除的附件在当前列表中的下标。 */
  index: number
  /** 激活移除按钮的原生点击事件。 */
  e: MouseEvent
}
