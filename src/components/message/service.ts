import { createVaporApp, shallowReactive, shallowRef, type CSSProperties, type ShallowRef } from 'vue'
import { inheritPopupTheme } from '../popup/attachment'
import MessageStack from './message-stack.vue'
import type { MessageCloseContext, MessageHandle, MessageOptions, MessagePlacement, MessageProps, MessageTheme } from './types'

export interface MessageEntry {
  id: number
  props: MessageProps & Pick<MessageOptions, 'onCloseBtnClick' | 'onDurationEnd'>
  style: ShallowRef<CSSProperties | undefined>
  dismiss: (context: MessageCloseContext) => void
}

interface Stack {
  host: HTMLElement
  entries: MessageEntry[]
  unmount: () => void
}

const stacks = new Set<Stack>()
let nextId = 0

function getStack(doc: Document, placement: MessagePlacement): Stack {
  for (const stack of stacks) {
    if (stack.host.ownerDocument === doc && stack.host.dataset.placement === placement && stack.host.isConnected) return stack
  }
  const host = doc.createElement('div')
  host.className = 'ym-message__stack'
  host.dataset.placement = placement
  host.popover = 'manual'
  doc.body.append(host)
  host.showPopover()
  const entries = shallowReactive<MessageEntry[]>([])
  const app = createVaporApp(MessageStack, { entries })
  app.mount(host)
  const stack = { host, entries, unmount: () => app.unmount() }
  stacks.add(stack)
  return stack
}

function currentProvider(doc: Document) {
  const focused = doc.activeElement?.closest<HTMLElement>('[data-ym-provider]')
  if (focused) return focused
  const roots = doc.querySelectorAll<HTMLElement>('[data-ym-provider]:not([data-ym-provider] [data-ym-provider])')
  return roots.length === 1 ? roots[0] : undefined
}

function open(options: MessageOptions): MessageHandle {
  const doc = options.source?.ownerDocument ?? (typeof document === 'undefined' ? undefined : document)
  if (!doc?.body) return { close() {} }
  const { source = currentProvider(doc), placement = 'top', onClose, ...props } = options
  const stack = getStack(doc, placement)
  const style = shallowRef<CSSProperties>()
  const stopTheme = source && inheritPopupTheme(source, next => { style.value = next })
  const entry: MessageEntry = { id: ++nextId, props, style, dismiss }
  stack.entries.push(entry)

  function dismiss(context: MessageCloseContext) {
    const index = stack.entries.indexOf(entry)
    if (index < 0) return
    stack.entries.splice(index, 1)
    stopTheme?.()
    if (!stack.entries.length) {
      stacks.delete(stack)
      stack.unmount()
      stack.host.remove()
    }
    onClose?.(context)
  }
  return { close: () => dismiss({ trigger: 'api' }) }
}

function shortcut(theme: MessageTheme) {
  return (message: string | Omit<MessageOptions, 'theme'>, duration?: number) => {
    const options = typeof message === 'string' ? { content: message } : message
    return open({ ...options, theme, duration: duration ?? options.duration })
  }
}

export const Message = {
  open,
  info: shortcut('info'),
  success: shortcut('success'),
  warning: shortcut('warning'),
  error: shortcut('error'),
  question: shortcut('question'),
  loading: shortcut('loading'),
  closeAll() {
    // 回调中可能发出新提示，本次只关闭调用时已经存在的消息。
    const current = [...stacks].flatMap(stack => stack.entries.slice())
    for (const entry of current) entry.dismiss({ trigger: 'api' })
  },
}
