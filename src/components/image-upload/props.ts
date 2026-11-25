import type { ComponentObjectPropsOptions, PropType } from 'vue'
import inputProps from '../input/props'
import type { ImageUploadProps } from './types'

export default {
  /** 已选图片列表。 */
  modelValue: Array as PropType<ImageUploadProps['modelValue']>,
  /** 非受控模式的初始列表。 */
  defaultValue: { type: Array as PropType<ImageUploadProps['defaultValue']>, default: () => [] },
  /** 允许选择多张图片。 */
  multiple: Boolean,
  /** 多张模式的数量上限，0 表示不限。 */
  max: { type: Number, default: 0, validator: (n: number) => Number.isInteger(n) && n >= 0 },
  /** 可选择的图片类型。 */
  accept: { type: String, default: 'image/*' },
  /** 单张图片的大小上限。 */
  sizeLimit: [Number, Object] as PropType<ImageUploadProps['sizeLimit']>,
  /** 禁用添加、上传及删除。 */
  disabled: Boolean,
  /** 启用拖放选择。 */
  draggable: Boolean,
  /** 显示图片名称。 */
  showImageFileName: { type: Boolean, default: true },
  /** 显示上传百分比。 */
  showUploadProgress: { type: Boolean, default: true },
  /** 选择后立即上传。 */
  autoUpload: { type: Boolean, default: true },
  /** 上传接口的地址。 */
  action: String,
  /** multipart 表单中的文件字段名。 */
  name: { type: String, default: 'file' },
  /** 内置请求的请求头。 */
  headers: Object as PropType<ImageUploadProps['headers']>,
  /** 允许跨域请求附带凭据。 */
  withCredentials: Boolean,
  /** 自定义单张图片的上传方法。 */
  requestMethod: Function as PropType<ImageUploadProps['requestMethod']>,
  /** 自定义内置请求的响应解析。 */
  formatResponse: Function as PropType<ImageUploadProps['formatResponse']>,
  /** 控件尺寸，默认继承全局配置。 */
  size: inputProps.size,
} satisfies ComponentObjectPropsOptions<ImageUploadProps>
