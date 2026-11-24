<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmDatePicker, YmSwitch, type ControlSize } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const deliveryDate = ref<string | null>('2026-10-01')
const size = ref<ControlSize>()
const firstDayOfWeek = ref<1 | 7>(1)
const showLunar = ref(true)
const showHoliday = ref(true)
const clearable = ref(true)
const disableWeekends = ref(false)
const borderless = ref(false)
const disabled = ref(false)

function isWeekend(date: Date) {
  return date.getDay() === 0 || date.getDay() === 6
}
</script>

<template>
  <PreviewFrame name="YmDatePicker">
    <template #preview>
      <YmDatePicker v-model="deliveryDate" aria-label="收货日期" :size="size" :first-day-of-week="firstDayOfWeek"
        :show-lunar="showLunar" :show-holiday="showHoliday" :clearable="clearable"
        :disabled-date="disableWeekends ? isWeekend : undefined" :borderless="borderless" :disabled="disabled" />
    </template>
    <template #controls>
      <label>选择器尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>每周首日
        <select v-model="firstDayOfWeek"><option :value="1">周一</option><option :value="7">周日</option></select>
      </label>
      <label>显示农历 <YmSwitch v-model="showLunar" /></label>
      <label>显示节假日 <YmSwitch v-model="showHoliday" /></label>
      <label>允许清空 <YmSwitch v-model="clearable" /></label>
      <label>禁选周末 <YmSwitch v-model="disableWeekends" /></label>
      <label>无边框 <YmSwitch v-model="borderless" /></label>
      <label>禁用 <YmSwitch v-model="disabled" /></label>
    </template>
  </PreviewFrame>
</template>
