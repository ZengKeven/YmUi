<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmImageUpload, type ImageUploadFile, type ImageUploadProps } from 'ym-ui-vapor'

const pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGMInbkKAALfAZkmGEfvAAAAAElFTkSuQmCC'
const existing: ImageUploadFile[] = [{ name: '原图.png', url: pixel }]
const local = ref<ImageUploadFile[]>([])
const gallery = ref<ImageUploadFile[]>([])
const manual = ref<ImageUploadFile[]>([])
const sent = ref<ImageUploadFile[]>([])
const events = ref<string[]>([])
const rejected = ref<string[]>([])
const percentages = ref<string[]>([])
const started = ref<string[]>([])
const aborted = ref<string[]>([])
const disabled = ref(false)
const showNames = ref(true)
const compact = ref(false)
const dark = ref(false)
const border = ref('#3b5877')

type RequestMethod = NonNullable<ImageUploadProps['requestMethod']>
type Result = Awaited<ReturnType<RequestMethod>>
const requests = new Map<string, (result: Result) => void>()
const requestMethod: RequestMethod = (file, { signal, onProgress }) => {
  started.value.push(file.name)
  signal.addEventListener('abort', () => aborted.value.push(file.name), { once: true })
  onProgress(25)
  return new Promise(resolve => requests.set(file.name, resolve))
}

function finish(name: string, success: boolean) {
  requests.get(name)?.(success
    ? { status: 'success', response: { url: '/uploads/' + name } }
    : { status: 'fail', error: '连接中断', response: {} })
  requests.delete(name)
}

function summary(files: ImageUploadFile[]) {
  return files.map(file => [file.name, file.status, file.url || ''].join('|')).join(';')
}
</script>

<template>
  <section id="single">
    <YmImageUpload v-model="local" @change="files => events.push('change ' + files.length)"
      @preview="({ file, index }) => events.push('preview ' + file.name + ' ' + index)"
      @remove="({ file, index }) => events.push('remove ' + file.name + ' ' + index)" />
    <output id="local-files">{{ summary(local) }}</output>
    <output id="events">{{ events.join(',') }}</output>
  </section>
  <section id="gallery">
    <YmImageUpload v-model="gallery" multiple draggable :max="2" :size-limit="{ size: 1, unit: 'KB' }" accept=".png,image/jpeg"
      :disabled="disabled" :show-image-file-name="showNames" @validate="({ file, reason }) => rejected.push(file.name + ' ' + reason)" />
    <output id="gallery-files">{{ summary(gallery) }}</output>
    <output id="rejected">{{ rejected.join(',') }}</output>
  </section>
  <label><input type="checkbox" v-model="disabled" />禁用图库</label>
  <label><input type="checkbox" v-model="showNames" />显示文件名</label>
  <section id="manual">
    <YmImageUpload v-model="manual" multiple :request-method="requestMethod" :auto-upload="false"
      @progress="({ file, percent }) => percentages.push(file.name + ' ' + percent)"
      @fail="({ file }) => events.push('fail ' + file.name)" @success="({ file }) => events.push('success ' + file.name)" />
    <output id="manual-files">{{ summary(manual) }}</output>
    <output id="started">{{ started.join(',') }}</output>
    <output id="aborted">{{ aborted.join(',') }}</output>
    <output id="percentages">{{ percentages.join(',') }}</output>
  </section>
  <button @click="finish('one.png', false)">第一张失败</button>
  <button @click="finish('one.png', true)">第一张完成</button>
  <button @click="finish('two.png', true)">第二张完成</button>
  <button @click="manual = [...manual, ...existing]">追加已有图片</button>
  <button @click="finish('two.png', true); finish('one.png', true)">同时完成</button>
  <section id="http">
    <YmImageUpload v-model="sent" action="/upload-case" :headers="{ 'X-Upload-Case': 'fixture' }" />
    <output id="sent-files">{{ summary(sent) }}</output>
  </section>
  <section id="locked"><YmImageUpload :model-value="existing" /></section>

  <label><input v-model="compact" type="checkbox" />紧凑直角</label>
  <label><input v-model="dark" type="checkbox" />深色</label>
  <label>边框色<input v-model="border" type="color" /></label>
  <ConfigProvider :size="compact ? 'small' : 'large'" :mode="dark ? 'dark' : 'light'"
    :theme="{ light: { border, surface: '#f0f4f8', text: '#17344a' }, dark: { border: '#8da4b6', surface: '#213240', text: '#e1eaf2' } }">
    <ConfigProvider :radius="compact ? 0 : 9">
      <section id="inherited"><YmImageUpload multiple :default-value="existing" /></section>
      <section id="override"><YmImageUpload size="extra-small"><template #trigger>选择凭证</template></YmImageUpload></section>
    </ConfigProvider>
  </ConfigProvider>
</template>
