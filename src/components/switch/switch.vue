<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor generic="Value extends SwitchValue = boolean">
import { computed, onScopeDispose, ref } from 'vue'
import { YmLoading } from '../loading'
import switchProps from './props'
import type { SwitchValue } from './types'

defineOptions({ name: 'YmSwitch' })
const props = defineProps(switchProps)
const emit = defineEmits<{
  'update:modelValue': [value: Value]
  change: [value: Value, context: { e: MouseEvent }]
}>()
defineSlots<{ label?: (scope: { value: Value; checked: boolean }) => unknown }>()

const localChecked = ref(props.defaultValue === props.customValue[0])
const controlled = computed(() => props.modelValue ?? props.value)
const value = computed(() => (controlled.value ?? props.customValue[localChecked.value ? 0 : 1]) as Value)
const checked = computed(() => value.value === props.customValue[0])
const nextValue = computed(() => props.customValue[checked.value ? 1 : 0] as Value)
const label = computed(() => typeof props.label === 'string' ? props.label : props.label?.[checked.value ? 0 : 1])
const pending = ref(false)
const busy = computed(() => props.loading || pending.value)
let disposed = false
onScopeDispose(() => { disposed = true })

async function toggle(e: MouseEvent) {
  if (props.disabled || busy.value) return
  const previous = value.value
  const next = nextValue.value

  if (props.beforeChange) {
    pending.value = true
    try {
      if (!await props.beforeChange()) return
    } catch {
      return
    } finally {
      pending.value = false
    }
    // 等待期间父组件可能更新绑定值、选项或交互状态。
    if (disposed || props.disabled || props.loading || value.value !== previous || nextValue.value !== next) return
  }

  if (controlled.value === undefined) localChecked.value = !checked.value
  emit('update:modelValue', next)
  emit('change', next, { e })
}
</script>

<template>
  <button type="button" role="switch" class="ym-switch" :data-size="props.size"
    :aria-checked="checked" :disabled="props.disabled"
    :aria-busy="busy || undefined" :aria-disabled="busy || undefined" @click="toggle">
    <span class="ym-switch__thumb" aria-hidden="true">
      <YmLoading v-if="busy" size="var(--ym-switch-spinner)" />
    </span>
    <span v-if="$slots.label || label" class="ym-switch__label">
      <slot name="label" :value="value" :checked="checked">{{ label }}</slot>
    </span>
  </button>
</template>
