<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmInput, type ControlSize, type InputProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const value = ref('示例文本')
const type = ref<InputProps['type']>('text')
const align = ref<InputProps['align']>('left')
const size = ref<ControlSize>()
const autofocus = ref(false)
const readOnly = ref(false)
const disabled = ref(false)
</script>

<template>
  <PreviewFrame name="YmInput">
    <template #preview>
      <YmInput v-model="value" :type="type" :align="align" :size="size" :readonly="readOnly" :disabled="disabled"
        :autofocus="autofocus" aria-label="示例输入框" placeholder="请输入内容" />
    </template>
    <template #controls>
      <label>输入类型
        <select v-model="type">
          <option value="text">文本</option><option value="password">密码</option>
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
      <label>自动聚焦 <input v-model="autofocus" type="checkbox" /></label>
      <label>只读 <input v-model="readOnly" type="checkbox" /></label>
      <label>禁用 <input v-model="disabled" type="checkbox" /></label>
    </template>
  </PreviewFrame>
</template>
