import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { ImageProps } from './types'

export default {
  /** 图片 URL 或 File 对象。 */
  src: [String, Object] as PropType<ImageProps['src']>,
  /** 按 MIME 类型指定候选图片地址。 */
  srcset: Object as PropType<ImageProps['srcset']>,
  /** 图片替代文本。 */
  alt: { type: String, default: '' },
  /** 点击图片打开预览。 */
  preview: Boolean,
  /** 加载失败时使用的备用图。 */
  fallback: String,
  /** 图片接近视口时由浏览器开始加载。 */
  lazy: Boolean,
  /** 图片请求的来源信息策略。 */
  referrerpolicy: { type: String as PropType<ImageProps['referrerpolicy']>, default: 'strict-origin-when-cross-origin' },
  /** 展示区域宽度。 */
  width: [Number, String] as PropType<ImageProps['width']>,
  /** 展示区域高度。 */
  height: [Number, String] as PropType<ImageProps['height']>,
  /** 图片填充方式。 */
  fit: { type: String as PropType<ImageProps['fit']>, default: 'fill',
    validator: (value: string) => ['fill', 'contain', 'cover', 'none', 'scale-down'].includes(value) },
  /** 图片的 object-position。 */
  position: { type: String, default: 'center' },
  /** 图片轮廓。 */
  shape: { type: String as PropType<ImageProps['shape']>, default: 'round',
    validator: (value: string) => ['round', 'circle', 'square'].includes(value) },
  /** 状态提示和预览工具的局部尺寸。 */
  size: buttonProps.size,
} satisfies ComponentObjectPropsOptions<ImageProps>
