import type { ComponentObjectPropsOptions } from 'vue'
import type { LayoutProps } from './types'

export default {
  /** 系统 Logo 的图片地址。 */
  logo: String,
  /** 侧栏展开时显示的系统名称。 */
  systemName: String,
  /** 顶栏与品牌区的高度，也是侧栏收起时的宽度，单位为像素。 */
  headerHeight: { type: Number, default: 48 },
  /** 展开时的侧栏宽度，单位为像素。 */
  asideWidth: { type: Number, default: 232 },
  /** 侧栏是否收起。 */
  collapsed: Boolean,
} satisfies ComponentObjectPropsOptions<LayoutProps>
