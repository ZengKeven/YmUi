<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed, nextTick, ref, useId, useTemplateRef, watch, type AriaAttributes } from 'vue'
import { useTextareaAutosizeFallback } from './autosize'
import { measureText } from './length'
import textareaProps from './props'

defineOptions({ name: 'YmTextarea', inheritAttrs: false })
const props = defineProps(textareaProps)
const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string, context: { e: Event }]
  validate: [context: { error?: 'exceed-maximum' }]
}>()
const slots = defineSlots<{ tips?: () => unknown }>()

const field = useTemplateRef<HTMLTextAreaElement>('field')
const infoId = `ym-textarea-info-${useId()}`
// 与原生 textarea 保持相同的换行表示，计数时每个换行只算一次。
const controlled = computed(() => (props.modelValue ?? props.value)?.replace(/\r\n?/g, '\n'))
const initial = props.defaultValue.replace(/\r\n?/g, '\n')
const text = ref(controlled.value ?? initial)
useTextareaAutosizeFallback(field, () => props.autosize, () => text.value)
const limit = computed(() => {
  const prop = props.maxcharacter ?? props.maxlength
  if (prop == null || String(prop).trim() === '') return undefined
  const n = Number(prop)
  return Number.isInteger(n) && n >= 0 ? n : undefined
})
const weighted = computed(() => props.maxcharacter !== undefined)
const length = computed(() => measureText(controlled.value ?? text.value, weighted.value).length)
const over = computed(() => limit.value !== undefined && length.value > limit.value)
const status = computed(() => over.value ? 'error' : props.status)
const hasFooter = computed(() => Boolean(props.tips || slots.tips || limit.value !== undefined))
const bounds = computed(() => typeof props.autosize === 'object' ? props.autosize : undefined)
let composing = false

// 只在文本变化时写入 DOM，保留当前选择和光标位置。
function show(input: HTMLTextAreaElement, value: string) {
  if (input.value !== value) input.value = value
  text.value = input.value
}

watch([field, controlled, () => props.autofocus], ([input, value, autofocus], [previous, oldValue, wasAutofocus]) => {
  if (!input) return
  if (input !== previous) input.defaultValue = initial
  if (!composing && (input !== previous || value !== oldValue)) show(input, value ?? initial)
  if (autofocus && !input.disabled && (input !== previous || !wasAutofocus)) {
    input.focus()
    if (input.matches(':focus')) input.select()
  }
}, { flush: 'post' })

watch([field, () => props.form], ([input], _, onCleanup) => {
  const form = input?.form
  if (!input || !form) return
  const reset = (event: Event) => {
    // reset 的默认操作先恢复原生值，随后同步计数并恢复受控文本。
    setTimeout(() => {
      if (event.defaultPrevented || field.value !== input || input.form !== form) return
      composing = false
      show(input, controlled.value ?? input.value)
    }, 0)
  }
  form.addEventListener('reset', reset)
  onCleanup(() => form.removeEventListener('reset', reset))
}, { flush: 'post' })

watch(over, (exceeded, previous) => {
  if (exceeded || previous) emit('validate', { error: exceeded ? 'exceed-maximum' : undefined })
}, { immediate: true })

async function commit(event: Event) {
  const input = event.currentTarget as HTMLTextAreaElement
  if (composing || (event as InputEvent).isComposing || props.readonly || props.disabled) return
  const next = limit.value === undefined || props.allowInputOverMax
    ? input.value : measureText(input.value, weighted.value, limit.value).text
  const previous = text.value
  show(input, next)
  if (next !== previous) {
    emit('update:modelValue', next)
    emit('change', next, { e: event })
  }
  if (controlled.value !== undefined) {
    await nextTick()
    if (field.value === input && !composing && controlled.value !== undefined) show(input, controlled.value)
  }
}

function finishComposition(event: Event) {
  if (!composing) return
  composing = false
  commit(event)
}

defineExpose({ focus: () => field.value?.focus(), blur: () => field.value?.blur() })
</script>

<template>
  <div class="ym-textarea" :class="props.class" :data-size="props.size" :data-status="status"
    :data-disabled="props.disabled || undefined" :data-autosize="bounds ? 'bounded' : props.autosize ? 'auto' : undefined"
    :style="{ '--ym-textarea-min-rows': bounds?.minRows, '--ym-textarea-max-rows': bounds?.maxRows }">
    <textarea ref="field" v-bind="$attrs" class="ym-textarea__control" :style="[props.style, { textAlign: props.align }]"
      :rows="props.rows" :placeholder="props.placeholder" :name="props.name" :form="props.form"
      :disabled="props.disabled" :readonly="props.readonly" :autofocus="props.autofocus"
      :maxlength="!weighted && !props.allowInputOverMax ? limit : undefined"
      :aria-invalid="status === 'error' ? true : $attrs['aria-invalid'] as AriaAttributes['aria-invalid']"
      :aria-describedby="[$attrs['aria-describedby'], hasFooter ? infoId : undefined].filter(Boolean).join(' ') || undefined"
      @input="commit" @compositionstart="composing = true" @compositionend="finishComposition" @change="finishComposition" />
    <div v-if="hasFooter" :id="infoId" class="ym-textarea__footer">
      <span v-if="props.tips || slots.tips" class="ym-textarea__tips"><slot name="tips">{{ props.tips }}</slot></span>
      <span v-if="limit !== undefined" class="ym-textarea__count">{{ length }}/{{ limit }}</span>
    </div>
  </div>
</template>
