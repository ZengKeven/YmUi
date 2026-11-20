<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed, provide, useId, useModel } from 'vue'
import { radioGroupKey } from './context'
import { radioGroupProps } from './props'
import YmRadio from './radio.vue'
import type { RadioValue } from './types'

defineOptions({ name: 'YmRadioGroup' })
const props = defineProps(radioGroupProps)
const emit = defineEmits<{
  'update:modelValue': [value: RadioValue]
  change: [value: RadioValue, context: { e: Event; name: string }]
}>()
defineSlots<{ default?: () => unknown }>()

const defaultName = `ym-radio-${useId()}`
const model = useModel(props, 'modelValue')
const initialValue = props.modelValue === undefined ? props.defaultValue : undefined
const selected = computed(() => props.modelValue ?? model.value ?? initialValue)
const options = computed(() => props.options?.map(option => typeof option === 'object' ? option : { value: option }))

provide(radioGroupKey, {
  get selected() { return selected.value },
  get name() { return props.name || defaultName },
  get disabled() { return props.disabled },
  select(value, e) {
    if (props.disabled || selected.value === value) return
    model.value = value
    emit('change', value, { e, name: props.name || defaultName })
  },
})
</script>

<template>
  <div class="ym-radio-group" role="radiogroup" :data-direction="props.direction"
    :data-size="props.size" :aria-disabled="props.disabled || undefined">
    <slot>
      <YmRadio v-for="option in options" :key="`${typeof option.value}:${option.value}`" v-bind="option" />
    </slot>
  </div>
</template>
