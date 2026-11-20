export interface LayoutProps {
  /** 系统 Logo 的图片地址。 */
  logo?: string
  /** 侧栏展开时显示的系统名称。 */
  systemName?: string
  /** 顶栏高度，同时决定侧栏品牌区高度及收起宽度，单位为像素。 */
  headerHeight?: number
  /** 展开时的侧栏宽度，单位为像素。 */
  asideWidth?: number
  /** 侧栏是否收起，支持 v-model:collapsed。 */
  collapsed?: boolean
}
