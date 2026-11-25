import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { RateProps } from './types'

export default {
  /** 当前评分，支持双向绑定。 */
  modelValue: Number,
  /** 外部控制的评分。 */
  value: Number,
  /** 非受控初始分值。 */
  defaultValue: { type: Number, default: 0 },
  /** 是否允许半星。 */
  allowHalf: Boolean,
  /** 是否允许重复点击当前分值清零。 */
  clearable: Boolean,
  /** 是否禁用交互。 */
  disabled: Boolean,
  /** 星星数量，默认五颗。 */
  count: { type: Number, default: 5, validator: (n: number) => Number.isSafeInteger(n) && n >= 0 },
  /** 星星之间的像素间距。 */
  gap: { type: Number, default: 4, validator: (n: number) => Number.isFinite(n) && n >= 0 },
  /** 图标尺寸，省略时继承 ConfigProvider。 */
  size: [String, Number],
  /** 选中和未选中的颜色。 */
  color: [String, Array] as PropType<RateProps['color']>,
  /** 是否展示评级文字。 */
  showText: Boolean,
  /** 每档分值的说明文字。 */
  texts: Array as PropType<RateProps['texts']>,
} satisfies ComponentObjectPropsOptions<RateProps>
