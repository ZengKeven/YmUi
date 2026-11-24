<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmCheckbox, YmCheckboxGroup, type CheckboxGroupChangeContext, type CheckboxProps, type CheckboxValue } from 'ym-ui-vapor'

const checked = ref(false)
const mixed = ref(true)
const singleUpdates = ref<boolean[]>([])
const singleChanges = ref<string[]>([])
const rejectedUpdates = ref<boolean[]>([])
const selected = ref<readonly CheckboxValue[]>(Object.freeze(['original']))
const groupDisabled = ref(false)
const groupUpdates = ref<CheckboxValue[][]>([])
const groupChanges = ref<string[]>([])
const itemUpdates = ref<boolean[]>([])
const itemChanges = ref<boolean[]>([])
const compact = ref(false)
const dark = ref(false)
const primary = ref('#236547')
const groupSize = ref(false)
const groupTheme = ref<CheckboxProps['theme']>('primary')

function recordGroup(values: CheckboxValue[], { current, type, e }: CheckboxGroupChangeContext) {
  groupChanges.value.push(`${JSON.stringify(values)} ${type} ${JSON.stringify(current)} ${e.type}`)
}
</script>

<template>
  <section id="checkbox-cases">
    <form id="checkbox-form">
      <YmCheckbox v-model="checked" :indeterminate="mixed" name="notice" value="yes" label="默认文案"
        @update:model-value="singleUpdates.push($event)"
        @change="(value, { e }) => singleChanges.push(value + '/' + e.type)">
        <strong>接收通知</strong>
      </YmCheckbox>
      <YmCheckbox default-checked label="保留副本" />
      <YmCheckbox default-checked disabled name="disabled-field" label="锁定设置" />
      <button type="reset">恢复复选框初始值</button>
    </form>
    <button @click="mixed = false">解除半选</button>
    <output id="checkbox-events">{{ checked }}/{{ singleUpdates.join(',') }}/{{ singleChanges.join(',') }}</output>
    <YmCheckbox :model-value="false" @update:model-value="rejectedUpdates.push($event)">由父级确认</YmCheckbox>
    <output id="checkbox-rejected">{{ rejectedUpdates.join(',') }}</output>

    <button @click="selected = [false]">替换分组选择</button>
    <button @click="groupDisabled = !groupDisabled">切换整组禁用</button>
    <YmCheckboxGroup v-model="selected" name="channels" aria-label="通知类型" :disabled="groupDisabled"
      :options="['由插槽替换']" @update:model-value="groupUpdates.push($event)" @change="recordGroup">
      <YmCheckbox value="original">原始渠道</YmCheckbox>
      <YmCheckbox :value="0" label="零值" @update:model-value="itemUpdates.push($event)" @change="itemChanges.push($event)" />
      <YmCheckbox :value="false" label="布尔值" />
      <YmCheckbox>缺少标识</YmCheckbox>
    </YmCheckboxGroup>
    <output id="checkbox-group-model">{{ JSON.stringify(selected) }}</output>
    <output id="checkbox-group-updates">{{ JSON.stringify(groupUpdates) }}</output>
    <output id="checkbox-group-changes">{{ groupChanges.join('; ') }}</output>
    <output id="checkbox-item-events">{{ itemUpdates.join(',') }}/{{ itemChanges.join(',') }}</output>
    <YmCheckboxGroup aria-label="配送方式" theme="success" :default-value="['自提']"
      :options="['自提', 0, false, { value: 'express', label: '快递', theme: 'warning' }, { value: 'stop', label: '暂停配送', disabled: true }]" />

    <label>复选框浅色主色 <input v-model="primary" type="color" /></label>
    <button @click="compact = !compact">调整复选框尺寸圆角</button>
    <button @click="dark = !dark">调整复选框模式</button>
    <button @click="groupSize = !groupSize">调整分组局部尺寸</button>
    <label>复选框分组主题
      <select v-model="groupTheme">
        <option>primary</option><option>success</option><option>warning</option><option>danger</option><option>default</option>
      </select>
    </label>
    <ConfigProvider :mode="dark ? 'dark' : 'light'" :size="compact ? 'small' : 'large'"
      :theme="{ light: { primary, success: '#127949' }, dark: { primary: '#99bbdd' } }">
      <ConfigProvider :radius="compact ? 0 : 9" :theme="{ dark: { warning: '#efab44', text: '#ccddee', surface: '#203040' } }">
        <YmCheckbox default-checked label="继承单项" />
        <YmCheckboxGroup :default-value="['inherit']" :size="groupSize ? 'medium' : undefined" :theme="groupTheme">
          <YmCheckbox value="inherit">继承分组</YmCheckbox>
          <YmCheckbox size="extra-small" value="local" theme="default" indeterminate>局部复选框</YmCheckbox>
        </YmCheckboxGroup>
      </ConfigProvider>
    </ConfigProvider>
  </section>
</template>
