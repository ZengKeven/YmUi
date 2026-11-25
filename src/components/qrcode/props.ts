import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { QRCodeProps } from './types'

export default {
  /** 扫码得到的文本。 */
  value: { type: String, default: '' },
  /** 使用 Canvas 或 SVG 绘制。 */
  type: { type: String as PropType<QRCodeProps['type']>, default: 'canvas',
    validator: (value: string) => ['canvas', 'svg'].includes(value) },
  /** 四档预设尺寸或大于零的像素边长。 */
  size: { type: [Number, String] as PropType<QRCodeProps['size']>,
    validator: (value: number | string) => typeof value === 'number' ? Number.isFinite(value) && value > 0
      : ['extra-small', 'small', 'medium', 'large'].includes(value) },
  /** 二维码的纠错等级。 */
  level: { type: String as PropType<QRCodeProps['level']>, default: 'M',
    validator: (value: string) => ['L', 'M', 'Q', 'H'].includes(value) },
  /** 自定义码点颜色。 */
  color: String,
  /** 自定义背景和静区颜色。 */
  bgColor: String,
  /** 隐藏二维码外框。 */
  borderless: Boolean,
  /** 在二维码中心绘制的图片。 */
  icon: String,
  /** 中心图片的像素边长或宽高。 */
  iconSize: { type: [Number, Object] as PropType<QRCodeProps['iconSize']>, default: 40 },
  /** 正常、过期、加载中或已扫描。 */
  status: { type: String as PropType<QRCodeProps['status']>, default: 'active',
    validator: (value: string) => ['active', 'expired', 'loading', 'scanned'].includes(value) },
  /** 点击过期状态的刷新按钮时触发。 */
  onRefresh: Function as PropType<QRCodeProps['onRefresh']>,
} satisfies ComponentObjectPropsOptions<QRCodeProps>
