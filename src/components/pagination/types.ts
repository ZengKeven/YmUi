import type { ControlSize } from '../config-provider/types'

export interface PaginationProps {
  /** 记录总条数。 */
  total?: number
  /** 从 1 开始的当前页码，支持 v-model:current。 */
  current?: number
  /** 每页条数，支持 v-model:page-size。 */
  pageSize?: number
  /** 每页条数下拉框的候选值。 */
  pageSizeOptions?: readonly number[]
  /** 是否禁用分页控件。 */
  disabled?: boolean
  /** 控件尺寸，默认继承全局配置。 */
  size?: ControlSize
}

export interface PageInfo {
  /** 操作后的页码。 */
  current: number
  /** 操作前的页码。 */
  previous: number
  /** 操作后的每页条数。 */
  pageSize: number
}
