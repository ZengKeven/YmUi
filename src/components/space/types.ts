export type SpaceSize = string | number

export interface SpaceProps {
  /** 子项在交叉轴上的对齐方式。 */
  align?: 'start' | 'end' | 'center' | 'baseline'
  /** 横向排列时是否允许换行。 */
  breakLine?: boolean
  /** 子项的排列方向。 */
  direction?: 'horizontal' | 'vertical'
  /** 相邻子项之间的分隔文本，separator 插槽优先。 */
  separator?: string
  /** 间距预设、CSS 长度或像素数值，也可分别指定行间距与列间距。 */
  size?: SpaceSize | readonly [SpaceSize, SpaceSize]
}
