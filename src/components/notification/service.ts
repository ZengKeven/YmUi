import { createVaporApp, shallowReactive, shallowRef, type CSSProperties, type ShallowRef } from 'vue'
import { inheritPopupTheme } from '../popup/attachment'
import NotificationStack from './notification-stack.vue'
import type { NotificationCloseContext, NotificationHandle, NotificationOptions, NotificationPlacement, NotificationProps, NotificationTheme } from './types'

export interface NotificationEntry {
  id: number
  props: NotificationProps
  style: ShallowRef<CSSProperties | undefined>
  dismiss: (context: NotificationCloseContext) => void
}

interface Stack {
  host: HTMLElement
  entries: NotificationEntry[]
  unmount: () => void
}

const stacks = new Set<Stack>()
let nextId = 0

function getStack(doc: Document, placement: NotificationPlacement): Stack {
  for (const stack of stacks) {
    if (stack.host.ownerDocument === doc && stack.host.dataset.placement === placement && stack.host.isConnected) return stack
  }
  const host = doc.createElement('div')
  host.className = 'ym-notification__stack'
  host.dataset.placement = placement
  host.popover = 'manual'
  doc.body.append(host)
  host.showPopover()
  const entries = shallowReactive<NotificationEntry[]>([])
  const app = createVaporApp(NotificationStack, { entries })
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

function open(options: NotificationOptions): NotificationHandle {
  const doc = options.source?.ownerDocument ?? (typeof document === 'undefined' ? undefined : document)
  if (!doc?.body) return { close() {} }
  const { source = currentProvider(doc), placement = 'top-right', onClose, onCloseBtnClick, onDurationEnd, ...props } = options
  const stack = getStack(doc, placement)
  const style = shallowRef<CSSProperties>()
  const stopTheme = source && inheritPopupTheme(source, next => { style.value = next })
  const entry: NotificationEntry = { id: ++nextId, props, style, dismiss }
  stack.entries.push(entry)

  function dismiss(context: NotificationCloseContext) {
    const index = stack.entries.indexOf(entry)
    if (index < 0) return
    stack.entries.splice(index, 1)
    stopTheme?.()
    if (!stack.entries.length) {
      stacks.delete(stack)
      stack.unmount()
      stack.host.remove()
    }
    try {
      if (context.trigger === 'close-click' && context.e) onCloseBtnClick?.({ e: context.e })
      if (context.trigger === 'duration-end') onDurationEnd?.()
    } finally {
      onClose?.(context)
    }
  }
  return { close: () => dismiss({ trigger: 'api' }) }
}

function shortcut(theme: NotificationTheme) {
  return (notification: string | Omit<NotificationOptions, 'theme'>, duration?: number) => {
    const options = typeof notification === 'string' ? { content: notification } : notification
    return open({ ...options, theme, duration: duration ?? options.duration })
  }
}

export const Notification = {
  open,
  info: shortcut('info'),
  success: shortcut('success'),
  warning: shortcut('warning'),
  error: shortcut('error'),
  closeAll() {
    // 本轮只处理当前通知，允许关闭回调创建下一条通知。
    const current = [...stacks].flatMap(stack => stack.entries.slice())
    const errors: unknown[] = []
    for (const entry of current) {
      try {
        entry.dismiss({ trigger: 'api' })
      } catch (error) {
        errors.push(error)
      }
    }
    if (errors.length) throw new AggregateError(errors, '通知的关闭回调执行失败')
  },
}
