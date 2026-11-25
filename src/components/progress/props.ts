import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { ProgressProps } from './types'

export default {
  /** 当前完成百分比，默认从零开始。 */
  percentage: { type: Number, default: 0 },
  /** 横线、内嵌标签或圆环。 */
  theme: { type: String as PropType<ProgressProps['theme']>, default: 'line',
    validator: (value: string) => ['line', 'plump', 'circle'].includes(value) },
  /** 显式设置进行中、成功、警告或错误状态。 */
  status: { type: String as PropType<ProgressProps['status']>,
    validator: (value: string) => ['active', 'success', 'warning', 'error'].includes(value) },
  /** 设置标签内容和可见性。 */
  label: { type: [Boolean, String] as PropType<ProgressProps['label']>, default: true },
  /** 四档预设尺寸或圆环直径（像素）。 */
  size: [String, Number] as PropType<ProgressProps['size']>,
  /** 设置横条高度或圆环线宽。 */
  strokeWidth: [Number, String] as PropType<ProgressProps['strokeWidth']>,
  /** 设置纯色或渐变进度色。 */
  color: [String, Array, Object] as PropType<ProgressProps['color']>,
  /** 自定义轨道背景色。 */
  trackColor: String,
} satisfies ComponentObjectPropsOptions<ProgressProps>
