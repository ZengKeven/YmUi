<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmBadge, YmIcon, YmSwitch, type BadgeProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const count = ref<BadgeProps['count']>(8)
const maxCount = ref(99)
const dot = ref(false)
const showZero = ref(false)
const shape = ref<BadgeProps['shape']>('circle')
const size = ref<BadgeProps['size']>()
const color = ref<string>()
</script>

<template>
  <PreviewFrame name="YmBadge">
    <template #preview>
      <YmBadge :count="count" :max-count="maxCount" :dot="dot" :show-zero="showZero"
        :shape="shape" :size="size" :color="color">
        <YmIcon name="notification" :size="32" aria-label="通知" />
      </YmBadge>
    </template>
    <template #controls>
      <label>徽标内容
        <select v-model="count">
          <option :value="0">0</option><option :value="8">8</option>
          <option :value="128">128</option><option value="NEW">NEW</option>
        </select>
      </label>
      <label>封顶数值
        <select v-model="maxCount">
          <option :value="9">9</option><option :value="99">99</option><option :value="999">999</option>
        </select>
      </label>
      <label>徽标形状
        <select v-model="shape">
          <option value="circle">胶囊</option><option value="round">圆角矩形</option>
        </select>
      </label>
      <label>徽标尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>徽标颜色
        <select v-model="color">
          <option :value="undefined">默认</option>
          <option value="var(--ym-color-primary)">主要</option><option value="var(--ym-color-success)">成功</option>
        </select>
      </label>
      <label>圆点模式 <YmSwitch v-model="dot" /></label>
      <label>显示零值 <YmSwitch v-model="showZero" /></label>
    </template>
  </PreviewFrame>
</template>
