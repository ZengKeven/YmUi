<script setup lang="ts" vapor>
import { computed, ref, useTemplateRef } from 'vue'
import { YmButton, YmStatistic, YmSwitch, type StatisticInstance, type StatisticProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const statistic = useTemplateRef<StatisticInstance>('statistic')
const value = ref(12480.75)
const duration = ref(1600)
const animated = ref(true)
const animation = computed(() => animated.value ? { valueFrom: 0, duration: duration.value } : undefined)
const decimalPlaces = ref<number | undefined>(2)
const size = ref<StatisticProps['size']>()
const color = ref<StatisticProps['color']>()
const trend = ref<StatisticProps['trend']>()
const loading = ref(false)
</script>

<template>
  <PreviewFrame name="YmStatistic">
    <template #preview>
      <YmStatistic ref="statistic" title="本月成交额" unit="元" :value="value" :decimal-places="decimalPlaces"
        :animation="animation" :animation-start="animated" :size="size" :color="color" :trend="trend" :loading="loading" />
    </template>
    <template #controls>
      <label>目标金额
        <select v-model="value">
          <option :value="8640.5">8,640.50</option><option :value="12480.75">12,480.75</option>
          <option :value="18600">18,600.00</option>
        </select>
      </label>
      <label>数值动画 <YmSwitch v-model="animated" /></label>
      <label>动画时长
        <select v-model="duration" :disabled="!animated">
          <option :value="800">0.8 秒</option><option :value="1600">1.6 秒</option><option :value="2400">2.4 秒</option>
        </select>
      </label>
      <YmButton variant="outline" :disabled="!animated || loading" @click="statistic?.start()">重播动画</YmButton>
      <label>小数位数
        <select v-model="decimalPlaces">
          <option :value="undefined">自动</option><option :value="0">0</option><option :value="2">2</option>
        </select>
      </label>
      <label>统计尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[key, name] in sizes" :key="key" :value="key">{{ name }}</option>
        </select>
      </label>
      <label>数值颜色
        <select v-model="color">
          <option :value="undefined">继承</option><option value="blue">蓝色</option><option value="red">红色</option>
          <option value="orange">橙色</option><option value="green">绿色</option>
        </select>
      </label>
      <label>趋势
        <select v-model="trend">
          <option :value="undefined">无</option><option value="increase">上升</option><option value="decrease">下降</option>
        </select>
      </label>
      <label>加载中 <YmSwitch v-model="loading" /></label>
    </template>
  </PreviewFrame>
</template>
