import type { ControlSize } from '../config-provider/types'

export interface ChatSuggestionItem {
  /** 展示给用户的问题标题。 */
  title: string
  /** 点击后发送的追问文本，省略或为空白时使用标题。 */
  prompt?: string
}

export interface ChatSuggestionProps {
  /** 按展示顺序排列的推荐问题。 */
  content?: readonly ChatSuggestionItem[]
  /** 是否禁用所有问题按钮。 */
  disabled?: boolean
  /** 按钮和间距的局部尺寸，省略时继承最近的 ConfigProvider。 */
  size?: ControlSize
}

export interface ChatSuggestionSelectContext {
  /** 被选中的原始推荐项。 */
  item: ChatSuggestionItem
  /** 该项在原始推荐数组中的下标。 */
  index: number
  /** 激活问题按钮的原生点击事件。 */
  e: MouseEvent
}
