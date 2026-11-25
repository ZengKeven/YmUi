import type { ComponentObjectPropsOptions, PropType } from 'vue'
import inputProps from '../input/props'
import type { TreeNode, TreeProps, TreeValue } from './types'

export default {
  /** 本地树节点。 */
  data: { type: Array as PropType<readonly TreeNode[]>, default: () => [] },
  /** 受控的高亮节点。 */
  modelValue: [String, Number] as PropType<TreeProps['modelValue']>,
  /** 非受控的初始高亮节点。 */
  defaultValue: [String, Number] as PropType<TreeProps['defaultValue']>,
  /** 初始展开的分支。 */
  defaultExpanded: { type: Array as PropType<readonly TreeValue[]>, default: () => [] },
  /** 显示内置的名称过滤框。 */
  filterable: { type: Boolean, default: true },
  /** 过滤框的占位文字。 */
  filterPlaceholder: { type: String, default: '过滤节点' },
  /** 节点及过滤框的尺寸。 */
  size: inputProps.size,
} satisfies ComponentObjectPropsOptions<TreeProps>
