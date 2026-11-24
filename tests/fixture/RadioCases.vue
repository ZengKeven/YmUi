<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmRadio, YmRadioGroup, type RadioProps, type RadioValue } from 'ym-ui-vapor'

const checked = ref(false)
const singleEvents = ref<string[]>([])
const choice = ref<RadioValue>('0')
const groupUpdates = ref<RadioValue[]>([])
const groupChanges = ref<string[]>([])
const rejected = ref<RadioValue[]>([])
const disabled = ref(false)
const compact = ref(false)
const dark = ref(false)
const lightPrimary = ref('#246854')
const groupTheme = ref<RadioProps['theme']>('primary')
</script>

<template>
  <section id="radio-cases">
    <YmRadio v-model="checked" label="默认标题" @update:model-value="singleEvents.push('update/' + $event)"
      @change="(value, { e }) => singleEvents.push(value + '/' + e.type)">
      <strong>开启单选提醒</strong>
    </YmRadio>
    <YmRadio default-checked label="初始开启的单选项" />
    <output id="radio-events">{{ checked }} {{ singleEvents.join(' ') }}</output>

    <form id="radio-method-form">
      <YmRadioGroup v-model="choice" name="method" aria-label="结算方式" :disabled="disabled"
        :options="['由插槽替换']" @update:model-value="groupUpdates.push($event)"
        @change="(value, { e, name }) => groupChanges.push(JSON.stringify(value) + '/' + name + '/' + e.type)">
        <YmRadio value="0">字符串零</YmRadio>
        <YmRadio disabled value="unused">暂停使用</YmRadio>
        <YmRadio :value="0" name="item-name" label="数字零" />
        <YmRadio :value="false">布尔假</YmRadio>
        <YmRadio value="">空字符串</YmRadio>
        <YmRadio>缺少单选值</YmRadio>
      </YmRadioGroup>
    </form>
    <button @click="choice = '0'">重设结算方式</button>
    <button @click="disabled = !disabled">切换结算方式禁用</button>
    <output id="radio-values">{{ JSON.stringify(groupUpdates) }}</output>
    <output id="radio-changes">{{ groupChanges.join(' ') }}</output>

    <YmRadioGroup :model-value="false" aria-label="待确认方式" :options="[false, { label: '备用', value: 'b' }]"
      @update:model-value="rejected.push($event)" />
    <output id="radio-rejected">{{ JSON.stringify(rejected) }}</output>
    <YmRadioGroup aria-label="另一组" theme="danger"
      :options="[false, { value: '乙', theme: 'success' }]" direction="vertical" />

    <button @click="dark = !dark">切换单选框配色模式</button>
    <button @click="compact = !compact">切换单选框尺寸和圆角</button>
    <label>单选框浅色主题色 <input v-model="lightPrimary" type="color" /></label>
    <label>单选框分组主题
      <select v-model="groupTheme">
        <option>primary</option><option>success</option><option>warning</option><option>danger</option><option>default</option>
      </select>
    </label>
    <ConfigProvider :size="compact ? 'small' : 'large'" :mode="dark ? 'dark' : 'light'"
      :theme="{ light: { primary: lightPrimary, warning: '#915000' }, dark: { primary: '#aaccee' } }">
      <ConfigProvider :radius="compact ? 0 : 9" :theme="{ dark: { danger: '#ff6677', text: '#ccddee', surface: '#203040' } }">
        <YmRadio default-checked label="继承单选尺寸" />
        <YmRadioGroup default-value="normal" aria-label="单选框主题展示"
          :size="compact ? 'medium' : undefined" :theme="groupTheme">
          <YmRadio value="normal">继承组尺寸</YmRadio>
          <YmRadio value="small" size="extra-small" theme="default">显式单项尺寸</YmRadio>
        </YmRadioGroup>
      </ConfigProvider>
    </ConfigProvider>
  </section>
</template>
