import type { ControlSize } from '../config-provider/types'

export interface UploadFile {
  /** 列表中的稳定标识，选择本地文件时自动生成。 */
  id?: string
  /** 文件名。 */
  name: string
  /** 已有文件或上传成功后的访问地址。 */
  url?: string
  /** 原始文件。 */
  raw?: File
  /** 文件大小，单位为字节。 */
  size?: number
  /** MIME 类型。 */
  type?: string
  /** 上传状态，回显已有文件时可以省略。 */
  status?: 'waiting' | 'progress' | 'success' | 'fail'
  /** 已上传的百分比。 */
  percent?: number
  /** 接口返回的数据或错误信息。 */
  response?: UploadResponse
}

export interface UploadResponse {
  /** 上传后的文件地址。 */
  url?: string
  /** 上传失败的原因。 */
  error?: string
  /** 接口返回的其他业务字段。 */
  [key: string]: unknown
}

export interface UploadResult {
  /** 本次请求的结果。 */
  status: 'success' | 'fail'
  /** 上传接口返回的数据。 */
  response?: UploadResponse
  /** 失败时展示的提示。 */
  error?: string
}

export interface UploadRequestContext {
  /** 请求被取消时触发。 */
  signal: AbortSignal
  /** 报告当前文件的上传百分比。 */
  onProgress: (percent: number) => void
}

export interface UploadRequestOptions {
  /** 接收 multipart/form-data POST 请求的地址。 */
  action?: string
  /** multipart 表单中的文件字段名。 */
  name?: string
  /** 内置请求的额外请求头。 */
  headers?: Record<string, string>
  /** 跨域请求是否附带凭据。 */
  withCredentials?: boolean
  /** 自定义单个文件的上传方法，优先于 action。 */
  requestMethod?: (file: UploadFile, context: UploadRequestContext) => Promise<UploadResult>
  /** 将内置请求的响应转换为文件地址或错误信息。 */
  formatResponse?: (response: unknown, file: UploadFile) => UploadResponse
}

export interface UploadFilesOptions extends UploadRequestOptions {
  /** 同时取消本次调用中的所有上传。 */
  signal?: AbortSignal
  /** 接收单个文件的进度和百分比。 */
  onProgress?: (file: UploadFile, percent: number) => void
}

export interface SharedUploadProps extends UploadRequestOptions {
  /** 受控文件列表，单选和多选均使用数组。 */
  modelValue?: UploadFile[]
  /** 非受控模式的初始列表。 */
  defaultValue?: UploadFile[]
  /** 允许多选并追加文件。 */
  multiple?: boolean
  /** 多选时的数量上限，0 表示不限。 */
  max?: number
  /** 接受的 MIME 类型或扩展名，以逗号分隔。 */
  accept?: string
  /** 每个文件的大小上限，数字单位为 KB。 */
  sizeLimit?: number | { size: number; unit: 'B' | 'KB' | 'MB' | 'GB' }
  /** 禁用选择、移除和发起上传。 */
  disabled?: boolean
  /** 允许拖入文件。 */
  draggable?: boolean
  /** 展示正在上传的文件的百分比。 */
  showUploadProgress?: boolean
  /** 选择后自动发送已配置的上传请求。 */
  autoUpload?: boolean
  /** 组件尺寸，默认继承全局配置。 */
  size?: ControlSize
}

export interface UploadProps extends SharedUploadProps {
  /** 列表为空时的提示文本。 */
  placeholder?: string
}

export interface UploadFileEvent {
  /** 发生变化的文件。 */
  file: UploadFile
  /** 文件在列表中的下标。 */
  index: number
}

export interface UploadValidation {
  /** 未通过校验的原始文件。 */
  file: File
  /** 拒绝原因，分别表示类型、大小和数量。 */
  reason: 'type' | 'size' | 'max'
}
