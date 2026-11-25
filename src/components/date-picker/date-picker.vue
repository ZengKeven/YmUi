<script setup lang="ts" vapor generic="Mode extends DatePickerMode = 'single'">
import { useFormControlState } from '../form/control-state'
import { onFormFieldReset } from '../form/field-reset'
import type { FormResetType } from '../form/types'
import { computed, nextTick, provide, ref, shallowRef, useId, useTemplateRef, watch } from 'vue'
import { YmCalendar, type CalendarCell } from '../calendar'
import { parseDate } from '../calendar/dates'
import { calendarRangeKey, type CalendarRange } from '../calendar/range'
import { YmIcon } from '../icon'
import { YmInput } from '../input'
import { YmPopup } from '../popup'
import pickerProps from './props'
import RangeField from './range-field.vue'
import RangePanel from './range-panel.vue'
import type { DatePickerMode, DatePickerValue, DateRangeValue } from './types'

defineOptions({ name: 'YmDatePicker', inheritAttrs: false })
const props = defineProps(pickerProps)
const { disabled, nativeDisabled, readOnly } = useFormControlState(props, 'choice')
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
type Endpoint = 'start' | 'end'
const active = ref<Endpoint>('start')
const anchor = ref<string | null>(null)
const preview = ref<string | null>(null)
const highlight = computed(() => anchor.value ? orderedRange(anchor.value, preview.value ?? anchor.value) : committedRange.value)
const fields = computed(() => {
  if (!anchor.value) return committedRange.value
  return active.value === 'end' ? [anchor.value, preview.value] : [preview.value, anchor.value]
})
const open = ref(false)
const dialogId = `ym-date-picker-${useId()}`
const trigger = useTemplateRef<HTMLElement>('trigger')
const dialog = useTemplateRef<HTMLElement>('dialog')
const calendar = useTemplateRef<{ focus(): void }>('calendar')
const rangePanel = useTemplateRef<{ focus(endpoint: Endpoint): void }>('rangePanel')

function orderedRange(first: string, second: string): DateRangeValue {
  return first <= second ? [first, second] : [second, first]
}

function resetDraft() {
  anchor.value = null
  preview.value = null
  active.value = 'start'
}

provide(calendarRangeKey, computed<CalendarRange | undefined>(() => isRange.value ? {
  selected(date) {
    if (anchor.value) return date === anchor.value
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
    if (anchor.value) preview.value = date
  },
} : undefined))

function select(date: string, close: () => void) {
  if (disabled.value) return
  if (isRange.value && !anchor.value) {
    anchor.value = date
    active.value = active.value === 'start' ? 'end' : 'start'
    return
  }
  const next = isRange.value && anchor.value ? orderedRange(anchor.value, date) : date
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

function activateRange(endpoint: Endpoint, keyboard: boolean) {
  if (!open.value || active.value !== endpoint) {
    resetDraft()
    active.value = endpoint
    if (endpoint === 'end' && committedRange.value) {
      const [first, last] = committedRange.value
      const date = parseDate(first)
      if (date && !props.disabledDate?.(date)) {
        anchor.value = first
        preview.value = last
      }
    }
  }
  open.value = true
  if (keyboard) nextTick(() => rangePanel.value?.focus(endpoint))
}

function openFromKeyboard(event: KeyboardEvent) {
  if (disabled.value || !['ArrowDown', 'Enter', ' '].includes(event.key)) return
  event.preventDefault()
  open.value = true
  nextTick(() => calendar.value?.focus())
}

function dismissOnLeave(event: FocusEvent) {
  const next = event.relatedTarget
  if (next instanceof Node && !trigger.value?.contains(next) && !dialog.value?.contains(next)) open.value = false
}

watch(disabled, disabled => { if (disabled) open.value = false })
watch(isRange, () => { open.value = false })
watch(open, visible => { if (!visible) resetDraft() })
watch([() => committedRange.value?.[0], () => committedRange.value?.[1]], resetDraft)
watch(() => {
  const date = parseDate(anchor.value)
  return date && props.disabledDate?.(date)
}, blocked => { if (blocked) resetDraft() })
function resetSelection(type: FormResetType) {
  local.value = type === 'initial' ? initial : null
  open.value = false
  resetDraft()
}
onFormFieldReset(resetSelection)
watch([trigger, () => props.form, isRange], ([element], _, onCleanup) => {
  const form = element?.querySelector('input')?.form
  if (!form) return
  const reset = (event: Event) => nextTick(() => {
    if (event.defaultPrevented || trigger.value !== element) return
    resetSelection('initial')
  })
  form.addEventListener('reset', reset)
  onCleanup(() => form.removeEventListener('reset', reset))
}, { flush: 'post' })
</script>

<template>
  <YmPopup class="ym-date-picker" :class="props.class" :data-mode="props.mode" :style="props.style" placement="bottom-left" v-bind="props.popupProps"
    v-model:visible="open" trigger="click" :disabled="disabled" :size="props.size"
    :overlay-class-name="['ym-date-picker__panel', props.popupProps?.overlayClassName]">
    <template #default>
      <span ref="trigger" class="ym-date-picker__trigger" :data-open="open || undefined" @focusout="dismissOnLeave">
        <RangeField v-if="isRange" v-bind="$attrs" :start-value="fields?.[0]" :end-value="fields?.[1]"
          :form-value="committedRange?.join(' 至 ') ?? ''" :active="active" :open="open" :dialog-id="dialogId"
          :placeholder="props.placeholder" :borderless="props.borderless" :disabled="nativeDisabled" :readonly="readOnly"
          :name="props.name" :form="props.form" @activate="activateRange" />
        <template v-else>
          <YmInput v-bind="$attrs" class="ym-date-picker__field" type="text" role="combobox" readonly
            :model-value="singleDate ?? ''" :placeholder="props.placeholder ?? '请选择日期'"
            :borderless="props.borderless" :disabled="nativeDisabled"
            :name="props.name" :form="props.form" aria-haspopup="dialog" :aria-expanded="open"
            :aria-controls="open ? dialogId : undefined" @keydown="openFromKeyboard" />
          <span class="ym-date-picker__suffix"><YmIcon name="calendar" /></span>
        </template>
      </span>
    </template>
    <template #content="{ close }">
      <div ref="dialog" :id="dialogId" role="dialog" :aria-label="isRange ? '选择日期范围' : '选择日期'" @focusout="dismissOnLeave">
        <RangePanel v-if="isRange" ref="rangePanel" :value="committedRange" :show-lunar="props.showLunar" :show-holiday="props.showHoliday"
          :first-day-of-week="props.firstDayOfWeek" :disabled-date="props.disabledDate" @select="select($event, close)">
          <template v-if="$slots.cell" #cell="cell"><slot name="cell" v-bind="cell" /></template>
        </RangePanel>
        <YmCalendar v-else ref="calendar" theme="card" :model-value="singleDate" :show-lunar="props.showLunar" :show-holiday="props.showHoliday"
          :first-day-of-week="props.firstDayOfWeek" :disabled-date="props.disabledDate" @select="select($event, close)">
          <template v-if="$slots.cell" #cell="cell"><slot name="cell" v-bind="cell" /></template>
        </YmCalendar>
        <div v-if="isRange" class="ym-date-picker__range-hint" role="status">{{ active === 'start' ? '请选择开始日期' : '请选择结束日期' }}</div>
      </div>
    </template>
  </YmPopup>
</template>
