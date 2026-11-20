<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed } from 'vue'
import { iconPaths, type IconDrawing } from './icons'
import iconProps from './props'

defineOptions({ name: 'YmIcon' })
const props = defineProps(iconProps)
const emit = defineEmits<{ click: [context: { e: MouseEvent }] }>()

const drawing = computed<IconDrawing | undefined>(() => Object.hasOwn(iconPaths, props.name) ? iconPaths[props.name] : undefined)
const outline = computed(() => typeof drawing.value === 'string' ? drawing.value : drawing.value?.outline)
const fill = computed(() => typeof drawing.value === 'object' ? drawing.value.fill : undefined)
const customSize = computed(() => {
  const size = props.size
  if (typeof size === 'number') return `${size}px`
  if (size && ['extra-small', 'small', 'medium', 'large'].includes(size)) return undefined
  return size
})
</script>

<template>
  <svg
    v-if="drawing"
    class="ym-icon"
    :data-name="props.name"
    :data-size="props.size"
    :style="{ fontSize: customSize, color: props.color }"
    viewBox="0 0 24 24"
    fill="none"
    focusable="false"
    role="img"
    :aria-hidden="$attrs['aria-label'] || $attrs['aria-labelledby'] ? undefined : true"
    @click="emit('click', { e: $event })"
  >
    <path v-if="outline" :d="outline" stroke="currentColor" stroke-width="2" stroke-linecap="square" />
    <path v-if="fill" :d="fill" fill="currentColor" fill-rule="evenodd" />
  </svg>
</template>
