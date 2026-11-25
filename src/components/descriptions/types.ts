import type { ControlSize } from '../config-provider/types'

export interface DescriptionsProps {
  /** 每行可容纳的描述项数量，默认 2。 */
  column?: number
  /** 每个标签的宽度，数值按像素计算，也可传入 CSS 长度。 */
  labelWidth?: number | string
  /** 标签和内容的尺寸，省略时继承全局设置。 */
  size?: ControlSize
}

export interface DescriptionsItemProps {
  /** 标签文本，label 插槽优先。 */
  label?: string | number
  /** 描述内容，支持用 content 插槽或默认插槽替代。 */
  content?: string | number
  /** 占用的描述列数，最多为父组件的列数。 */
  colSpan?: number
  /** 占用的网格行数。 */
  rowSpan?: number
}
