<script setup lang="ts" vapor generic="Mode extends TimePickerMode = 'single'">
import { computed, nextTick, ref, shallowRef, useId, useTemplateRef, watch } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import { YmInput } from '../input'
import { YmPopup } from '../popup'
import pickerProps from './props'
import TimeColumns from './time-columns.vue'
import type { TimePickerMode, TimePickerValue, TimeRangeValue } from './types'

defineOptions({ name: 'YmTimePicker', inheritAttrs: false })
const props = defineProps(pickerProps)
const emit = defineEmits<{
  'update:modelValue': [value: TimePickerValue<Mode>]
  change: [value: TimePickerValue<Mode>]
}>()

const initial = props.defaultValue
const local = shallowRef(initial)
const range = computed(() => props.mode === 'range')
const value = computed(() => props.modelValue === undefined ? local.value : props.modelValue)
const midnight = computed(() => props.format === 'HH:mm' ? '00:00' : '00:00:00')

function formatTime(value: unknown) {
  if (typeof value !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)) return ''
  return props.format === 'HH:mm' ? value.slice(0, 5) : value.length === 5 ? value + ':00' : value
}

function ordered(start: string, end: string): TimeRangeValue {
  return start <= end ? [start, end] : [end, start]
}

const committed = computed<TimeRangeValue>(() => {
  const current = value.value
  if (!range.value) return [formatTime(current), '']
  if (!Array.isArray(current) || current.length !== 2) return ['', '']
  const start = formatTime(current[0])
  const end = formatTime(current[1])
  return start && end ? ordered(start, end) : ['', '']
})
const formValue = computed(() => range.value && committed.value[0] ? committed.value.join(' 至 ') : committed.value[0])
const draft = ref<TimeRangeValue>(['', ''])
const open = ref(false)
const activeSide = ref(0)
const displayed = computed<TimeRangeValue>(() => {
  if (!open.value) return committed.value
  const [start, end] = draft.value
  return range.value ? [start || end, end || start] : draft.value
})
const names = ['开始时间', '结束时间'] as const
const dialogId = `ym-time-picker-${useId()}`
const field = useTemplateRef<HTMLElement>('field')
const dialog = useTemplateRef<HTMLElement>('dialog')
const panels = useTemplateRef<{ focus(): void }[]>('panels')

function openPicker(side: number, keyboard = false) {
  if (props.disabled) return
  if (!open.value) draft.value = [...committed.value]
  activeSide.value = side
  open.value = true
  if (keyboard) nextTick(() => panels.value?.[side]?.focus())
}

function clickField(event: MouseEvent) {
  if (props.disabled || !field.value) return
  const fields = field.value.querySelectorAll<HTMLInputElement>('input[role="combobox"]')
  const side = event.target === fields[1] ? 1 : event.target === fields[0] ? 0 : activeSide.value
  fields[side]?.focus()
  openPicker(side)
}

function keydown(event: KeyboardEvent, side: number) {
  if (!['ArrowDown', 'Enter', ' '].includes(event.key)) return
  event.preventDefault()
  openPicker(side, true)
}

function pick(side: number, time: string) {
  activeSide.value = side
  draft.value[side] = time
}

function confirm(close: () => void) {
  if (props.disabled) return
  const [first, last] = displayed.value
  const start = first || midnight.value
  const next = range.value ? ordered(start, last || midnight.value) : start
  const [oldStart, oldEnd] = committed.value
  if (Array.isArray(next) ? next[0] !== oldStart || next[1] !== oldEnd : next !== oldStart) {
    if (props.modelValue === undefined) local.value = next
    const result = next as TimePickerValue<Mode>
    emit('update:modelValue', result)
    emit('change', result)
  }
  close()
}

function dismissOnLeave(event: FocusEvent) {
  const next = event.relatedTarget
  if (next instanceof Node && !field.value?.contains(next) && !dialog.value?.contains(next)) open.value = false
}

watch([() => props.disabled, range, () => props.format], () => {
  open.value = false
  activeSide.value = 0
})
watch([() => committed.value[0], () => committed.value[1]], () => {
  if (open.value) draft.value = [...committed.value]
})
watch([field, () => props.form, range], ([element], _, onCleanup) => {
  const form = element?.querySelector('input')?.form
  if (!form) return
  const reset = (event: Event) => nextTick(() => {
    if (event.defaultPrevented || field.value !== element) return
    if (props.modelValue === undefined) local.value = initial
    open.value = false
  })
  form.addEventListener('reset', reset)
  onCleanup(() => form.removeEventListener('reset', reset))
}, { flush: 'post' })
</script>

<template>
  <YmPopup class="ym-time-picker" :class="props.class" :style="props.style" :data-mode="props.mode"
    placement="bottom-left" v-bind="props.popupProps" trigger="manual" v-model:visible="open"
    :size="props.size" :disabled="props.disabled" :overlay-class-name="['ym-time-picker__panel', props.popupProps?.overlayClassName]">
    <template #default>
      <span ref="field" class="ym-time-picker__trigger" :data-open="open || undefined" @click="clickField" @focusout="dismissOnLeave">
        <span v-if="range" aria-label="时间范围" v-bind="$attrs" :id="undefined" :tabindex="undefined"
          role="group" class="ym-input ym-time-picker__field ym-time-picker__range"
          :data-disabled="props.disabled || undefined" :data-borderless="props.borderless || undefined">
          <template v-for="(name, side) in names" :key="name">
            <span v-if="side === 1" aria-hidden="true">–</span>
            <input class="ym-input__control" type="text" readonly role="combobox" :aria-label="name" aria-haspopup="dialog"
              :id="side === 0 ? ($attrs.id as string | undefined) : undefined" :tabindex="$attrs.tabindex as number | undefined"
              :aria-describedby="$attrs['aria-describedby'] as string | undefined" :aria-expanded="open" :aria-controls="open ? dialogId : undefined"
              :data-active="open && activeSide === side || undefined" :value.attr="displayed[side]" :placeholder="props.placeholder ?? name"
              :form="props.form" :disabled="props.disabled" @keydown="keydown($event, side)" />
          </template>
        </span>
        <YmInput v-else v-bind="$attrs" class="ym-time-picker__field" readonly role="combobox" aria-haspopup="dialog"
          :aria-expanded="open" :aria-controls="open ? dialogId : undefined" :model-value="displayed[0]"
          :placeholder="props.placeholder ?? '请选择时间'" :disabled="props.disabled" :borderless="props.borderless"
          :form="props.form" @keydown="keydown($event, 0)" />
        <YmIcon class="ym-time-picker__icon" name="clock" />
        <input v-if="props.name" type="hidden" :name="props.name" :form="props.form" :disabled="props.disabled" :value="formValue" />
      </span>
    </template>
    <template #content="{ close }">
      <div ref="dialog" :id="dialogId" role="dialog" :aria-label="range ? '选择时间范围' : '选择时间'" @focusout="dismissOnLeave">
        <div class="ym-time-picker__panels">
          <div v-for="n in (range ? 2 : 1)" :key="n" class="ym-time-picker__pane" @focusin="activeSide = n - 1">
            <div v-if="range" class="ym-time-picker__heading">{{ names[n - 1] }}</div>
            <TimeColumns ref="panels" :value="displayed[n - 1] || midnight" :format="props.format"
              :label="range ? names[n - 1] : '时间'" @change="pick(n - 1, $event)" />
          </div>
        </div>
        <div class="ym-time-picker__footer"><YmButton type="button" @click="confirm(close)">确定</YmButton></div>
      </div>
    </template>
  </YmPopup>
</template>
