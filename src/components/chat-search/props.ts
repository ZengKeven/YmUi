import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { ChatSearchProps } from './types'

export default {
  /** 搜索结果和自定义面板标题。 */
  content: Object as PropType<ChatSearchProps['content']>,
  /** 受控的收起状态，省略时由组件维护。 */
  collapsed: { type: Boolean, default: undefined },
  /** 非受控的初始收起状态。 */
  defaultCollapsed: Boolean,
  /** 局部尺寸，省略时继承全局配置。 */
  size: buttonProps.size,
} satisfies ComponentObjectPropsOptions<ChatSearchProps>
