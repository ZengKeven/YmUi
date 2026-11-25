export interface LayoutProps {
  /** 系统 Logo 的图片地址。 */
  logo?: string
  /** 侧栏展开时显示的系统名称。 */
  systemName?: string
  /** 顶栏与侧栏品牌区的高度，单位为像素。 */
  headerHeight?: number
  /** 展开时的侧栏宽度，单位为像素。 */
  asideWidth?: number
  /** 收起时的侧栏宽度，单位为像素。 */
  collapsedWidth?: number
  /** 侧栏是否收起，支持 v-model:collapsed。 */
  collapsed?: boolean
  /** 在主内容区平铺文字水印，默认关闭。 */
  showWatermark?: boolean
  /** 水印文字，支持换行或逐行传入数组。省略时使用系统名称或「内部使用」。 */
  watermarkText?: string | readonly string[]
}
