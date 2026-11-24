import { watch, type Ref } from 'vue'
import type { TextareaProps } from './types'

export function useTextareaAutosizeFallback(
  field: Readonly<Ref<HTMLTextAreaElement | null>>,
  autosize: () => TextareaProps['autosize'],
  text: () => string,
) {
  watch([field, autosize], ([input, enabled], _, onCleanup) => {
    if (!input || !enabled || CSS.supports('field-sizing', 'content')) return

    const property = '--ym-textarea-content-height'
    let frame = 0
    let width = -1
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        // 先缩到最小高度才能测出删除内容后的高度。scrollHeight 包括内边距。
        input.style.setProperty(property, '0px')
        const height = input.scrollHeight + input.offsetHeight - input.clientHeight
        input.style.setProperty(property, height + 'px')
      })
    }

    const resize = new ResizeObserver(([entry]) => {
      if (width === entry.contentRect.width) return
      width = entry.contentRect.width
      schedule()
    })
    resize.observe(input)

    // Provider 可能只改变字号，编辑区的宽度仍保持不变。
    const config = new MutationObserver(schedule)
    for (let parent = input.parentElement; parent; parent = parent.parentElement) {
      config.observe(parent, { attributes: true, attributeFilter: ['data-size', 'class', 'style'] })
    }
    const stop = watch(text, schedule, { flush: 'post', immediate: true })
    input.addEventListener('input', schedule)
    onCleanup(() => {
      stop()
      resize.disconnect()
      config.disconnect()
      cancelAnimationFrame(frame)
      input.removeEventListener('input', schedule)
      input.style.removeProperty(property)
    })
  }, { flush: 'post' })
}
