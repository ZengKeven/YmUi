<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmImage, YmSwitch, type ImageProps } from '../../src'
import calendarImage from './assets/delivery-calendar.png'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const preview = ref(false)
const fit = ref<ImageProps['fit']>('contain')
const shape = ref<ImageProps['shape']>('round')
const size = ref<ImageProps['size']>()
</script>

<template>
  <PreviewFrame name="YmImage">
    <template #preview>
      <YmImage :src="calendarImage" alt="配送日历" :width="240" :height="240"
        :preview="preview" :fit="fit" :shape="shape" :size="size" />
    </template>
    <template #controls>
      <label>点击预览 <YmSwitch v-model="preview" /></label>
      <label>填充方式
        <select v-model="fit">
          <option value="contain">完整显示</option><option value="cover">裁剪填满</option>
          <option value="fill">拉伸填满</option><option value="none">原始尺寸</option>
          <option value="scale-down">仅缩小</option>
        </select>
      </label>
      <label>图片形状
        <select v-model="shape">
          <option value="round">主题圆角</option><option value="square">直角</option><option value="circle">圆形</option>
        </select>
      </label>
      <label>组件尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
    </template>
  </PreviewFrame>
</template>
