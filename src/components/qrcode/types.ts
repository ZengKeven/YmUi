import type { ControlSize } from '../config-provider/types'

export type QRCodeLevel = 'L' | 'M' | 'Q' | 'H'
export type QRCodeStatus = 'active' | 'expired' | 'loading' | 'scanned'

export interface QRCodeProps {
  /** 扫描二维码后得到的原始文本。 */
  value?: string
  /** 绘制方式，默认使用 Canvas。 */
  type?: 'canvas' | 'svg'
  /** 二维码边长，接受全局尺寸名或像素数值。 */
  size?: ControlSize | number
  /** 纠错等级，从 L 到 H 逐级提高。 */
  level?: QRCodeLevel
  /** 码点颜色，默认继承全局文字色。 */
  color?: string
  /** 包含静区在内的背景色，默认继承全局表面色。 */
  bgColor?: string
  /** 是否隐藏外框。 */
  borderless?: boolean
  /** 二维码中心图标的图片地址。 */
  icon?: string
  /** 中心图标的像素尺寸，支持分别指定宽度和高度。 */
  iconSize?: number | { width: number; height: number }
  /** 二维码的显示状态。 */
  status?: QRCodeStatus
  /** 过期后请求刷新二维码的回调。 */
  onRefresh?: () => void
}
