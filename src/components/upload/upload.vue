<script setup lang="ts" vapor>
import { useTemplateRef } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import { YmLoading } from '../loading'
import uploadProps from './props'
import { useUpload, type UploadEvents } from './use-upload'

defineOptions({ name: 'YmUpload' })
const props = defineProps(uploadProps)
const emit = defineEmits<UploadEvents>()
defineSlots<{ trigger?: () => unknown }>()
const input = useTemplateRef<HTMLInputElement>('input')
const { disabled, entries, configured, canChoose, canUpload, message, dragDepth, choose, upload, uploadFiles, changeInput, dragEvent, remove } =
  useUpload(props, emit, input)

function downloadable(url?: string) {
  if (!url) return false
  const address = URL.parse(url, 'https://upload.invalid/')
  return address && ['https:', 'http:', 'blob:'].includes(address.protocol)
}
defineExpose({ choose, uploadFiles })
</script>

<template>
  <div class="ym-upload ym-theme" :data-size="props.size"
    :data-dragging="props.draggable && !disabled && dragDepth > 0 || undefined"
    @dragover="dragEvent" @dragenter="dragEvent" @dragleave="dragEvent" @drop="dragEvent">
    <input ref="input" type="file" hidden :accept="props.accept || undefined" :multiple="props.multiple" :disabled="disabled" @change="changeInput" />
    <div class="ym-upload__controls">
      <YmButton class="ym-upload__trigger" theme="primary" variant="outline" :disabled="disabled || !canChoose" @click="choose">
        <template #icon><YmIcon name="upload" /></template>
        <slot name="trigger">{{ !props.multiple && entries.length ? '重新选择' : '上传文件' }}</slot>
      </YmButton>
      <YmButton v-if="!props.autoUpload && canUpload" :disabled="disabled" @click="uploadFiles">开始上传</YmButton>
      <span v-if="!entries.length && props.placeholder" class="ym-upload__placeholder">{{ props.placeholder }}</span>
    </div>
    <ul v-if="entries.length" class="ym-upload__list" aria-label="文件列表">
      <li v-for="(entry, index) in entries" :key="entry.key" class="ym-upload__item" :data-status="entry.status">
        <YmIcon name="file" />
        <a v-if="downloadable(entry.file.url)" class="ym-upload__name" :href="entry.file.url" :title="entry.file.name"
          target="_blank" rel="noopener noreferrer">{{ entry.file.name }}</a>
        <span v-else class="ym-upload__name" :title="entry.file.name">{{ entry.file.name }}</span>
        <span v-if="entry.status" class="ym-upload__status" role="status">
          <template v-if="entry.status === 'progress'"><YmLoading /> 上传中{{ props.showUploadProgress ? ' ' + entry.percent + '%' : '' }}</template>
          <template v-else-if="entry.status === 'fail'">{{ entry.file.response?.error || '上传失败' }}</template>
          <template v-else-if="entry.status === 'success'">已上传</template>
          <template v-else>{{ configured ? '待上传' : '已选择' }}</template>
        </span>
        <template v-if="!disabled">
          <YmButton v-if="entry.status === 'fail' && entry.file.raw && configured" shape="square" variant="text" theme="primary"
            :aria-label="'重试 ' + entry.file.name" title="重试" @click="upload(entry.file)"><YmIcon name="refresh" /></YmButton>
          <YmButton shape="square" variant="text" theme="default" :aria-label="'删除 ' + entry.file.name"
            title="删除" @click="remove(entry.file, index)"><YmIcon name="close" /></YmButton>
        </template>
      </li>
    </ul>
    <p v-if="message" class="ym-upload__message" role="alert">{{ message }}</p>
  </div>
</template>
