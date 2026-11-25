<script setup lang="ts" vapor>
import { ref, watch } from 'vue'
import { YmSwitch, YmUpload, type ControlSize, type UploadFile, type UploadProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const files = ref<UploadFile[]>([])
const multiple = ref(false)
const max = ref(3)
const accept = ref('')
const size = ref<ControlSize>()
const autoUpload = ref(true)
const draggable = ref(false)
const disabled = ref(false)

watch(multiple, enabled => {
  if (!enabled && files.value.length > 1) files.value = files.value.slice(0, 1)
})

// 在本地模拟分段上传；删除文件时组件会取消对应的请求。
const simulateUpload: NonNullable<UploadProps['requestMethod']> = (_file, { signal, onProgress }) =>
  new Promise((resolve, reject) => {
    signal.throwIfAborted()
    let percent = 0
    const timer = window.setInterval(() => {
      percent += 25
      onProgress(percent)
      if (percent === 100) {
        window.clearInterval(timer)
        signal.removeEventListener('abort', cancel)
        resolve({ status: 'success' })
      }
    }, 180)
    function cancel() {
      window.clearInterval(timer)
      reject(signal.reason)
    }
    signal.addEventListener('abort', cancel, { once: true })
  })
</script>

<template>
  <PreviewFrame name="YmUpload">
    <template #preview>
      <YmUpload v-model="files" :multiple="multiple" :max="max" :accept="accept" :size="size"
        :auto-upload="autoUpload" :request-method="simulateUpload" :draggable="draggable"
        :disabled="disabled" placeholder="请选择附件" />
    </template>
    <template #controls>
      <label>允许多文件 <YmSwitch v-model="multiple" /></label>
      <label v-if="multiple">最多文件数
        <select v-model="max">
          <option :value="2">2 个</option><option :value="3">3 个</option><option :value="0">不限</option>
        </select>
      </label>
      <label>文件类型
        <select v-model="accept">
          <option value="">全部文件</option>
          <option value=".pdf">PDF 文档</option>
          <option value=".csv,.xlsx">电子表格</option>
        </select>
      </label>
      <label>组件尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>自动上传 <YmSwitch v-model="autoUpload" /></label>
      <label>拖放文件 <YmSwitch v-model="draggable" /></label>
      <label>禁用 <YmSwitch v-model="disabled" /></label>
    </template>
  </PreviewFrame>
</template>
