<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed, ref, shallowRef, useTemplateRef, watch, watchPostEffect } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import { YmLoading } from '../loading'
import { createDrawing, paintCanvas } from './drawing'
import { encodeQRCode } from './encode'
import qrCodeProps from './props'
import type { QRCodeStatus } from './types'

defineOptions({ name: 'YmQRCode' })
const props = defineProps(qrCodeProps)
const emit = defineEmits<{ refresh: [] }>()
defineSlots<{ 'status-render'?: (info: { status: QRCodeStatus; onRefresh: () => void }) => unknown }>()

const root = useTemplateRef<HTMLElement>('root')
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const image = shallowRef<HTMLImageElement | null>(null)
const displaySize = ref(160)
const pixelRatio = ref(1)
const ink = ref('currentColor')
const paper = ref('var(--ym-color-surface)')
const cells = computed(() => {
  if (!props.value) return null
  try {
    return encodeQRCode(props.value, props.level)
  } catch (error) {
    if (error instanceof RangeError) return null
    throw error
  }
})
const drawing = computed(() => cells.value && createDrawing(cells.value, displaySize.value,
  image.value ? props.iconSize : undefined))

watch([root, () => props.icon], ([element, src], _, onCleanup) => {
  image.value = null
  if (!element || !src) return
  const loader = new Image()
  loader.crossOrigin = 'anonymous'
  loader.onload = () => { image.value = loader }
  onCleanup(() => { loader.onload = null })
  loader.src = src
}, { flush: 'post' })

// Canvas 位图和独立 SVG 都需要实际颜色。运行时同步祖先主题、系统模式与显示尺寸。
watch(root, (element, _, onCleanup) => {
  if (!element) return
  const sync = () => {
    const css = getComputedStyle(element)
    ink.value = css.color
    paper.value = css.backgroundColor
    if (element.clientWidth) displaySize.value = element.clientWidth
    pixelRatio.value = window.devicePixelRatio || 1
  }
  sync()
  const resize = new ResizeObserver(sync)
  resize.observe(element)
  const theme = new MutationObserver(sync)
  for (let node: Element | null = element; node; node = node.parentElement) {
    theme.observe(node, { attributes: true, attributeFilter: ['style', 'class', 'data-theme', 'data-ym-palette', 'data-size'] })
  }
  const preference = window.matchMedia('(prefers-color-scheme: dark)')
  preference.addEventListener('change', sync)
  window.addEventListener('resize', sync)
  onCleanup(() => {
    resize.disconnect()
    theme.disconnect()
    preference.removeEventListener('change', sync)
    window.removeEventListener('resize', sync)
  })
}, { flush: 'post' })

watchPostEffect(() => {
  if (canvas.value && drawing.value) {
    paintCanvas(canvas.value, drawing.value, displaySize.value * pixelRatio.value, ink.value, paper.value, image.value)
  }
})

function refresh() { emit('refresh') }
</script>

<template>
  <div ref="root" class="ym-qrcode ym-theme" :data-size="typeof props.size === 'string' ? props.size : undefined"
    :data-status="props.status" :data-borderless="props.borderless || undefined"
    :style="{ '--ym-qrcode-size': typeof props.size === 'number' ? props.size + 'px' : undefined,
      color: props.color, backgroundColor: props.bgColor }">
    <template v-if="drawing">
      <canvas v-if="props.type === 'canvas'" ref="canvas" class="ym-qrcode__code" role="img"
        :aria-label="String($attrs['aria-label'] ?? '二维码')" :aria-hidden="props.status !== 'active' || undefined"></canvas>
      <svg v-else class="ym-qrcode__code" role="img" xmlns="http://www.w3.org/2000/svg"
        :aria-label="String($attrs['aria-label'] ?? '二维码')" :aria-hidden="props.status !== 'active' || undefined"
        :width="displaySize" :height="displaySize" :viewBox="`0 0 ${drawing.side} ${drawing.side}`">
        <rect width="100%" height="100%" :fill="paper" />
        <path :d="drawing.path" :fill="ink" shape-rendering="crispEdges" />
        <image v-if="drawing.icon && image" :href="image.src" v-bind="drawing.icon" preserveAspectRatio="none" />
      </svg>
    </template>
    <span v-else-if="props.status === 'active'" class="ym-qrcode__message" role="status">
      {{ props.value ? '内容超出二维码容量' : '暂无二维码' }}
    </span>
    <div v-if="props.status !== 'active'" class="ym-qrcode__mask">
      <slot name="status-render" :status="props.status" :onRefresh="refresh">
        <YmLoading v-if="props.status === 'loading'" text="加载中" />
        <template v-else-if="props.status === 'expired'">
          <span role="status">二维码已过期</span>
          <YmButton v-if="props.onRefresh" variant="text" theme="primary" @click="refresh">
            <template #icon><YmIcon name="refresh" /></template>点击刷新
          </YmButton>
        </template>
        <span v-else class="ym-qrcode__scanned" role="status"><YmIcon name="success" />已扫描</span>
      </slot>
    </div>
  </div>
</template>
