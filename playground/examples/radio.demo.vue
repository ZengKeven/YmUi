<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmRadio, YmRadioGroup, type ControlSize, type RadioGroupProps, type RadioValue } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const delivery = ref<RadioValue>('courier')
const size = ref<ControlSize>()
const direction = ref<RadioGroupProps['direction']>('horizontal')
const disabled = ref(false)
</script>

<template>
  <PreviewFrame name="YmRadio">
    <template #preview>
      <YmRadioGroup v-model="delivery" name="delivery" aria-label="配送方式"
        :direction="direction" :size="size" :disabled="disabled">
        <YmRadio value="courier">快递配送</YmRadio>
        <YmRadio value="pickup">门店自提</YmRadio>
        <YmRadio value="express" disabled>当日达</YmRadio>
      </YmRadioGroup>
    </template>
    <template #controls>
      <label>排列方向
        <select v-model="direction">
          <option value="horizontal">横向</option><option value="vertical">纵向</option>
        </select>
      </label>
      <label>单选框尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>整组禁用 <input v-model="disabled" type="checkbox" /></label>
    </template>
  </PreviewFrame>
</template>
