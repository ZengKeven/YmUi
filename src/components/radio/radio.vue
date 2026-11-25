<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { useFormControlState } from '../form/control-state'
import { onFormFieldReset } from '../form/field-reset'
import { computed, inject, nextTick, ref, useTemplateRef } from 'vue'
import { radioGroupKey } from './context'
import radioProps from './props'

defineOptions({ name: 'YmRadio', inheritAttrs: false })
const props = defineProps(radioProps)
const { nativeDisabled, readOnly } = useFormControlState(props, 'choice')
const emit = defineEmits<{
  'update:modelValue': [checked: boolean]
  change: [checked: boolean, context: { e: Event }]
}>()
defineSlots<{ default?: () => unknown }>()

const group = inject(radioGroupKey, undefined)
const initiallyChecked = props.defaultChecked
const fallback = ref(initiallyChecked)
const field = useTemplateRef<HTMLInputElement>('field')
const checked = computed(() => group ? props.value !== undefined && group.selected === props.value : props.modelValue)
const disabled = computed(() => nativeDisabled.value || (group && (group.disabled || props.value === undefined)))

if (!group) onFormFieldReset(type => {
  fallback.value = type === 'initial' && initiallyChecked
  if (field.value) field.value.checked = checked.value ?? fallback.value
})

async function change(e: Event) {
  const input = e.currentTarget as HTMLInputElement
  if (disabled.value || readOnly.value || !input.checked) return
  if (group && props.value !== undefined) group.select(props.value, e)
  emit('update:modelValue', true)
  emit('change', true, { e })

  // 原生切换会同时取消旧选项。父级拒绝切换时，同一表单和组名下的旧选项也要恢复。
  await nextTick()
  if (checked.value !== false || !input.checked) return
  input.checked = false
  if (input.name) {
    const root = input.getRootNode() as ParentNode
    for (const peer of root.querySelectorAll<HTMLInputElement>('input[data-ym-radio-selected]')) {
      if (peer.form === input.form && peer.name === input.name) {
        peer.checked = true
        break
      }
    }
  }
}
</script>

<template>
  <label class="ym-radio" :data-size="props.size" :data-theme="props.theme ?? group?.theme ?? 'primary'">
    <input ref="field" v-bind="$attrs" class="ym-radio__input" type="radio" :name="group?.name ?? props.name"
      :value="String(props.value ?? 'on')" :disabled="disabled" :checked="checked ?? fallback"
      :data-ym-radio-selected="checked || undefined" :aria-readonly="readOnly || undefined"
      @click="readOnly && $event.preventDefault()"
      @keydown="readOnly && $event.key.startsWith('Arrow') && $event.preventDefault()" @change="change" />
    <span class="ym-radio__label"><slot>{{ props.label ?? props.value }}</slot></span>
  </label>
</template>
