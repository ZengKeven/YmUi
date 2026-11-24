<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed, provide, shallowRef } from 'vue'
import YmCheckbox from './checkbox.vue'
import { checkboxGroupKey } from './context'
import { checkboxGroupProps } from './props'
import type { CheckboxGroupChangeContext, CheckboxValue } from './types'

defineOptions({ name: 'YmCheckboxGroup' })
const props = defineProps(checkboxGroupProps)
const emit = defineEmits<{
  'update:modelValue': [values: CheckboxValue[]]
  change: [values: CheckboxValue[], context: CheckboxGroupChangeContext]
}>()
defineSlots<{ default?: () => unknown }>()

const localValue = shallowRef([...(props.defaultValue ?? [])])
const selected = computed(() => props.modelValue ?? localValue.value)
const options = computed(() => props.options?.map(option =>
  typeof option === 'object' ? option : { value: option },
))

provide(checkboxGroupKey, {
  get theme() { return props.theme },
  get selected() { return selected.value },
  get disabled() { return props.disabled },
  get name() { return props.name },
  toggle(value, checked, e) {
    const next = new Set(selected.value)
    if (props.disabled || next.has(value) === checked) return
    if (checked) next.add(value)
    else next.delete(value)
    const values = [...next]
    if (props.modelValue === undefined) localValue.value = values
    emit('update:modelValue', values)
    emit('change', values, { e, current: value, type: checked ? 'check' : 'uncheck' })
  },
})
</script>

<template>
  <div class="ym-checkbox-group" role="group" :data-size="props.size" :aria-disabled="props.disabled || undefined">
    <slot>
      <YmCheckbox v-for="option in options" :key="`${typeof option.value}:${option.value}`" v-bind="option" />
    </slot>
  </div>
</template>
