<script setup lang="ts" vapor>
import { ref, shallowRef } from 'vue'
import { ConfigProvider, YmImage, type ControlSize, type ImageProps } from 'ym-ui-vapor'

const src = shallowRef<string | File>('/image-case/main.svg')
const fallback = ref<string>()
const preview = ref<boolean>()
const alternate = ref(false)
const size = ref<ControlSize>('large')
const shape = ref<ImageProps['shape']>()
const dark = ref(false)
const square = ref(false)
const surface = ref('#f0f4f8')
const events = ref<string[]>([])
const sources = { 'image/svg+xml': '/image-case/chosen.svg' }
const cached = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="150"/%3E'

function record({ e }: { e: Event }) {
  const image = e.target as HTMLImageElement
  const url = new URL(image.currentSrc || image.src)
  events.value.push(e.type + ' ' + (url.protocol === 'data:' ? 'cached' : url.pathname))
}

function pick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) src.value = file
}
</script>

<template>
  <main>
    <label><input v-model="preview" type="checkbox">允许预览</label>
    <label><input v-model="alternate" type="checkbox">多格式图片</label>
    <button @click="src = '/image-case/main.svg'">主图</button>
    <button @click="src = '/image-case/broken.svg'">坏图</button>
    <button @click="src = '/image-case/slow.svg'">慢图</button>
    <button @click="src = cached">缓存图片</button>
    <button @click="fallback = '/image-case/backup.svg'">设置备用图</button>
    <button @click="fallback = '/image-case/bad-backup.svg'">设置损坏的备用图</button>
    <label>本地图片 <input type="file" accept="image/*" @change="pick"></label>
    <label>全局尺寸
      <select v-model="size"><option>extra-small</option><option>small</option><option>medium</option><option>large</option></select>
    </label>
    <label><input v-model="dark" type="checkbox">深色模式</label>
    <label><input v-model="square" type="checkbox">直角</label>
    <label>浅色表面 <input v-model="surface" type="color"></label>
    <label>图片形状
      <select v-model="shape"><option :value="undefined">继承圆角</option><option>square</option><option>circle</option></select>
    </label>
    <ConfigProvider :size="size" :mode="dark ? 'dark' : 'light'" :radius="15"
      :theme="{ light: { surface, text: '#344455' }, dark: { surface: '#213240', text: '#fff4dd' } }">
      <ConfigProvider :radius="square ? 0 : 9">
        <YmImage id="main-image" :src="src" alt="送货凭证" :preview="preview" :width="180" height="6rem"
          fit="cover" position="25% 75%" :shape="shape" :fallback="fallback" lazy
          :srcset="alternate ? sources : undefined" referrerpolicy="no-referrer" @load="record" @error="record">
          <template #loading><span>读取凭证中</span></template>
          <template #error><span>凭证暂不可用</span></template>
        </YmImage>
        <YmImage id="small-image" src="/image-case/bad-size.svg" size="small">
          <template #error><span>紧凑提示</span></template>
        </YmImage>
      </ConfigProvider>
    </ConfigProvider>
    <output id="events">{{ events.join(' | ') }}</output>
  </main>
</template>
