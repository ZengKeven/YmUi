<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmDatePicker, YmSwitch, type ControlSize, type DatePickerMode, type DateRangeValue } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const mode = ref<DatePickerMode>('single')
const deliveryDate = ref('2026-10-01')
const deliveryRange = ref<DateRangeValue>(['2026-10-01', '2026-10-07'])
const delivery = computed({
  get: () => mode.value === 'range' ? deliveryRange.value : deliveryDate.value,
  set(value: string | DateRangeValue) {
    if (typeof value === 'string') deliveryDate.value = value
    else deliveryRange.value = value
  },
})
const size = ref<ControlSize>()
const firstDayOfWeek = ref<1 | 7>(1)
const showLunar = ref(true)
const showHoliday = ref(true)
const disableWeekends = ref(false)
const borderless = ref(false)
const disabled = ref(false)
</script>

<template>
  <PreviewFrame name="YmDatePicker">
    <template #preview>
      <YmDatePicker v-if="disableWeekends === false" v-model="delivery" :mode="mode"
        :aria-label="mode === 'range' ? '收货日期范围' : '收货日期'" :size="size" :first-day-of-week="firstDayOfWeek"
        :show-lunar="showLunar" :show-holiday="showHoliday" :borderless="borderless" :disabled="disabled" />
      <YmDatePicker v-if="disableWeekends" v-model="delivery" :mode="mode" :disabled-date="date => [0, 6].includes(date.getDay())"
        :aria-label="mode === 'range' ? '收货日期范围' : '收货日期'" :size="size" :first-day-of-week="firstDayOfWeek"
        :show-lunar="showLunar" :show-holiday="showHoliday" :borderless="borderless" :disabled="disabled" />
    </template>
    <template #controls>
      <label>选择模式
        <select v-model="mode"><option value="single">单个日期</option><option value="range">日期范围</option></select>
      </label>
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
      <label>禁选周末 <YmSwitch v-model="disableWeekends" /></label>
      <label>无边框 <YmSwitch v-model="borderless" /></label>
      <label>禁用 <YmSwitch v-model="disabled" /></label>
    </template>
  </PreviewFrame>
</template>
