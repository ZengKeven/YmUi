import { onUnmounted, shallowRef, watch, type Ref } from 'vue'

// 固定 Teleport 的目标节点。直接重新挂载已打开的原生 dialog 会丢失其模态层级。
export function useDialogMount(target: Readonly<Ref<Element | null>>, panel: Readonly<Ref<HTMLDialogElement | null>>) {
  const host = shallowRef<HTMLElement | null>(null)
  function remove() {
    host.value?.remove()
    host.value = null
  }
  watch(target, (next, _, onCleanup) => {
    if (!next) { remove(); return }
    const doc = next.ownerDocument
    const container = host.value ?? doc.createElement('div')
    if (!host.value) {
      container.className = 'ym-dialog__mount'
      next.append(container)
      host.value = container
      return
    }
    const destination = next as Element & { moveBefore?: (node: Node, before: Node | null) => void }
    if (container.parentElement === next || container.contains(next)) return
    if (destination.moveBefore && destination.isConnected && container.isConnected) {
      destination.moveBefore(container, null)
      return
    }

    // 旧浏览器在子框关闭后再移动父框，避免重新 showModal() 把父框置顶。
    const waiting = new AbortController()
    function retry() {
      queueMicrotask(() => { if (!waiting.signal.aborted) relocate() })
    }
    function relocate() {
      const element = panel.value
      const focused = doc.activeElement
      const activeModal = focused?.closest('dialog:modal')
      const modal = element?.matches(':modal') ? element : null
      if (modal && activeModal && activeModal !== modal) return
      waiting.abort()
      modal?.close()
      destination.append(container)
      if (modal) {
        modal.showModal()
        if (focused instanceof HTMLElement && modal.contains(focused)) focused.focus({ preventScroll: true })
      }
    }
    doc.addEventListener('focusin', retry, { capture: true, signal: waiting.signal })
    doc.addEventListener('close', retry, { capture: true, signal: waiting.signal })
    onCleanup(() => waiting.abort())
    relocate()
  }, { flush: 'post', immediate: true })
  onUnmounted(remove)
  return host
}
