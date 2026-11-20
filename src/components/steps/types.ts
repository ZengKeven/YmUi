import type { ControlSize } from '../config-provider/types'
import type { IconName } from '../icon'

export type StepValue = string | number
export type StepStatus = 'default' | 'process' | 'finish' | 'error'

export interface StepOption {
  /** 步骤标题。 */
  title: string
  /** 唯一标识，默认使用从零开始的原始下标。 */
  value?: StepValue
  /** 步骤说明。 */
  content?: string
  /** 显示在说明下方的补充内容。 */
  extra?: string
  /** 替换编号或状态标记的内置图标。 */
  icon?: IconName
  /** 显式状态，省略或使用 default 时由当前进度推导。 */
  status?: StepStatus
}

export interface StepsProps {
  /** 按流程顺序排列的步骤。 */
  options?: readonly StepOption[]
  /** 当前步骤标识，支持 v-model:current，FINISH 表示全部完成。 */
  current?: StepValue
  /** 步骤排列方向。 */
  layout?: 'horizontal' | 'vertical'
  /** 是否仅展示进度。 */
  readonly?: boolean
  /** 步骤的展示顺序。 */
  sequence?: 'positive' | 'reverse'
  /** 相邻步骤的连接方式。 */
  separator?: 'line' | 'dashed' | 'arrow'
  /** 步骤标记的风格。 */
  theme?: 'default' | 'dot'
  /** 步骤标记和文字的尺寸，默认继承全局配置。 */
  size?: ControlSize
}
