import { shallowRef, watch, type Ref } from 'vue'

interface Separator {
  id: number
  host: HTMLSpanElement
}

// Vapor 的条件和循环直接更新 DOM。在实际子项前放置分隔插槽的挂载点，保留子项的节点和组件状态。
export function useSpaceSeparators(root: Readonly<Ref<HTMLElement | null>>, enabled: () => boolean) {
  const separators = shallowRef<Separator[]>([])
  let nextId = 0
  watch([root, enabled], ([container, show], _, onCleanup) => {
    if (!container || !show) return
    const hosts = new WeakSet<Node>()
    const byItem = new Map<ChildNode, Separator>()

    function sync(parent: HTMLElement) {
      const items = Array.from(parent.childNodes).filter(node =>
        !hosts.has(node) && (node.nodeType === Node.ELEMENT_NODE ||
          (node.nodeType === Node.TEXT_NODE && node.textContent?.trim())),
      )
      const followingItems = new Set(items.slice(1))
      for (const [item, separator] of byItem) {
        if (!followingItems.has(item)) {
          separator.host.remove()
          byItem.delete(item)
        }
      }
      for (const item of followingItems) {
        let separator = byItem.get(item)
        if (!separator) {
          const host = parent.ownerDocument.createElement('span')
          host.className = 'ym-space__separator'
          hosts.add(host)
          separator = { id: nextId++, host }
          byItem.set(item, separator)
        }
        if (separator.host.nextSibling !== item) parent.insertBefore(separator.host, item)
      }
      separators.value = [...byItem.values()]
    }

    const observer = new MutationObserver(records => {
      if (records.some(record => record.target === container ||
        (record.type === 'characterData' && record.target.parentNode === container))) sync(container)
    })
    sync(container)
    observer.observe(container, { childList: true, characterData: true, subtree: true })
    onCleanup(() => {
      observer.disconnect()
      for (const { host } of byItem.values()) host.remove()
      separators.value = []
    })
  }, { flush: 'post', immediate: true })
  return separators
}
