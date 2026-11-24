<script setup lang="ts" vapor>
import { computed, nextTick, ref, useId, useTemplateRef, watch } from 'vue'
import { YmButton } from '../button'
import { YmCalendar, type CalendarCell } from '../calendar'
import { YmIcon } from '../icon'
import { YmInput } from '../input'
import { YmPopup } from '../popup'
import pickerProps from './props'

defineOptions({ name: 'YmDatePicker', inheritAttrs: false })
const props = defineProps(pickerProps)
const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  change: [value: string | null]
  clear: []
}>()
defineSlots<{ cell?: (cell: CalendarCell) => unknown }>()

const initial = props.defaultValue ?? null
const local = ref(initial)
const value = computed(() => props.modelValue === undefined ? local.value : props.modelValue)
const open = ref(false)
const dialogId = `ym-date-picker-${useId()}`
const trigger = useTemplateRef<HTMLElement>('trigger')
const dialog = useTemplateRef<HTMLElement>('dialog')
const editor = useTemplateRef<{ focus(): void }>('editor')
const calendar = useTemplateRef<{ focus(): void }>('calendar')

function update(next: string | null) {
  if (props.disabled || next === value.value) return
  if (props.modelValue === undefined) local.value = next
  emit('update:modelValue', next)
  emit('change', next)
}

function select(date: string, close: () => void) {
  update(date)
  close()
}

function clear() {
  if (props.disabled || !value.value) return
  update(null)
  open.value = false
  editor.value?.focus()
  emit('clear')
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
  <YmPopup class="ym-date-picker" :class="props.class" :style="props.style" placement="bottom-left" v-bind="props.popupProps"
    v-model:visible="open" trigger="click" :disabled="props.disabled" :size="props.size"
    :overlay-class-name="['ym-date-picker__panel', props.popupProps?.overlayClassName]">
    <template #default>
      <span ref="trigger" class="ym-date-picker__trigger" :data-open="open || undefined" @focusout="dismissOnLeave">
        <YmInput ref="editor" v-bind="$attrs" class="ym-date-picker__field" type="text" role="combobox" readonly
          :model-value="value ?? ''" :placeholder="props.placeholder" :borderless="props.borderless" :disabled="props.disabled"
          :name="props.name" :form="props.form" aria-haspopup="dialog" :aria-expanded="open"
          :aria-controls="open ? dialogId : undefined" @keydown="openFromKeyboard" />
        <span class="ym-date-picker__suffix">
          <YmButton v-if="props.clearable && value && !props.disabled" class="ym-date-picker__clear" shape="square"
            variant="text" aria-label="清空日期" @click.stop="clear">
            <template #icon><YmIcon name="close" /></template>
          </YmButton>
          <YmIcon name="calendar" />
        </span>
      </span>
    </template>
    <template #content="{ close }">
      <div ref="dialog" :id="dialogId" role="dialog" aria-label="选择日期" @focusout="dismissOnLeave">
        <YmCalendar ref="calendar" theme="card" :model-value="value" :show-lunar="props.showLunar" :show-holiday="props.showHoliday"
          :first-day-of-week="props.firstDayOfWeek" :disabled-date="props.disabledDate" @select="select($event, close)">
          <template v-if="$slots.cell" #cell="cell"><slot name="cell" v-bind="cell" /></template>
        </YmCalendar>
      </div>
    </template>
  </YmPopup>
</template>
