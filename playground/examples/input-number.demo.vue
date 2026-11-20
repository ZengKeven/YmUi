<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmInputNumber, type ControlSize } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const amount = ref<number | null>(-12.5)
const decimalPlaces = ref<number | undefined>(2)
const min = ref<number | undefined>(-100)
const max = ref<number | undefined>(100)
const size = ref<ControlSize>()
</script>

<template>
  <PreviewFrame name="YmInputNumber">
    <template #preview>
      <YmInputNumber v-model="amount" :decimal-places="decimalPlaces" :min="min" :max="max"
        :size="size" aria-label="调整金额" placeholder="请输入调整金额" />
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
      <label>输入框尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
    </template>
  </PreviewFrame>
</template>
