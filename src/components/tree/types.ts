import type { ControlSize } from '../config-provider/types'

export type TreeValue = string | number

export interface TreeNode {
  /** 显示名称，也是本地过滤使用的文字。 */
  label: string
  /** 整棵树中唯一的节点标识。 */
  value: TreeValue
  /** 当前节点的下一级节点。 */
  children?: readonly TreeNode[]
}

export interface TreeProps {
  /** 按显示顺序排列的根节点。 */
  data?: readonly TreeNode[]
  /** 当前高亮的节点标识，支持 v-model，传入 null 清除高亮。 */
  modelValue?: TreeValue | null
  /** 非受控时的初始高亮节点。 */
  defaultValue?: TreeValue | null
  /** 初始展开的分支标识。 */
  defaultExpanded?: readonly TreeValue[]
  /** 显示按节点名称过滤的输入框，默认开启。 */
  filterable?: boolean
  /** 过滤输入框的占位文字。 */
  filterPlaceholder?: string
  /** 节点和过滤框的尺寸，省略时继承全局配置。 */
  size?: ControlSize
}
