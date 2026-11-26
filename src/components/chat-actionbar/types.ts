import type { ControlSize } from '../config-provider/types'

export const chatActions = ['replay', 'copy', 'good', 'bad'] as const
export type ChatActionbarAction = typeof chatActions[number]
export type ChatActionbarComment = '' | 'good' | 'bad'

export interface ChatActionbarProps {
  /** 写入剪贴板的正文。 */
  content?: string
  /** 按显示顺序排列的操作，省略时显示全部四项。 */
  actionBar?: readonly ChatActionbarAction[]
  /** 当前评价，省略时由组件记录。 */
  comment?: ChatActionbarComment
  /** 禁用操作栏内的全部按钮。 */
  disabled?: boolean
  /** 按钮和提示的局部尺寸，默认继承全局配置。 */
  size?: ControlSize
}
