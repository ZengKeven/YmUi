export interface RateProps {
  /** 当前评分，支持 v-model。 */
  modelValue?: number
  /** 外部控制的评分，modelValue 优先。 */
  value?: number
  /** 非受控模式下的初始评分。 */
  defaultValue?: number
  /** 是否允许按半星评分。 */
  allowHalf?: boolean
  /** 是否允许再次点击当前分值清零。 */
  clearable?: boolean
  /** 是否禁用评分。 */
  disabled?: boolean
  /** 评分图标的数量。 */
  count?: number
  /** 相邻图标的间距，单位为像素。 */
  gap?: number
  /** 图标尺寸，支持四档全局尺寸、CSS 长度或像素数值。 */
  size?: string | number
  /** 选中色，或依次指定选中、未选中的颜色。 */
  color?: string | readonly [selected: string, unselected: string]
  /** 是否显示当前评分的说明文字。 */
  showText?: boolean
  /** 从一分起各等级的说明文字。 */
  texts?: readonly string[]
}
