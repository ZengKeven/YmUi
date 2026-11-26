import type { ControlSize } from '../config-provider/types'

export type ChatThinkingStatus = 'pending' | 'streaming' | 'complete'

export interface ChatThinkingData {
  /** 自定义标题，省略时按思考状态显示。 */
  title?: string
  /** 截至当前收到的思考过程文本。 */
  text?: string
}

export interface ChatThinkingProps {
  /** 思考块的标题和正文。 */
  content?: ChatThinkingData
  /** 思考状态，默认等待，接收中可设为 streaming。 */
  status?: ChatThinkingStatus
  /** 外部控制的收起状态，可用 v-model:collapsed 同步。 */
  collapsed?: boolean
  /** 非受控时是否初始收起，默认展开。 */
  defaultCollapsed?: boolean
  /** 面板和标题按钮的局部尺寸，省略时继承最近的 ConfigProvider。 */
  size?: ControlSize
}
