<script setup lang="ts" vapor>
import { computed, ref, watch } from 'vue'
import { YmSwitch, YmTreeSelect, type ControlSize, type TreeSelectOption, type TreeSelectValue } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const warehouses: TreeSelectOption<string>[] = [
  { value: 'east', label: '华东区', children: [
    { value: 'sh', label: '上海市', children: [
      { value: 'pudong', label: '浦东仓' },
      { value: 'hongqiao', label: '虹桥仓', disabled: true },
    ] },
    { value: 'hz', label: '杭州市', children: [{ value: 'yuhang', label: '余杭仓' }] },
  ] },
  { value: 'south', label: '华南区', children: [
    { value: 'gz', label: '广州市', children: [{ value: 'baiyun', label: '白云仓' }] },
  ] },
]
const selected = ref<TreeSelectValue<string>>([])
const multiple = ref(true)
const filterable = ref(true)
const disableRegions = ref(true)
const disableCities = ref(true)
const disabledLevels = computed(() => [
  ...(disableRegions.value ? [1] : []),
  ...(disableCities.value ? [2] : []),
])
const borderless = ref(false)
const disabled = ref(false)
const size = ref<ControlSize>()

watch(multiple, enabled => {
  const current = selected.value
  if (enabled && !Array.isArray(current)) selected.value = current === null ? [] : [current]
  if (!enabled && Array.isArray(current)) selected.value = current[0] ?? null
})
</script>

<template>
  <PreviewFrame name="YmTreeSelect">
    <template #preview>
      <YmTreeSelect v-model="selected" :options="warehouses" :multiple="multiple" :filterable="filterable"
        :disabled-levels="disabledLevels" :borderless="borderless" :disabled="disabled" :size="size"
        aria-label="仓库范围" placeholder="选择仓库范围" />
    </template>
    <template #controls>
      <label>多选 <YmSwitch v-model="multiple" /></label>
      <label>允许过滤 <YmSwitch v-model="filterable" /></label>
      <label>禁选第一级（区域） <YmSwitch v-model="disableRegions" /></label>
      <label>禁选第二级（城市） <YmSwitch v-model="disableCities" /></label>
      <label>选择器尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>无边框 <YmSwitch v-model="borderless" /></label>
      <label>禁用整个选择器 <YmSwitch v-model="disabled" /></label>
    </template>
  </PreviewFrame>
</template>
