<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmQRCode, YmSwitch, type QRCodeProps } from '../../src'
import deliveryIcon from './assets/delivery-calendar.png'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const value = ref('配送单 PS-1028')
const type = ref<QRCodeProps['type']>('canvas')
const size = ref<QRCodeProps['size']>()
const level = ref<QRCodeProps['level']>('M')
const status = ref<QRCodeProps['status']>('active')
const palette = ref<'ink' | undefined>()
const color = computed(() => palette.value === 'ink' ? '#143c60' : undefined)
const bgColor = computed(() => palette.value === 'ink' ? '#edf5fa' : undefined)
const showIcon = ref(false)
const icon = computed(() => showIcon.value ? deliveryIcon : undefined)
const borderless = ref(false)
</script>

<template>
  <PreviewFrame name="YmQRCode">
    <template #preview>
      <YmQRCode :value="value" :type="type" :size="size" :level="level" :status="status" :color="color"
        :bg-color="bgColor" :icon="icon" :icon-size="showIcon ? 24 : undefined" :borderless="borderless"
        @refresh="status = 'active'" />
    </template>
    <template #controls>
      <label>扫码内容 <input v-model="value" type="text" /></label>
      <label>渲染方式
        <select v-model="type"><option value="canvas">Canvas</option><option value="svg">SVG</option></select>
      </label>
      <label>二维码尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[key, name] in sizes" :key="key" :value="key">{{ name }}</option>
          <option :value="192">192px</option>
        </select>
      </label>
      <label>纠错等级
        <select v-model="level"><option>L</option><option>M</option><option>Q</option><option>H</option></select>
      </label>
      <label>扫码状态
        <select v-model="status">
          <option value="active">可扫描</option><option value="loading">加载中</option>
          <option value="expired">已过期</option><option value="scanned">已扫描</option>
        </select>
      </label>
      <label>码面配色
        <select v-model="palette"><option :value="undefined">继承</option><option value="ink">墨蓝</option></select>
      </label>
      <label>中心标志 <YmSwitch v-model="showIcon" /></label>
      <label>无边框 <YmSwitch v-model="borderless" /></label>
    </template>
  </PreviewFrame>
</template>
