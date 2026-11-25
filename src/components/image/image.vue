<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { YmIcon } from '../icon'
import ImagePreview from '../image-upload/image-preview.vue'
import { YmLoading } from '../loading'
import imageProps from './props'

defineOptions({ name: 'YmImage' })
const props = defineProps(imageProps)
const emit = defineEmits<{ load: [context: { e: Event }]; error: [context: { e: Event }] }>()
defineSlots<{ loading?: () => unknown; error?: () => unknown }>()

const img = useTemplateRef<HTMLImageElement>('img')
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const objectUrl = ref('')
watch(() => props.src, (src, _, onCleanup) => {
  if (src && typeof src !== 'string' && typeof window !== 'undefined') {
    const url = URL.createObjectURL(src)
    objectUrl.value = url
    onCleanup(() => URL.revokeObjectURL(url))
  } else objectUrl.value = ''
}, { immediate: true })

const primary = computed(() => {
  const sources = Object.entries(props.srcset ?? {}).filter(([, url]) => url)
  const url = typeof props.src === 'string' ? props.src.trim() : objectUrl.value
  return { url: url || sources[0]?.[1], sources }
})
const primaryFailed = ref(false)
watch(primary, () => { primaryFailed.value = false }, { flush: 'sync' })
const request = computed(() => {
  const original = primary.value
  if (!primaryFailed.value && original.url) return original
  const alreadyTried = !original.sources.length && props.fallback === original.url
  return { url: alreadyTried ? '' : props.fallback, sources: [] }
})
const state = ref<'loading' | 'ready' | 'error'>('loading')
const loadedUrl = ref('')
const previewOpen = ref(false)
const requestId = ref(0)
watch(request, ({ url }) => {
  // 每次请求使用独立的 img，使旧请求的事件无法改变当前图片的状态。
  requestId.value++
  state.value = url ? 'loading' : 'error'
  loadedUrl.value = ''
  previewOpen.value = false
}, { immediate: true, flush: 'sync' })
watch(() => props.preview, enabled => { if (!enabled) previewOpen.value = false })

function load(e: Event) {
  const element = img.value
  if (!element || element !== e.currentTarget) return
  const url = element.currentSrc || element.src
  if (state.value === 'ready' && loadedUrl.value === url) return
  loadedUrl.value = url
  state.value = 'ready'
  emit('load', { e })
}

function fail(e: Event) {
  if (img.value !== e.currentTarget) return
  if (request.value === primary.value) primaryFailed.value = true
  else state.value = 'error'
  emit('error', { e })
}

onMounted(() => {
  // 服务端渲染的图片可能已在客户端接管前加载完成。
  const element = img.value
  if (state.value === 'loading' && element?.complete && element.currentSrc) {
    element.dispatchEvent(new Event(element.naturalWidth ? 'load' : 'error'))
  }
})

function openPreview() {
  if (!props.preview || state.value !== 'ready') return
  trigger.value?.focus({ preventScroll: true })
  previewOpen.value = true
}

function cssLength(value?: string | number) {
  if (value == null || value === '') return undefined
  return Number.isFinite(Number(value)) ? `${value}px` : value
}
</script>

<template>
  <div class="ym-image ym-theme" :data-shape="props.shape" :data-size="props.size"
    :data-preview="props.preview && state === 'ready' || undefined"
    :style="{ width: cssLength(props.width), height: cssLength(props.height) }">
    <picture v-if="state !== 'error'" :key="requestId" class="ym-image__picture" @click="openPreview">
      <source v-for="[type, url] in request.sources" :key="type" :type="type" :srcset="url" />
      <img ref="img" class="ym-image__img" :alt="props.alt" :loading="props.lazy ? 'lazy' : 'eager'"
        :referrerpolicy="props.referrerpolicy" :src="request.url || undefined"
        :style="{ objectFit: props.fit, objectPosition: props.position }" @load="load" @error="fail" />
    </picture>
    <div v-if="state === 'loading'" class="ym-image__status">
      <slot name="loading"><YmLoading text="加载中" /></slot>
    </div>
    <div v-else-if="state === 'error'" class="ym-image__status" role="status">
      <slot name="error"><YmIcon name="file-image" />图片加载失败</slot>
    </div>
    <button v-if="props.preview && state === 'ready'" ref="trigger" class="ym-image__open" type="button"
      :aria-label="props.alt ? '预览 ' + props.alt : '预览图片'" aria-haspopup="dialog" @click="openPreview">
      <YmIcon name="zoom-in" />
    </button>
    <ImagePreview v-if="props.preview && previewOpen && state === 'ready'" :active-key="loadedUrl"
      :items="[{ key: loadedUrl, name: props.alt || '图片预览', url: loadedUrl }]"
      :referrerpolicy="props.referrerpolicy" @close="previewOpen = false" />
  </div>
</template>
