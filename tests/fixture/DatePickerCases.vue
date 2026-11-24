<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmDatePicker } from 'ym-ui-vapor'

const selected = ref<string | null>('2026-10-01')
const updates = ref<(string | null)[]>([])
const changes = ref<(string | null)[]>([])
const clears = ref(0)
const compact = ref(false)
const dark = ref(false)
const surface = ref('#f5f0e0')
const disableSunday = (date: Date) => date.getDay() === 0
</script>

<template>
  <form id="order"></form>
  <section id="controlled">
    <YmDatePicker v-model="selected" name="delivery" form="order" aria-label="收货日期"
      clearable show-lunar show-holiday :disabled-date="disableSunday" :first-day-of-week="7"
      @update:model-value="updates.push($event)" @change="changes.push($event)" @clear="clears++">
      <template #cell="{ value, date }"><span>{{ value === '2026-10-03' ? '盘点日' : date.getDate() }}</span></template>
    </YmDatePicker>
    <output id="model">{{ selected ?? '空' }}</output>
    <output id="updates">{{ JSON.stringify(updates) }}</output>
    <output id="changes">{{ JSON.stringify(changes) }}</output>
    <output id="clears">{{ clears }}</output>
    <button @click="selected = '2027-01-02'">变更收货日期</button>
  </section>
  <YmDatePicker aria-label="固定日期" model-value="2026-10-01" />
  <YmDatePicker aria-label="入库日期" form="order" default-value="2026-10-01" />
  <YmDatePicker aria-label="空日期" />
  <YmDatePicker aria-label="禁用日期" disabled />
  <button type="button">外部操作</button>
  <label><input v-model="compact" type="checkbox" />紧凑尺寸和直角</label>
  <label><input v-model="dark" type="checkbox" />深色模式</label>
  <label>浅色背景<input v-model="surface" type="color" /></label>
  <ConfigProvider :size="compact ? 'small' : 'large'" :mode="dark ? 'dark' : 'light'"
    :theme="{ light: { surface, primary: '#275d43' }, dark: { surface: '#293349', primary: '#9cd7b6' } }">
    <ConfigProvider :radius="compact ? 0 : 12">
      <YmDatePicker aria-label="继承配置" default-value="2026-10-01" :popup-props="{ attach: '#date-overlays' }" />
      <YmDatePicker aria-label="局部尺寸" size="extra-small" />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider size="extra-small" mode="dark" :radius="28">
    <div id="date-overlays"></div>
  </ConfigProvider>
</template>
