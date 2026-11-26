import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { ChatListProps } from './types'

export default {
  /** 列表消息，稳定标识取自每条消息的 id。 */
  data: Array as PropType<ChatListProps['data']>,
  /** 角色的对齐方式。 */
  layout: { type: String as PropType<ChatListProps['layout']>, default: 'both',
    validator: (value: string) => ['both', 'single'].includes(value) },
  /** 将新到旧的输入按旧到新显示。 */
  reverse: Boolean,
  /** 贴底时是否跟随消息增长。 */
  autoScroll: { type: Boolean, default: true },
  /** 首次显示列表时的位置。 */
  defaultScrollTo: { type: String as PropType<ChatListProps['defaultScrollTo']>, default: 'bottom',
    validator: (value: string) => ['top', 'bottom'].includes(value) },
  /** 离开底部后是否提供返回按钮。 */
  showScrollButton: { type: Boolean, default: true },
  /** 是否提供清空历史操作。 */
  clearHistory: { type: Boolean, default: true },
  /** 是否禁用内置消息的推荐问题按钮。 */
  suggestionDisabled: Boolean,
  /** 列表局部尺寸，省略时继承。 */
  size: buttonProps.size,
} satisfies ComponentObjectPropsOptions<ChatListProps>
