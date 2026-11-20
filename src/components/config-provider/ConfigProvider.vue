<script setup lang="ts" vapor>
import { computed, type CSSProperties } from 'vue'
import type { ConfigProviderProps } from './types'

defineOptions({ name: 'YmConfigProvider' })
const props = defineProps<ConfigProviderProps>()

const variables = computed(() => {
  const style: CSSProperties = {}
  for (const mode of ['light', 'dark'] as const) {
    for (const [name, color] of Object.entries(props.theme?.[mode] ?? {})) {
      const token = name === 'onAccent' ? 'on-accent' : name
      style[`--ym-${mode}-${token}`] = color
    }
  }
  if (props.radius != null) {
    style['--ym-radius'] = typeof props.radius === 'number' ? `${props.radius}px` : props.radius
  }
  return style
})
</script>

<template>
  <div class="ym-theme" :data-theme="mode" :data-size="size" :data-ym-palette="theme ? '' : undefined" :style="variables">
    <slot />
  </div>
</template>
