<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmSteps, type StepOption, type StepsProps, type StepValue } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const options = [
  { value: 'submit', title: '提交申请', content: '填写入库单' },
  { value: 'review', title: '审核申请', content: '核对品项与数量' },
  { value: 'receive', title: '确认入库', content: '登记实收数量' },
] satisfies StepOption[]
const current = ref<StepValue>('review')
const layout = ref<StepsProps['layout']>('horizontal')
const theme = ref<StepsProps['theme']>('default')
const separator = ref<StepsProps['separator']>('line')
const sequence = ref<StepsProps['sequence']>('positive')
const size = ref<StepsProps['size']>()
const readOnly = ref(false)
</script>

<template>
  <PreviewFrame name="YmSteps">
    <template #preview>
      <YmSteps v-model:current="current" :options="options" :layout="layout" :size="size"
        :theme="theme" :separator="separator" :sequence="sequence" :readonly="readOnly" />
    </template>
    <template #controls>
      <label>当前步骤
        <select v-model="current">
          <option v-for="option in options" :key="option.value" :value="option.value">{{ option.title }}</option>
          <option value="FINISH">全部完成</option>
        </select>
      </label>
      <label>排列方向
        <select v-model="layout">
          <option value="horizontal">横向</option>
          <option value="vertical">纵向</option>
        </select>
      </label>
      <label>步骤标记
        <select v-model="theme">
          <option value="default">编号</option>
          <option value="dot">圆点</option>
        </select>
      </label>
      <label>连接线
        <select v-model="separator">
          <option value="line">实线</option>
          <option value="dashed">虚线</option>
          <option value="arrow">箭头</option>
        </select>
      </label>
      <label>显示顺序
        <select v-model="sequence">
          <option value="positive">正序</option>
          <option value="reverse">倒序</option>
        </select>
      </label>
      <label>步骤尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>只读 <input v-model="readOnly" type="checkbox" /></label>
    </template>
  </PreviewFrame>
</template>
