<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmUpload, type UploadFile, type UploadProps, type UploadResult } from 'ym-ui-vapor'

const single = ref<UploadFile[]>([])
const multiple = ref<UploadFile[]>([])
const disabled = ref(false)
const events = ref<string[]>([])
const requests = new Map<string, (result: UploadResult) => void>()

const upload: NonNullable<UploadProps['requestMethod']> = (file, { signal, onProgress }) => {
  events.value.push('start ' + file.name)
  signal.addEventListener('abort', () => events.value.push('abort ' + file.name), { once: true })
  onProgress(25)
  return new Promise(resolve => requests.set(file.name, resolve))
}

function finish(name: string, success = true) {
  requests.get(name)?.(success
    ? { status: 'success', response: { url: '/documents/' + name } }
    : { status: 'fail', error: '连接中断' })
  requests.delete(name)
}

function summary(files: UploadFile[]) {
  return files.map(file => file.name + ':' + file.status).join(',')
}

const dark = ref(false)
const compact = ref(false)
const primary = ref('#264c7c')
</script>

<template>
  <section id="single">
    <YmUpload v-model="single" accept=".csv" :size-limit="{ size: 20, unit: 'B' }" :request-method="upload"
      @validate="({ file, reason }) => events.push('invalid ' + file.name + ' ' + reason)"
      @success="({ file }) => events.push('success ' + file.name)" />
    <output>{{ summary(single) }}</output>
  </section>
  <button @click="finish('first.csv')">完成旧文件</button>
  <button @click="finish('second.csv')">完成新文件</button>
  <section id="controlled">
    <YmUpload :model-value="[{ name: 'approved.pdf', url: '/documents/approved.pdf' }]" :request-method="upload" />
  </section>
  <section id="multiple">
    <YmUpload v-model="multiple" multiple draggable :max="2" :disabled="disabled" :auto-upload="false"
      :request-method="upload" @validate="({ file, reason }) => events.push('invalid ' + file.name + ' ' + reason)"
      @remove="({ file, index }) => events.push('remove ' + file.name + ' ' + index)"
      @progress="({ file, percent }) => events.push('progress ' + file.name + ' ' + percent)" />
    <output>{{ summary(multiple) }}</output>
  </section>
  <label><input type="checkbox" v-model="disabled" />禁用多选</label>
  <button @click="finish('note.txt', false)">文本失败</button>
  <button @click="finish('note.txt')">文本成功</button>
  <button @click="finish('brief.pdf')">文档成功</button>
  <output id="events">{{ events.join(';') }}</output>

  <label><input type="checkbox" v-model="dark" />深色</label>
  <label><input type="checkbox" v-model="compact" />小尺寸直角</label>
  <label>强调色<input type="color" v-model="primary" /></label>
  <ConfigProvider :size="compact ? 'small' : 'large'" :mode="dark ? 'dark' : 'light'"
    :theme="{ light: { primary, surface: '#f2f6fa' }, dark: { primary: '#d1c3fa', surface: '#282238' } }">
    <ConfigProvider :radius="compact ? 0 : 9">
      <section id="inherited"><YmUpload /></section>
      <section id="override"><YmUpload size="extra-small"><template #trigger>添加单据</template></YmUpload></section>
    </ConfigProvider>
  </ConfigProvider>
</template>
