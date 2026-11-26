import type { ControlSize } from '../config-provider/types'

export interface ChatSearchReference {
  /** 搜索结果的标题，空白标题会被跳过。 */
  title: string
  /** 来源链接，地址通过过滤后可点击。 */
  url?: string
  /** 来源站点的名称。 */
  site?: string
  /** 来源的日期文字。 */
  date?: string
  /** 搜索结果的纯文本摘要。 */
  content?: string
  /** 上游返回的来源类型，随点击事件传出。 */
  type?: string
  /** 上游返回的来源图标地址，随点击事件传出。 */
  icon?: string
}

export interface ChatSearchData {
  /** 面板标题，默认显示有效结果数。 */
  title?: string
  /** 按展示顺序排列的搜索来源。 */
  references?: readonly ChatSearchReference[]
}

export interface ChatSearchProps {
  /** 搜索面板标题与来源列表。 */
  content?: ChatSearchData
  /** 受控的收起状态，支持 v-model:collapsed。 */
  collapsed?: boolean
  /** 非受控时是否初始收起，默认展开。 */
  defaultCollapsed?: boolean
  /** 局部尺寸，省略时继承最近的 ConfigProvider。 */
  size?: ControlSize
}

export interface ChatSearchSourceContext {
  /** 用户激活的原始来源项。 */
  item: ChatSearchReference
  /** 来源项在原始数组中的下标。 */
  index: number
  /** 来源链接的原生点击事件，可调用 preventDefault 接管导航。 */
  e: MouseEvent
}
