<script setup lang="ts" vapor>
import { computed, provide, shallowReactive, useModel, useTemplateRef } from 'vue'
import { tabsKey } from './context'
import tabsProps from './props'
import type { TabPanelProps, TabValue } from './types'

defineOptions({ name: 'YmTabs' })
const props = defineProps(tabsProps)
const emit = defineEmits<{ 'update:modelValue': [value: TabValue]; change: [value: TabValue] }>()
defineSlots<{ default?: () => unknown }>()

const model = useModel(props, 'modelValue')
const panels = shallowReactive<TabPanelProps[]>([])
const tablist = useTemplateRef<HTMLDivElement>('tablist')
const actions = useTemplateRef<HTMLDivElement>('actions')
const active = computed(() => panels.find(panel => panel.value === model.value)?.value ?? panels[0]?.value)

provide(tabsKey, {
  tablist,
  actions,
  active,
  register(panel) {
    panels.push(panel)
    return () => panels.splice(panels.indexOf(panel), 1)
  },
  select(value) {
    if (value === active.value) return
    model.value = value
    emit('change', value)
  },
})

function moveFocus(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey) return
  const list = event.currentTarget as HTMLElement
  const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>(':scope > [role="tab"]'))
  const index = tabs.indexOf(event.target as HTMLButtonElement)
  if (index === -1) return
  let next: number
  switch (event.key) {
    case 'ArrowLeft': next = (index + tabs.length - 1) % tabs.length; break
    case 'ArrowRight': next = (index + 1) % tabs.length; break
    case 'Home': next = 0; break
    case 'End': next = tabs.length - 1; break
    default: return
  }
  event.preventDefault()
  tabs[next].focus()
  tabs[next].click()
}
</script>

<template>
  <div class="ym-tabs" :data-size="props.size">
    <div class="ym-tabs__header">
      <div ref="tablist" class="ym-tabs__list" role="tablist" aria-label="选项卡" @keydown="moveFocus"></div>
      <div ref="actions" class="ym-tabs__actions"></div>
    </div>
    <slot />
  </div>
</template>
