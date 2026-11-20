import type { ControlSize } from '../config-provider/types'
import type { IconName } from '../icon'

export type MenuValue = string | number

export interface MenuLeaf {
  /** 节点在整份菜单中的唯一标识。 */
  value: MenuValue
  /** 菜单名称，也是收起时的可访问名称。 */
  label: string
  /** 菜单名称前的内置图标。 */
  icon?: IconName
  /** 选择叶项时打开的链接。 */
  href?: string
}

export interface MenuItem extends MenuLeaf {
  /** 一级菜单下的二级叶项。 */
  children?: readonly MenuLeaf[]
}

export interface MenuProps {
  /** 按显示顺序排列的一级节点。 */
  items?: readonly MenuItem[]
  /** 是否收起为仅显示图标的侧栏。 */
  collapsed?: boolean
  /** 当前选中的叶项标识。 */
  modelValue?: MenuValue
  /** 在展开模式中打开的菜单组标识。 */
  expanded?: readonly MenuValue[]
  /** 菜单行的尺寸，默认继承全局配置。 */
  size?: ControlSize
}
