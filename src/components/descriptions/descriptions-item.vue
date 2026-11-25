<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { descriptionsItemProps, isPositiveInteger } from './props'

defineOptions({ name: 'YmDescriptionsItem' })
const props = defineProps(descriptionsItemProps)
defineSlots<{
  label?: () => unknown
  content?: () => unknown
  default?: () => unknown
}>()
</script>

<template>
  <div class="ym-descriptions__item" :style="{
    '--ym-descriptions-col-span': isPositiveInteger(props.colSpan) ? props.colSpan : 1,
    gridRow: 'span ' + (isPositiveInteger(props.rowSpan) ? props.rowSpan : 1),
  }">
    <dt class="ym-descriptions__label"><slot name="label">{{ props.label }}</slot></dt>
    <dd class="ym-descriptions__content"><slot name="content"><slot>{{ props.content }}</slot></slot></dd>
  </div>
</template>
