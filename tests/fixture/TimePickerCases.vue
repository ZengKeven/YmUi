<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmTimePicker, type TimeRangeValue } from 'ym-ui-vapor'

const time = ref<string | null>(null)
const updates = ref<string[]>([])
const changes = ref<string[]>([])
const shift = ref<TimeRangeValue | null>(['09:00', '17:30'])
const rangeUpdates = ref<TimeRangeValue[]>([])
const rangeChanges = ref<TimeRangeValue[]>([])
const disabled = ref(false)
const compact = ref(false)
const dark = ref(false)
const primary = ref('#216143')
</script>

<template>
  <form id="schedule"></form>
  <YmTimePicker v-model="time" aria-label="提醒时间" name="reminder" form="schedule"
    @update:model-value="updates.push($event)" @change="changes.push($event)" />
  <output id="updates">{{ JSON.stringify(updates) }}</output>
  <output id="changes">{{ JSON.stringify(changes) }}</output>
  <button @click="time = '23:01:02'">设置提醒</button>

  <YmTimePicker v-model="shift" mode="range" format="HH:mm" aria-label="工作时段" name="shift" form="schedule"
    :disabled="disabled" @update:model-value="rangeUpdates.push($event)" @change="rangeChanges.push($event)" />
  <output id="range-updates">{{ JSON.stringify(rangeUpdates) }}</output>
  <output id="range-changes">{{ JSON.stringify(rangeChanges) }}</output>
  <button @click="shift = null">重置工作时段</button>
  <label><input v-model="disabled" type="checkbox" />禁用工作时段</label>
  <YmTimePicker mode="range" aria-label="值班时段" name="duty" form="schedule" :default-value="['08:15:00', '09:30:00']" />
  <YmTimePicker model-value="12:00:00" aria-label="固定时间" />
  <YmTimePicker disabled borderless placeholder="暂不可选" aria-label="禁用时间" />
  <button type="button">其他操作</button>

  <label><input v-model="compact" type="checkbox" />紧凑直角</label>
  <label><input v-model="dark" type="checkbox" />深色</label>
  <label>强调色<input v-model="primary" type="color" /></label>
  <ConfigProvider :size="compact ? 'small' : 'large'" :mode="dark ? 'dark' : 'light'"
    :theme="{ light: { primary, surface: '#f4f1df' }, dark: { primary: '#d1c9fa', surface: '#232136' } }">
    <ConfigProvider :radius="compact ? 0 : 10">
      <YmTimePicker aria-label="继承配置" default-value="08:15:00" :popup-props="{ attach: '#time-overlays' }" />
      <YmTimePicker aria-label="覆盖尺寸" size="extra-small" />
    </ConfigProvider>
  </ConfigProvider>
  <ConfigProvider mode="dark" size="extra-small" :radius="25">
    <div id="time-overlays"></div>
  </ConfigProvider>
</template>
