import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { DescriptionsItemProps, DescriptionsProps } from './types'

export function isPositiveInteger(value: number) {
  return Number.isSafeInteger(value) && value > 0
}

export default {
  /** 每行的描述列数，默认 2。 */
  column: { type: Number, default: 2, validator: isPositiveInteger },
  /** 统一标签宽度，省略时标签与内容按 1:2 分配。 */
  labelWidth: [Number, String] as PropType<DescriptionsProps['labelWidth']>,
  /** 局部尺寸，优先于全局尺寸。 */
  size: buttonProps.size,
} satisfies ComponentObjectPropsOptions<DescriptionsProps>

export const descriptionsItemProps = {
  /** 标签文本，支持数字。 */
  label: [String, Number] as PropType<DescriptionsItemProps['label']>,
  /** 内容文本，支持数字。 */
  content: [String, Number] as PropType<DescriptionsItemProps['content']>,
  /** 当前描述项占用的列数。 */
  colSpan: { type: Number, default: 1, validator: isPositiveInteger },
  /** 当前描述项占用的行数。 */
  rowSpan: { type: Number, default: 1, validator: isPositiveInteger },
} satisfies ComponentObjectPropsOptions<DescriptionsItemProps>
