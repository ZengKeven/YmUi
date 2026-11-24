<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmDatePicker, type DateRangeValue } from 'ym-ui-vapor'

const selected = ref<string | null>('2026-10-01')
const updates = ref<string[]>([])
const changes = ref<string[]>([])
const range = ref<DateRangeValue | null>(null)
const rangeUpdates = ref<DateRangeValue[]>([])
const rangeChanges = ref<DateRangeValue[]>([])
const rangeDisabled = ref(false)
const switchMode = ref<'single' | 'range'>('range')
const compact = ref(false)
const dark = ref(false)
const surface = ref('#f5f0e0')
const disableSunday = (date: Date) => date.getDay() === 0
</script>

<template>
  <form id="order"></form>
  <section id="controlled">
    <YmDatePicker v-model="selected" name="delivery" form="order" aria-label="收货日期"
      show-lunar show-holiday :disabled-date="disableSunday" :first-day-of-week="7"
      @update:model-value="updates.push($event)" @change="changes.push($event)">
      <template #cell="{ value, date }"><span>{{ value === '2026-10-03' ? '盘点日' : date.getDate() }}</span></template>
    </YmDatePicker>
    <output id="model">{{ selected ?? '空' }}</output>
    <output id="updates">{{ JSON.stringify(updates) }}</output>
    <output id="changes">{{ JSON.stringify(changes) }}</output>
    <button @click="selected = null">重置收货日期</button>
    <button @click="selected = '2027-01-02'">变更收货日期</button>
  </section>
  <YmDatePicker aria-label="固定日期" model-value="2026-10-01" />
  <YmDatePicker aria-label="入库日期" form="order" default-value="2026-10-01" />
  <YmDatePicker aria-label="空日期" />
  <YmDatePicker aria-label="禁用日期" disabled />
  <button type="button">外部操作</button>
  <section>
    <YmDatePicker v-model="range" mode="range" aria-label="配送范围" :disabled="rangeDisabled" name="window" form="order"
      :disabled-date="disableSunday" show-lunar show-holiday
      @update:model-value="rangeUpdates.push($event)" @change="rangeChanges.push($event)" />
    <output id="range-model">{{ JSON.stringify(range) }}</output>
    <output id="range-updates">{{ JSON.stringify(rangeUpdates) }}</output>
    <output id="range-changes">{{ JSON.stringify(rangeChanges) }}</output>
    <button @click="range = ['2027-01-05', '2027-01-09']">外部设置范围</button>
    <button @click="range = null">外部重置范围</button>
    <label><input v-model="rangeDisabled" type="checkbox" />禁用范围</label>
    <YmDatePicker mode="range" aria-label="默认范围" :default-value="['2026-10-01', '2026-10-03']" form="order" />
    <YmDatePicker mode="range" aria-label="固定范围" :model-value="['2026-10-01', '2026-10-03']" />
    <YmDatePicker :mode="switchMode" aria-label="切换模式的日期" />
    <button @click="switchMode = switchMode === 'single' ? 'range' : 'single'">切换选择模式</button>
  </section>
  <label><input v-model="compact" type="checkbox" />紧凑尺寸和直角</label>
  <label><input v-model="dark" type="checkbox" />深色模式</label>
  <label>浅色背景<input v-model="surface" type="color" /></label>
  <ConfigProvider :size="compact ? 'small' : 'large'" :mode="dark ? 'dark' : 'light'"
    :theme="{ light: { surface, primary: '#275d43' }, dark: { surface: '#293349', primary: '#9cd7b6' } }">
    <ConfigProvider :radius="compact ? 0 : 12">
      <YmDatePicker aria-label="继承配置" default-value="2026-10-01" :popup-props="{ attach: '#date-overlays' }" />
      <YmDatePicker aria-label="局部尺寸" size="extra-small" />
      <YmDatePicker aria-label="配置范围" mode="range" :default-value="['2026-10-07', '2026-10-09']"
        :popup-props="{ attach: '#date-overlays' }" />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider size="extra-small" mode="dark" :radius="28">
    <div id="date-overlays"></div>
  </ConfigProvider>
</template>
