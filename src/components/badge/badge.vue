<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed } from 'vue'
import badgeProps from './props'

defineOptions({ name: 'YmBadge' })
const props = defineProps(badgeProps)
defineSlots<{ default?: () => unknown; content?: () => unknown; count?: () => unknown }>()

const displayCount = computed(() => {
  const number = Number(props.count)
  if (Number.isNaN(number)) return props.count
  return number > props.maxCount ? `${props.maxCount}+` : number
})

function offsetLength(value: number | string | undefined) {
  if (value == null) return undefined
  return Number.isFinite(Number(value)) ? `${Number(value)}px` : value
}
</script>

<template>
  <span class="ym-badge" :data-anchored="$slots.default || $slots.content || props.content ? '' : undefined">
    <slot><slot name="content">{{ props.content }}</slot></slot>
    <sup v-if="$slots.count || props.showZero || displayCount !== 0" class="ym-badge__mark"
      :data-size="props.size" :data-shape="props.shape" :data-dot="props.dot || undefined"
      :style="{ backgroundColor: props.color, right: offsetLength(props.offset?.[0]), top: offsetLength(props.offset?.[1]) }"
      :aria-hidden="props.dot || undefined">
      <slot v-if="!props.dot" name="count">{{ displayCount }}</slot>
    </sup>
  </span>
</template>
