<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed, inject, nextTick } from 'vue'
import { checkboxGroupKey } from './context'
import checkboxProps from './props'

defineOptions({ name: 'YmCheckbox', inheritAttrs: false })
const props = defineProps(checkboxProps)
const emit = defineEmits<{
  'update:modelValue': [checked: boolean]
  change: [checked: boolean, context: { e: Event }]
}>()
defineSlots<{ default?: () => unknown }>()

const group = inject(checkboxGroupKey, undefined)
const initialChecked = props.defaultChecked ?? false
const checked = computed(() => group
  ? props.value !== undefined && group.selected.includes(props.value)
  : props.modelValue)
const disabled = computed(() => props.disabled || (group && (group.disabled || props.value === undefined)))

async function change(e: Event) {
  if (disabled.value) return
  const input = e.currentTarget as HTMLInputElement
  const next = input.checked
  if (group && props.value !== undefined) group.toggle(props.value, next, e)
  emit('update:modelValue', next)
  emit('change', next, { e })

  // 浏览器在 change 前已切换 checked 并清除半选，等待父级处理事件后恢复受控状态。
  await nextTick()
  if (checked.value !== undefined) input.checked = checked.value
  input.indeterminate = props.indeterminate
}
</script>

<template>
  <label class="ym-checkbox" :data-size="props.size" :data-theme="props.theme ?? group?.theme ?? 'primary'">
    <input v-bind="$attrs" class="ym-checkbox__input" type="checkbox"
      :name="props.name ?? group?.name" :value="String(props.value ?? 'on')"
      :disabled="disabled" :checked="checked ?? initialChecked" :indeterminate="props.indeterminate"
      @change="change" />
    <span class="ym-checkbox__label"><slot>{{ props.label ?? props.value }}</slot></span>
  </label>
</template>
