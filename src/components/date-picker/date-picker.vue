<script setup lang="ts" vapor generic="Mode extends DatePickerMode = 'single'">
import { computed, nextTick, provide, ref, shallowRef, useId, useTemplateRef, watch } from 'vue'
import { YmCalendar, type CalendarCell } from '../calendar'
import { parseDate } from '../calendar/dates'
import { calendarRangeKey, type CalendarRange } from '../calendar/range'
import { YmIcon } from '../icon'
import { YmInput } from '../input'
import { YmPopup } from '../popup'
import pickerProps from './props'
import type { DatePickerMode, DatePickerValue, DateRangeValue } from './types'

defineOptions({ name: 'YmDatePicker', inheritAttrs: false })
const props = defineProps(pickerProps)
const emit = defineEmits<{
  'update:modelValue': [value: DatePickerValue<Mode>]
  change: [value: DatePickerValue<Mode>]
}>()
defineSlots<{ cell?: (cell: CalendarCell) => unknown }>()

const initial = Array.isArray(props.defaultValue) ? orderedRange(...props.defaultValue) : props.defaultValue ?? null
const local = shallowRef(initial)
const value = computed(() => props.modelValue === undefined ? local.value : props.modelValue)
const isRange = computed(() => props.mode === 'range')
const singleDate = computed(() => typeof value.value === 'string' ? value.value : null)
const committedRange = computed(() => {
  const dates = value.value
  if (!isRange.value || !Array.isArray(dates) || dates.length !== 2 || !parseDate(dates[0]) || !parseDate(dates[1])) return null
  return orderedRange(dates[0], dates[1])
})
const displayValue = computed(() => isRange.value ? committedRange.value?.join(' 至 ') ?? '' : singleDate.value ?? '')
const start = ref<string | null>(null)
const previewEnd = ref<string | null>(null)
const calendarDate = computed(() => isRange.value ? start.value ?? committedRange.value?.[0] ?? null : singleDate.value)
const highlight = computed(() => start.value ? orderedRange(start.value, previewEnd.value ?? start.value) : committedRange.value)
const open = ref(false)
const dialogId = `ym-date-picker-${useId()}`
const trigger = useTemplateRef<HTMLElement>('trigger')
const dialog = useTemplateRef<HTMLElement>('dialog')
const calendar = useTemplateRef<{ focus(): void }>('calendar')

function orderedRange(first: string, second: string): DateRangeValue {
  return first <= second ? [first, second] : [second, first]
}

function resetDraft() {
  start.value = null
  previewEnd.value = null
}

provide(calendarRangeKey, computed<CalendarRange | undefined>(() => isRange.value ? {
  selected(date) {
    if (start.value) return date === start.value
    const dates = committedRange.value
    return !!dates && dates[0] <= date && date <= dates[1]
  },
  position(date) {
    const dates = highlight.value
    if (!dates || date < dates[0] || date > dates[1]) return
    if (dates[0] === dates[1]) return 'single'
    if (date === dates[0]) return 'start'
    return date === dates[1] ? 'end' : 'inside'
  },
  preview(date) {
    if (start.value) previewEnd.value = date
  },
} : undefined))

function select(date: string, close: () => void) {
  if (props.disabled) return
  if (isRange.value && !start.value) {
    start.value = date
    return
  }
  const next = isRange.value && start.value ? orderedRange(start.value, date) : date
  const changed = typeof next === 'string' ? singleDate.value !== next
    : next[0] !== committedRange.value?.[0] || next[1] !== committedRange.value?.[1]
  if (changed) {
    if (props.modelValue === undefined) local.value = next
    const result = next as DatePickerValue<Mode>
    emit('update:modelValue', result)
    emit('change', result)
  }
  close()
}

function openFromKeyboard(event: KeyboardEvent) {
  if (props.disabled || !['ArrowDown', 'Enter', ' '].includes(event.key)) return
  event.preventDefault()
  open.value = true
  nextTick(() => calendar.value?.focus())
}

function dismissOnLeave(event: FocusEvent) {
  const next = event.relatedTarget
  if (next instanceof Node && !trigger.value?.contains(next) && !dialog.value?.contains(next)) open.value = false
}

watch(() => props.disabled, disabled => { if (disabled) open.value = false })
watch(isRange, () => { open.value = false })
watch(open, visible => { if (!visible) resetDraft() })
watch([() => committedRange.value?.[0], () => committedRange.value?.[1]], resetDraft)
watch(() => {
  const date = parseDate(start.value)
  return date && props.disabledDate?.(date)
}, blocked => { if (blocked) resetDraft() })
watch([trigger, () => props.form], ([element], _, onCleanup) => {
  const form = element?.querySelector('input')?.form
  if (!form) return
  const reset = (event: Event) => nextTick(() => {
    if (event.defaultPrevented || trigger.value !== element) return
    if (props.modelValue === undefined) local.value = initial
    open.value = false
  })
  form.addEventListener('reset', reset)
  onCleanup(() => form.removeEventListener('reset', reset))
}, { flush: 'post' })
</script>

<template>
  <YmPopup class="ym-date-picker" :class="props.class" :data-mode="props.mode" :style="props.style" placement="bottom-left" v-bind="props.popupProps"
    v-model:visible="open" trigger="click" :disabled="props.disabled" :size="props.size"
    :overlay-class-name="['ym-date-picker__panel', props.popupProps?.overlayClassName]">
    <template #default>
      <span ref="trigger" class="ym-date-picker__trigger" :data-open="open || undefined" @focusout="dismissOnLeave">
        <YmInput v-bind="$attrs" class="ym-date-picker__field" type="text" role="combobox" readonly
          :model-value="displayValue" :placeholder="props.placeholder ?? (isRange ? '请选择日期范围' : '请选择日期')"
          :borderless="props.borderless" :disabled="props.disabled"
          :name="props.name" :form="props.form" aria-haspopup="dialog" :aria-expanded="open"
          :aria-controls="open ? dialogId : undefined" @keydown="openFromKeyboard" />
        <span class="ym-date-picker__suffix">
          <YmIcon :name="isRange ? 'date-range' : 'calendar'" />
        </span>
      </span>
    </template>
    <template #content="{ close }">
      <div ref="dialog" :id="dialogId" role="dialog" :aria-label="isRange ? '选择日期范围' : '选择日期'" @focusout="dismissOnLeave">
        <YmCalendar ref="calendar" theme="card" :model-value="calendarDate" :show-lunar="props.showLunar" :show-holiday="props.showHoliday"
          :first-day-of-week="props.firstDayOfWeek" :disabled-date="props.disabledDate" @select="select($event, close)">
          <template v-if="$slots.cell" #cell="cell"><slot name="cell" v-bind="cell" /></template>
        </YmCalendar>
        <div v-if="isRange" class="ym-date-picker__range-hint" role="status">{{ start ? `已选 ${start}，请选择结束日期` : '请选择开始日期' }}</div>
      </div>
    </template>
  </YmPopup>
</template>
