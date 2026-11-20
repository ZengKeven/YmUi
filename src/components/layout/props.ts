import type { ComponentObjectPropsOptions } from 'vue'
import type { LayoutProps } from './types'

export default {
  /** 系统 Logo 的图片地址。 */
  logo: String,
  /** 侧栏展开时显示的系统名称。 */
  systemName: String,
  /** 顶栏与侧栏品牌区的高度，单位为像素。 */
  headerHeight: { type: Number, default: 48 },
  /** 展开时的侧栏宽度，单位为像素。 */
  asideWidth: { type: Number, default: 232 },
  /** 收起时的侧栏宽度，单位为像素。 */
  collapsedWidth: { type: Number, default: 48 },
  /** 侧栏是否收起。 */
  collapsed: Boolean,
} satisfies ComponentObjectPropsOptions<LayoutProps>
