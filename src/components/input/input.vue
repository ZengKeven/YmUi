<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { useFormControlState } from '../form/control-state'
import { onFormFieldReset } from '../form/field-reset'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import inputProps from './props'

defineOptions({ name: 'YmInput', inheritAttrs: false })
const props = defineProps(inputProps)
const { disabled, readOnly } = useFormControlState(props, 'text')
const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string, context: { e: Event }]
  clear: [context: { e: MouseEvent }]
}>()

const field = useTemplateRef<HTMLInputElement>('field')
const controlled = computed(() => props.modelValue ?? props.value)
const initialValue = props.defaultValue
const hasText = ref(false)
const revealed = ref(false)
watch([() => props.type, disabled], () => { revealed.value = false })

let compositionStartValue: string | undefined
let committedComposition: string | undefined

function setText(input: HTMLInputElement, value: string) {
  if (input.value !== value) input.value = value
  hasText.value = input.value !== ''
}

onFormFieldReset(type => {
  compositionStartValue = undefined
  committedComposition = undefined
  nextTick(() => {
    if (field.value) setText(field.value, controlled.value ?? (type === 'initial' ? initialValue : ''))
  })
})

watch([field, controlled, () => props.autofocus], ([input, value, autofocus], [previousInput, previousValue, wasAutofocus]) => {
  if (!input) return
  if (compositionStartValue === undefined && (input !== previousInput || value !== previousValue)) {
    setText(input, value ?? initialValue)
  }
  if (autofocus && !input.disabled && (input !== previousInput || !wasAutofocus)) {
    input.focus()
    if (input.matches(':focus')) input.select()
  }
}, { flush: 'post' })

watch([field, () => props.form], ([input], _, onCleanup) => {
  const form = input?.form
  if (!input || !form) return
  const reset = (e: Event) => {
    // reset 事件先于浏览器恢复默认值，等原生操作完成再同步受控文本。
    setTimeout(() => {
      if (e.defaultPrevented || field.value !== input || input.form !== form) return
      compositionStartValue = undefined
      committedComposition = undefined
      setText(input, controlled.value ?? input.value)
    }, 0)
  }
  form.addEventListener('reset', reset)
  onCleanup(() => form.removeEventListener('reset', reset))
}, { flush: 'post' })

async function publish(input: HTMLInputElement, e: Event) {
  hasText.value = input.value !== ''
  if (disabled.value || readOnly.value || input.value === controlled.value) return
  const value = input.value
  emit('update:modelValue', value)
  emit('change', value, { e })
  // 父级可能格式化或拒绝本次输入，等它处理完再校准原生值。
  await nextTick()
  if (controlled.value !== undefined && compositionStartValue === undefined) setText(input, controlled.value)
}

function onInput(e: Event) {
  if (compositionStartValue !== undefined || (e as InputEvent).isComposing) return
  const input = e.currentTarget as HTMLInputElement
  const alreadyCommitted = input.value === committedComposition
  committedComposition = undefined
  if (!alreadyCommitted) publish(input, e)
}

function startComposition(e: CompositionEvent) {
  compositionStartValue = (e.currentTarget as HTMLInputElement).value
  committedComposition = undefined
}

function finishComposition(e: Event) {
  if (compositionStartValue === undefined) return
  const previous = compositionStartValue
  compositionStartValue = undefined
  // 部分浏览器会在 compositionend 后再发送一次相同的 input。
  const input = e.currentTarget as HTMLInputElement
  committedComposition = input.value
  if (committedComposition !== previous) publish(input, e)
  else if (controlled.value !== undefined) setText(input, controlled.value)
}

function clear(e: MouseEvent) {
  e.stopPropagation()
  const input = field.value
  if (!input || !input.value || disabled.value || readOnly.value) return
  compositionStartValue = undefined
  committedComposition = undefined
  setText(input, '')
  input.focus()
  publish(input, e)
  emit('clear', { e })
}

function keepInputFocus(e: MouseEvent) {
  if (e.target !== field.value && field.value?.matches(':focus')) e.preventDefault()
}

defineExpose({
  focus: () => field.value?.focus(),
  blur: () => field.value?.blur(),
})
</script>

<template>
  <span class="ym-input" :class="props.class" :style="props.style" :data-size="props.size"
    :data-borderless="props.borderless || undefined" :data-disabled="disabled || undefined" @mousedown="keepInputFocus">
    <input ref="field" v-bind="$attrs" class="ym-input__control" :style="{ textAlign: props.align }"
      :type="props.type === 'password' && !revealed ? 'password' : 'text'"
      :value.attr="initialValue" :placeholder="props.placeholder" :name="props.name" :form="props.form"
      :autofocus="props.autofocus" :disabled="disabled" :readonly="readOnly"
      @input="onInput" @compositionstart="startComposition" @compositionend="finishComposition"
      @change="finishComposition" />
    <YmButton v-if="props.clearable && hasText && !disabled && !readOnly" class="ym-input__clear" type="button"
      variant="text" theme="default" shape="square" aria-label="清空内容" @click="clear">
      <YmIcon name="close" />
    </YmButton>
    <YmButton v-if="props.type === 'password'" class="ym-input__visibility" type="button" variant="text"
      theme="default" shape="square" :disabled="disabled" :aria-label="revealed ? '隐藏密码' : '显示密码'"
      @click="revealed = !revealed">
      <YmIcon :name="revealed ? 'hide-password' : 'show-password'" />
    </YmButton>
  </span>
</template>
