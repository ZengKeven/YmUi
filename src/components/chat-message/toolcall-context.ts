import type { InjectionKey } from 'vue'
import type { ChatToolCallComponents } from './types'

export const toolCallComponentsKey: InjectionKey<() => ChatToolCallComponents | undefined> = Symbol('YmChatToolCallComponents')
