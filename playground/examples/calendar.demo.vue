<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmCalendar, YmSwitch, type CalendarProps, type ControlSize } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const selected = ref<string | null>(null)
const theme = ref<CalendarProps['theme']>('card')
const size = ref<ControlSize>()
const firstDayOfWeek = ref<1 | 7>(1)
const disableWeekends = ref(false)
const disabled = ref(false)

function isWeekend(date: Date) {
  return date.getDay() === 0 || date.getDay() === 6
}
</script>

<template>
  <PreviewFrame name="YmCalendar">
    <template #preview>
      <YmCalendar v-model="selected" :theme="theme" :size="size" :first-day-of-week="firstDayOfWeek"
        :disabled-date="disableWeekends ? isWeekend : undefined" :disabled="disabled" />
    </template>
    <template #controls>
      <label>日历样式
        <select v-model="theme"><option value="card">卡片</option><option value="full">完整</option></select>
      </label>
      <label>日历尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>每周首日
        <select v-model="firstDayOfWeek"><option :value="1">周一</option><option :value="7">周日</option></select>
      </label>
      <label>禁选周末 <YmSwitch v-model="disableWeekends" /></label>
      <label>禁用 <YmSwitch v-model="disabled" /></label>
    </template>
  </PreviewFrame>
</template>
