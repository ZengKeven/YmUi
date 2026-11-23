<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed, useId } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import tagProps from './props'

defineOptions({ name: 'YmTag' })
const props = defineProps(tagProps)
const emit = defineEmits<{ close: [event: MouseEvent] }>()
defineSlots<{ default?: () => unknown; icon?: () => unknown }>()

const id = useId()
const maxWidth = computed(() => {
  const width = props.maxWidth
  if (width == null || width === '') return undefined
  const pixels = Number(width)
  const length = Number.isFinite(pixels) ? `${pixels}px` : width
  return `min(100%, ${length})`
})
</script>

<template>
  <span class="ym-tag" :data-theme="props.theme" :data-variant="props.variant" :data-size="props.size"
    :data-shape="props.shape" :style="{ maxWidth }"
    :aria-disabled="props.disabled || undefined">
    <span v-if="$slots.icon" class="ym-tag__icon"><slot name="icon" /></span>
    <span :id="`${id}-text`" class="ym-tag__text"><slot>{{ props.content }}</slot></span>
    <YmButton v-if="props.closable" :id="`${id}-close`" class="ym-tag__close" variant="text" shape="square"
      :disabled="props.disabled" :aria-label="props.closeLabel || '移除'"
      :aria-labelledby="props.closeLabel ? undefined : `${id}-close ${id}-text`"
      @click.stop="emit('close', $event)">
      <template #icon><YmIcon name="close" /></template>
    </YmButton>
  </span>
</template>
