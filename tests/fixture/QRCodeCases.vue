<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmQRCode, type ControlSize, type QRCodeProps } from 'ym-ui-vapor'

const value = ref('YM')
const type = ref<QRCodeProps['type']>()
const level = ref<QRCodeProps['level']>()
const status = ref<QRCodeProps['status']>()
const icon = ref('')
const borderless = ref(false)
const refreshes = ref(0)
const globalSize = ref<ControlSize>('medium')
const dark = ref(false)
const square = ref(false)
const ink = ref('#123456')
const logo = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="10"><rect width="20" height="10" fill="#ff0099"/></svg>')
</script>

<template>
  <main>
    <label>内容 <input v-model="value" /></label>
    <button @click="value = 'a'.repeat(4000)">超长内容</button>
    <label>渲染方式
      <select v-model="type"><option>canvas</option><option>svg</option></select>
    </label>
    <label>纠错级别
      <select v-model="level"><option>L</option><option>M</option><option>Q</option><option>H</option></select>
    </label>
    <label>状态
      <select v-model="status"><option>active</option><option>expired</option><option>loading</option><option>scanned</option></select>
    </label>
    <label>中心图标
      <select v-model="icon"><option value="">无</option><option :value="logo">正常</option><option value="data:image/png,invalid">损坏</option></select>
    </label>
    <label><input v-model="borderless" type="checkbox" /> 无边框</label>
    <YmQRCode id="code" aria-label="采购单二维码" :value="value" :type="type" :status="status" :level="level" :borderless="borderless"
      :icon="icon" :icon-size="{ width: 20, height: 10 }" @refresh="refreshes++" />
    <YmQRCode id="slotted" value="example" :status="status" @refresh="refreshes++">
      <template #status-render="{ status: current, onRefresh }">
        <button @click="onRefresh">重新生成 {{ current }}</button>
      </template>
    </YmQRCode>
    <YmQRCode id="passive" value="example" status="expired" />
    <output id="refreshes">{{ refreshes }}</output>

    <label>全局尺寸
      <select v-model="globalSize"><option>extra-small</option><option>small</option><option>medium</option><option>large</option></select>
    </label>
    <label>浅色前景 <input v-model="ink" type="color" /></label>
    <label><input v-model="dark" type="checkbox" /> 深色模式</label>
    <label><input v-model="square" type="checkbox" /> 直角</label>
    <ConfigProvider :size="globalSize" :radius="8" :mode="dark ? 'dark' : 'light'"
      :theme="{ light: { text: ink, surface: '#fffdee' }, dark: { text: '#ffddaa', surface: '#112233' } }">
      <ConfigProvider :radius="square ? 0 : 3">
        <YmQRCode id="inherited" value="YM" :type="type" />
        <YmQRCode id="local" value="YM" :type="type" :size="144" color="#760052" bg-color="#f4f8fc" />
      </ConfigProvider>
    </ConfigProvider>
  </main>
</template>
