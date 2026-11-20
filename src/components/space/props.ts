import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { SpaceProps } from './types'

export default {
  /** 子项在交叉轴上的对齐方式。 */
  align: {
    type: String as PropType<SpaceProps['align']>,
    validator: (value: string) => ['start', 'end', 'center', 'baseline'].includes(value),
  },
  /** 横向排列时是否允许换行。 */
  breakLine: Boolean,
  /** 子项的排列方向，默认横向。 */
  direction: {
    type: String as PropType<SpaceProps['direction']>,
    default: 'horizontal',
    validator: (value: string) => ['horizontal', 'vertical'].includes(value),
  },
  /** 相邻子项之间的分隔文本，separator 插槽优先。 */
  separator: String,
  /** 间距或行列间距组合，省略时继承全局尺寸。 */
  size: [String, Number, Array] as PropType<SpaceProps['size']>,
} satisfies ComponentObjectPropsOptions<SpaceProps>
