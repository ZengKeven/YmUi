<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import descriptionsProps, { isPositiveInteger } from './props'

defineOptions({ name: 'YmDescriptions' })
const props = defineProps(descriptionsProps)
defineSlots<{ default?: () => unknown }>()
</script>

<template>
  <dl class="ym-descriptions" :data-size="props.size"
    :style="{ '--ym-descriptions-columns': isPositiveInteger(props.column) ? props.column : 2 }">
    <slot />
  </dl>
</template>
