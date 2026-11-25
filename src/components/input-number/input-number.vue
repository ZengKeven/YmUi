<script setup lang="ts" vapor>
import { useFormControlState } from '../form/control-state'
import { onFormFieldReset } from '../form/field-reset'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { YmInput } from '../input'
import { createNumberFormat } from './number'
import inputNumberProps from './props'

defineOptions({ name: 'YmInputNumber', inheritAttrs: false })
const props = defineProps(inputNumberProps)
const { disabled, readOnly } = useFormControlState(props, 'text')
const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  change: [value: number | null, context: { e: Event }]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const editor = useTemplateRef<{ focus(): void; blur(): void }>('editor')
const formField = useTemplateRef<HTMLInputElement>('formField')
const initial = props.defaultValue ?? null
const local = ref(initial)
const controlled = computed(() => props.modelValue === undefined ? props.value : props.modelValue)
const value = computed(() => controlled.value === undefined ? local.value : controlled.value)
const format = computed(() => createNumberFormat(props.decimalPlaces, props.min, props.max))
const normalized = computed(() => value.value !== null && Number.isFinite(value.value)
  ? format.value.normalize(value.value) : null)

// 编辑期间保留负号、小数点和末尾的零，确认后再格式化。
const draft = ref<string | null>(null)
onFormFieldReset(type => {
  draft.value = null
  local.value = type === 'initial' ? initial : null
})
const text = computed(() => draft.value ?? format.value.display(value.value))
const negative = computed(() => (draft.value === null ? normalized.value ?? 0 : Number(draft.value)) < 0)
watch([value, readOnly, disabled], () => { draft.value = null })

function onFocus(e: FocusEvent) {
  if (!readOnly.value && !disabled.value && normalized.value === 0) {
    const field = e.target as HTMLInputElement
    draft.value = '0'
    field.value = '0'
    field.select()
  }
  emit('focus', e)
}

function commit(e: Event) {
  if (draft.value === null || readOnly.value || disabled.value) return
  const input = draft.value.trim()
  draft.value = null
  let next: number | null = null
  if (input !== '') {
    const number = Number(input)
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(input) || !Number.isFinite(number)) return
    next = format.value.normalize(number)
  }
  if (next === value.value) return
  if (controlled.value === undefined) local.value = next
  emit('update:modelValue', next)
  emit('change', next, { e })
}

function onEnter(e: KeyboardEvent) {
  if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229) return
  commit(e)
  const field = e.target as HTMLInputElement
  nextTick(() => { if (field === document.activeElement) field.select() })
}

function onBlur(e: FocusEvent) {
  commit(e)
  emit('blur', e)
}

watch([formField, () => props.form], ([field], _, onCleanup) => {
  const form = field?.form
  if (!field || !form) return
  const reset = (e: Event) => {
    nextTick(() => {
      if (e.defaultPrevented || formField.value !== field || field.form !== form) return
      draft.value = null
      if (controlled.value === undefined) local.value = initial
    })
  }
  form.addEventListener('reset', reset)
  onCleanup(() => form.removeEventListener('reset', reset))
}, { flush: 'post' })

defineExpose({ focus: () => editor.value?.focus(), blur: () => editor.value?.blur() })
</script>

<template>
  <YmInput ref="editor" v-bind="$attrs" type="text" inputmode="decimal" :model-value="text"
    :class="['ym-input-number', props.class, { 'ym-input-number--negative': negative }]" :style="props.style"
    :align="props.align" :size="props.size" :placeholder="props.placeholder" :form="props.form"
    :autofocus="props.autofocus" :borderless="props.borderless" :disabled="disabled" :readonly="readOnly"
    @update:model-value="draft = $event" @focus="onFocus" @blur="onBlur" @keydown="onEnter" />
  <input ref="formField" type="hidden" :name="props.name" :form="props.form"
    :disabled="disabled" :value="normalized ?? ''" />
</template>
