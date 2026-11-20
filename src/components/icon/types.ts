import type { iconPaths } from './icons'

export type IconName = keyof typeof iconPaths

export interface IconProps {
  /** 内置图标名称。 */
  name: IconName
  /** 图标尺寸，接受预设尺寸、CSS 长度或像素数值。 */
  size?: string | number
  /** 图标颜色，默认继承文字颜色。 */
  color?: string
  /** 点击图标时触发，e 为原生鼠标事件。 */
  onClick?: (context: { e: MouseEvent }) => void
}
