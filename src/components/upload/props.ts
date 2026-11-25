import type { ComponentObjectPropsOptions, PropType } from 'vue'
import inputProps from '../input/props'
import type { SharedUploadProps, UploadProps } from './types'

export const sharedUploadProps = {
  /** 受控文件列表。 */
  modelValue: Array as PropType<SharedUploadProps['modelValue']>,
  /** 非受控模式的初始文件列表。 */
  defaultValue: { type: Array as PropType<SharedUploadProps['defaultValue']>, default: () => [] },
  /** 允许选择多个文件。 */
  multiple: Boolean,
  /** 多选模式的文件数量上限。 */
  max: { type: Number, default: 0, validator: (n: number) => Number.isInteger(n) && n >= 0 },
  /** 可选择的文件类型，默认不限。 */
  accept: { type: String, default: '' },
  /** 每个文件的大小上限。 */
  sizeLimit: [Number, Object] as PropType<SharedUploadProps['sizeLimit']>,
  /** 禁用选择、上传和移除文件。 */
  disabled: Boolean,
  /** 启用拖放选择。 */
  draggable: Boolean,
  /** 显示上传百分比。 */
  showUploadProgress: { type: Boolean, default: true },
  /** 选择后自动发送请求。 */
  autoUpload: { type: Boolean, default: true },
  /** 上传接口的地址。 */
  action: String,
  /** multipart 表单中的字段名。 */
  name: { type: String, default: 'file' },
  /** 内置请求的附加请求头。 */
  headers: Object as PropType<SharedUploadProps['headers']>,
  /** 跨域请求是否附带凭据。 */
  withCredentials: Boolean,
  /** 自定义单个文件的上传方法。 */
  requestMethod: Function as PropType<SharedUploadProps['requestMethod']>,
  /** 自定义内置请求的响应解析。 */
  formatResponse: Function as PropType<SharedUploadProps['formatResponse']>,
  /** 控件尺寸，默认继承。 */
  size: inputProps.size,
} satisfies ComponentObjectPropsOptions<SharedUploadProps>

export default {
  ...sharedUploadProps,
  /** 列表为空时显示的提示。 */
  placeholder: String,
} satisfies ComponentObjectPropsOptions<UploadProps>
