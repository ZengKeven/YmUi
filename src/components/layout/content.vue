<script setup lang="ts" vapor>
import { computed, ref, useId, useTemplateRef, watch } from 'vue'
import type { LayoutProps } from './types'

defineOptions({ name: 'YmLayoutContent' })
const props = defineProps<Pick<LayoutProps, 'showWatermark' | 'watermarkText'>>()
const lines = computed(() => {
  if (!props.showWatermark) return []
  const text = props.watermarkText ?? '内部使用'
  const rows = (typeof text === 'string' ? [text] : text).flatMap(line => line.split(/\r\n|\r|\n/))
  return rows.some(line => line.trim()) ? rows : []
})

const patternId = `ym-layout-watermark-${useId()}`
const lettering = useTemplateRef<SVGTextElement>('lettering')
const tileWidth = ref(160)
const lineHeight = 22
const tileHeight = computed(() => 48 + lines.value.length * lineHeight)

// 根据实际字体和最长一行调整平铺间距，避免文字在图案边界被截断。
watch(lettering, (text, _, onCleanup) => {
  if (!text) return
  const observer = new ResizeObserver(([entry]) => {
    tileWidth.value = Math.max(160, Math.ceil(entry.contentRect.width) + 64)
  })
  observer.observe(text)
  onCleanup(() => observer.disconnect())
}, { flush: 'post' })
</script>

<template>
  <div class="ym-layout__content-area">
    <main class="ym-layout__content"><slot /></main>
    <svg v-if="lines.length" class="ym-layout__watermark" aria-hidden="true" focusable="false">
      <defs>
        <pattern :id="patternId" patternUnits="userSpaceOnUse" :width="tileWidth" :height="tileHeight" patternTransform="rotate(-22)">
          <text ref="lettering" fill="currentColor" text-anchor="middle">
            <tspan v-for="(line, index) in lines" :key="index" :x="tileWidth / 2" :y="40 + index * lineHeight">{{ line }}</tspan>
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" :fill="`url(#${patternId})`" />
    </svg>
  </div>
</template>
