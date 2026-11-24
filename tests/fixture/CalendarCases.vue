<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmCalendar, YmPopup } from 'ym-ui-vapor'

const value = ref<string | null>('2024-02-28')
const updates = ref<string[]>([])
const changes = ref<string[]>([])
const months = ref<string[]>([])
const picked = ref<string | null>(null)
const picks = ref<string[]>([])
const pickerChanges = ref<string[]>([])
const sundayFirst = ref(false)
const showLunar = ref(false)
const disabled = ref(false)
const dark = ref(false)
const compact = ref(false)
const primary = ref('#126a63')
const weekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6
</script>

<template>
  <section id="controlled">
    <YmCalendar v-model="value" theme="card" :show-lunar="showLunar" :first-day-of-week="sundayFirst ? 7 : 1"
      :disabled-date="weekend" :disabled="disabled" @update:model-value="updates.push($event)"
      @change="changes.push($event)" @month-change="months.push($event)">
      <template #cell="{ value: day, date, inMonth, today, selected }">
        <span>{{ date.getDate() }}</span>
        <span v-if="day === '2024-02-29' && inMonth">盘点</span>
        <span v-if="today">今天</span><span v-if="selected">已选</span>
      </template>
    </YmCalendar>
    <output id="value">{{ value }}</output>
    <output id="updates">{{ updates.join(',') }}</output>
    <output id="changes">{{ changes.join(',') }}</output>
    <output id="months">{{ months.join(',') }}</output>
    <button @click="value = '2025-01-02'">设置次年日期</button>
    <button @click="value = null">清空日期</button>
    <label><input v-model="sundayFirst" type="checkbox" />周日起始</label>
    <label><input v-model="showLunar" type="checkbox" />显示农历</label>
    <label><input v-model="disabled" type="checkbox" />禁用日历</label>
  </section>
  <section id="empty"><YmCalendar /></section>
  <section id="uncontrolled"><YmCalendar default-value="2023-12-31" /></section>
  <section id="locked"><YmCalendar model-value="2024-01-12" /></section>
  <section id="picker">
    <YmPopup overlay-class-name="calendar-picker-panel">
      <template #default="{ visible }">
        <button aria-label="选择日期" :aria-expanded="visible">{{ picked ?? '请选择日期' }}</button>
      </template>
      <template #content="{ close }">
        <YmCalendar v-model="picked" theme="card" @select="picks.push($event); close()"
          @change="pickerChanges.push($event)" />
      </template>
    </YmPopup>
    <output id="picker-selections">{{ picks.join(',') }}</output>
    <output id="picker-changes">{{ pickerChanges.join(',') }}</output>
  </section>
  <section id="config">
    <label><input v-model="dark" type="checkbox" />深色模式</label>
    <label><input v-model="compact" type="checkbox" />小号和直角</label>
    <label>浅色强调色<input v-model="primary" type="color" /></label>
    <ConfigProvider :size="compact ? 'small' : 'large'" :mode="dark ? 'dark' : 'light'"
      :theme="{ light: { primary, surface: '#fffaf3' }, dark: { primary: '#8acdb4', surface: '#26344b' } }">
      <ConfigProvider :radius="compact ? 0 : 12">
        <div id="inherited"><YmCalendar theme="card" default-value="2024-02-28" /></div>
        <div id="local"><YmCalendar theme="card" size="extra-small" default-value="2025-07-25" :show-lunar="showLunar" /></div>
      </ConfigProvider>
    </ConfigProvider>
  </section>
</template>
