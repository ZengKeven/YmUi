import type { ControlSize } from '../config-provider/types'

export type TabValue = string | number

export interface TabsProps {
  /** 当前面板标识，省略时选中首个面板。 */
  modelValue?: TabValue
  /** 标签尺寸，默认继承全局配置。 */
  size?: ControlSize
}

export interface TabPanelProps {
  /** 面板在当前选项卡内的唯一标识。 */
  value: TabValue
  /** 标签标题，label 插槽优先，省略时使用面板标识。 */
  label?: string
}
