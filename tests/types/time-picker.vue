<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmTimePicker, type TimePickerMode, type TimeRangeValue } from '../../src'

const time = ref<string | null>(null)
const shift = ref<TimeRangeValue | null>(null)
const mode = ref<TimePickerMode>('single')
const value = ref<string | TimeRangeValue | null>(null)
</script>

<template>
  <YmTimePicker v-model="time" format="HH:mm" @change="time = $event" />
  <YmTimePicker mode="range" v-model="shift" @change="shift = $event" />
  <YmTimePicker :mode="mode" v-model="value" @change="value = $event" />
  <!-- @vue-expect-error 单选模式只接受单个时间。 -->
  <YmTimePicker :model-value="shift" />
  <!-- @vue-expect-error 范围模式需要起止时间对。 -->
  <YmTimePicker mode="range" default-value="09:00:00" />
  <!-- @vue-expect-error 范围事件传递起止时间对。 -->
  <YmTimePicker mode="range" @change="time = $event" />
</template>
