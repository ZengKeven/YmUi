<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmProgress, type ControlSize, type ProgressProps } from 'ym-ui-vapor'

const percentage = ref(35)
const theme = ref<ProgressProps['theme']>('line')
const status = ref<ProgressProps['status']>()
const label = ref<ProgressProps['label']>(true)
const color = ref<ProgressProps['color']>()
const size = ref<ControlSize>('medium')
const dark = ref(false)
const square = ref(false)
const primary = ref('#004488')
</script>

<template>
  <main>
    <YmProgress aria-label="初始进度" />
    <label>百分比 <input v-model.number="percentage" type="number" step="any" /></label>
    <label>样式
      <select v-model="theme"><option>line</option><option>plump</option><option>circle</option></select>
    </label>
    <label>状态
      <select v-model="status">
        <option :value="undefined">自动</option>
        <option>active</option><option>warning</option><option>error</option><option>success</option>
      </select>
    </label>
    <label>标签
      <select v-model="label">
        <option :value="true">百分比</option><option value="已接收">自定义</option><option :value="false">隐藏</option>
      </select>
    </label>
    <label>颜色
      <select v-model="color">
        <option :value="undefined">主题色</option>
        <option value="#336699">单色</option>
        <option :value="['#ff0000', '#00ff00', '#0000ff']">色带</option>
        <option :value="{ '100%': '#0000ff', '25%': '#00ff00', '0%': '#ff0000' }">色标</option>
        <option :value="{ from: '#ff0000', to: '#0000ff' }">起止色</option>
      </select>
    </label>
    <YmProgress aria-label="文件传输" :percentage="percentage" :theme="theme" :status="status" :label="label"
      :color="color" track-color="#dbdeef" />
    <YmProgress aria-label="自定义进度" :percentage="percentage" :theme="theme" :status="status" :label="label">
      <template #label="progress"><strong>{{ progress.percentage }} / {{ progress.status }}</strong></template>
    </YmProgress>
    <YmProgress aria-label="自定义线宽" :percentage="50" :stroke-width="12" />
    <YmProgress aria-label="自定义圆环" theme="circle" :percentage="50" :size="124" :stroke-width="8" />
    <YmProgress aria-label="字符串尺寸" theme="circle" :percentage="50" size="96" stroke-width="4" />
    <label>全局尺寸
      <select v-model="size"><option>extra-small</option><option>small</option><option>medium</option><option>large</option></select>
    </label>
    <label>浅色主题色 <input v-model="primary" type="color" /></label>
    <label><input v-model="dark" type="checkbox" /> 深色模式</label>
    <label><input v-model="square" type="checkbox" /> 直角</label>
    <ConfigProvider :size="size" :mode="dark ? 'dark' : 'light'" :radius="9"
      :theme="{ light: { primary, text: '#283944' }, dark: { primary: '#99ccff', text: '#e4edf5' } }">
      <ConfigProvider :radius="square ? 0 : 3">
        <YmProgress aria-label="全局线条" :percentage="35" />
        <YmProgress aria-label="全局圆环" theme="circle" :percentage="35" />
        <YmProgress aria-label="局部线条" size="small" :percentage="35" />
        <YmProgress aria-label="局部圆环" theme="circle" size="small" :percentage="35" />
      </ConfigProvider>
    </ConfigProvider>
  </main>
</template>
