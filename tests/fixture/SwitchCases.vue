<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmSwitch, type ControlSize, type SwitchProps, type SwitchValue } from 'ym-ui-vapor'

const enabled = ref(false)
const events = ref<string[]>([])
const submits = ref(0)
function recordChange(value: boolean, { e }: { e: MouseEvent }) {
  events.value.push('change/' + value + '/' + (e instanceof MouseEvent))
}
const controlled = ref<SwitchValue>(0)
const requested = ref<SwitchValue[]>([])
const disabled = ref(false)
const loading = ref(false)
const attempts = ref(0)
const approved = ref<SwitchValue[]>([])
let allow: (value: boolean) => void
let reject: () => void

function confirmChange() {
  attempts.value++
  return new Promise<boolean>((resolve, fail) => {
    allow = resolve
    reject = fail
  })
}

const dark = ref(false)
const lightPrimary = ref('#246854')
const flat = ref(false)
const size = ref<ControlSize>('medium')
const theme = ref<SwitchProps['theme']>('primary')
</script>

<template>
  <section id="switch-cases">
    <form @submit.prevent="submits++">
      <label for="switch-reminders">到货提醒</label>
      <YmSwitch id="switch-reminders" v-model="enabled" :label="['开', '关']"
        @update:model-value="events.push('update/' + $event)"
        @change="recordChange" />
      <output id="switch-events">{{ events.join(' ') }}</output>
      <output id="switch-submits">{{ submits }}</output>
    </form>

    <YmSwitch aria-label="自定义开关值" :custom-value="[0, '0']" label="备用文案">
      <template #label="{ value, checked }">{{ typeof value }}/{{ value }}/{{ checked }}</template>
    </YmSwitch>
    <YmSwitch aria-label="初始开启" default-value="on" :custom-value="['on', 'off']" label="通知" />
    <YmSwitch aria-label="固定开关值" :model-value="controlled" value="off" :custom-value="[0, 'off']"
      @update:model-value="requested.push($event)" />
    <YmSwitch aria-label="通过 value 控制" :value="controlled" :custom-value="[0, 'off']" />
    <button @click="controlled = 'off'">外部关闭开关</button>
    <output id="switch-requests">{{ JSON.stringify(requested) }}</output>

    <YmSwitch aria-label="审批开关" :before-change="confirmChange" :disabled="disabled" :loading="loading"
      @change="approved.push($event)" />
    <button @click="allow(true)">批准切换</button>
    <button @click="allow(false)">取消切换</button>
    <button @click="reject()">审批失败</button>
    <label><input v-model="disabled" type="checkbox" />暂停审批开关</label>
    <label><input v-model="loading" type="checkbox" />审批开关加载中</label>
    <output id="switch-approvals">{{ attempts }} / {{ JSON.stringify(approved) }}</output>

    <label>开关全局尺寸
      <select v-model="size">
        <option>extra-small</option><option>small</option><option>medium</option><option>large</option>
      </select>
    </label>
    <label>开关浅色主题色 <input v-model="lightPrimary" type="color" /></label>
    <label>开关主题
      <select v-model="theme">
        <option>default</option><option>primary</option><option>success</option><option>warning</option><option>danger</option>
      </select>
    </label>
    <label><input v-model="dark" type="checkbox" />开关深色模式</label>
    <label><input v-model="flat" type="checkbox" />开关直角</label>
    <ConfigProvider :size="size" :mode="dark ? 'dark' : 'light'"
      :theme="{ light: { primary: lightPrimary, success: '#197849', warning: '#915000', danger: '#aa3344', border: '#aabbcc' },
        dark: { primary: '#aaccee', danger: '#ee8899' } }">
      <ConfigProvider :radius="flat ? 0 : 4" :theme="{ dark: { danger: '#ff6677', text: '#ccddee', surface: '#222233' } }">
        <YmSwitch aria-label="继承配置的开关" :default-value="true" />
        <YmSwitch aria-label="局部尺寸的开关" size="small" :theme="theme" :default-value="true" />
      </ConfigProvider>
    </ConfigProvider>
  </section>
</template>
