import type { ComponentObjectPropsOptions } from 'vue'
import buttonProps from '../button/props'
import type { ChatMarkdownProps } from './types'

export default {
  /** 要渲染的 Markdown 源文。 */
  content: { type: String, default: '' },
  /** 局部尺寸，默认继承全局配置。 */
  size: buttonProps.size,
} satisfies ComponentObjectPropsOptions<ChatMarkdownProps>
