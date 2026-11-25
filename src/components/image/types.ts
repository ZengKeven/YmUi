import type { ControlSize } from '../config-provider/types'

export interface ImageProps {
  /** 图片地址或本地图片文件。 */
  src?: string | File
  /** 按 MIME 类型排列的候选图片，浏览器选择支持的格式。 */
  srcset?: Record<string, string>
  /** 图片的替代文本，也用于预览标题。 */
  alt?: string
  /** 图片加载成功后允许点击预览，默认关闭。 */
  preview?: boolean
  /** 主图加载失败时尝试的备用图片地址。 */
  fallback?: string
  /** 使用浏览器的图片懒加载。 */
  lazy?: boolean
  /** 图片请求和预览请求的来源信息策略。 */
  referrerpolicy?: ReferrerPolicy
  /** 展示区域宽度，数字按像素计算。 */
  width?: number | string
  /** 展示区域高度，数字按像素计算。 */
  height?: number | string
  /** 图片在展示区域中的填充方式。 */
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  /** 图片在展示区域内的对齐位置。 */
  position?: string
  /** 图片轮廓，round 跟随全局圆角。 */
  shape?: 'round' | 'circle' | 'square'
  /** 状态提示及预览工具的尺寸。 */
  size?: ControlSize
}
