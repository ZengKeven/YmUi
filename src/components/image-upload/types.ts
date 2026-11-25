import type { SharedUploadProps } from '../upload/types'

export type {
  UploadFile as ImageUploadFile, UploadRequestContext as ImageUploadRequestContext,
  UploadResponse as ImageUploadResponse, UploadResult as ImageUploadResult,
} from '../upload/types'

export interface ImageUploadProps extends SharedUploadProps {
  /** 是否在缩略图卡片下方展示文件名。 */
  showImageFileName?: boolean
}
