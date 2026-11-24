import { type CSSProperties } from 'vue'
import type { PopupProps } from './types'

export function resolveAttachment(attach: PopupProps['attach'], anchor: HTMLElement): Element | null {
  const target = typeof attach === 'function' ? attach(anchor) : attach
  const element = typeof target === 'string' ? anchor.ownerDocument.querySelector(target) : target
  return element?.ownerDocument === anchor.ownerDocument && !anchor.contains(element) ? element : null
}

// 只在跨节点挂载期间观察触发器的祖先。复制已生效的变量，也涵盖父级局部覆盖。
export function inheritPopupTheme(anchor: HTMLElement, apply: (style: CSSProperties) => void) {
  const update = () => {
    const source = getComputedStyle(anchor)
    const style: CSSProperties = { colorScheme: source.colorScheme, fontFamily: source.fontFamily,
      '--ym-icon-size': source.getPropertyValue('--ym-icon-size') || 'initial' }
    for (const key of source) {
      if (key.startsWith('--ym-')) style[key as `--${string}`] = source.getPropertyValue(key)
    }
    apply(style)
  }
  const observer = new MutationObserver(update)
  for (let parent: Element | null = anchor; parent; parent = parent.parentElement) {
    observer.observe(parent, { attributes: true })
  }
  update()
  return () => observer.disconnect()
}
