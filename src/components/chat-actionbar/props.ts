import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import { chatActions, type ChatActionbarAction, type ChatActionbarProps } from './types'

export default {
  /** 复制按钮使用的正文，空字符串时禁用复制。 */
  content: { type: String, default: '' },
  /** 操作的种类和显示顺序。 */
  actionBar: {
    type: Array as PropType<ChatActionbarProps['actionBar']>,
    default: () => [...chatActions],
    validator: (actions: readonly ChatActionbarAction[]) => actions.every(action => chatActions.includes(action)),
  },
  /** 外部控制的评价，可通过 v-model:comment 同步。 */
  comment: { type: String as PropType<ChatActionbarProps['comment']>,
    validator: (value: string) => ['', 'good', 'bad'].includes(value) },
  /** 是否禁用所有操作。 */
  disabled: buttonProps.disabled,
  /** 局部尺寸，省略时继承最近的 ConfigProvider。 */
  size: buttonProps.size,
} satisfies ComponentObjectPropsOptions<ChatActionbarProps>
