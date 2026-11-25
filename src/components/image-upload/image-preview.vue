<script setup lang="ts" vapor>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'

const props = defineProps<{ items: { key: string; name: string; url: string }[]; activeKey: string }>()
const emit = defineEmits<{ close: []; navigate: [key: string] }>()
const index = computed(() => props.items.findIndex(item => item.key === props.activeKey))
const current = computed(() => props.items[index.value])
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const stage = useTemplateRef<HTMLElement>('stage')
const image = useTemplateRef<HTMLImageElement>('image')
const zoom = ref(100)
const angle = ref(0)
const offset = ref({ x: 0, y: 0 })
const failed = ref(false)
let drag: { pointerId: number; x: number; y: number; offsetX: number; offsetY: number } | undefined
let opener: Element | null = null

onMounted(() => {
  const element = dialog.value
  if (!element) return
  opener = element.ownerDocument.activeElement
  element.showModal()
})
onBeforeUnmount(() => {
  dialog.value?.close()
  if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true })
})

watch([() => props.activeKey, () => current.value?.url], () => {
  zoom.value = 100
  angle.value = 0
  failed.value = false
})
watch([zoom, angle, () => props.activeKey], () => {
  offset.value = { x: 0, y: 0 }
  drag = undefined
})

function navigate(step: number) {
  const next = index.value + step
  const target = props.items[next]
  if (!target) return
  const focused = dialog.value?.ownerDocument.activeElement
  const leavesPrevious = next === 0 && focused?.matches('.ym-image-upload__preview-prev')
  const leavesNext = next === props.items.length - 1 && focused?.matches('.ym-image-upload__preview-next')
  emit('navigate', target.key)
  // 到达首尾后当前按钮会禁用，将焦点交给仍可用的切图按钮。
  if (leavesPrevious || leavesNext) nextTick(() => {
    dialog.value?.querySelector<HTMLButtonElement>('.ym-image-upload__preview-stage button:not(:disabled)')?.focus()
  })
}

function keydown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || event.altKey) return
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  navigate(event.key === 'ArrowLeft' ? -1 : 1)
}

function startPan(event: PointerEvent) {
  if (!event.isPrimary || event.button !== 0) return
  if (zoom.value <= 100 && event.pointerType !== 'touch') return
  drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, offsetX: offset.value.x, offsetY: offset.value.y }
  image.value?.setPointerCapture(event.pointerId)
}

function pan(event: PointerEvent) {
  if (drag?.pointerId !== event.pointerId || zoom.value <= 100 || !image.value || !stage.value) return
  const rect = image.value.getBoundingClientRect()
  const maxX = Math.max(0, (rect.width - stage.value.clientWidth) / 2)
  const maxY = Math.max(0, (rect.height - stage.value.clientHeight) / 2)
  offset.value = {
    x: Math.max(-maxX, Math.min(maxX, drag.offsetX + event.clientX - drag.x)),
    y: Math.max(-maxY, Math.min(maxY, drag.offsetY + event.clientY - drag.y)),
  }
}

function endPan(event: PointerEvent) {
  if (drag?.pointerId !== event.pointerId) return
  const dx = event.clientX - drag.x
  const dy = event.clientY - drag.y
  drag = undefined
  if (event.pointerType === 'touch' && zoom.value === 100 && Math.abs(dx) > 48 && Math.abs(dx) > 2 * Math.abs(dy)) {
    navigate(dx < 0 ? 1 : -1)
  }
}
</script>

<template>
  <dialog ref="dialog" class="ym-image-upload__preview" aria-label="图片预览"
    @cancel.prevent="emit('close')" @click.self="emit('close')" @keydown="keydown">
    <div class="ym-image-upload__preview-header">
      <strong class="ym-image-upload__preview-name" :title="current?.name">{{ current?.name }}</strong>
      <span v-if="props.items.length > 1" class="ym-image-upload__preview-count" aria-live="polite">{{ index + 1 }} / {{ props.items.length }}</span>
      <YmButton type="button" variant="text" theme="default" shape="square" aria-label="关闭预览" title="关闭预览" @click="emit('close')">
        <YmIcon name="close" />
      </YmButton>
    </div>
    <div ref="stage" class="ym-image-upload__preview-stage" @click.self="emit('close')">
      <img v-if="current && !failed" :key="current.key" ref="image" class="ym-image-upload__preview-image"
        :src="current.url" :alt="current.name" draggable="false" :data-turned="angle % 180 !== 0 || undefined"
        :data-zoomed="zoom > 100 || undefined"
        :style="{ transform: `translate(${offset.x}px, ${offset.y}px) rotate(${angle}deg) scale(${zoom / 100})` }"
        @error="failed = true" @pointerdown="startPan" @pointermove="pan" @pointerup="endPan" @lostpointercapture="drag = undefined" />
      <span v-if="failed" role="status">图片加载失败</span>
      <template v-if="props.items.length > 1">
        <YmButton class="ym-image-upload__preview-prev" type="button" shape="square" theme="default"
          aria-label="上一张" title="上一张" :disabled="index <= 0" @click="navigate(-1)"><YmIcon name="chevron-left" /></YmButton>
        <YmButton class="ym-image-upload__preview-next" type="button" shape="square" theme="default"
          aria-label="下一张" title="下一张" :disabled="index >= props.items.length - 1" @click="navigate(1)"><YmIcon name="chevron-right" /></YmButton>
      </template>
    </div>
    <div class="ym-image-upload__preview-tools" role="group" aria-label="图片操作">
      <YmButton type="button" variant="text" theme="default" shape="square" aria-label="缩小" title="缩小"
        :disabled="failed || zoom <= 25" @click="zoom -= 25"><YmIcon name="zoom-out" /></YmButton>
      <span class="ym-image-upload__preview-scale">{{ zoom }}%</span>
      <YmButton type="button" variant="text" theme="default" shape="square" aria-label="放大" title="放大"
        :disabled="failed || zoom >= 400" @click="zoom += 25"><YmIcon name="zoom-in" /></YmButton>
      <YmButton type="button" variant="text" theme="default" shape="square" aria-label="旋转" title="顺时针旋转 90°"
        :disabled="failed" @click="angle = (angle + 90) % 360"><YmIcon name="redo" /></YmButton>
    </div>
  </dialog>
</template>
