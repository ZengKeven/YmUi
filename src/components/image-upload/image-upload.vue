<script setup lang="ts" vapor>
import { computed, nextTick, onScopeDispose, ref, shallowReactive, shallowRef, toRaw, useId, useTemplateRef, watchEffect } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import { YmLoading } from '../loading'
import ImagePreview from './image-preview.vue'
import uploadProps from './props'
import type { ImageUploadFile, ImageUploadResult } from './types'
import { acceptsImage, maxBytes, postImage } from './upload'

defineOptions({ name: 'YmImageUpload' })
const props = defineProps(uploadProps)
type FileEvent = { file: ImageUploadFile; index: number }
type Validation = { file: File; reason: 'type' | 'size' | 'max' }
const emit = defineEmits<{
  'update:modelValue': [files: ImageUploadFile[]]
  change: [files: ImageUploadFile[]]
  preview: [context: FileEvent]
  remove: [context: FileEvent]
  success: [context: FileEvent]
  fail: [context: FileEvent]
  progress: [context: { file: ImageUploadFile; percent: number }]
  validate: [context: Validation]
}>()
defineSlots<{ trigger?: () => unknown }>()

const input = useTemplateRef<HTMLInputElement>('input')
const local = shallowRef<ImageUploadFile[]>([...props.defaultValue])
const files = computed(() => props.modelValue ?? local.value)
const visibleFiles = computed(() => props.multiple ? files.value : files.value.slice(0, 1))
const limit = computed(() => props.multiple ? props.max || Infinity : 1)
const configured = computed(() => !!(props.requestMethod || props.action))
const message = ref('')
const dragDepth = ref(0)
const activeKey = ref('')
const prefix = useId()
let sequence = 0
const identities = new WeakMap<object, string>()
function keyFor(file: ImageUploadFile) {
  if (file.id != null) return 'id-' + file.id
  const identity = toRaw(file.raw ?? file)
  let key = identities.get(identity)
  if (!key) {
    key = 'file-' + ++sequence
    identities.set(identity, key)
  }
  return key
}

const urls = shallowReactive(new Map<File, string>())
const jobs = shallowReactive(new Map<string, { controller: AbortController; file: ImageUploadFile; percent: number }>())
const cards = computed(() => visibleFiles.value.map(file => {
  const key = keyFor(file)
  const job = jobs.get(key)
  return {
    file, key, name: file.name, url: file.url || (file.raw && urls.get(file.raw)) || '',
    status: job ? 'progress' : file.status, percent: job?.percent ?? file.percent ?? 0,
  }
}))
const previews = computed(() => cards.value.filter(card => card.url))
const canUpload = computed(() => configured.value && cards.value.some(({file, status}) =>
  file.raw && (status === 'waiting' || status === 'fail')))

watchEffect(() => {
  if (typeof window === 'undefined') return
  const needed = new Set<File>()
  const current = new Map<string, ImageUploadFile>()
  for (const file of files.value) {
    current.set(keyFor(file), file)
    if (file.raw && !file.url) {
      needed.add(file.raw)
      if (!urls.has(file.raw)) urls.set(file.raw, URL.createObjectURL(file.raw))
    }
  }
  for (const [file, url] of urls) {
    if (!needed.has(file)) { URL.revokeObjectURL(url); urls.delete(file) }
  }
  for (const [key, job] of jobs) {
    const file = current.get(key)
    if (!file || file.raw !== job.file.raw || file.status !== job.file.status) cancel(key)
  }
  if (activeKey.value && !previews.value.some(item => item.key === activeKey.value)) activeKey.value = ''
})
let disposed = false
onScopeDispose(() => {
  disposed = true
  for (const key of jobs.keys()) cancel(key)
  for (const url of urls.values()) URL.revokeObjectURL(url)
})

function publish(next: ImageUploadFile[]) {
  if (props.modelValue === undefined) local.value = next
  emit('update:modelValue', next)
  emit('change', next)
}

function cancel(key: string) {
  const job = jobs.get(key)
  jobs.delete(key)
  job?.controller.abort()
}

// 同一轮完成的并发请求要依次合并到父级最新确认的列表。
let commits = Promise.resolve()
async function upload(file: ImageUploadFile) {
  const key = keyFor(file)
  if (disposed || props.disabled || !file.raw || !configured.value || jobs.has(key)) return
  const job = shallowReactive({ file, controller: new AbortController(), percent: 0 })
  jobs.set(key, job)
  const context = {
    signal: job.controller.signal,
    onProgress(value: number) {
      if (jobs.get(key) !== job || !Number.isFinite(value)) return
      job.percent = Math.min(100, Math.max(0, Math.round(value)))
      emit('progress', { file: { ...file, status: 'progress', percent: job.percent }, percent: job.percent })
    },
  }
  let result: ImageUploadResult
  try {
    result = props.requestMethod ? await props.requestMethod(file, context) : await postImage(file, props, context)
  } catch (error) {
    result = { status: 'fail', error: error instanceof Error ? error.message : '上传失败' }
  }
  commits = commits.then(async () => {
    await nextTick()
    if (jobs.get(key) !== job) return
    jobs.delete(key)
    const index = files.value.findIndex(item => keyFor(item) === key && item.raw === file.raw)
    if (index < 0) return
    const failed = result?.status !== 'success' || !!(result.error || result.response?.error)
    const updated: ImageUploadFile = failed
      ? { ...files.value[index], status: 'fail', percent: job.percent,
        response: { ...result?.response, error: result?.error || result?.response?.error || '上传失败' } }
      : { ...files.value[index], status: 'success', percent: 100, response: result.response, url: result.response?.url || file.url }
    const next = files.value.slice()
    next[index] = updated
    publish(next)
    const event = { file: updated, index }
    if (failed) emit('fail', event)
    else emit('success', event)
  })
  return commits
}

