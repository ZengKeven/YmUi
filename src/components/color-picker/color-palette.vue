<script setup lang="ts" vapor>
import { computed, nextTick, useTemplateRef } from 'vue'
import { Color, genGradientPoint } from './color'
import ChannelInput from './channel-input.vue'

const props = defineProps<{
  color: Color
  disabled: boolean
  enableAlpha: boolean
  enableMultipleGradient: boolean
  showPrimaryColorPreview: boolean
}>()
const emit = defineEmits<{
  saturation: [saturation: number, brightness: number]
  hue: [value: number]
  alpha: [value: number]
  degree: [value: number]
  selectStop: [id: string]
  stops: [points: ReturnType<typeof genGradientPoint>[], selected: string]
}>()
const track = useTemplateRef<HTMLElement>('track')
const sortedStops = computed(() => props.color.gradientColors.slice().sort((a, b) => a.left - b.left))
const trackColor = computed(() => `linear-gradient(90deg, ${sortedStops.value.map(p => `${p.color} ${p.left}%`).join(', ')})`)
let dragStop: { id: string; pointer: number; startX: number } | null = null

function clamp(value: number, max = 1) {
  return Math.min(max, Math.max(0, value))
}

function pointAt(event: PointerEvent, start: boolean) {
  const field = event.currentTarget as HTMLElement
  if (props.disabled || !event.isPrimary) return
  if (start) {
    if (event.button !== 0) return
    field.setPointerCapture(event.pointerId)
  } else if (!field.hasPointerCapture(event.pointerId)) return
  const { left, top, width, height } = field.getBoundingClientRect()
  if (!width || !height) return
  const saturation = Math.round(100 * clamp((event.clientX - left) / width)) / 100
  const brightness = Math.round(100 * clamp(1 - (event.clientY - top) / height)) / 100
  emit('saturation', saturation, brightness)
}

function keySaturation(event: KeyboardEvent) {
  if (props.disabled) return
  const step = event.shiftKey ? .1 : .01
  const { saturation, value } = props.color
  switch (event.key) {
    case 'ArrowLeft': emit('saturation', clamp(saturation - step), value); break
    case 'ArrowRight': emit('saturation', clamp(saturation + step), value); break
    case 'ArrowUp': emit('saturation', saturation, clamp(value + step)); break
    case 'ArrowDown': emit('saturation', saturation, clamp(value - step)); break
    default: return
  }
  event.preventDefault()
}

function stopPosition(event: PointerEvent) {
  const { left, width } = track.value!.getBoundingClientRect()
  return width ? Math.round(clamp((event.clientX - left) / width) * 10000) / 100 : 0
}

async function focusStop(id: string) {
  await nextTick()
  const button = Array.from(track.value?.querySelectorAll<HTMLElement>('[data-stop]') ?? [])
    .find(element => element.dataset.stop === id)
  button?.focus({ preventScroll: true })
}

function startStop(event: PointerEvent) {
  if (props.disabled || !event.isPrimary || event.button !== 0 || !track.value) return
  let id = (event.target as Element).closest<HTMLElement>('[data-stop]')?.dataset.stop
  if (!id) {
    if (!props.enableMultipleGradient) return
    const newStop = genGradientPoint(stopPosition(event), props.color.rgba)
    id = newStop.id
    emit('stops', [...props.color.gradientColors, newStop], id)
    focusStop(id)
  } else if (id !== props.color.gradientSelectedId) emit('selectStop', id)
  dragStop = { id, pointer: event.pointerId, startX: event.clientX }
  track.value.setPointerCapture(event.pointerId)
}

function moveStop(id: string, left: number) {
  const stops = props.color.gradientColors.map(stop => stop.id === id ? { ...stop, left } : stop)
  emit('stops', stops, id)
}

function drag(event: PointerEvent) {
  if (props.disabled || !dragStop || dragStop.pointer !== event.pointerId || dragStop.startX === event.clientX) return
  dragStop.startX = event.clientX
  moveStop(dragStop.id, stopPosition(event))
}

