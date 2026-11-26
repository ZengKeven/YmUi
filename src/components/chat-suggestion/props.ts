import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { ChatSuggestionProps } from './types'

export default {
  /** 需要展示的推荐问题，默认列表为空。 */
  content: { type: Array as PropType<ChatSuggestionProps['content']>, default: () => [] },
  /** 是否禁用问题按钮。 */
  disabled: buttonProps.disabled,
  /** 局部尺寸，默认继承全局配置。 */
  size: buttonProps.size,
} satisfies ComponentObjectPropsOptions<ChatSuggestionProps>
