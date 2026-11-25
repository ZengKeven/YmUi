<script setup lang="ts" vapor>
import { computed, onScopeDispose, ref, shallowReactive, useTemplateRef, watchEffect } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import { YmLoading } from '../loading'
import { useUpload, type UploadEvents } from '../upload/use-upload'
import type { UploadFileEvent } from '../upload/types'
import ImagePreview from './image-preview.vue'
import uploadProps from './props'
import type { ImageUploadFile } from './types'
import { acceptsImage } from './upload'

defineOptions({ name: 'YmImageUpload' })
const props = defineProps(uploadProps)
const emit = defineEmits<UploadEvents & { preview: [context: UploadFileEvent] }>()
defineSlots<{ trigger?: () => unknown }>()

const input = useTemplateRef<HTMLInputElement>('input')
const {
  disabled, files, entries, configured, canChoose, canUpload, message, dragDepth, keyFor,
  upload, uploadFiles, choose, changeInput, dragEvent, remove,
} = useUpload(props, emit, input, { acceptsFile: acceptsImage, replaceSingle: false, noun: '图片' })

const activeKey = ref('')
const urls = shallowReactive(new Map<File, string>())
const cards = computed(() => entries.value.map(entry => ({
  ...entry, name: entry.file.name, url: entry.file.url || (entry.file.raw && urls.get(entry.file.raw)) || '',
})))
const previews = computed(() => cards.value.filter(card => card.url))

watchEffect(() => {
  if (typeof window === 'undefined') return
  const needed = new Set<File>()
  for (const file of files.value) {
    if (file.raw && !file.url) {
      needed.add(file.raw)
      if (!urls.has(file.raw)) urls.set(file.raw, URL.createObjectURL(file.raw))
    }
  }
  for (const [file, url] of urls) {
    if (!needed.has(file)) {
      URL.revokeObjectURL(url)
      urls.delete(file)
    }
  }
  if (activeKey.value && !previews.value.some(item => item.key === activeKey.value)) activeKey.value = ''
})
onScopeDispose(() => {
  for (const url of urls.values()) URL.revokeObjectURL(url)
})

function preview(file: ImageUploadFile, index: number) {
  activeKey.value = keyFor(file)
  emit('preview', { file, index })
}
defineExpose({ choose, uploadFiles })
</script>

<template>
  <div class="ym-image-upload ym-theme" :data-size="props.size" :data-dragging="props.draggable && !disabled && dragDepth > 0 || undefined"
    @dragover="dragEvent" @dragenter="dragEvent" @dragleave="dragEvent" @drop="dragEvent">
    <input ref="input" type="file" hidden :multiple="props.multiple" :accept="props.accept" :disabled="disabled" @change="changeInput" />
    <div class="ym-image-upload__list">
      <div v-for="(card, index) in cards" :key="card.key" class="ym-image-upload__item">
        <div class="ym-image-upload__tile" :data-status="card.status">
          <img v-if="card.url" :src="card.url" :alt="card.name" />
          <span v-if="card.status === 'progress'" class="ym-image-upload__status" role="status">
            <YmLoading /><span>上传中{{ props.showUploadProgress ? ' ' + card.percent + '%' : '' }}</span>
          </span>
          <span v-else-if="card.status === 'fail'" class="ym-image-upload__status" role="status" :title="card.file.response?.error">
            <YmIcon name="error" /><span>{{ card.file.response?.error || '上传失败' }}</span>
          </span>
          <span v-else-if="!card.url" class="ym-image-upload__status"><YmIcon name="file-image" /></span>
          <span v-if="card.status === 'waiting' && configured" class="ym-image-upload__waiting">待上传</span>
          <button v-if="card.url" type="button" class="ym-image-upload__open" :aria-label="'预览 ' + card.name"
            @click="preview(card.file, index)"><YmIcon name="show-password" /></button>
          <span v-if="!disabled" class="ym-image-upload__actions">
            <YmButton v-if="card.status === 'fail' && card.file.raw && configured" variant="text" shape="square"
              :aria-label="'重试 ' + card.name" @click="upload(card.file)"><YmIcon name="refresh" /></YmButton>
            <YmButton variant="text" shape="square" :aria-label="'删除 ' + card.name" @click="remove(card.file, index)"><YmIcon name="delete" /></YmButton>
          </span>
        </div>
        <span v-if="props.showImageFileName" class="ym-image-upload__name" :title="card.name">{{ card.name }}</span>
      </div>
      <YmButton v-if="canChoose" class="ym-image-upload__add" variant="dashed" theme="default" :disabled="disabled"
        aria-label="上传图片" @click="choose"><slot name="trigger"><YmIcon name="add" /><span>上传图片</span></slot></YmButton>
    </div>
    <p v-if="message" class="ym-image-upload__message" role="alert">{{ message }}</p>
    <YmButton v-if="!props.autoUpload && canUpload" class="ym-image-upload__submit" :disabled="disabled" @click="uploadFiles">开始上传</YmButton>
    <ImagePreview v-if="activeKey" :active-key="activeKey" :items="previews" @navigate="activeKey = $event" @close="activeKey = ''" />
  </div>
</template>