function uploadFiles() {
  return Promise.all(visibleFiles.value.filter(file => file.status === 'waiting' || file.status === 'fail').map(upload))
}

async function select(selection: File[]) {
  if (props.disabled || !selection.length) return
  message.value = ''
  const added: ImageUploadFile[] = []
  for (const raw of selection) {
    let reason: Validation['reason'] | undefined
    if (!acceptsImage(raw, props.accept)) reason = 'type'
    else if (raw.size > maxBytes(props.sizeLimit)) reason = 'size'
    else if (files.value.length + added.length >= limit.value) reason = 'max'
    if (reason) {
      message.value = reason === 'max' ? `最多可选择 ${limit.value} 张图片`
        : raw.name + (reason === 'type' ? ' 的图片格式不支持' : ' 超过大小限制')
      emit('validate', { file: raw, reason })
      continue
    }
    added.push({ id: `${prefix}-${++sequence}`, name: raw.name, raw, size: raw.size, type: raw.type, status: 'waiting' })
  }
  if (!added.length) return
  publish([...files.value, ...added])
  await nextTick()
  if (props.autoUpload && configured.value) {
    const ids = new Set(added.map(keyFor))
    for (const file of files.value) {
      if (ids.has(keyFor(file)) && file.status === 'waiting') void upload(file)
    }
  }
}

function choose() {
  if (!props.disabled && files.value.length < limit.value) input.value?.click()
}
function changeInput(event: Event) {
  const field = event.currentTarget as HTMLInputElement
  const selection = Array.from(field.files ?? [])
  field.value = ''
  void select(selection)
}
function remove(file: ImageUploadFile, index: number) {
  if (props.disabled) return
  message.value = ''
  publish(files.value.filter((_, i) => i !== index))
  emit('remove', { file, index })
}
function preview(file: ImageUploadFile, index: number) {
  activeKey.value = keyFor(file)
  emit('preview', { file, index })
}
function dragEvent(event: DragEvent) {
  if (!props.draggable || !event.dataTransfer?.types.includes('Files')) return
  event.preventDefault()
  if (props.disabled) return
  if (event.type === 'dragenter') dragDepth.value++
  if (event.type === 'dragleave') dragDepth.value = Math.max(0, dragDepth.value - 1)
  if (event.type === 'drop') {
    dragDepth.value = 0
    void select(Array.from(event.dataTransfer.files))
  }
}
defineExpose({ choose, uploadFiles })
</script>

<template>
  <div class="ym-image-upload ym-theme" :data-size="props.size" :data-dragging="props.draggable && !props.disabled && dragDepth > 0 || undefined"
    @dragover="dragEvent" @dragenter="dragEvent" @dragleave="dragEvent" @drop="dragEvent">
    <input ref="input" type="file" hidden :multiple="props.multiple" :accept="props.accept" :disabled="props.disabled" @change="changeInput" />
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
          <span v-if="!props.disabled" class="ym-image-upload__actions">
            <YmButton v-if="card.status === 'fail' && card.file.raw && configured" variant="text" shape="square"
              :aria-label="'重试 ' + card.name" @click="upload(card.file)"><YmIcon name="refresh" /></YmButton>
            <YmButton variant="text" shape="square" :aria-label="'删除 ' + card.name" @click="remove(card.file, index)"><YmIcon name="delete" /></YmButton>
          </span>
        </div>
        <span v-if="props.showImageFileName" class="ym-image-upload__name" :title="card.name">{{ card.name }}</span>
      </div>
      <YmButton v-if="files.length < limit" class="ym-image-upload__add" variant="dashed" theme="default" :disabled="props.disabled"
        aria-label="上传图片" @click="choose"><slot name="trigger"><YmIcon name="add" /><span>上传图片</span></slot></YmButton>
    </div>
    <p v-if="message" class="ym-image-upload__message" role="alert">{{ message }}</p>
    <YmButton v-if="!props.autoUpload && canUpload" class="ym-image-upload__submit" :disabled="props.disabled" @click="uploadFiles">开始上传</YmButton>
    <ImagePreview v-if="activeKey" :active-key="activeKey" :items="previews" @navigate="activeKey = $event" @close="activeKey = ''" />
  </div>
</template>
