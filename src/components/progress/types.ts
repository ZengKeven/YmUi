import type { ControlSize } from '../config-provider/types'

export type ProgressTheme = 'line' | 'plump' | 'circle'
export type ProgressStatus = 'active' | 'success' | 'warning' | 'error'
export type ProgressColor = string | readonly string[] | Readonly<Record<string, string>>

export interface ProgressProps {
  /** 已完成的百分比，显示范围为 0 至 100。 */
  percentage?: number
  /** 进度条形态，支持横线、内嵌标签和圆环。 */
  theme?: ProgressTheme
  /** 任务状态，省略时进度达到 100% 自动使用成功色。 */
  status?: ProgressStatus
  /** 显示百分比或自定义标签文字，设为 false 隐藏标签。 */
  label?: boolean | string
  /** 继承全局尺寸，也可用像素数值自定义圆环直径。 */
  size?: ControlSize | number | `${number}`
  /** 横条高度或圆环线宽，支持像素数值和 CSS 长度。 */
  strokeWidth?: number | string
  /** 进度颜色，支持纯色、渐变色数组及带位置的色标。 */
  color?: ProgressColor
  /** 未完成部分的轨道颜色。 */
  trackColor?: string
}
