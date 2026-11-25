import type { ComponentObjectPropsOptions, PropType } from 'vue'
import inputProps from '../input/props'
import type { ColorFormat, ColorPickerPanelProps, ColorPickerProps } from './types'

const formats: ColorFormat[] = ['HEX', 'HEX8', 'RGB', 'RGBA', 'HSL', 'HSLA', 'HSV', 'HSVA', 'CMYK', 'CSS']
const recentType = [Array, Boolean, null] as PropType<ColorPickerPanelProps['recentColors']>
// Vue 将未传入的字段转为 false，显式绑定的 undefined 仍表示受控；String 优先保留空字符串。
const colorValueProp = { type: [String, Boolean] as PropType<string>, validator: (value: unknown) => value === false || typeof value === 'string' }

export const panelProps = {
  /** v-model 当前色值。 */
  modelValue: colorValueProp,
  /** 受控色值。 */
  value: colorValueProp,
  /** 非受控的初始色值。 */
  defaultValue: { type: String, default: '' },
  /** 可用模式，默认支持单色和渐变。 */
  colorModes: {
    type: Array as PropType<ColorPickerPanelProps['colorModes']>,
    default: () => ['monochrome', 'linear-gradient'],
  },
  /** 禁用编辑。 */
  disabled: { type: Boolean, default: undefined },
  /** 显示透明通道。 */
  enableAlpha: Boolean,
  /** 允许添加渐变色标。 */
  enableMultipleGradient: { type: Boolean, default: true },
  /** 输出颜色的格式。 */
  format: { type: String as PropType<ColorFormat>, default: 'RGB', validator: (value: ColorFormat) => formats.includes(value) },
  /** 向文本输入框透传属性。 */
  inputProps: Object as PropType<ColorPickerPanelProps['inputProps']>,
  /** 向格式选择器透传属性。 */
  selectInputProps: Object as PropType<ColorPickerPanelProps['selectInputProps']>,
  /** 最近色或显示状态。 */
  recentColors: { type: recentType, default: undefined },
  /** 非受控时的初始最近色。 */
  defaultRecentColors: { type: recentType, default: () => [] },
  /** 显示当前颜色预览。 */
  showPrimaryColorPreview: { type: Boolean, default: true },
  /** 自定义系统色。 */
  swatchColors: { type: [Array, null] as PropType<ColorPickerPanelProps['swatchColors']>, default: undefined },
  /** 控件尺寸，省略时继承。 */
  size: inputProps.size,
  /** 颜色变化回调。 */
  onChange: Function as PropType<ColorPickerPanelProps['onChange']>,
  /** 色相滑杆变化回调。 */
  onPaletteBarChange: Function as PropType<ColorPickerPanelProps['onPaletteBarChange']>,
  /** 最近色变化回调。 */
  onRecentColorsChange: Function as PropType<ColorPickerPanelProps['onRecentColorsChange']>,
} satisfies ComponentObjectPropsOptions<ColorPickerPanelProps>

export default {
  ...panelProps,
  /** 隐藏触发框边框。 */
  borderless: Boolean,
  /** 显示清空按钮。 */
  clearable: Boolean,
  /** 向浮层透传属性。 */
  popupProps: Object as PropType<ColorPickerProps['popupProps']>,
  /** 清空回调。 */
  onClear: Function as PropType<ColorPickerProps['onClear']>,
} satisfies ComponentObjectPropsOptions<ColorPickerProps>
