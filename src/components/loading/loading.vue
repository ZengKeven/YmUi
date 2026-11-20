<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed, ref, shallowRef, useTemplateRef, watch, watchPostEffect, type CSSProperties } from 'vue'
import { YmIcon } from '../icon'
import loadingProps from './props'

defineOptions({ name: 'YmLoading' })
const props = defineProps(loadingProps)
const slots = defineSlots<{ default?: () => unknown }>()
const origin = useTemplateRef<HTMLElement>('origin')
const visible = ref(false)
const wrapped = computed(() => !props.fullscreen && Boolean(slots.default || props.default || props.content))

watch([() => props.loading, () => props.delay], ([loading, delay], _, onCleanup) => {
  visible.value = loading && !(delay > 0)
  if (loading && delay > 0) {
    const timer = setTimeout(() => { visible.value = true }, delay)
    onCleanup(() => clearTimeout(timer))
  }
}, { immediate: true })

const target = computed(() => {
  if (!visible.value || !origin.value || wrapped.value) return null
  const doc = origin.value.ownerDocument
  const attach = props.attach
  if (!attach) return props.fullscreen ? doc.body : null
  if (typeof attach === 'string') return doc.querySelector(attach)
  const node = typeof attach === 'function' ? attach(origin.value) : attach
  return node instanceof Document ? node.body : node
})

// 挂载到外部元素时，从原位置同步继承的字体与主题色。
const portalStyle = shallowRef<CSSProperties>()
watchPostEffect(onCleanup => {
  const source = origin.value
  if (!source || !target.value) {
    portalStyle.value = undefined
    return
  }
  const sync = () => {
    const style = getComputedStyle(source)
    portalStyle.value = {
      colorScheme: style.colorScheme,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      '--ym-loading-parent-color': style.color,
      '--ym-color-primary': style.getPropertyValue('--ym-color-primary'),
      '--ym-color-surface': style.getPropertyValue('--ym-color-surface'),
    }
  }
  sync()
  const observer = new MutationObserver(sync)
  for (let el: Element | null = source; el; el = el.parentElement) {
    observer.observe(el, { attributes: true })
  }
  const preference = window.matchMedia('(prefers-color-scheme: dark)')
  preference.addEventListener('change', sync)
  onCleanup(() => {
    observer.disconnect()
    preference.removeEventListener('change', sync)
  })
})
</script>

<template>
  <span
    ref="origin"
    class="ym-loading-origin"
    :class="{ 'ym-loading-origin--wrapped': wrapped }"
    :aria-busy="wrapped ? props.loading : undefined"
  >
    <slot><template v-if="wrapped">{{ props.default || props.content }}</template></slot>
    <Teleport :to="target ?? 'body'" :disabled="!target">
      <span
        v-if="visible"
        class="ym-loading"
        :class="{
          'ym-loading--inherit': props.inheritColor,
          'ym-loading--fullscreen': props.fullscreen,
          'ym-loading--attached': target && !props.fullscreen,
          'ym-loading--covered': wrapped,
          'ym-loading--overlay': props.fullscreen || (props.showOverlay && (wrapped || target)),
          'ym-loading--lock': props.fullscreen && props.preventScrollThrough,
        }"
        :style="[portalStyle, { zIndex: props.zIndex }]"
        role="status"
        :aria-label="props.text ? undefined : '加载中'"
      >
        <YmIcon v-if="props.indicator === true" class="ym-loading__spinner" name="loading"
          :size="props.size || 'var(--ym-loading-size, 1em)'" />
        <template v-else-if="props.indicator">{{ props.indicator }}</template>
        <template v-if="props.text">{{ props.text }}</template>
      </span>
    </Teleport>
  </span>
</template>
