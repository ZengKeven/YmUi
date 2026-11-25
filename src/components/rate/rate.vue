<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { useFormControlState } from '../form/control-state'
import { onFormFieldReset } from '../form/field-reset'
import { computed, ref, watch } from 'vue'
import { YmIcon } from '../icon'
import rateProps from './props'

defineOptions({ name: 'YmRate' })
const props = defineProps(rateProps)
const { disabled } = useFormControlState(props, 'choice')
const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()
defineSlots<{ icon?: (scope: { index: number; size: string; color: string }) => unknown }>()

const initial = props.defaultValue
const local = ref(initial)
const preview = ref<number>()
const count = computed(() => Number.isSafeInteger(props.count) && props.count >= 0 ? props.count : 5)
const step = computed(() => props.allowHalf ? 0.5 : 1)
const controlled = computed(() => props.modelValue ?? props.value)
const selected = computed(() => {
  const value = controlled.value ?? local.value
  return Number.isFinite(value) ? Math.min(count.value, Math.max(0, Math.round(value / step.value) * step.value)) : 0
})
const displayed = computed(() => preview.value ?? selected.value)
const defaultTexts = ['极差', '失望', '一般', '满意', '惊喜']
const text = computed(() => {
  if (!displayed.value) return ''
  const texts = props.texts?.length ? props.texts : defaultTexts
  return texts[Math.ceil(displayed.value) - 1] ?? `${displayed.value}分`
})
const iconSize = computed(() => {
  const size = props.size
  if (size == null || ['extra-small', 'small', 'medium', 'large'].includes(String(size))) return undefined
  return Number.isFinite(Number(size)) ? `${Number(size)}px` : size
})
const layers = ['empty', 'fill'] as const
const layerColors = { empty: 'var(--ym-rate-inactive)', fill: 'var(--ym-rate-active)' }

function clearPreview() { preview.value = undefined }
watch([selected, count, disabled, step], clearPreview)
onFormFieldReset(type => {
  clearPreview()
  local.value = type === 'initial' ? initial : 0
})

function scoreAt(event: MouseEvent, index: number) {
  if (!props.allowHalf) return index
  const { left, width } = (event.currentTarget as HTMLElement).getBoundingClientRect()
  return event.clientX < left + width / 2 ? index - 0.5 : index
}

function hover(event: PointerEvent, index: number) {
  if (!disabled.value && event.pointerType !== 'touch') preview.value = scoreAt(event, index)
}

function commit(value: number) {
  clearPreview()
  if (disabled.value || value === selected.value) return
  if (controlled.value === undefined) local.value = value
  emit('update:modelValue', value)
  emit('change', value)
}

function choose(event: MouseEvent, index: number) {
  const score = scoreAt(event, index)
  commit(props.clearable && score === selected.value ? 0 : score)
}

function keydown(event: KeyboardEvent) {
  if (disabled.value) return
  let value: number
  switch (event.key) {
    case 'ArrowRight': case 'ArrowUp': value = Math.min(selected.value + step.value, count.value); break
    case 'ArrowLeft': case 'ArrowDown': value = Math.max(selected.value - step.value, 0); break
    case 'Home': value = 0; break
    case 'End': value = count.value; break
    default: return
  }
  event.preventDefault()
  commit(value)
}
</script>

<template>
  <span class="ym-rate" role="slider" aria-label="评分" :aria-valuemin="0" :aria-valuemax="count"
    :aria-valuenow="selected" :aria-valuetext="`${selected}分`" :aria-disabled="disabled || undefined"
    :tabindex="disabled ? -1 : 0" :data-size="props.size"
    :style="{ '--ym-rate-size': iconSize, '--ym-rate-active': typeof props.color === 'string' ? props.color : props.color?.[0],
      '--ym-rate-inactive': typeof props.color === 'string' ? undefined : props.color?.[1] }"
    @keydown="keydown" @blur="clearPreview">
    <span class="ym-rate__list" aria-hidden="true" :style="{ gap: props.gap + 'px' }"
      @pointerleave="clearPreview" @pointercancel="clearPreview">
      <span v-for="index in count" :key="index" class="ym-rate__item"
        :data-fill="index <= displayed ? 'full' : index - 0.5 === displayed ? 'half' : 'empty'"
        :title="props.showText ? text : undefined"
        @pointermove="hover($event, index)" @click="choose($event, index)">
        <span v-for="layer in layers" :key="layer" :class="`ym-rate__${layer}`">
          <slot name="icon" :index="index" size="1em" :color="layerColors[layer]">
            <YmIcon class="ym-rate__star" name="favorite" size="1em" />
          </slot>
        </span>
      </span>
    </span>
    <span v-if="props.showText && text" class="ym-rate__text">{{ text }}</span>
  </span>
</template>
