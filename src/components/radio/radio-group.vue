<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { useFormControlState } from '../form/control-state'
import { onFormFieldReset } from '../form/field-reset'
import { computed, provide, shallowRef, useId, useModel } from 'vue'
import { radioGroupKey } from './context'
import { radioGroupProps } from './props'
import YmRadio from './radio.vue'
import type { RadioValue } from './types'

defineOptions({ name: 'YmRadioGroup' })
const props = defineProps(radioGroupProps)
const { disabled, nativeDisabled, readOnly } = useFormControlState(props, 'choice')
const emit = defineEmits<{
  'update:modelValue': [value: RadioValue]
  change: [value: RadioValue, context: { e: Event; name: string }]
}>()
defineSlots<{ default?: () => unknown }>()

const defaultName = `ym-radio-${useId()}`
const model = useModel(props, 'modelValue')
const initialValue = props.modelValue === undefined ? props.defaultValue : undefined
const local = shallowRef(initialValue)
const selected = computed(() => props.modelValue ?? local.value)
onFormFieldReset(type => { local.value = type === 'initial' ? initialValue : undefined })
const options = computed(() => props.options?.map(option => typeof option === 'object' ? option : { value: option }))

provide(radioGroupKey, {
  get theme() { return props.theme },
  get selected() { return selected.value },
  get name() { return props.name || defaultName },
  get disabled() { return nativeDisabled.value },
  select(value, e) {
    if (disabled.value || selected.value === value) return
    // 重置只修改本地选中项，重新选择之前的值时也要发出更新。
    if (model.value === value) emit('update:modelValue', value)
    else model.value = value
    if (props.modelValue === undefined && model.value === value) local.value = value
    emit('change', value, { e, name: props.name || defaultName })
  },
})
</script>

<template>
  <div class="ym-radio-group" role="radiogroup" :data-direction="props.direction"
    :data-size="props.size" :aria-disabled="nativeDisabled || undefined" :aria-readonly="readOnly || undefined">
    <slot>
      <YmRadio v-for="option in options" :key="`${typeof option.value}:${option.value}`" v-bind="option" />
    </slot>
  </div>
</template>
