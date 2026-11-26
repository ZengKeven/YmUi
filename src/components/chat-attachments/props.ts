import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { ChatAttachmentsProps } from './types'

export default {
  /** 受控的附件列表。 */
  items: { type: Array as PropType<ChatAttachmentsProps['items']>, default: () => [] },
  /** 是否提供逐项移除操作。 */
  removable: { type: Boolean, default: true },
  /** 是否允许打开图片预览。 */
  imageViewer: { type: Boolean, default: true },
  /** 局部尺寸，默认继承全局配置。 */
  size: buttonProps.size,
} satisfies ComponentObjectPropsOptions<ChatAttachmentsProps>
