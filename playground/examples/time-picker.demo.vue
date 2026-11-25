<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmSwitch, YmTimePicker, type ControlSize, type TimePickerProps, type TimeRangeValue } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const mode = ref<'single' | 'range'>('single')
const format = ref<NonNullable<TimePickerProps['format']>>('HH:mm:ss')
const dispatchTime = ref('09:30:15')
const dispatchWindow = ref<TimeRangeValue>(['09:00:00', '18:00:00'])
const selection = computed<string | TimeRangeValue>({
  get() {
    const length = format.value.length
    const [start, end] = dispatchWindow.value
    return mode.value === 'range'
      ? [start.slice(0, length), end.slice(0, length)]
      : dispatchTime.value.slice(0, length)
  },
  set(value) {
    const withSeconds = (time: string) => time.length === 5 ? time + ':00' : time
    if (typeof value === 'string') dispatchTime.value = withSeconds(value)
    else dispatchWindow.value = [withSeconds(value[0]), withSeconds(value[1])]
  },
})
const size = ref<ControlSize>()
const borderless = ref(false)
const disabled = ref(false)
</script>

<template>
  <PreviewFrame name="YmTimePicker">
    <template #preview>
      <YmTimePicker v-model="selection" :mode="mode" :format="format" :size="size"
        :aria-label="mode === 'range' ? '配送时段' : '配送时间'" :borderless="borderless" :disabled="disabled" />
    </template>
    <template #controls>
      <label>选择模式
        <select v-model="mode"><option value="single">单个时间</option><option value="range">时间范围</option></select>
      </label>
      <label>时间格式
        <select v-model="format"><option>HH:mm:ss</option><option>HH:mm</option></select>
      </label>
      <label>选择器尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>无边框 <YmSwitch v-model="borderless" /></label>
      <label>禁用 <YmSwitch v-model="disabled" /></label>
    </template>
  </PreviewFrame>
</template>
