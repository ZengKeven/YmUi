import type { ComponentObjectPropsOptions } from 'vue'
import { sharedUploadProps } from '../upload/props'
import type { ImageUploadProps } from './types'

export default {
  ...sharedUploadProps,
  /** 可选择的图片类型，默认接受全部图片。 */
  accept: { type: String, default: 'image/*' },
  /** 显示图片名称。 */
  showImageFileName: { type: Boolean, default: true },
} satisfies ComponentObjectPropsOptions<ImageUploadProps>
