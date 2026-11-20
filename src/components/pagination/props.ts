import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { PaginationProps } from './types'

export default {
  /** 记录总条数。 */
  total: { type: Number, default: 0 },
  /** 从 1 开始的当前页码。 */
  current: { type: Number, default: 1 },
  /** 每页条数。 */
  pageSize: { type: Number, default: 10 },
  /** 每页条数下拉框的候选值。 */
  pageSizeOptions: {
    type: Array as PropType<readonly number[]>,
    default: () => [5, 10, 20, 50],
  },
  /** 是否禁用分页控件。 */
  disabled: Boolean,
  /** 控件尺寸，默认继承全局配置。 */
  size: {
    type: String as PropType<PaginationProps['size']>,
    validator: (value: string) => ['extra-small', 'small', 'medium', 'large'].includes(value),
  },
} satisfies ComponentObjectPropsOptions<PaginationProps>
