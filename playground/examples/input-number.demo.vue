<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmInputNumber, YmSwitch, type ControlSize, type InputNumberProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const amount = ref<number | null>(-12.5)
const decimalPlaces = ref<number | undefined>(2)
const min = ref<number | undefined>(-100)
const max = ref<number | undefined>(100)
const align = ref<InputNumberProps['align']>('right')
const size = ref<ControlSize>()
const borderless = ref(false)
const autofocus = ref(false)
</script>

<template>
  <PreviewFrame name="YmInputNumber">
    <template #preview>
      <YmInputNumber v-model="amount" :decimal-places="decimalPlaces" :min="min" :max="max"
        :align="align" :size="size" :borderless="borderless" :autofocus="autofocus" aria-label="调整金额" placeholder="请输入调整金额" />
    </template>
    <template #controls>
      <label>小数位数
        <select v-model="decimalPlaces">
          <option :value="undefined">保留有效小数位</option>
          <option v-for="places in [0, 1, 2, 3]" :key="places" :value="places">{{ places }}</option>
        </select>
      </label>
      <label>最小值
        <select v-model="min">
          <option :value="undefined">无下限</option>
          <option v-for="limit in [-100, -10, 0]" :key="limit" :value="limit">{{ limit }}</option>
        </select>
      </label>
      <label>最大值
        <select v-model="max">
          <option :value="undefined">无上限</option>
          <option v-for="limit in [10, 100, 1000]" :key="limit" :value="limit">{{ limit }}</option>
        </select>
      </label>
      <label>文本对齐
        <select v-model="align">
          <option value="left">左对齐</option><option value="center">居中</option><option value="right">右对齐</option>
        </select>
      </label>
      <label>输入框尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>无边框 <YmSwitch v-model="borderless" /></label>
      <label>自动聚焦 <YmSwitch v-model="autofocus" /></label>
    </template>
  </PreviewFrame>
</template>
