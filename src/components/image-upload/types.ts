import type { ControlSize } from '../config-provider/types'

export interface ImageUploadFile {
  /** 图片的稳定标识，选择本地文件时自动生成。 */
  id?: string
  /** 图片名称。 */
  name: string
  /** 已有图片或上传成功后的访问地址。 */
  url?: string
  /** 用户选择的原始图片。 */
  raw?: File
  /** 文件字节数。 */
  size?: number
  /** 文件 MIME 类型。 */
  type?: string
  /** 上传状态，已有地址的图片可省略。 */
  status?: 'waiting' | 'progress' | 'success' | 'fail'
  /** 上传百分比。 */
  percent?: number
  /** 接口返回的图片地址、错误信息及业务字段。 */
  response?: ImageUploadResponse
}

export interface ImageUploadResponse {
  /** 图片的访问地址。 */
  url?: string
  /** 上传失败的原因。 */
  error?: string
  [key: string]: unknown
}

export interface ImageUploadResult {
  /** 当前请求的结果。 */
  status: 'success' | 'fail'
  /** 上传接口响应。 */
  response?: ImageUploadResponse
  /** 上传失败时的提示。 */
  error?: string
}

export interface ImageUploadRequestContext {
  /** 删除图片或卸载组件时取消请求。 */
  signal: AbortSignal
  /** 更新此张图片的上传百分比。 */
  onProgress: (percent: number) => void
}

export interface ImageUploadProps {
  /** 受控图片列表，单张和多张均使用数组。 */
  modelValue?: ImageUploadFile[]
  /** 非受控模式的初始图片。 */
  defaultValue?: ImageUploadFile[]
  /** 允许选择多张图片。 */
  multiple?: boolean
  /** 多张模式的数量上限，0 表示不限。 */
  max?: number
  /** 支持的图片 MIME 类型或扩展名。 */
  accept?: string
  /** 单张图片的大小上限，使用数字时单位为 KB。 */
  sizeLimit?: number | { size: number; unit: 'B' | 'KB' | 'MB' | 'GB' }
  /** 禁用添加、上传及删除。 */
  disabled?: boolean
  /** 允许将图片拖入组件。 */
  draggable?: boolean
  /** 是否在卡片下方展示文件名。 */
  showImageFileName?: boolean
  /** 是否显示上传的百分比。 */
  showUploadProgress?: boolean
  /** 选择图片后自动发送已配置的上传请求。 */
  autoUpload?: boolean
  /** 接收 multipart/form-data POST 请求的地址。 */
  action?: string
  /** 上传文件的表单字段名。 */
  name?: string
  /** 内置上传请求的额外请求头。 */
  headers?: Record<string, string>
  /** 跨域请求附带凭据。 */
  withCredentials?: boolean
  /** 自定义单张图片的请求，优先于 action。 */
  requestMethod?: (file: ImageUploadFile, context: ImageUploadRequestContext) => Promise<ImageUploadResult>
  /** 将内置请求的响应转换为图片地址或错误信息。 */
  formatResponse?: (response: unknown, file: ImageUploadFile) => ImageUploadResponse
  /** 卡片、操作按钮及预览的尺寸，默认继承。 */
  size?: ControlSize
}
