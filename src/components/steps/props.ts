import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { StepsProps } from './types'

export default {
  /** 按流程顺序排列的步骤。 */
  options: { type: Array as PropType<NonNullable<StepsProps['options']>>, default: () => [] },
  /** 当前步骤标识，省略时展示第一步。 */
  current: [String, Number] as PropType<StepsProps['current']>,
  /** 步骤排列方向。 */
  layout: {
    type: String as PropType<StepsProps['layout']>, default: 'horizontal',
    validator: (value: string) => ['horizontal', 'vertical'].includes(value),
  },
  /** 是否仅展示进度。 */
  readonly: Boolean,
  /** 步骤的展示顺序。 */
  sequence: {
    type: String as PropType<StepsProps['sequence']>, default: 'positive',
    validator: (value: string) => ['positive', 'reverse'].includes(value),
  },
  /** 相邻步骤的连接方式。 */
  separator: {
    type: String as PropType<StepsProps['separator']>, default: 'line',
    validator: (value: string) => ['line', 'dashed', 'arrow'].includes(value),
  },
  /** 步骤标记的风格。 */
  theme: {
    type: String as PropType<StepsProps['theme']>, default: 'default',
    validator: (value: string) => ['default', 'dot'].includes(value),
  },
  /** 步骤标记和文字的尺寸，默认继承全局配置。 */
  size: {
    type: String as PropType<StepsProps['size']>,
    validator: (value: string) => ['extra-small', 'small', 'medium', 'large'].includes(value),
  },
} satisfies ComponentObjectPropsOptions<StepsProps>
