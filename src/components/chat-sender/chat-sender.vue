<script setup lang="ts" vapor>
import { computed, onScopeDispose, ref, useTemplateRef, watch } from 'vue'
import { YmButton } from '../button'
import { useFormControlState } from '../form/control-state'
import { onFormFieldReset } from '../form/field-reset'
import { YmIcon } from '../icon'
import { YmTextarea } from '../textarea'
import chatSenderProps from './props'

defineOptions({ name: 'YmChatSender' })
const props = defineProps(chatSenderProps)
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:value': [value: string]
  change: [value: string, context: { e: Event }]
  focus: [value: string, context: { e: FocusEvent }]
  blur: [value: string, context: { e: FocusEvent }]
  send: [value: string, context: { e: MouseEvent | KeyboardEvent }]
  stop: [value: string, context: { e: MouseEvent }]
}>()
defineSlots<{
  header?: () => unknown
  'inner-header'?: () => unknown
  'input-prefix'?: () => unknown
  'footer-prefix'?: () => unknown
  suffix?: (scope: {
    send: (e: MouseEvent) => void
    stop: (e: MouseEvent) => void
    disabled: boolean
    loading: boolean
  }) => unknown
}>()

const { disabled } = useFormControlState({
  get disabled() { return props.disabled ?? props.textareaProps?.disabled },
}, 'text')
const initial = props.defaultValue.replace(/\r\n?/g, '\n')
const draft = ref(initial)
const controlled = computed(() => props.modelValue ?? props.value)
const text = computed(() => controlled.value?.replace(/\r\n?/g, '\n') ?? draft.value)
const stopping = computed(() => props.loading || props.stopDisabled)
const sendDisabled = computed(() => disabled.value || props.sendBtnDisabled || stopping.value || !text.value)
const defaultAutosize = { minRows: 2, maxRows: 5 }
const editorArea = useTemplateRef<HTMLDivElement>('editorArea')

function change(value: string, context: { e: Event }) {
  if (controlled.value === undefined) draft.value = value
  emit('update:modelValue', value)
  emit('update:value', value)
  emit('change', value, context)
}

function send(e: MouseEvent | KeyboardEvent) {
  if (!sendDisabled.value) emit('send', text.value, { e })
}

function stop(e: MouseEvent) {
  if (stopping.value && !disabled.value) emit('stop', text.value, { e })
}

let composing = false
let compositionTimer: ReturnType<typeof setTimeout> | undefined
function startComposition() {
  clearTimeout(compositionTimer)
  composing = true
}

function endComposition() {
  // Safari 确认候选词时，可在 compositionend 后于同一任务再派发一次 Enter。
  clearTimeout(compositionTimer)
  compositionTimer = setTimeout(() => { composing = false }, 0)
}
onScopeDispose(() => clearTimeout(compositionTimer))

function keydown(e: KeyboardEvent) {
  if (e.defaultPrevented || e.key !== 'Enter' || e.shiftKey || composing || e.isComposing || e.keyCode === 229) return
  e.preventDefault()
  e.stopPropagation()
  if (!e.repeat) send(e)
}

onFormFieldReset(type => { draft.value = type === 'initial' ? initial : '' })
watch([editorArea, () => props.textareaProps?.form], ([area], _, onCleanup) => {
  const form = area?.querySelector('textarea')?.form
  if (!form) return
  const reset = (e: Event) => queueMicrotask(() => {
    if (!e.defaultPrevented) draft.value = initial
  })
  form.addEventListener('reset', reset)
  onCleanup(() => form.removeEventListener('reset', reset))
}, { flush: 'post' })
</script>

<template>
  <div class="ym-chat-sender" :data-size="props.size" :data-disabled="disabled || undefined">
    <div v-if="$slots.header"><slot name="header" /></div>
    <div v-if="$slots['inner-header']"><slot name="inner-header" /></div>
    <div class="ym-chat-sender__body">
      <div v-if="$slots['input-prefix']"><slot name="input-prefix" /></div>
      <div ref="editorArea" class="ym-chat-sender__editor" @keydown="keydown"
        @compositionstart="startComposition" @compositionend="endComposition">
        <YmTextarea aria-label="消息内容" v-bind="props.textareaProps"
          :model-value="text" :disabled="disabled"
          :placeholder="props.placeholder ?? props.textareaProps?.placeholder"
          :autosize="props.textareaProps?.autosize ?? defaultAutosize" @change="change"
          @focus="emit('focus', text, { e: $event })" @blur="emit('blur', text, { e: $event })" />
      </div>
    </div>
    <div class="ym-chat-sender__footer">
      <div v-if="$slots['footer-prefix']"><slot name="footer-prefix" /></div>
      <div class="ym-chat-sender__actions">
        <slot name="suffix" :send="send" :stop="stop" :loading="stopping" :disabled="stopping ? disabled : sendDisabled">
          <YmButton shape="square" :aria-label="stopping ? '停止生成' : '发送消息'"
            :disabled="stopping ? disabled : sendDisabled" @click="stopping ? stop($event) : send($event)">
            <template #icon><YmIcon :name="stopping ? 'disable' : 'submit'" /></template>
          </YmButton>
        </slot>
      </div>
    </div>
  </div>
</template>
