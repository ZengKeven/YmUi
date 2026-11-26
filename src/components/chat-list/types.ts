import type { ChatMessageData } from '../chat-message'
import type { ControlSize } from '../config-provider/types'

export interface ChatListProps {
  /** 按时间顺序排列的消息，支持 v-model:data 同步清空操作。 */
  data?: readonly ChatMessageData[]
  /** 双侧布局将用户消息放在右侧，单侧布局全部居左。 */
  layout?: 'both' | 'single'
  /** 数据以最新消息在前的顺序提供。 */
  reverse?: boolean
  /** 位于底部时，随内容增长自动跟随。 */
  autoScroll?: boolean
  /** 首次显示时的滚动位置。 */
  defaultScrollTo?: 'top' | 'bottom'
  /** 浏览历史时显示回到底部的按钮。 */
  showScrollButton?: boolean
  /** 提供清空历史记录的确认操作。 */
  clearHistory?: boolean
  /** 列表、内置消息与操作控件的尺寸。 */
  size?: ControlSize
}

export interface ChatListInstance {
  /** 将列表滚动到最新消息，默认立即定位。 */
  scrollToBottom(options?: { behavior?: 'auto' | 'smooth' }): void
}
