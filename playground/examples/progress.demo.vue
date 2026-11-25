<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmProgress, YmSwitch, type ProgressProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const percentage = ref(65)
const theme = ref<ProgressProps['theme']>('line')
const status = ref<ProgressProps['status']>()
const size = ref<ProgressProps['size']>()
const label = ref(true)
const gradient = ref(false)
const color = computed(() => gradient.value ? ['var(--ym-color-primary)', 'var(--ym-color-success)'] : undefined)
</script>

<template>
  <PreviewFrame name="YmProgress">
    <template #preview>
      <YmProgress aria-label="文件上传进度" :percentage="percentage" :theme="theme" :status="status"
        :size="size" :color="color" :label="label" />
    </template>
    <template #controls>
      <label>完成进度
        <span class="radius-field">
          <input v-model.number="percentage" type="range" min="0" max="100" aria-label="完成进度" />
          <output>{{ percentage }}%</output>
        </span>
      </label>
      <label>进度条形态
        <select v-model="theme">
          <option value="line">横线</option><option value="plump">内嵌文字</option><option value="circle">圆环</option>
        </select>
      </label>
      <label>进度状态
        <select v-model="status">
          <option :value="undefined">自动</option><option value="active">进行中</option>
          <option value="success">成功</option><option value="warning">警告</option><option value="error">错误</option>
        </select>
      </label>
      <label>进度条尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, name] in sizes" :key="value" :value="value">{{ name }}</option>
        </select>
      </label>
      <label>渐变色 <YmSwitch v-model="gradient" /></label>
      <label>显示标签 <YmSwitch v-model="label" /></label>
    </template>
  </PreviewFrame>
</template>
