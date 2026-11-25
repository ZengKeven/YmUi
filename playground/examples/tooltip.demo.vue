<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmButton, YmSwitch, YmTooltip, type TooltipProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const trigger = ref<TooltipProps['trigger']>('hover')
const placement = ref<TooltipProps['placement']>('top')
const theme = ref<TooltipProps['theme']>('default')
const size = ref<TooltipProps['size']>()
const showArrow = ref(true)
const disabled = ref(false)
</script>

<template>
  <PreviewFrame name="YmTooltip">
    <template #preview>
      <YmTooltip content="自发货日起 2 个工作日内送达。" :trigger="trigger" :placement="placement"
        :theme="theme" :size="size" :show-arrow="showArrow" :disabled="disabled">
        <YmButton variant="outline">配送时效</YmButton>
      </YmTooltip>
    </template>
    <template #controls>
      <label>触发方式
        <select v-model="trigger">
          <option value="hover">悬停或聚焦</option><option value="focus">聚焦</option>
          <option value="click">点击</option><option value="context-menu">右键</option>
        </select>
      </label>
      <label>提示位置
        <select v-model="placement">
          <option value="top">上方</option><option value="bottom">下方</option>
          <option value="left">左侧</option><option value="right">右侧</option>
        </select>
      </label>
      <label>提示配色
        <select v-model="theme">
          <option value="default">默认</option><option value="light">浅色</option>
          <option value="primary">主要</option><option value="success">成功</option>
          <option value="warning">警告</option><option value="danger">危险</option>
        </select>
      </label>
      <label>提示尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>显示箭头 <YmSwitch v-model="showArrow" /></label>
      <label>禁用提示 <YmSwitch v-model="disabled" /></label>
    </template>
  </PreviewFrame>
</template>
