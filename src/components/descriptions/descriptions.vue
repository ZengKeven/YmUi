<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed } from 'vue'
import descriptionsProps, { isPositiveInteger } from './props'

defineOptions({ name: 'YmDescriptions' })
const props = defineProps(descriptionsProps)
defineSlots<{ default?: () => unknown }>()

const labelWidth = computed(() => {
  const width = typeof props.labelWidth === 'string' ? props.labelWidth.trim() : props.labelWidth
  if (width == null || width === '') return undefined
  const pixels = Number(width)
  return Number.isFinite(pixels) ? `${Math.max(0, pixels)}px` : width
})
</script>

<template>
  <dl class="ym-descriptions" :data-size="props.size" :style="{
    '--ym-descriptions-columns': isPositiveInteger(props.column) ? props.column : 2,
    '--ym-descriptions-label-width': labelWidth,
  }">
    <slot />
  </dl>
</template>
