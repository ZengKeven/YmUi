<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed, nextTick, provide, shallowRef, useTemplateRef, watch } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import { swiperKey } from './context'
import { useSwiperPlayback } from './playback'
import swiperProps from './props'
import type { SwiperChangeSource } from './types'

defineOptions({ name: 'YmSwiper' })
const props = defineProps(swiperProps)
const emit = defineEmits<{
  'update:current': [index: number]
  change: [index: number, context: { source: SwiperChangeSource }]
}>()
defineSlots<{
  default?: () => unknown
  navigation?: (scope: { current: number; total: number; goTo: (index: number) => void; prev: () => void; next: () => void }) => unknown
}>()

const viewport = useTemplateRef<HTMLElement>('viewport')
const items = shallowRef<HTMLElement[]>([])
const count = computed(() => items.value.length)
let switchDirection = 0
const { current, step, select, hovering, focused, playing, reducedMotion } = useSwiperPlayback(props, count, (index, source) => {
  if (source === 'autoplay') switchDirection = 1
  emit('update:current', index)
  emit('change', index, { source })
  if (source === 'autoplay') nextTick(() => { switchDirection = 0 })
})
provide(swiperKey, { items, current, loop: computed(() => props.loop) })
const nav = computed(() => props.navigation || {})
const vertical = computed(() => props.direction === 'vertical')
const height = computed(() => typeof props.height === 'number' ? props.height + 'px' : props.height)
const duration = computed(() => Number.isFinite(props.duration) ? Math.max(0, props.duration) : 0)

// Vapor 的条件和循环直接改变插槽 DOM；读取实际顺序也涵盖已有项的重排。
watch(viewport, (element, _, onCleanup) => {
  if (!element) return
  const sync = () => {
    items.value = Array.from(element.children).filter((item): item is HTMLElement =>
      item instanceof HTMLElement && item.classList.contains('ym-swiper__item'))
  }
  sync()
  const observer = new MutationObserver(sync)
  observer.observe(element, { childList: true })
  onCleanup(() => observer.disconnect())
}, { flush: 'post' })

function move(delta: number, source: SwiperChangeSource) {
  switchDirection = delta
  step(delta, source)
  nextTick(() => { switchDirection = 0 })
}
const prev = () => move(-1, 'click')
const next = () => move(1, 'click')
const goTo = (index: number) => select(index, 'click')

// 只对离开和进入的两个原始面板做动画，首尾循环也保留插槽实例及表单状态。
watch([() => items.value[current.value], () => props.type, () => props.animation, vertical, duration, reducedMotion],
  ([incoming, type, effect, isVertical, ms, reduce], [outgoing], onCleanup) => {
    const oldIndex = items.value.indexOf(outgoing)
    if (!incoming || !outgoing || incoming === outgoing || oldIndex < 0 || type === 'card' || !ms || reduce) return
    let direction = switchDirection || Math.sign(current.value - oldIndex)
    if (!switchDirection && props.loop && count.value > 2 && Math.abs(current.value - oldIndex) === count.value - 1) direction *= -1
    const axis = isVertical ? 'Y' : 'X'
    const center = effect === 'slide' ? { transform: `translate${axis}(0%)` } : { opacity: 1 }
    const offscreen = (sign: number) => effect === 'slide' ? { transform: `translate${axis}(${sign * 100}%)` } : { opacity: 0 }
    const options = { duration: ms, easing: 'ease-in-out' }
    const enter = incoming.animate([offscreen(direction), center], options)
    const leave = outgoing.animate([{ ...center, visibility: 'visible' }, { ...offscreen(-direction), visibility: 'visible' }], options)
    onCleanup(() => { enter.cancel(); leave.cancel() })
  }, { flush: 'post' })

