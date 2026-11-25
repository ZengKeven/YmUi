<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmRate, YmSwitch, type RateProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const score = ref(3.5)
const allowHalf = ref(true)
const showText = ref(true)
const clearable = ref(false)
const disabled = ref(false)
const count = ref(5)
const size = ref<RateProps['size']>()
const color = ref<string>()
</script>

<template>
  <PreviewFrame name="YmRate">
    <template #preview>
      <YmRate v-model="score" aria-label="服务评分" :count="count" :size="size" :color="color"
        :allow-half="allowHalf" :show-text="showText" :clearable="clearable" :disabled="disabled" />
    </template>
    <template #controls>
      <label>星星数量
        <select v-model="count">
          <option :value="5">5</option><option :value="7">7</option><option :value="10">10</option>
        </select>
      </label>
      <label>评分尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>选中颜色
        <select v-model="color">
          <option :value="undefined">继承</option>
          <option value="var(--ym-color-primary)">主要</option><option value="var(--ym-color-success)">成功</option>
        </select>
      </label>
      <label>允许半星 <YmSwitch v-model="allowHalf" /></label>
      <label>显示评语 <YmSwitch v-model="showText" /></label>
      <label>允许清除 <YmSwitch v-model="clearable" /></label>
      <label>禁用 <YmSwitch v-model="disabled" /></label>
    </template>
  </PreviewFrame>
</template>
