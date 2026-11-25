<script setup lang="ts" vapor>
import { computed, useId, useTemplateRef, watch } from 'vue'
import { YmPopup, type PopupPlacement } from '../popup'
import tooltipProps from './props'

defineOptions({ name: 'YmTooltip' })
const props = defineProps(tooltipProps)
const emit = defineEmits<{
  'update:visible': [visible: boolean]
  'visible-change': [visible: boolean]
}>()
defineSlots<{
  default?: () => unknown
  content?: () => unknown
}>()

const placement = computed<PopupPlacement>(() => {
  const side = props.placement
  return side === 'top' || side === 'bottom' || side === 'left' || side === 'right' ? `${side}-center` : side
})
const descriptionId = `ym-tooltip-${useId()}`
const trigger = useTemplateRef<HTMLElement>('trigger')
const content = useTemplateRef<HTMLElement>('content')

// 把说明加到实际触发元素上，并保留表单帮助、校验信息等已有的描述。
watch([trigger, content], ([host, tip], _, onCleanup) => {
  if (!host || !tip) return
  const described = new Set<Element>()
  function removeDescription(el: Element) {
    const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(id => id && id !== descriptionId)
    if (ids.length) el.setAttribute('aria-describedby', ids.join(' '))
    else el.removeAttribute('aria-describedby')
  }
  const sync = () => {
    const targets = Array.from(host.querySelectorAll('button, a[href], input, select, textarea, [tabindex], [contenteditable="true"]'))
    if (!targets.length) targets.push(host.firstElementChild ?? host)
    for (const el of described) {
      if (!targets.includes(el)) {
        removeDescription(el)
        described.delete(el)
      }
    }
    for (const el of targets) {
      const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
      if (!ids.includes(descriptionId)) el.setAttribute('aria-describedby', [...ids, descriptionId].join(' '))
      described.add(el)
    }
  }
  sync()
  const observer = new MutationObserver(sync)
  observer.observe(host, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-describedby', 'tabindex', 'href', 'contenteditable'] })
  onCleanup(() => {
    observer.disconnect()
    for (const el of described) removeDescription(el)
  })
}, { flush: 'post' })
</script>

<template>
  <YmPopup class="ym-tooltip" :visible="props.visible" :default-visible="props.defaultVisible"
    :trigger="props.trigger" :placement="placement" :attach="props.attach" :size="props.size"
    :disabled="props.disabled || (!$slots.content && !props.content?.trim())" :show-arrow="props.showArrow"
    :overlay-class-name="['ym-tooltip__panel', `ym-tooltip__panel--${props.theme}`, props.overlayClassName]"
    :overlay-style="props.overlayStyle" :z-index="props.zIndex"
    @update:visible="emit('update:visible', $event)" @visible-change="emit('visible-change', $event)">
    <template #default><span ref="trigger" class="ym-tooltip__trigger"><slot /></span></template>
    <template #content>
      <div :id="descriptionId" ref="content" class="ym-tooltip__content" role="tooltip"><slot name="content">{{ props.content }}</slot></div>
    </template>
  </YmPopup>
</template>
