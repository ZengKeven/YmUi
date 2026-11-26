import type { ControlSize } from '../config-provider/types'

export interface ChatMarkdownProps {
  /** 截至当前收到的完整 Markdown 源文。 */
  content?: string
  /** 正文字号，省略时继承最近的 ConfigProvider。 */
  size?: ControlSize
}