function keydown(event: KeyboardEvent) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || count.value < 2) return
  const target = event.target as HTMLElement
  if (target !== event.currentTarget && (!target.matches('.ym-swiper__arrow, .ym-swiper__indicator') ||
    target.closest('.ym-swiper') !== event.currentTarget)) return
  if (event.key === (vertical.value ? 'ArrowUp' : 'ArrowLeft')) move(-1, 'keyboard')
  else if (event.key === (vertical.value ? 'ArrowDown' : 'ArrowRight')) move(1, 'keyboard')
  else if (event.key === 'Home') select(0, 'keyboard')
  else if (event.key === 'End') select(count.value - 1, 'keyboard')
  else return
  event.preventDefault()
}

let contact: Touch | undefined
function touchStart(event: TouchEvent) {
  const target = event.target as HTMLElement
  contact = event.touches.length === 1 && target.closest('.ym-swiper') === viewport.value?.parentElement &&
    !target.closest('input, select, textarea, [contenteditable="true"]') ? event.touches[0] : undefined
}
function touchEnd(event: TouchEvent) {
  const origin = contact
  contact = undefined
  if (!origin || event.touches.length) return
  const end = Array.from(event.changedTouches).find(touch => touch.identifier === origin.identifier)
  if (!end) return
  const dx = end.clientX - origin.clientX
  const dy = end.clientY - origin.clientY
  const distance = vertical.value ? dy : dx
  if (Math.abs(distance) <= 40 || Math.abs(distance) <= Math.abs(vertical.value ? dx : dy)) return
  if (event.cancelable) event.preventDefault()
  move(distance < 0 ? 1 : -1, 'touch')
}

function focusOut(event: FocusEvent) {
  focused.value = event.relatedTarget instanceof Node && (event.currentTarget as HTMLElement).contains(event.relatedTarget)
}
</script>

<template>
  <section class="ym-swiper ym-theme" role="region" aria-roledescription="轮播" aria-label="轮播框" tabindex="0"
    :data-size="props.size" :data-direction="props.direction" :data-animation="props.animation" :data-type="props.type"
    :data-placement="nav.placement ?? 'inside'" :data-arrows="nav.showSlideBtn ?? 'always'"
    :style="{ '--ym-swiper-height': height, '--ym-swiper-duration': duration + 'ms', '--ym-swiper-scale': props.cardScale }"
    @mouseenter="hovering = true" @mouseleave="hovering = false" @focusin="focused = true" @focusout="focusOut" @keydown="keydown">
    <div ref="viewport" class="ym-swiper__viewport" :aria-live="playing ? 'off' : 'polite'"
      @touchstart.passive="touchStart" @touchend="touchEnd" @touchcancel="contact = undefined">
      <slot />
    </div>
    <div v-if="props.navigation !== false && count > 1" class="ym-swiper__controls ym-theme" :data-size="nav.size">
      <div v-if="$slots.navigation" class="ym-swiper__navigation">
        <slot name="navigation" :current="current" :total="count" :goTo="goTo" :prev="prev" :next="next" />
      </div>
      <template v-else>
        <template v-if="nav.showSlideBtn !== 'never'">
          <YmButton class="ym-swiper__arrow ym-swiper__prev" shape="square" theme="default" aria-label="上一项"
            :disabled="!props.loop && current === 0" @click="prev"><YmIcon :name="vertical ? 'chevron-up' : 'chevron-left'" /></YmButton>
          <YmButton class="ym-swiper__arrow ym-swiper__next" shape="square" theme="default" aria-label="下一项"
            :disabled="!props.loop && current === count - 1" @click="next"><YmIcon :name="vertical ? 'chevron-down' : 'chevron-right'" /></YmButton>
        </template>
        <div class="ym-swiper__navigation" :data-nav-type="nav.type ?? 'bars'">
          <span v-if="nav.type === 'fraction'" class="ym-swiper__fraction">{{ current + 1 }} / {{ count }}</span>
          <button v-else v-for="n in count" :key="n" type="button" class="ym-swiper__indicator"
            :aria-label="`转到第 ${n} 项`" :aria-current="current === n - 1 || undefined"
            @pointerenter="props.trigger === 'hover' && $event.pointerType === 'mouse' && select(n - 1, 'hover')"
            @click="goTo(n - 1)"></button>
        </div>
      </template>
    </div>
  </section>
</template>
