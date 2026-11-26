import type { InjectionKey } from 'vue'
import type { ChatToolCallComponents, ChatToolCallContent, ChatToolCallRendererProps } from './types'

export const toolCallComponentsKey: InjectionKey<() => ChatToolCallComponents | undefined> = Symbol('YmChatToolCallComponents')
export const toolCallRespondKey: InjectionKey<(block: ChatToolCallContent) => ChatToolCallRendererProps['respond']> =
  Symbol('YmChatToolCallRespond')
