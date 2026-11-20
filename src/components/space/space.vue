<script setup lang="ts" vapor>
import { computed, useTemplateRef } from 'vue'
import spaceProps from './props'
import { useSpaceSeparators } from './separators'
import type { SpaceSize } from './types'

defineOptions({ name: 'YmSpace' })
const props = defineProps(spaceProps)
const slots = defineSlots<{ default?: () => unknown; separator?: () => unknown }>()
const root = useTemplateRef<HTMLDivElement>('root')
const separators = useSpaceSeparators(root, () => Boolean(slots.separator || props.separator))

const presets = new Map([['extra-small', '4px'], ['small', '8px'], ['medium', '16px'], ['large', '24px']])
function gapValue(size: SpaceSize) {
  return typeof size === 'number' ? `${size}px` : presets.get(size) ?? size
}
const gap = computed(() => {
  const size = props.size
  if (size == null) return undefined
  if (typeof size === 'object') return size.map(gapValue).join(' ')
  return gapValue(size)
})
</script>

<template>
  <div ref="root" class="ym-space" :data-direction="props.direction" :data-align="props.align"
    :class="{ 'ym-space--wrap': props.breakLine && props.direction === 'horizontal' }" :style="{ gap }">
    <slot />
    <Teleport v-for="separator in separators" :key="separator.id" :to="separator.host">
      <slot name="separator">{{ props.separator }}</slot>
    </Teleport>
  </div>
</template>
