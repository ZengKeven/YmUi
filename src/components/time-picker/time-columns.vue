<script setup lang="ts" vapor>
import { computed, nextTick, onMounted, onScopeDispose, useId, useTemplateRef, watch } from 'vue'
import type { TimePickerFormat } from './types'

const props = defineProps<{ value: string; format: TimePickerFormat; label: string }>()
const emit = defineEmits<{ change: [value: string] }>()

const numbers = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'))
const units = [
  { name: '小时', short: '时', values: numbers.slice(0, 24) },
  { name: '分钟', short: '分', values: numbers },
  { name: '秒钟', short: '秒', values: numbers },
]
const columns = computed(() => props.format === 'HH:mm' ? units.slice(0, 2) : units)
const parts = computed(() => {
  const value = props.value.split(':')
  return columns.value.map((unit, index) => unit.values.includes(value[index]) ? value[index] : '00')
})
const group = useTemplateRef<HTMLElement>('group')
const id = `ym-time-columns-${useId()}`

function lists() {
  return group.value?.querySelectorAll<HTMLElement>('[role="listbox"]')
}

function focusColumn(index: number) {
  lists()?.[index]?.focus({ preventScroll: true })
}
defineExpose({ focus: () => focusColumn(0) })

function select(index: number, number: string) {
  const time = parts.value.slice()
  time[index] = number
  emit('change', time.join(':'))
}

function keydown(event: KeyboardEvent, index: number) {
  if (event.altKey || event.ctrlKey || event.metaKey) return
  const current = Number(parts.value[index])
  const values = columns.value[index].values
  switch (event.key) {
    case 'ArrowUp': select(index, values[Math.max(0, current - 1)]); break
    case 'ArrowDown': select(index, values[Math.min(values.length - 1, current + 1)]); break
    case 'Home': select(index, values[0]); break
    case 'End': select(index, values[values.length - 1]); break
    case 'ArrowLeft': focusColumn(index - 1); break
    case 'ArrowRight': focusColumn(index + 1); break
    default: return
  }
  event.preventDefault()
}

function alignSelection() {
  lists()?.forEach((list, index) => {
    const item = list.children[Number(parts.value[index])]
    if (item instanceof HTMLElement && list.clientHeight) list.scrollTop = item.offsetTop
  })
}
watch(parts, alignSelection, { flush: 'post' })
let observer: ResizeObserver | undefined
onMounted(() => {
  observer = new ResizeObserver(alignSelection)
  if (group.value) observer.observe(group.value)
  nextTick(alignSelection)
})
onScopeDispose(() => observer?.disconnect())
</script>

<template>
  <div ref="group" class="ym-time-picker__columns" role="group" :aria-label="props.label">
    <div v-for="(column, index) in columns" :key="column.name" class="ym-time-picker__column">
      <div class="ym-time-picker__unit" aria-hidden="true">{{ column.short }}</div>
      <div class="ym-time-picker__list" role="listbox" tabindex="0" :aria-label="column.name"
        :aria-activedescendant="`${id}-${index}-${parts[index]}`" @keydown="keydown($event, index)">
        <div v-for="number in column.values" :id="`${id}-${index}-${number}`" :key="number"
          class="ym-time-picker__option" role="option" :aria-selected="parts[index] === number"
          @click="select(index, number)">{{ number }}</div>
      </div>
    </div>
  </div>
</template>
