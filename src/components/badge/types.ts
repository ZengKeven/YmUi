import type { ControlSize } from '../config-provider/types'

export interface BadgeProps {
  /** 被标记的文字，可通过默认插槽或 content 插槽替换。 */
  content?: string
  /** 角标显示的数量或短文本，可通过 count 插槽替换。 */
  count?: number | string
  /** 计数显示上限，超过时在上限后显示加号。 */
  maxCount?: number
  /** 数量为零时是否显示角标。 */
  showZero?: boolean
  /** 将角标显示为圆点。 */
  dot?: boolean
  /** 徽标形状，支持胶囊形和圆角矩形。 */
  shape?: 'circle' | 'round'
  /** 自定义徽标背景色。 */
  color?: string
  /** 相对右上角的偏移，依次对应 right 和 top，数值按像素计算。 */
  offset?: readonly [number | string, number | string]
  /** 徽标尺寸，省略时继承最近的 ConfigProvider。 */
  size?: ControlSize
}
