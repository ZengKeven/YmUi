<script setup lang="ts" vapor>
import { ref, watch } from 'vue'
import { YmImageUpload, YmSwitch, type ControlSize, type ImageUploadFile, type ImageUploadProps } from '../../src'
import calendarImage from './assets/delivery-calendar.png'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const files = ref<ImageUploadFile[]>([{ name: '配送日历.png', url: calendarImage }])
const multiple = ref(true)
const max = ref(3)
const size = ref<ControlSize>()
const autoUpload = ref(true)
const draggable = ref(false)
const showImageFileName = ref(true)
const disabled = ref(false)

watch(multiple, enabled => {
  if (!enabled && files.value.length > 1) files.value = files.value.slice(0, 1)
})

// 演示只在浏览器内读取所选图片，返回可预览的地址。
const readImage: NonNullable<ImageUploadProps['requestMethod']> = (file, { signal, onProgress }) =>
  new Promise((resolve, reject) => {
    if (!file.raw) return resolve({ status: 'fail', error: '请选择本地图片' })
    signal.throwIfAborted()
    const reader = new FileReader()
    const abort = () => reader.abort()
    signal.addEventListener('abort', abort, { once: true })
    reader.onloadend = () => signal.removeEventListener('abort', abort)
    reader.onabort = () => reject(signal.reason)
    reader.onerror = () => reject(reader.error)
    reader.onprogress = event => {
      if (event.lengthComputable && event.total) onProgress(Math.round(event.loaded * 100 / event.total))
    }
    reader.onload = () => resolve({ status: 'success', response: { url: String(reader.result) } })
    reader.readAsDataURL(file.raw)
  })
</script>

<template>
  <PreviewFrame name="YmImageUpload">
    <template #preview>
      <YmImageUpload v-model="files" :multiple="multiple" :max="max" :size="size"
        :auto-upload="autoUpload" :request-method="readImage" :draggable="draggable"
        :show-image-file-name="showImageFileName" :disabled="disabled" />
    </template>
    <template #controls>
      <label>允许多张 <YmSwitch v-model="multiple" /></label>
      <label v-if="multiple">最多张数
        <select v-model="max">
          <option :value="2">2 张</option><option :value="3">3 张</option><option :value="0">不限</option>
        </select>
      </label>
      <label>组件尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>显示图片名称 <YmSwitch v-model="showImageFileName" /></label>
      <label>拖放图片 <YmSwitch v-model="draggable" /></label>
      <label>自动上传 <YmSwitch v-model="autoUpload" /></label>
      <label>禁用 <YmSwitch v-model="disabled" /></label>
    </template>
  </PreviewFrame>
</template>
