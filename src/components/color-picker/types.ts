import type { InputHTMLAttributes } from 'vue'
import type { ControlSize } from '../config-provider/types'
import type { InputProps } from '../input'
import type { PopupProps } from '../popup'
import type { SelectProps } from '../select'

export type ColorMode = 'monochrome' | 'linear-gradient'
export type ColorFormat = 'HEX' | 'HEX8' | 'RGB' | 'RGBA' | 'HSL' | 'HSLA' | 'HSV' | 'HSVA' | 'CMYK' | 'CSS'
export type ColorPickerChangeTrigger = 'palette-saturation-brightness' | 'palette-saturation' | 'palette-brightness'
  | 'palette-hue-bar' | 'palette-alpha-bar' | 'input' | 'preset' | 'recent'

export interface ColorObject {
  /** 透明度，范围 0 至 1。 */
  alpha: number
  /** 可用于 CSS 的颜色或完整渐变。 */
  css: string
  /** 六位十六进制颜色。 */
  hex: string
  /** 带透明度的八位十六进制颜色。 */
  hex8: string
  /** 色相、饱和度与亮度。 */
  hsl: string
  /** 带透明度的 HSL 颜色。 */
  hsla: string
  /** 色相、饱和度与明度。 */
  hsv: string
  /** 带透明度的 HSV 颜色。 */
  hsva: string
  /** 红绿蓝颜色。 */
  rgb: string
  /** 带透明度的 RGB 颜色。 */
  rgba: string
  /** 当前色标的 HSV 饱和度，范围 0 至 1。 */
  saturation: number
  /** 当前色标的 HSV 明度，范围 0 至 1。 */
  value: number
  /** 当前是否处于渐变模式。 */
  isGradient: boolean
  /** 渐变模式下的完整 CSS 色值。 */
  linearGradient?: string
}

export interface ColorPickerChangeContext {
  /** 当前颜色及各种格式。 */
  color: ColorObject
  /** 产生这次变化的操作。 */
  trigger: ColorPickerChangeTrigger
}

export interface ColorPickerPanelProps {
  /** 当前颜色，支持 v-model。 */
  modelValue?: string
  /** 受控颜色，modelValue 优先。 */
  value?: string
  /** 非受控模式的初始颜色。 */
  defaultValue?: string
  /** 可用的单色和渐变模式。 */
  colorModes?: readonly ColorMode[]
  /** 禁用颜色编辑。 */
  disabled?: boolean
  /** 启用透明通道。 */
  enableAlpha?: boolean
  /** 允许在渐变轨道上添加色标。 */
  enableMultipleGradient?: boolean
  /** 单色变化时的输出格式。 */
  format?: ColorFormat
  /** 传给文本输入框的属性。 */
  inputProps?: InputProps & Omit<InputHTMLAttributes, keyof InputProps | 'onChange'> & {
    /** 默认输入框编辑后的回调。 */
    onChange?: (value: string, context: { e: Event }) => void
    /** 默认输入框清空后的回调。 */
    onClear?: (context: { e: MouseEvent }) => void
  }
  /** 传给颜色编辑格式选择器的属性。 */
  selectInputProps?: SelectProps
  /** 最近色列表，false 或 null 隐藏。 */
  recentColors?: readonly string[] | boolean | null
  /** 非受控的初始最近色列表。 */
  defaultRecentColors?: readonly string[] | boolean | null
  /** 显示滑杆旁的当前颜色预览。 */
  showPrimaryColorPreview?: boolean
  /** 系统色板，省略时使用内置色，空数组或 null 隐藏。 */
  swatchColors?: readonly string[] | null
  /** 控件尺寸，省略时继承全局设置。 */
  size?: ControlSize
  /** 当前颜色改变时触发。 */
  onChange?: (value: string, context: ColorPickerChangeContext) => void
  /** 色相滑杆改变时触发。 */
  onPaletteBarChange?: (context: { color: ColorObject }) => void
  /** 最近色增删时触发。 */
  onRecentColorsChange?: (colors: string[]) => void
}

export interface ColorPickerProps extends ColorPickerPanelProps {
  /** 隐藏默认触发框的边框。 */
  borderless?: boolean
  /** 允许清空当前颜色。 */
  clearable?: boolean
  /** 传给颜色面板浮层的属性。 */
  popupProps?: PopupProps & {
    /** 浮层请求打开或关闭时触发。 */
    onVisibleChange?: (visible: boolean) => void
    /** 同步受控浮层的可见状态。 */
    'onUpdate:visible'?: (visible: boolean) => void
  }
  /** 点击清空时触发，携带原始鼠标事件。 */
  onClear?: (context: { e: MouseEvent }) => void
}
