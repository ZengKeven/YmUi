<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed, inject, useTemplateRef } from 'vue'
import { swiperKey } from './context'

defineOptions({ name: 'YmSwiperItem' })
defineSlots<{ default?: () => unknown }>()
const swiper = inject(swiperKey)
if (!swiper) throw new Error('YmSwiperItem 需要放在 YmSwiper 内。')
const { items, current, loop } = swiper
const element = useTemplateRef<HTMLElement>('element')
const index = computed(() => element.value ? items.value.indexOf(element.value) : -1)
const selected = computed(() => index.value === current.value)
const offset = computed(() => {
  const distance = index.value - current.value
  const count = items.value.length
  if (loop.value && Math.abs(distance) > count / 2) return distance - Math.sign(distance) * count
  return distance
})
</script>

<template>
  <div ref="element" class="ym-swiper__item" role="group" aria-roledescription="轮播项"
    :aria-label="`第 ${index + 1} 项，共 ${items.length} 项`" :aria-hidden="!selected" :inert="!selected"
    :data-offset="offset">
    <slot />
  </div>
</template>
