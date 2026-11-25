<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmDatePicker, type DatePickerMode, type DateRangeValue } from '../../src'

const day = ref<string | null>(null)
const range = ref<DateRangeValue | null>(null)
const mode = ref<DatePickerMode>('single')
const value = ref<string | DateRangeValue | null>(null)
</script>

<template>
  <YmDatePicker v-model="day" aria-label="日期" @change="day = $event">
    <template #cell="{ date }">{{ date.getDate() }}</template>
  </YmDatePicker>
  <YmDatePicker v-model="range" mode="range" :presets="{ 固定: ['2026-10-01', '2026-10-02'] as const, 动态: () => ['2026-10-03', '2026-10-04'] }" @change="range = $event" />
  <YmDatePicker v-model="value" :mode="mode" @change="value = $event" />
  <!-- @vue-expect-error 范围模式的值必须是起止日期对。 -->
  <YmDatePicker mode="range" default-value="2026-10-01" />
  <!-- @vue-expect-error 默认单选模式只接受单个日期。 -->
  <YmDatePicker :model-value="range" />
  <!-- @vue-expect-error 范围模式的 change 参数是日期对。 -->
  <YmDatePicker mode="range" @change="day = $event" />
  <!-- @vue-expect-error 范围快捷项需要同时提供起止日期。 -->
  <YmDatePicker mode="range" :presets="{ 缺少终点: () => ['2026-10-01'] }" />
</template>