function keyStop(event: KeyboardEvent, id: string) {
  if (props.disabled) return
  const stops = sortedStops.value
  const index = stops.findIndex(p => p.id === id)
  if (index < 0) return
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    if (stops.length <= 2) return
    const rest = stops.filter(point => point.id !== id)
    const next = rest[Math.min(index, rest.length - 1)].id
    emit('stops', rest, next)
    focusStop(next)
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    const step = event.shiftKey ? 10 : 1
    moveStop(id, clamp(stops[index].left + (event.key === 'ArrowLeft' ? -step : step), 100))
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (props.color.gradientSelectedId !== id) emit('selectStop', id)
  }
}
</script>

<template>
  <div v-if="props.color.isGradient" class="ym-color-picker__gradient">
    <div ref="track" class="ym-color-picker__gradient-track ym-color-picker__checker" :style="{ '--ym-gradient': trackColor }"
      @pointerdown="startStop" @pointermove="drag" @lostpointercapture="dragStop = null">
      <button v-for="(stop, i) in sortedStops" :key="stop.id" type="button" class="ym-color-picker__stop" role="slider"
        :data-stop="stop.id" :data-selected="stop.id === props.color.gradientSelectedId || undefined"
        :aria-label="`渐变色标 ${i + 1}`" :aria-valuenow="Math.round(stop.left)" :aria-valuemin="0" :aria-valuemax="100"
        :title="`${stop.color} ${stop.left}%`" :disabled="props.disabled" :style="{ left: stop.left + '%', background: stop.color }"
        @keydown="keyStop($event, stop.id)" />
    </div>
    <ChannelInput class="ym-color-picker__degree" label="渐变角度" :value="props.color.gradientDegree" :min="0" :max="360"
      unit="°" :disabled="props.disabled" @commit="emit('degree', Number($event))" />
    <span class="ym-color-picker__gradient-preview ym-color-picker__checker" aria-hidden="true">
      <span :style="{ background: props.color.linearGradient }" />
    </span>
  </div>
  <div class="ym-color-picker__saturation" role="slider" aria-label="饱和度与亮度" :aria-disabled="props.disabled || undefined"
    :aria-valuemin="0" :aria-valuemax="100" :aria-valuenow="Math.round(props.color.saturation * 100)"
    :aria-valuetext="`饱和度 ${Math.round(props.color.saturation * 100)}%，亮度 ${Math.round(props.color.value * 100)}%`"
    :tabindex="props.disabled ? -1 : 0" :style="{ backgroundColor: `hsl(${props.color.hue}, 100%, 50%)` }"
    @pointerdown="pointAt($event, true)" @pointermove="pointAt($event, false)" @keydown="keySaturation">
    <span class="ym-color-picker__thumb" :style="{ left: props.color.saturation * 100 + '%', top: (1 - props.color.value) * 100 + '%', background: props.color.rgb }" />
  </div>
  <div class="ym-color-picker__sliders">
    <div class="ym-color-picker__bars">
      <input type="range" min="0" max="360" step="1" aria-label="色相" class="ym-color-picker__hue"
        :value="props.color.hue" :disabled="props.disabled" :style="{ '--ym-thumb': `hsl(${props.color.hue}, 100%, 50%)` }"
        @input="emit('hue', ($event.target as HTMLInputElement).valueAsNumber)" />
      <input v-if="props.enableAlpha" type="range" min="0" max="100" step="1" aria-label="透明度"
        class="ym-color-picker__alpha ym-color-picker__checker" :value="Math.round(props.color.alpha * 100)" :disabled="props.disabled"
        :style="{ '--ym-thumb': props.color.rgba, '--ym-alpha-color': props.color.rgb }"
        @input="emit('alpha', ($event.target as HTMLInputElement).valueAsNumber / 100)" />
    </div>
    <span v-if="props.showPrimaryColorPreview" class="ym-color-picker__preview ym-color-picker__checker" aria-label="当前颜色预览">
      <span :style="{ background: props.color.css }" />
    </span>
  </div>
</template>
